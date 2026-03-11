import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

# 1. Load environment variables immediately
load_dotenv()

# 2. Initialize the App once
app = FastAPI(title="Fytò Inc. API")

# 3. Setup CORS so your Frontend can talk to your Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Define the Data Model
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str

# 5. Email Logic
def send_email_notification(data: ContactForm):
    msg = EmailMessage()
    msg["Subject"] = f"Fytò Inc. New Signal from {data.name}"
    msg["From"] = os.getenv("EMAIL_ADDRESS")
    msg["To"] = os.getenv("EMAIL_ADDRESS")
    msg.set_content(f"Name: {data.name}\nEmail: {data.email}\n\nMessage:\n{data.message}")

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(os.getenv("EMAIL_ADDRESS"), os.getenv("EMAIL_PASSWORD"))
            smtp.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")

# 6. Routes
@app.get("/")
async def root():
    # This fixes the 404 when you visit http://127.0.0.1:8000
    return {"status": "Fytò Inc. Systems Online", "message": "Ready to cultivate growth."}

@app.post("/contact")
async def receive_contact(form: ContactForm, background_tasks: BackgroundTasks):
    # This sends the email in the background so the UI stays "silky"
    background_tasks.add_task(send_email_notification, form)
    
    # Printing to your terminal for debugging
    print(f"Signal Received from {form.name}") 
    
    return {"message": "Signal transmitted to Michael."}
