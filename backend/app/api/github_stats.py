from fastapi import APIRouter, HTTPException
from app.github.stats_fetcher import GitHubStatsFetcher

router = APIRouter()
fetcher = GitHubStatsFetcher()

@router.get("/stats/{username}")
async def get_github_stats(username: str):
    stats = await fetcher.get_user_stats(username)
    if "error" in stats:
        raise HTTPException(status_code=404, detail=stats["error"])
    return stats

@router.get("/repos/{username}")
async def get_github_repos(username: str):
    repos = await fetcher.get_repos(username)
    return repos
