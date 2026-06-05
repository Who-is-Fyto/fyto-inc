import os
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- CONFIGURATION ---
# In production, these will be set as Environment Variables in Vercel/Render
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://Chipapa:3vO1gONCY614h8Do@fytoinc.vlzilq6.mongodb.net/?retryWrites=true&w=majority")
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "FYTO_SECRET_2026_SQUAD") # Change this!
DB_NAME = "fyto_portfolio"

app = FastAPI(title="Fytò Inc. API")

# --- CORS SETUP ---
# Allows your Vercel frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # We'll tighten this to your Vercel URL later
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE CONNECTION ---
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# --- MODELS ---
class Project(BaseModel):
    name: str
    description: str
    tech_stack: List[str]
    link: Optional[str] = None
    image_url: Optional[str] = None
    date_added: datetime = Field(default_factory=datetime.utcnow)

class StatusUpdate(BaseModel):
    text: str
    is_online: bool = True

# --- SECURITY ---
async def verify_admin_key(x_admin_key: str = Header(None)):
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized: Invalid Admin Key")
    return x_admin_key

# --- PUBLIC ENDPOINTS ---

@app.get("/api/projects", response_model=List[Project])
async def get_projects():
    """Fetch all projects for the Greenhouse."""
    cursor = db.projects.find().sort("date_added", -1)
    projects = await cursor.to_list(length=100)
    # MongoDB returns _id as ObjectId, we need to convert it or remove it
    for p in projects:
        p["_id"] = str(p["_id"])
    return projects

@app.get("/api/status")
async def get_status():
    """Fetch the current status badge text."""
    status = await db.status.find_one({"id": "current_status"})
    if status:
        return {"text": status["text"], "is_online": status["is_online"]}
    return {"text": "Finalizing IT Degree & Open for Freelance", "is_online": True}

# --- ADMIN ENDPOINTS (PROTECTED) ---

@app.post("/api/admin/projects", dependencies=[Depends(verify_admin_key)])
async def add_project(project: Project):
    """Add a new project to the Greenhouse."""
    result = await db.projects.insert_one(project.dict())
    return {"message": "Project cultivated successfully", "id": str(result.inserted_id)}

@app.post("/api/admin/status", dependencies=[Depends(verify_admin_key)])
async def update_status(status: StatusUpdate):
    """Update the global status badge."""
    await db.status.update_one(
        {"id": "current_status"}, 
        {"$set": status.dict()}, 
        upsert=True
    )
    return {"message": "Status signal updated"}

@app.delete("/api/admin/projects/{project_id}", dependencies=[Depends(verify_admin_key)])
async def delete_project(project_id: str):
    """Remove a project from the Greenhouse."""
    from bson import ObjectId
    await db.projects.delete_one({"_id": ObjectId(project_id)})
    return {"message": "Project pruned from Greenhouse"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
