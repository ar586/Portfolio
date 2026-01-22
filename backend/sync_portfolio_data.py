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
from app.database import get_database

async def sync_github_data(username: str, db):
    """Fetch and save GitHub data to MongoDB"""
    print(f"[{datetime.now()}] Syncing GitHub data for {username}...")
    
    fetcher = GitHubStatsFetcher()
    
    # Fetch user stats
    stats = await fetcher.get_user_stats(username)
    if "error" not in stats:
        # Save to github_stats collection
        await db["github_stats"].update_one(
            {"username": username},
            {
                "$set": {
                    "username": username,
                    "public_repos": stats.get("public_repos"),
                    "followers": stats.get("followers"),
                    "following": stats.get("following"),
                    "bio": stats.get("bio"),
                    "avatar_url": stats.get("avatar_url"),
                    "html_url": stats.get("html_url"),
                    "updated_at": datetime.now()
                }
            },
            upsert=True
        )
        print(f"  ✓ Saved user stats: {stats.get('public_repos')} repos, {stats.get('followers')} followers")
    
    # Fetch repositories
    repos = await fetcher.get_repos(username)
    if repos:
        # Save to github_repos collection
        await db["github_repos"].update_one(
            {"username": username},
            {
                "$set": {
                    "username": username,
                    "repos": repos,
                    "updated_at": datetime.now()
                }
            },
            upsert=True
        )
        print(f"  ✓ Saved {len(repos)} repositories")

async def sync_leetcode_data(username: str, db):
    """Fetch and save LeetCode data to MongoDB"""
    print(f"[{datetime.now()}] Syncing LeetCode data for {username}...")
    
    client = LeetCodeClient()
    stats = await client.get_user_stats(username)
    
    if stats and "error" not in stats:
        submit_stats = stats.get("submitStats", {}).get("acSubmissionNum", [])
        profile = stats.get("profile", {})
        
        # Parse submission stats
        easy = medium = hard = total = 0
        for stat in submit_stats:
            difficulty = stat["difficulty"]
            count = stat["count"]
            if difficulty == "Easy":
                easy = count
            elif difficulty == "Medium":
                medium = count
            elif difficulty == "Hard":
                hard = count
            elif difficulty == "All":
                total = count
        
        # Save to leetcode_stats collection
        await db["leetcode_stats"].update_one(
            {"username": username},
            {
                "$set": {
                    "username": username,
                    "total_solved": total,
                    "easy_solved": easy,
                    "medium_solved": medium,
                    "hard_solved": hard,
                    "ranking": profile.get("ranking"),
                    "updated_at": datetime.now()
                }
            },
            upsert=True
        )
        print(f"  ✓ Saved LeetCode stats: {total} problems solved (E:{easy}, M:{medium}, H:{hard})")

async def sync_heatmap_data(db):
    """Fetch and save heatmap data to MongoDB"""
    print(f"[{datetime.now()}] Syncing heatmap data...")
    
    # GitHub heatmap
    from app.github.heatmap_fetcher import GitHubHeatmapFetcher
    gh_heatmap = GitHubHeatmapFetcher()
    gh_data = await gh_heatmap.get_heatmap("ar586")
    
    if gh_data:
        await db["github_heatmap"].update_one(
            {"username": "ar586"},
            {
                "$set": {
                    "username": "ar586",
                    "data": gh_data,
                    "updated_at": datetime.now()
                }
            },
            upsert=True
        )
        print(f"  ✓ Saved GitHub heatmap data")
    
    # LeetCode heatmap
    lc_client = LeetCodeClient()
    lc_heatmap = await lc_client.get_submission_calendar("aryan_anand2006")
    
    if lc_heatmap:
        await db["leetcode_heatmap"].update_one(
            {"username": "aryan_anand2006"},
            {
                "$set": {
                    "username": "aryan_anand2006",
                    "data": lc_heatmap,
                    "updated_at": datetime.now()
                }
            },
            upsert=True
        )
        print(f"  ✓ Saved LeetCode heatmap data")

async def generate_stats_markdown(db):
    """Generate stats.md for vector store from MongoDB data"""
    print(f"[{datetime.now()}] Generating stats.md for vector store...")
    
    data_dir = os.path.join(current_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    output_file = os.path.join(data_dir, "stats.md")
    
    # Fetch from MongoDB
    gh_stats = await db["github_stats"].find_one({"username": "ar586"})
    lc_stats = await db["leetcode_stats"].find_one({"username": "aryan_anand2006"})
    
    # Generate markdown
    content = f"# Live Development Statistics\n"
    content += f"*Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n"
    
    if gh_stats:
        content += "## GitHub Activity\n"
        content += f"- **Username**: {gh_stats.get('username')}\n"
        content += f"- **Public Repositories**: {gh_stats.get('public_repos')}\n"
        content += f"- **Followers**: {gh_stats.get('followers')}\n"
        content += f"- **Bio**: {gh_stats.get('bio', 'No bio provided')}\n\n"
    
    if lc_stats:
        content += "## LeetCode Problem Solving\n"
        content += f"- **Username**: {lc_stats.get('username')}\n"
        content += f"- **Global Ranking**: {lc_stats.get('ranking')}\n"
        content += f"- **Easy Solved**: {lc_stats.get('easy_solved')}\n"
        content += f"- **Medium Solved**: {lc_stats.get('medium_solved')}\n"
        content += f"- **Hard Solved**: {lc_stats.get('hard_solved')}\n"
        content += f"- **Total Problems Solved**: {lc_stats.get('total_solved')}\n"
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"  ✓ Generated {output_file}")

async def main():
    print(f"\n{'='*60}")
    print(f"Portfolio Data Sync - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")
    
    # Get database connection
    db = get_database()
    
    # Sync all data
    await sync_github_data("ar586", db)
    await sync_leetcode_data("aryan_anand2006", db)
    # TODO: Implement heatmap sync later
    await sync_heatmap_data(db)
    await generate_stats_markdown(db)
    
    print(f"\n{'='*60}")
    print(f"Sync completed successfully!")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    asyncio.run(main())
