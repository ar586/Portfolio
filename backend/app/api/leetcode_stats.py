from fastapi import APIRouter, HTTPException
from app.leetcode.graphql_client import LeetCodeClient

router = APIRouter()
client = LeetCodeClient()

@router.get("/stats/{username}")
async def get_leetcode_stats(username: str):
    stats = await client.get_user_stats(username)
    if not stats or "error" in stats:
        raise HTTPException(status_code=404, detail=stats.get("error", "User not found"))
    return stats

@router.get("/heatmap/{username}")
async def get_leetcode_heatmap(username: str):
    data = await client.get_submission_calendar(username)
    if not data or "error" in data:
        raise HTTPException(status_code=404, detail=data.get("error", "User not found"))
    
    # Parse the stringified JSON calendar
    import json
    calendar_str = data.get("submissionCalendar", "{}")
    calendar = json.loads(calendar_str)
    
    return {"submissionCalendar": calendar}
