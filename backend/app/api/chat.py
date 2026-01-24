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

def get_vectorstore():
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    if not qdrant_url or not qdrant_api_key:
        raise ValueError("QDRANT_URL or QDRANT_API_KEY not found in environment variables.")

    from qdrant_client import QdrantClient
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    
    client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    
    return QdrantVectorStore(
        client=client,
        collection_name="portfolio_docs",
        embedding=embeddings
    )

@router.post("/query")
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Setup Vector Store & Retriever
        vectorstore = get_vectorstore()
        retriever = vectorstore.as_retriever()
        
        # 2. Setup LLM
        llm = ChatGoogleGenerativeAI(model="models/gemma-3-27b-it", temperature=0.7)
        
        # 3. Setup RAG Chain
        from langchain_core.output_parsers import StrOutputParser
        from langchain_core.runnables import RunnablePassthrough
        
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)
        
        # 4. Handle History
        db = get_database()
        session_id = request.session_id
        if not session_id:
            import uuid
            session_id = str(uuid.uuid4())

        
        chat_history_str = ""
        if session_id:
            history_msgs = await get_chat_history(db, session_id, limit=5)
            for msg in history_msgs:
                role = "User" if msg["role"] == "user" else "Assistant"
                chat_history_str += f"{role}: {msg['content']}\n"
        
        prompt = ChatPromptTemplate.from_template("""You are a helpful AI assistant for a portfolio website.
Use the following pieces of retrieved context and chat history to answer the question.
If you don't know the answer, say that you don't know.
Keep the answer professional and concise.

Chat History:
{chat_history}

Context:
{context}

Question:
{input}""")
        
        rag_chain = (
            {
                "context": retriever | format_docs, 
                "chat_history": lambda _: chat_history_str,
                "input": RunnablePassthrough()
            }
            | prompt
            | llm
            | StrOutputParser()
        )
        
        async def stream_generator():
            full_response = ""
            
            # Send session_id first as a metadata chunk
            yield json.dumps({"session_id": session_id}) + "\n"
            
            async for chunk in rag_chain.astream(request.message):
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
