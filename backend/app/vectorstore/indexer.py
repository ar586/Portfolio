
import os
import sys
# Pre-import faiss removed

# Add backend root to sys.path
current_file = os.path.abspath(__file__)
backend_root = os.path.dirname(os.path.dirname(os.path.dirname(current_file)))
if backend_root not in sys.path:
    sys.path.append(backend_root)

from app.personal.loader import PersonalKBLoader
from langchain_community.vectorstores import Qdrant
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from dotenv import load_dotenv

# Load env variables including GOOGLE_API_KEY
load_dotenv()

VECTORSTORE_PATH = os.path.join(os.path.dirname(current_file), "faiss_index")

def simple_text_splitter(text: str, chunk_size: int = 500, chunk_overlap: int = 50):
    """
    A simple text splitter to avoid importing langchain_text_splitters
    which is causing segmentation faults on this environment.
    """
    if not text:
        return []
    
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk = text[start:end]
        chunks.append(chunk)
        
        if end == text_len:
            break
            
        start += (chunk_size - chunk_overlap)
        
    return chunks

def build_index():
    print("Initializing Google Gemini Embeddings...")
    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY not found in environment variables.")
        return

    # Use the requested gemini-embedding-001 model
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    
    
    loader = PersonalKBLoader()
    doc_names = loader.get_all_docs()
    
    if not doc_names:
        print("No documents found in data directory.")
        return

    documents = []

    print(f"Found {len(doc_names)} documents. Processing...")
    
    for doc_name in doc_names:
        content = loader.load_file(doc_name)
        if not content:
            continue
            
        print(f" - Processing {doc_name}...")
        
        chunks = simple_text_splitter(content, chunk_size=500, chunk_overlap=50)
        
        for chunk in chunks:
            documents.append(Document(
                page_content=chunk,
                metadata={"source": doc_name}
            ))

    if not documents:
        print("No content to index.")
        return

    print(f"Creating index from {len(documents)} chunks...")
    
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    if not qdrant_url or not qdrant_api_key:
        print("Error: QDRANT_URL or QDRANT_API_KEY not found in environment variables.")
        return

    from langchain_qdrant import QdrantVectorStore
    from qdrant_client import QdrantClient
    from qdrant_client.http import models

    client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    
    print("Recreating collection 'portfolio_docs' on Qdrant Cloud...")
    client.recreate_collection(
        collection_name="portfolio_docs",
        vectors_config=models.VectorParams(size=3072, distance=models.Distance.COSINE)
    )

    vectorstore = QdrantVectorStore(
        client=client, 
        collection_name="portfolio_docs", 
        embedding=embeddings
    )
    
    vectorstore.add_documents(documents)
    
    print("Index successfully saved to Qdrant Cloud!")

if __name__ == "__main__":
    build_index()
