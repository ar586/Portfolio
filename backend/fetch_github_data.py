import asyncio
import os
import sys

# Add backend to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from app.github.stats_fetcher import GitHubStatsFetcher
from app.github.repo_loader import GitHubRepoLoader

async def main():
    username = "ar586"
    data_dir = os.path.join(current_dir, "data", "repos")
    os.makedirs(data_dir, exist_ok=True)
    
    print(f"Fetching repositories for {username}...")
    stats_fetcher = GitHubStatsFetcher()
    repos = await stats_fetcher.get_repos(username)
    
    if not repos:
        print("No repositories found.")
        return

    repo_loader = GitHubRepoLoader()
    
    print(f"Found {len(repos)} repositories. Fetching READMEs...")
    
    for repo in repos:
        repo_name = repo["name"]
        print(f" - Processing {repo_name}...")
        
        readme_content = await repo_loader.get_repo_readme(username, repo_name)
        
        if readme_content:
            file_path = os.path.join(data_dir, f"{repo_name}.md")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(readme_content)
            print(f"   Saved README to {file_path}")
        else:
            print("   No README found.")

if __name__ == "__main__":
    asyncio.run(main())
