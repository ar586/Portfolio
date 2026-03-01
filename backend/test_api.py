import requests
import sys

BASE_URL = "http://localhost:8000"

def test_endpoint(name, url, expected_status=200):
    try:
        response = requests.get(f"{BASE_URL}{url}", timeout=10)
        if response.status_code == expected_status:
            print(f"✅ {name}: OK ({response.status_code})")
            return True
        else:
            print(f"❌ {name}: Failed with status {response.status_code}")
            try:
                print(f"   Response: {response.json()}")
            except:
                print(f"   Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ {name}: Request Failed - {e}")
        return False

def test_post_endpoint(name, url, payload, expected_status=200):
    try:
        response = requests.post(f"{BASE_URL}{url}", json=payload, timeout=15)
        if response.status_code == expected_status:
            print(f"✅ {name}: OK ({response.status_code})")
            return True
        else:
            print(f"❌ {name}: Failed with status {response.status_code}")
            try:
                print(f"   Response: {response.json()}")
            except:
                print(f"   Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ {name}: Request Failed - {e}")
        return False

def main():
    print("Starting Backend API Integration Tests...\n")
    
    endpoints = [
        ("Health Check", "/health"),
        ("Profile Retrieval", "/api/v1/profile"),
        ("GitHub Stats", "/api/v1/github/stats/ar586"),
        ("LeetCode Stats", "/api/v1/leetcode/stats/aryan_anand2006"),
        ("Cached GitHub Stats", "/api/v1/cached/github/stats/ar586"),
        ("Cached LeetCode Stats", "/api/v1/cached/leetcode/stats/aryan_anand2006"),
    ]
    
    all_passed = True
    for name, url in endpoints:
        if not test_endpoint(name, url):
            all_passed = False
            
    # Test chat endpoint
    print("\nTesting Chat Endpoint...")
    chat_payload = {"message": "Hello, who are you?", "session_id": "test_session_123"}
    if not test_post_endpoint("Chat API", "/api/v1/chat/query", chat_payload):
        all_passed = False

    print("\n" + "="*40)
    if all_passed:
        print("🎉 ALL TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("🚨 SOME TESTS FAILED. CHECK LOGS ABOVE.")
        sys.exit(1)

if __name__ == "__main__":
    main()
