from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os
from typing import Optional, List
from datetime import datetime
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from app.database import get_database

# Load environment variables (GOOGLE_API_KEY)
load_dotenv()

router = APIRouter()

# Define the path to the vector store
current_dir = os.path.dirname(os.path.abspath(__file__))
VECTORSTORE_PATH = os.path.abspath(os.path.join(current_dir, "..", "vectorstore", "faiss_index"))

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

def get_vectorstore():
    if not os.path.exists(VECTORSTORE_PATH):
        raise FileNotFoundError(f"Vector store not found at {VECTORSTORE_PATH}. Please run indexer.py first.")
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    return FAISS.load_local(VECTORSTORE_PATH, embeddings, allow_dangerous_deserialization=True)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

async def get_chat_history(db, session_id: str, limit: int = 5) -> str:
    if not session_id:
        return ""
    
    collection = db["chat_history"]
    doc = await collection.find_one({"session_id": session_id})
    
    if not doc or "messages" not in doc:
        return ""
        
    # Get last N messages
    messages = doc["messages"][-limit:]
    history_str = ""
    for msg in messages:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_str += f"{role}: {msg['content']}\n"
        
    return history_str

async def save_chat_message(db, session_id: str, user_msg: str, ai_msg: str):
    if not session_id:
        return
        
    collection = db["chat_history"]
    
    # Update or insert
    await collection.update_one(
        {"session_id": session_id},
        {
            "$push": {
                "messages": {
                    "$each": [
                        {"role": "user", "content": user_msg, "timestamp": datetime.now()},
                        {"role": "assistant", "content": ai_msg, "timestamp": datetime.now()}
                    ]
                }
            },
            "$setOnInsert": {"created_at": datetime.now()},
            "$set": {"updated_at": datetime.now()}
        },
        upsert=True
    )

@router.post("/query")
async def chat_endpoint(request: ChatRequest):
    try:
        vectorstore = get_vectorstore()
        retriever = vectorstore.as_retriever()
        
        # Get Database Session
        db = get_database()
        
        # Determine Session ID (generate one if not provided?) 
        # For now, just rely on client providing it, or ignore history if None
        session_id = request.session_id
        
        history = await get_chat_history(db, session_id)
        
        # Updated Template with History
        template = """You are a helpful AI assistant for a portfolio website.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, say that you don't know.
Keep the answer professional and concise.

Chat History:
{history}

Context:
{context}

Question:
{input}"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        # User requested explicit model: google/gemma-3-27b-it
        llm = ChatGoogleGenerativeAI(model="models/gemma-3-27b-it", temperature=0.7)
        
        # We need to inject history into the chain
        rag_chain = (
            {
                "context": retriever | format_docs, 
                "history": lambda x: history,
                "input": RunnablePassthrough()
            }
            | prompt
            | llm
            | StrOutputParser()
        )
        
        response = rag_chain.invoke(request.message)
        
        # Save to History
        if session_id:
            await save_chat_message(db, session_id, request.message, response)
        
        return {"response": response, "session_id": session_id}
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        # import traceback
        # traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
