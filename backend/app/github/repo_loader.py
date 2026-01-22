import httpx
import os
from typing import Dict, Any, List, Optional
import base64

class GitHubRepoLoader:
    def __init__(self):
        self.base_url = "https://api.github.com"
        # Optional: Add GitHub Token from env for higher rate limits
        self.token = os.getenv("GITHUB_TOKEN")
        self.headers = {"Accept": "application/vnd.github.v3+json"}
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"

    async def get_repo_readme(self, username: str, repo_name: str) -> Optional[str]:
        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}/repos/{username}/{repo_name}/readme"
            print(f"Fetching README from {url}")
            response = await client.get(url, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                content = base64.b64decode(data["content"]).decode("utf-8")
                return content
            elif response.status_code == 404:
                print(f"No README found for {username}/{repo_name}")
                return None
            else:
                print(f"Error fetching README: {response.status_code}")
                return None

    # Future extension: Fetch file structure
    async def get_repo_structure(self, username: str, repo_name: str) -> List[str]:
        # Implementation for tree/contents
        return []
