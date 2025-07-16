from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import SessionLocal
from .. import models

router = APIRouter(prefix="/anomalies", tags=["anomalies"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Modèles Pydantic pour les anomalies
class AnomalieCreate(BaseModel):
    materiel_id: int
    description: str
    photo_url: Optional[str] = None

class AnomalieUpdate(BaseModel):
    materiel_id: Optional[int] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None

class AnomalieResponse(BaseModel):
    id: int
    materiel_id: int
    description: str
    photo_url: Optional[str] = None
    date_signalement: datetime

    class Config:
        from_attributes = True

@router.get("/")
def get_anomalies(db: Session = Depends(get_db)):
    anomalies = db.query(models.Anomalie).all()
    return anomalies

@router.get("/{anomalie_id}")
def get_anomalie(anomalie_id: int, db: Session = Depends(get_db)):
    anomalie = db.query(models.Anomalie).filter(models.Anomalie.id == anomalie_id).first()
    if not anomalie:
        raise HTTPException(status_code=404, detail="Anomalie non trouvée")
    return anomalie

@router.post("/")
def create_anomalie(anomalie: AnomalieCreate, db: Session = Depends(get_db)):
    # Vérifier que le matériel existe
    materiel = db.query(models.Materiel).filter(models.Materiel.id == anomalie.materiel_id).first()
    if not materiel:
        raise HTTPException(status_code=400, detail="Matériel non trouvé")
    
    db_anomalie = models.Anomalie(**anomalie.dict())
    db.add(db_anomalie)
    db.commit()
    db.refresh(db_anomalie)
    
    return {
        "id": db_anomalie.id,
        "materiel_id": db_anomalie.materiel_id,
        "description": db_anomalie.description,
        "photo_url": db_anomalie.photo_url,
        "date_signalement": db_anomalie.date_signalement
    }

@router.put("/{anomalie_id}")
def update_anomalie(anomalie_id: int, anomalie: AnomalieUpdate, db: Session = Depends(get_db)):
    db_anomalie = db.query(models.Anomalie).filter(models.Anomalie.id == anomalie_id).first()
    if not db_anomalie:
        raise HTTPException(status_code=404, detail="Anomalie non trouvée")
    
    # Mettre à jour seulement les champs fournis
    update_data = anomalie.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_anomalie, field, value)
    
    db.commit()
    db.refresh(db_anomalie)
    
    return {
        "id": db_anomalie.id,
        "materiel_id": db_anomalie.materiel_id,
        "description": db_anomalie.description,
        "photo_url": db_anomalie.photo_url,
        "date_signalement": db_anomalie.date_signalement
    }

@router.delete("/{anomalie_id}")
def delete_anomalie(anomalie_id: int, db: Session = Depends(get_db)):
    db_anomalie = db.query(models.Anomalie).filter(models.Anomalie.id == anomalie_id).first()
    if not db_anomalie:
        raise HTTPException(status_code=404, detail="Anomalie non trouvée")
    
    db.delete(db_anomalie)
    db.commit()
    
    return {"message": "Anomalie supprimée avec succès"} 