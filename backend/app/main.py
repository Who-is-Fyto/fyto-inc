import os
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import requests # Added for simple Resend API call

# --- CONFIGURATION ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://Chipapa:3vO1gONCY614h8Do@fytoinc.vlzilq6.mongodb.net/?retryWrites=true&w=majority&tls=true")
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "FYTO_SECRET_2026_SQUAD")
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "re_fEoAskoF_C7csh5N2tAoSGLarzLwzJPzU")
DB_NAME = "fyto_portfolio"
MY_EMAIL = "mtmazhambe@gmail.com" # Updated to your primary personal email

app = FastAPI(title="Fytò Inc. API")

# --- CORS SETUP ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
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

class ContactForm(BaseModel):
    name: str
    email: str
    message: str

# --- SECURITY ---
async def verify_admin_key(x_admin_key: str = Header(None)):
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized: Invalid Admin Key")
    return x_admin_key

# --- PUBLIC ENDPOINTS ---

@app.get("/api/projects", response_model=List[Project])
async def get_projects():
    cursor = db.projects.find().sort("date_added", -1)
    projects = await cursor.to_list(length=100)
    for p in projects:
        p["_id"] = str(p["_id"])
    return projects

@app.get("/api/status")
async def get_status():
    status = await db.status.find_one({"id": "current_status"})
    if status:
        return {"text": status["text"], "is_online": status["is_online"]}
    return {"text": "Finalizing IT Degree & Open for Freelance", "is_online": True}

@app.post("/contact")
async def send_contact_email(form: ContactForm):
    """The Signal Relay: Sends form data to your email via Resend."""
    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            json={
                "from": "Fytò Inc. <onboarding@resend.dev>", # Resend uses this for unverified domains
                "to": [MY_EMAIL],
                "subject": f"New Signal from {form.name}",
                "html": f"<strong>Name:</strong> {form.name}<br><strong>Email:</strong> {form.email}<br><br><strong>Message:</strong><br>{form.message}"
            }
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Email relay failed")
        return {"message": "Signal transmitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ADMIN ENDPOINTS (PROTECTED) ---

@app.post("/api/admin/projects", dependencies=[Depends(verify_admin_key)])
async def add_project(project: Project):
    result = await db.projects.insert_one(project.dict())
    return {"message": "Project cultivated successfully", "id": str(result.inserted_id)}

@app.post("/api/admin/status", dependencies=[Depends(verify_admin_key)])
async def update_status(status: StatusUpdate):
    await db.status.update_one(
        {"id": "current_status"}, 
        {"$set": status.dict()}, 
        upsert=True
    )
    return {"message": "Status signal updated"}

@app.delete("/api/admin/projects/{project_id}", dependencies=[Depends(verify_admin_key)])
async def delete_project(project_id: str):
    from bson import ObjectId
    await db.projects.delete_one({"_id": ObjectId(project_id)})
    return {"message": "Project pruned from Greenhouse"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
