from fastapi import APIRouter, HTTPException
from app.database import get_database

router = APIRouter()

@router.get("/stats/{username}")
async def get_cached_github_stats(username: str):
    """Get cached GitHub stats from MongoDB"""
    db = get_database()
    stats = await db["github_stats"].find_one({"username": username})
    
    if not stats:
        raise HTTPException(status_code=404, detail="Stats not found. Run sync script first.")
    
    # Remove MongoDB _id field
    stats.pop("_id", None)
    return stats

@router.get("/repos/{username}")
async def get_cached_github_repos(username: str):
    """Get cached GitHub repositories from MongoDB"""
    db = get_database()
    repos_doc = await db["github_repos"].find_one({"username": username})
    
    if not repos_doc:
        raise HTTPException(status_code=404, detail="Repos not found. Run sync script first.")
    
    return {"repos": repos_doc.get("repos", []), "updated_at": repos_doc.get("updated_at")}

@router.get("/heatmap/{username}")
async def get_cached_github_heatmap(username: str):
    """Get cached GitHub heatmap from MongoDB"""
    db = get_database()
    heatmap = await db["github_heatmap"].find_one({"username": username})
    
    if not heatmap:
        raise HTTPException(status_code=404, detail="Heatmap not found. Run sync script first.")
    
    heatmap.pop("_id", None)
    return heatmap
