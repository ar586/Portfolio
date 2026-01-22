from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from typing import Optional
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor
from langchain.tools.retriever import create_retriever_tool
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain.agents.format_scratchpad.tools import format_to_tool_messages
from langchain.agents.output_parsers.tools import ToolsAgentOutputParser
from dotenv import load_dotenv

from app.database import get_database, get_chat_history, save_chat_message
from app.tools.stats_tools import fetch_github_stats, fetch_leetcode_stats

# Load environment variables
load_dotenv()

router = APIRouter()

# Define the path to the vector store
current_dir = os.path.dirname(os.path.abspath(__file__))
# vectorstore/faiss_index
VECTORSTORE_PATH = os.path.abspath(os.path.join(current_dir, "..", "vectorstore", "faiss_index"))

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

def get_vectorstore():
    if not os.path.exists(VECTORSTORE_PATH):
        raise FileNotFoundError(f"Vector store not found at {VECTORSTORE_PATH}. Please run indexer.py first.")
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    return FAISS.load_local(VECTORSTORE_PATH, embeddings, allow_dangerous_deserialization=True)

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
        
        prompt = ChatPromptTemplate.from_template("""You are a helpful AI assistant for a portfolio website.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, say that you don't know.
Keep the answer professional and concise.

Context:
{context}

Question:
{input}""")
        
        rag_chain = (
            {"context": retriever | format_docs, "input": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        
        # 4. Handle History
        db = get_database()
        session_id = request.session_id
        
        # 5. Run Chain
        response = rag_chain.invoke(request.message)
        
        # 6. Save History
        if session_id:
            await save_chat_message(db, session_id, request.message, response)
        
        return {"response": response, "session_id": session_id}
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
