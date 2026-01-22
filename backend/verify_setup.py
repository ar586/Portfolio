import httpx
import time
import sys

def verify():
    base_url = "http://localhost:8000"
    print("Waiting for server to start...")
    for _ in range(10):
        try:
            resp = httpx.get(f"{base_url}/health")
            if resp.status_code == 200:
                print("Server is up!")
                break
        except httpx.ConnectError:
            time.sleep(1)
    else:
        print("Server failed to start.")
        sys.exit(1)

    print("Testing GitHub Stats Endpoint...")
    resp = httpx.get(f"{base_url}/api/v1/github/stats/octocat")
    if resp.status_code == 200:
        print("GitHub Stats: OK")
        print(resp.json())
    else:
        print(f"GitHub Stats: Failed ({resp.status_code})")
        print(resp.text)
        sys.exit(1)

    print("Testing GitHub Repos Endpoint...")
    resp = httpx.get(f"{base_url}/api/v1/github/repos/octocat")
    if resp.status_code == 200:
        print("GitHub Repos: OK")
        print(f"Found {len(resp.json())} repos.")
    else:
        print(f"GitHub Repos: Failed ({resp.status_code})")

    print("Testing LeetCode Stats Endpoint...")
    # Use a known username that exists, e.g., 'kaidul' or 'neal_wu'
    resp = httpx.get(f"{base_url}/api/v1/leetcode/stats/neal_wu") 
    if resp.status_code == 200:
        print("LeetCode Stats: OK")
        print("Ranking:", resp.json().get("profile", {}).get("ranking"))
    else:
        print(f"LeetCode Stats: Failed ({resp.status_code})")
        print(resp.text)

    print("Testing LeetCode Heatmap Endpoint...")
    resp = httpx.get(f"{base_url}/api/v1/leetcode/heatmap/neal_wu")
    if resp.status_code == 200:
        print("LeetCode Heatmap: OK")
        print(f"Calendar data length: {len(resp.json().get('submissionCalendar', {}))}")
    else:
        print(f"LeetCode Heatmap: Failed ({resp.status_code})")

    print("Testing Profile Endpoint (Resume)...")
    resp = httpx.get(f"{base_url}/api/v1/profile/resume")
    if resp.status_code == 200:
        print("Profile Resume: OK")
        print("Content Preview:", resp.json().get("content", "")[:50])
    else:
        print(f"Profile Resume: Failed ({resp.status_code})")
        
    print("Testing Profile List Endpoint...")
    resp = httpx.get(f"{base_url}/api/v1/profile/")
    if resp.status_code == 200:
        print("Profile List: OK")
        print("Documents:", resp.json().get("documents"))
    else:
        print(f"Profile List: Failed ({resp.status_code})")
        
if __name__ == "__main__":
    verify()
