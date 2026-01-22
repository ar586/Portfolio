import httpx
from typing import Dict, Any, List

class GitHubStatsFetcher:
    def __init__(self):
        self.base_url = "https://api.github.com"

    async def get_user_stats(self, username: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/users/{username}")
            if response.status_code != 200:
                return {"error": "User not found or API limits exceeded"}
            return response.json()

    async def get_repos(self, username: str) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/users/{username}/repos")
            if response.status_code != 200:
                return []
            return response.json()
