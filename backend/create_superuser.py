#!/usr/bin/env python3
"""
Script to create a superuser admin account for the Billun backend.
Run this script after the database is set up.
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models import User, Base
from app.database import DATABASE_URL

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_superuser():
    # Create database connection
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if superuser already exists
        existing_admin = db.query(User).filter(User.role == "admin").first()
        if existing_admin:
            print(f"Admin user already exists: {existing_admin.email}")
            return
        
        # Default superuser credentials
        email = os.getenv("ADMIN_EMAIL", "admin@billun.com")
        password = os.getenv("ADMIN_PASSWORD", "admin123456")
        
        # Create superuser
        hashed_password = get_password_hash(password)
        superuser = User(
            email=email,
            hashed_password=hashed_password,
            nom="Super",
            prenom="Admin",
            role="admin",
            is_active=True
        )
        
        db.add(superuser)
        db.commit()
        db.refresh(superuser)
        
        print(f"✅ Superuser created successfully!")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Role: admin")
        print(f"   ID: {superuser.id}")
        
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_superuser()
