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
        default_branch = repo.get("default_branch", "main")
        print(f" - Processing {repo_name} (branch: {default_branch})...")
        
        # Fetch README
        readme_content = await repo_loader.get_repo_readme(username, repo_name)
        
        # Fetch File Structure
        structure = await repo_loader.get_repo_structure(username, repo_name, branch=default_branch)
        structure_str = "\n".join(f"- {path}" for path in structure)
        
        if readme_content or structure:
            file_path = os.path.join(data_dir, f"{repo_name}.md")
            with open(file_path, "w", encoding="utf-8") as f:
                if readme_content:
                    f.write(readme_content)
                    f.write("\n\n")
                
                if structure:
                    f.write("# Repository File Structure\n\n")
                    f.write(structure_str)
                    f.write("\n")
            
            print(f"   Saved data to {file_path}")
        else:
            print("   No data found.")

if __name__ == "__main__":
    asyncio.run(main())
