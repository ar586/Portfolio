import asyncio
import os
import sys
from datetime import datetime

# Add backend to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from app.github.stats_fetcher import GitHubStatsFetcher
from app.leetcode.graphql_client import LeetCodeClient

async def main():
    github_username = "ar586"
    leetcode_username = "aryan_anand2006"
    data_dir = os.path.join(current_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    output_file = os.path.join(data_dir, "stats.md")

    print(f"Fetching stats for GitHub ({github_username}) and LeetCode ({leetcode_username})...")

    # Fetch GitHub Stats
    gh_fetcher = GitHubStatsFetcher()
    gh_stats = await gh_fetcher.get_user_stats(github_username)
    
    # Fetch LeetCode Stats
    lc_client = LeetCodeClient()
    lc_stats = await lc_client.get_user_stats(leetcode_username)

    # Prepare Markdown Content
    content = f"# Live Development Statistics\n"
    content += f"*Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n"

    # GitHub Section
    content += "## GitHub Activity\n"
    if "error" not in gh_stats:
        content += f"- **Username**: {gh_stats.get('login')}\n"
        content += f"- **Public Repositories**: {gh_stats.get('public_repos')}\n"
        content += f"- **Followers**: {gh_stats.get('followers')}\n"
        content += f"- **Profile URL**: {gh_stats.get('html_url')}\n"
        content += f"- **Bio**: {gh_stats.get('bio', 'No bio provided')}\n"
    else:
        content += f"Error fetching GitHub stats: {gh_stats['error']}\n"
    content += "\n"

    # LeetCode Section
    content += "## LeetCode Problem Solving\n"
    if lc_stats and "error" not in lc_stats:
        submit_stats = lc_stats.get("submitStats", {}).get("acSubmissionNum", [])
        profile = lc_stats.get("profile", {})
        
        content += f"- **Username**: {lc_stats.get('username')}\n"
        content += f"- **Global Ranking**: {profile.get('ranking')}\n"
        
        total_solved = 0
        for stat in submit_stats:
            difficulty = stat["difficulty"]
            count = stat["count"]
            content += f"- **{difficulty} Solved**: {count}\n"
            if difficulty == "All":
                total_solved = count
                
        content += f"- **Total Problems Solved**: {total_solved}\n"
    else:
        content += "Error fetching LeetCode stats.\n"

    # Write to file
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"Stats saved to {output_file}")

if __name__ == "__main__":
    asyncio.run(main())
