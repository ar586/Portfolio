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

    async def get_repo_structure(self, username: str, repo_name: str, branch: str = "main") -> List[str]:
        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}/repos/{username}/{repo_name}/git/trees/{branch}?recursive=1"
            print(f"Fetching file structure from {url}")
            response = await client.get(url, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                tree = data.get("tree", [])
                # Filter validation: keep only blob (files) and tree (directories)
                paths = [item["path"] for item in tree if item["type"] in ["blob", "tree"]]
                return paths
            elif response.status_code == 404:
                # Try 'master' if 'main' fails, or just return empty
                if branch == "main":
                    print(f"Branch 'main' not found, trying 'master'...")
                    return await self.get_repo_structure(username, repo_name, branch="master")
                print(f"No file structure found for {username}/{repo_name}")
                return []
            else:
                print(f"Error fetching structure: {response.status_code}")
                return []
