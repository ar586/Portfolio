from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, github_stats, leetcode_stats, chat, projects
from app.api import github_cached, leetcode_cached

app = FastAPI(title="Portfolio Backend API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router, prefix="/api/v1/profile", tags=["profile"])
app.include_router(github_stats.router, prefix="/api/v1/github", tags=["github"])
app.include_router(leetcode_stats.router, prefix="/api/v1/leetcode", tags=["leetcode"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])

# Cached endpoints (read from MongoDB)
app.include_router(github_cached.router, prefix="/api/v1/cached/github", tags=["cached-github"])
app.include_router(leetcode_cached.router, prefix="/api/v1/cached/leetcode", tags=["cached-leetcode"])




@app.get("/health")
async def health_check():
    return {"status": "ok"}
