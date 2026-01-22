from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
from app.database import get_database

router = APIRouter()

class Project(BaseModel):
    title: str
    image_url: Optional[str] = None
    description: str
    github_link: Optional[str] = None
    deployed_link: Optional[str] = None
    tech_stack: Optional[List[str]] = []
    featured: Optional[bool] = False

class ProjectCreate(BaseModel):
    title: str
    image_url: Optional[str] = None
    description: str
    github_link: Optional[str] = None
    deployed_link: Optional[str] = None
    tech_stack: Optional[List[str]] = []
    featured: Optional[bool] = False

@router.get("/")
async def get_all_projects():
    """Get all projects"""
    db = get_database()
    projects = await db["projects"].find().sort("created_at", -1).to_list(length=100)
    
    # Remove MongoDB _id field
    for project in projects:
        project.pop("_id", None)
    
    return {"projects": projects}

@router.get("/featured")
async def get_featured_projects():
    """Get only featured projects"""
    db = get_database()
    projects = await db["projects"].find({"featured": True}).sort("created_at", -1).to_list(length=10)
    
    for project in projects:
        project.pop("_id", None)
    
    return {"projects": projects}

@router.get("/{project_id}")
async def get_project(project_id: str):
    """Get a specific project by ID"""
    db = get_database()
    project = await db["projects"].find_one({"project_id": project_id})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.pop("_id", None)
    return project

@router.post("/")
async def create_project(project: ProjectCreate):
    """Create a new project"""
    db = get_database()
    
    # Generate project ID from title
    project_id = project.title.lower().replace(" ", "-")
    
    project_data = {
        "project_id": project_id,
        "title": project.title,
        "image_url": project.image_url,
        "description": project.description,
        "github_link": project.github_link,
        "deployed_link": project.deployed_link,
        "tech_stack": project.tech_stack or [],
        "featured": project.featured or False,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    await db["projects"].insert_one(project_data)
    
    return {"message": "Project created successfully", "project_id": project_id}

@router.put("/{project_id}")
async def update_project(project_id: str, project: ProjectCreate):
    """Update an existing project"""
    db = get_database()
    
    update_data = {
        "title": project.title,
        "image_url": project.image_url,
        "description": project.description,
        "github_link": project.github_link,
        "deployed_link": project.deployed_link,
        "tech_stack": project.tech_stack or [],
        "featured": project.featured or False,
        "updated_at": datetime.now()
    }
    
    result = await db["projects"].update_one(
        {"project_id": project_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Project updated successfully"}

@router.delete("/{project_id}")
async def delete_project(project_id: str):
    """Delete a project"""
    db = get_database()
    
    result = await db["projects"].delete_one({"project_id": project_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Project deleted successfully"}
