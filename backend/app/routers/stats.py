from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models

router = APIRouter(prefix="/stats", tags=["stats"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_stats(db: Session = Depends(get_db)):
    materiels_count = db.query(models.Materiel).count() if hasattr(models, 'Materiel') else 0
    anomalies_count = db.query(models.Anomalie).count() if hasattr(models, 'Anomalie') else 0
    users_count = db.query(models.User).count()
    
    return {
        "materiels_total": materiels_count,
        "anomalies_total": anomalies_count,
        "users_total": users_count
    }

@router.get("/users")
def get_users_stats(db: Session = Depends(get_db)):
    """Statistiques des utilisateurs"""
    total_users = db.query(models.User).count()
    admin_users = db.query(models.User).filter(models.User.role == "admin").count()
    regular_users = total_users - admin_users
    
    return {
        "total_users": total_users,
        "admin_users": admin_users,
        "regular_users": regular_users,
        "roles_distribution": {
            "admin": admin_users,
            "user": regular_users
        }
    }

@router.get("/refresh")
def get_refresh_status():
    """Endpoint pour indiquer au frontend qu'il doit se rafraîchir"""
    from datetime import datetime
    return {
        "should_refresh": True,
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Données mises à jour"
    }