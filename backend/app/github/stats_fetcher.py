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
            # Fetch up to 100 repos (should cover most users)
            response = await client.get(f"{self.base_url}/users/{username}/repos?per_page=100&sort=updated")
            if response.status_code != 200:
                return []
            return response.json()

    async def get_events(self, username: str, limit: int = 10) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/users/{username}/events?per_page={limit}")
            if response.status_code != 200:
                return []
            return response.json()
