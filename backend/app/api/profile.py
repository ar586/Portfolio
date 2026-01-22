from fastapi import APIRouter, HTTPException
from app.personal.loader import PersonalKBLoader

router = APIRouter()
loader = PersonalKBLoader()

@router.get("/{doc_name}")
async def get_document(doc_name: str):
    """
    Generic endpoint to fetch any markdown document from the personal KB.
    Example: /api/v1/profile/resume -> fetches resume.md
    """
    filename = f"{doc_name}.md"
    content = loader.load_file(filename)
    if not content:
        raise HTTPException(status_code=404, detail=f"Document '{doc_name}' not found")
    
    return {"document": doc_name, "content": content}

@router.get("/")
async def list_documents():
    """List all available documents."""
    docs = loader.get_all_docs()
    return {"documents": docs}
