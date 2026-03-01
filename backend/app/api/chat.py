from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
import json
import asyncio
from typing import Optional
from langchain_qdrant import QdrantVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

from dotenv import load_dotenv

from app.database import get_database, get_chat_history, save_chat_message
from app.tools.stats_tools import fetch_github_stats, fetch_leetcode_stats

# Load environment variables
load_dotenv()

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

def get_all_portfolio_data() -> str:
    """Reads all markdown files in backend/data/ and concatenates them."""
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data")
    context_str = ""
    
    if not os.path.exists(data_dir):
        return context_str
        
    for filename in os.listdir(data_dir):
        if filename.endswith(".md"):
            filepath = os.path.join(data_dir, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    context_str += f"\n\n--- Source: {filename} ---\n\n"
                    context_str += f.read()
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
                
    return context_str

@router.post("/query")
async def chat_endpoint(request: ChatRequest):
    try:
        # Configuration check
        if not os.getenv("GOOGLE_API_KEY"):
            raise ValueError("GOOGLE_API_KEY not found in environment variables.")
        
        # 1. Gather comprehensive portfolio data
        portfolio_context = get_all_portfolio_data()
        
        # 2. Setup LLM
        llm = ChatGoogleGenerativeAI(model="models/gemma-3-27b-it", temperature=0.7)
        
        # 3. Handle Chat History
        db = get_database()
        session_id = request.session_id
        if not session_id:
            import uuid
            session_id = str(uuid.uuid4())
            
        chat_history_str = ""
        if session_id:
            history_msgs = await get_chat_history(db, session_id, limit=5)
            # Format oldest to newest
            history_msgs.reverse() 
            for msg in history_msgs:
                role = "User" if msg["role"] == "user" else "Assistant"
                chat_history_str += f"{role}: {msg['content']}\n"
        
        # 4. Construct Prompt structure
        prompt_template = ChatPromptTemplate.from_messages([
            ("human", """You are a helpful AI assistant representing Aryan Anand's portfolio website.
Your objective is to answer questions about him drawing *only* from the provided portfolio context and chat history below. 
Do not hallucinate facts outside of the provided context. If the information is not in the context, politely state that you do not have that specific information about Aryan.
Maintain a professional, conversational, and helpful tone.

--- PORTFOLIO CONTEXT ---
{context}

--- CONVERSATION HISTORY ---
{chat_history}

--- NEW QUESTION ---
{input}
""")
        ])
        
        from langchain_core.output_parsers import StrOutputParser
        
        # Build pure chain
        chain = prompt_template | llm | StrOutputParser()
        
        async def stream_generator():
            full_response = ""
            
            # Send session_id first as a metadata chunk
            yield json.dumps({"session_id": session_id}) + "\n"
            
            # Form stream generator
            async for chunk in chain.astream({
                "context": portfolio_context,
                "chat_history": chat_history_str,
                "input": request.message
            }):
                full_response += chunk
                yield json.dumps({"text": chunk}) + "\n"
            
            # Save history after streaming is complete
            if session_id:
                try:
                    await save_chat_message(db, session_id, request.message, full_response)
                except Exception as e:
                    print(f"Error saving chat history: {e}")

        return StreamingResponse(stream_generator(), media_type="application/x-ndjson")
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{session_id}")
async def get_history_endpoint(session_id: str):
    """Retrieve chat history for a given session"""
    try:
        db = get_database()
        history = await get_chat_history(db, session_id, limit=50) # Fetch more for UI
        return {"history": history}
    except Exception as e:
        print(f"Error fetching history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
