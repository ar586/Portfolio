from fastapi import APIRouter, HTTPException
from app.database import get_database

router = APIRouter()

@router.get("/stats/{username}")
async def get_cached_leetcode_stats(username: str):
    """Get cached LeetCode stats from MongoDB"""
    db = get_database()
    stats = await db["leetcode_stats"].find_one({"username": username})
    
    if not stats:
        raise HTTPException(status_code=404, detail="Stats not found. Run sync script first.")
    
    stats.pop("_id", None)
    return stats

@router.get("/heatmap/{username}")
async def get_cached_leetcode_heatmap(username: str):
    """Get cached LeetCode heatmap from MongoDB"""
    db = get_database()
    heatmap = await db["leetcode_heatmap"].find_one({"username": username})
    
    if not heatmap:
        raise HTTPException(status_code=404, detail="Heatmap not found. Run sync script first.")
    
    heatmap.pop("_id", None)
    return heatmap
