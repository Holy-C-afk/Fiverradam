from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import Optional, Union
from passlib.context import CryptContext
from ..database import SessionLocal
from .. import models
from ..routers.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models for user creation
class UserCreate(BaseModel):
    nom_utilisateur: Optional[str] = None  # Optional username field
    email: str
    nom_complet: Optional[str] = None      # Optional full name
    utilisateur_actif: bool = True
    # French fields as expected by frontend
    nom: Optional[str] = None
    prénom: Optional[str] = None
    société: Optional[str] = None
    téléphone: Optional[str] = None
    role: str = "user"
    password: str = "defaultpassword123"  # Default password for admin creation

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    nom: str = ""
    prénom: str = ""
    société: str = ""
    téléphone: str = ""
    role: str

class UserUpdate(BaseModel):
    nom: Optional[str] = None
    prénom: Optional[str] = None
    société: Optional[str] = None
    téléphone: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password):
    return pwd_context.hash(password)

@router.get("/")
def read_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user - for admin use"""
    
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        nom=user.nom if user.nom is not None else "",
        prénom=user.prénom if user.prénom is not None else "",
        société=user.société if user.société is not None else "",
        téléphone=user.téléphone if user.téléphone is not None else ""
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Return dict instead of SQLAlchemy object to avoid validation issues
    return {
        "id": db_user.id,
        "email": db_user.email,
        "nom": db_user.nom or "",
        "prénom": db_user.prénom or "",
        "société": db_user.société or "",
        "téléphone": db_user.téléphone or "",
        "role": db_user.role
    }

@router.get("/me")
def read_user_me(current_user: models.User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user

@router.put("/{user_id}")
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    """Update a user"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Update only provided fields
    update_data = user.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "password" and value:
            setattr(db_user, "hashed_password", get_password_hash(value))
        else:
            setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    
    return {
        "id": db_user.id,
        "email": db_user.email,
        "nom": db_user.nom or "",
        "prénom": db_user.prénom or "",
        "société": db_user.société or "",
        "téléphone": db_user.téléphone or "",
        "role": db_user.role
    }

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db.delete(db_user)
    db.commit()
    
    return {"message": "Utilisateur supprimé avec succès"}