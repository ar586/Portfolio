from fastapi import FastAPI
from app.api import github_stats
from app.api import leetcode_stats
from app.api import profile
# from app.api import chat # Uncomment as we implement them

app = FastAPI(title="Portfolio Backend API")

app.include_router(github_stats.router, prefix="/api/v1/github", tags=["github"])
app.include_router(leetcode_stats.router, prefix="/api/v1/leetcode", tags=["leetcode"])
app.include_router(profile.router, prefix="/api/v1/profile", tags=["profile"])
# app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
