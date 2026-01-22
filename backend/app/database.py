from motor.motor_asyncio import AsyncIOMotorClient
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = "portfolio_db"

class Database:
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        if not MONGODB_URL:
            print("Warning: MONGODB_URL not found in environment variables.")
            return
            
        try:
            # Development mode: Allow invalid certificates to bypass SSL errors
            self.client = AsyncIOMotorClient(MONGODB_URL, tlsAllowInvalidCertificates=True)
            self.db = self.client[DB_NAME]
            print("Connected to MongoDB")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")

    def get_db(self):
        return self.db

    def close(self):
        if self.client:
            self.client.close()

db_instance = Database()

def get_database():
    if db_instance.client is None:
        db_instance.connect()
    return db_instance.get_db()

# --- Chat History Helpers ---
from datetime import datetime

async def get_chat_history(db, session_id: str, limit: int = 10) -> list:
    """Returns a list of message dicts: [{'role': 'user', 'content': '...'}, ...]"""
    if not session_id:
        return []
    
    collection = db["chat_history"]
    doc = await collection.find_one({"session_id": session_id})
    
    if not doc or "messages" not in doc:
        return []
        
    # Return last N messages
    return doc["messages"][-limit:]

async def save_chat_message(db, session_id: str, user_msg: str, ai_msg: str):
    if not session_id:
        return
        
    collection = db["chat_history"]
    
    # Update or insert
    await collection.update_one(
        {"session_id": session_id},
        {
            "$push": {
                "messages": {
                    "$each": [
                        {"role": "user", "content": user_msg, "timestamp": datetime.now()},
                        {"role": "assistant", "content": ai_msg, "timestamp": datetime.now()}
                    ]
                }
            },
            "$setOnInsert": {"created_at": datetime.now()},
            "$set": {"updated_at": datetime.now()}
        },
        upsert=True
    )
