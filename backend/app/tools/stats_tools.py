from langchain_core.tools import tool
from app.github.stats_fetcher import GitHubStatsFetcher
from app.leetcode.graphql_client import LeetCodeClient
import asyncio

@tool
async def fetch_github_stats(username: str) -> str:
    """Useful for fetching fresh, live GitHub statistics for a user, including repository count and followers. 
    Use this when the user asks for current GitHub stats or if the vector store data seems outdated."""
    fetcher = GitHubStatsFetcher()
    data = await fetcher.get_user_stats(username)
    if "error" in data:
        return f"Error fetching GitHub stats: {data['error']}"
    return str(data)

@tool
async def fetch_leetcode_stats(username: str) -> str:
    """Useful for fetching fresh, live LeetCode statistics, specifically the number of problems solved (easy, medium, hard).
    Use this when the user asks for current LeetCode progress or if the vector store data seems outdated."""
    client = LeetCodeClient()
    data = await client.get_user_stats(username)
    if not data or "error" in data:
       return "Error fetching LeetCode stats."
    return str(data)
