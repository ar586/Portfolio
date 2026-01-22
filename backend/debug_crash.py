
import os
import sys
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Load env
load_dotenv()

current_dir = os.path.dirname(os.path.abspath(__file__))
# app/api/chat.py logic uses:
# VECTORSTORE_PATH = os.path.abspath(os.path.join(current_dir, "..", "vectorstore", "faiss_index"))
# But here we are in backend root
VECTORSTORE_PATH = os.path.abspath(os.path.join(current_dir, "app", "vectorstore", "faiss_index"))

print(f"Loading vector store from: {VECTORSTORE_PATH}")

try:
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    print("Embeddings initialized.")
    
    vectorstore = FAISS.load_local(VECTORSTORE_PATH, embeddings, allow_dangerous_deserialization=True)
    print("Vector store loaded successfully.")
    
    retriever = vectorstore.as_retriever()
    docs = retriever.invoke("Who is this?")
    print(f"Retrieved {len(docs)} docs.")
    
except Exception as e:
    print(f"Error: {e}")
