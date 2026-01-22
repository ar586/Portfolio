from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

# Load environment variables (GOOGLE_API_KEY)
load_dotenv()

router = APIRouter()

# Define the path to the vector store
# This file is in backend/app/api/chat.py
# Vector store is in backend/app/vectorstore/faiss_index
current_dir = os.path.dirname(os.path.abspath(__file__))
# Navigate up from api -> app, then down to vectorstore -> faiss_index
VECTORSTORE_PATH = os.path.abspath(os.path.join(current_dir, "..", "vectorstore", "faiss_index"))

class ChatRequest(BaseModel):
    message: str

def get_vectorstore():
    if not os.path.exists(VECTORSTORE_PATH):
        raise FileNotFoundError(f"Vector store not found at {VECTORSTORE_PATH}. Please run indexer.py first.")
    
    # Use the same embedding model as the indexer
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    
    # Allow dangerous deserialization because we generated this index ourselves locally
    return FAISS.load_local(VECTORSTORE_PATH, embeddings, allow_dangerous_deserialization=True)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

@router.post("/query")
async def chat_endpoint(request: ChatRequest):
    try:
        vectorstore = get_vectorstore()
        retriever = vectorstore.as_retriever()
        
        # Custom template that doesn't use system role, as gemma-3-27b-it doesn't support it via API
        template = """You are a helpful AI assistant for a portfolio website.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, say that you don't know.
Keep the answer professional and concise.

Context:
{context}

Question:
{input}"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        # User requested explicit model: google/gemma-3-27b-it
        # We must use the full key 'models/gemma-3-27b-it' as verified in test_generation.py
        llm = ChatGoogleGenerativeAI(model="models/gemma-3-27b-it", temperature=0.7)
        
        rag_chain = (
            {"context": retriever | format_docs, "input": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        
        response = rag_chain.invoke(request.message)
        return {"response": response}
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error in chat endpoint: {str(e)}")
        # import traceback
        # traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
