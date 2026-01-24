from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
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
        # 1. Setup Vector Store
        vectorstore = get_vectorstore()
        retriever = vectorstore.as_retriever()
        
        # 2. Setup LLM
        llm = ChatGoogleGenerativeAI(model="models/gemma-3-27b-it", temperature=0.7)
        
        # 3. Setup Simple RAG Chain (Tools integration has compatibility issues)
        from langchain_core.output_parsers import StrOutputParser
        from langchain_core.runnables import RunnablePassthrough
        
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)
        
        # 4. Handle History (Fetch before generating response)
        db = get_database()
        session_id = request.session_id
        
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
        
        # 5. Run Chain
        response = await rag_chain.ainvoke(request.message)
        
        # 6. Save History
        if session_id:
            await save_chat_message(db, session_id, request.message, response)
        
        return {"response": response, "session_id": session_id}
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
