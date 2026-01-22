import httpx
from typing import Optional, Dict, Any

class GitHubHeatmapFetcher:
    async def get_heatmap(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Fetch GitHub heatmap data using public API.
        Returns JSON structure suitable for frontend rendering.
        """
        try:
            url = f"https://github-contributions-api.jogruber.de/v4/{username}"
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"Failed to fetch GitHub heatmap: {response.status_code}")
                    return None
        except Exception as e:
            print(f"Error fetching GitHub heatmap: {e}")
            return None
