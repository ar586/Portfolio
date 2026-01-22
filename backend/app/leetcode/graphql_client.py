import httpx
from typing import Dict, Any, Optional

class LeetCodeClient:
    def __init__(self):
        self.url = "https://leetcode.com/graphql"
        self.headers = {
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
        }

    async def _query(self, query: str, variables: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.url,
                json={"query": query, "variables": variables},
                headers=self.headers,
                timeout=10.0
            )
            if response.status_code != 200:
                return {"error": f"LeetCode API error: {response.status_code}"}
            return response.json()

    async def get_user_stats(self, username: str) -> Dict[str, Any]:
        query = """
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                submitStats: submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                }
                profile {
                    ranking
                    reputation
                    realName
                    aboutMe
                    countryName
                    company
                    school
                }
            }
        }
        """
        data = await self._query(query, {"username": username})
        if "errors" in data:
            return {"error": data["errors"][0]["message"]}
        return data.get("data", {}).get("matchedUser", {})

    async def get_submission_calendar(self, username: str) -> Dict[str, Any]:
        query = """
        query getSubmissionCalendar($username: String!) {
            matchedUser(username: $username) {
                submissionCalendar
            }
        }
        """
        data = await self._query(query, {"username": username})
        if "errors" in data:
            return {"error": data["errors"][0]["message"]}
        return data.get("data", {}).get("matchedUser", {})
