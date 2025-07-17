from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, get_db
from . import models
from .routers import auth, users, materiels, anomalies, stats, contact

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Billun Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # à restreindre en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint

@app.post("/create-admin")
def create_admin(db: Session = Depends(get_db)):
    from models import User
    from utils import get_password_hash  # selon ton projet
    hashed_password = get_password_hash("admin123")
    user = User(
        username="admin",
        email="admin@demo.com",
        hashed_password=hashed_password,
        is_admin=True
    )
    db.add(user)
    db.commit()
    return {"message": "Admin created"}

@app.get("/")
def read_root():
    return {"message": "Billun Backend API is running!", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "api": "Billun Backend", "version": "1.0.0"}

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(materiels.router)
app.include_router(anomalies.router)
app.include_router(stats.router)
app.include_router(contact.router)