from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import SessionLocal
from .. import models

router = APIRouter(prefix="/materiels", tags=["materiels"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Modèles Pydantic pour les matériels
class MaterielCreate(BaseModel):
    identifiant: str
    plaque: str
    type_materiel: str
    statut: Optional[str] = "disponible"
    kilometrage: Optional[int] = 0
    date_controle_technique: Optional[datetime] = None
    options: Optional[str] = None
    responsable_id: Optional[int] = None
    
    # Validation des champs obligatoires
    @classmethod
    def model_validate(cls, data):
        if isinstance(data, dict):
            # Vérifier que les champs obligatoires ne sont pas vides
            if not data.get('identifiant', '').strip():
                raise ValueError("L'identifiant ne peut pas être vide")
            if not data.get('plaque', '').strip():
                raise ValueError("La plaque ne peut pas être vide")
            if not data.get('type_materiel', '').strip():
                raise ValueError("Le type de matériel ne peut pas être vide")
        return super().model_validate(data)

class MaterielUpdate(BaseModel):
    identifiant: Optional[str] = None
    plaque: Optional[str] = None
    type_materiel: Optional[str] = None
    statut: Optional[str] = None
    kilometrage: Optional[int] = None
    date_controle_technique: Optional[datetime] = None
    options: Optional[str] = None
    responsable_id: Optional[int] = None

class MaterielResponse(BaseModel):
    id: int
    identifiant: str
    plaque: str
    type_materiel: str
    statut: str
    kilometrage: int
    date_controle_technique: Optional[datetime] = None
    options: Optional[str] = None
    responsable_id: Optional[int] = None

    class Config:
        from_attributes = True

# Endpoints spécifiques doivent venir avant les endpoints avec paramètres
@router.get("/events")
def get_events():
    """Endpoint pour vérifier s'il y a eu des modifications récentes"""
    # Retourne un timestamp simple pour indiquer la dernière modification
    from datetime import datetime
    return {
        "last_update": datetime.utcnow().isoformat(),
        "status": "updated"
    }

@router.get("/count")
def get_materiels_count(db: Session = Depends(get_db)):
    """Obtenir le nombre total de matériels"""
    count = db.query(models.Materiel).count()
    return {"count": count}

@router.get("/")
def get_materiels(db: Session = Depends(get_db)):
    materiels = db.query(models.Materiel).all()
    return materiels

@router.get("/{materiel_id}")
def get_materiel(materiel_id: int, db: Session = Depends(get_db)):
    materiel = db.query(models.Materiel).filter(models.Materiel.id == materiel_id).first()
    if not materiel:
        raise HTTPException(status_code=404, detail="Matériel non trouvé")
    return materiel

@router.post("/")
def create_materiel(materiel: MaterielCreate, db: Session = Depends(get_db)):
    try:
        # Vérifier si l'identifiant existe déjà
        existing_materiel = db.query(models.Materiel).filter(models.Materiel.identifiant == materiel.identifiant).first()
        if existing_materiel:
            raise HTTPException(status_code=400, detail="Un matériel avec cet identifiant existe déjà")
        
        # Validation supplémentaire des champs obligatoires
        if not materiel.identifiant.strip():
            raise HTTPException(status_code=422, detail="L'identifiant ne peut pas être vide")
        if not materiel.plaque.strip():
            raise HTTPException(status_code=422, detail="La plaque ne peut pas être vide")
        if not materiel.type_materiel.strip():
            raise HTTPException(status_code=422, detail="Le type de matériel ne peut pas être vide")
        
        db_materiel = models.Materiel(**materiel.dict())
        db.add(db_materiel)
        db.commit()
        db.refresh(db_materiel)
        
        return {
            "id": db_materiel.id,
            "identifiant": db_materiel.identifiant,
            "plaque": db_materiel.plaque,
            "type_materiel": db_materiel.type_materiel,
            "statut": db_materiel.statut,
            "kilometrage": db_materiel.kilometrage,
            "date_controle_technique": db_materiel.date_controle_technique,
            "options": db_materiel.options,
            "responsable_id": db_materiel.responsable_id,
            "created": True  # Flag pour indiquer une création réussie
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création: {str(e)}")

@router.put("/{materiel_id}")
def update_materiel(materiel_id: int, materiel: MaterielUpdate, db: Session = Depends(get_db)):
    db_materiel = db.query(models.Materiel).filter(models.Materiel.id == materiel_id).first()
    if not db_materiel:
        raise HTTPException(status_code=404, detail="Matériel non trouvé")
    
    # Mettre à jour seulement les champs fournis
    update_data = materiel.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_materiel, field, value)
    
    db.commit()
    db.refresh(db_materiel)
    
    return {
        "id": db_materiel.id,
        "identifiant": db_materiel.identifiant,
        "plaque": db_materiel.plaque,
        "type_materiel": db_materiel.type_materiel,
        "statut": db_materiel.statut,
        "kilometrage": db_materiel.kilometrage,
        "date_controle_technique": db_materiel.date_controle_technique,
        "options": db_materiel.options,
        "responsable_id": db_materiel.responsable_id
    }

@router.delete("/{materiel_id}")
def delete_materiel(materiel_id: int, db: Session = Depends(get_db)):
    db_materiel = db.query(models.Materiel).filter(models.Materiel.id == materiel_id).first()
    if not db_materiel:
        raise HTTPException(status_code=404, detail="Matériel non trouvé")
    
    db.delete(db_materiel)
    db.commit()
    
    return {"message": "Matériel supprimé avec succès"}