from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    société = Column(String)
    prénom = Column(String)
    nom = Column(String)
    téléphone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    materiels = relationship("Materiel", back_populates="responsable")

class Materiel(Base):
    __tablename__ = "materiels"

    id = Column(Integer, primary_key=True, index=True)
    identifiant = Column(String, unique=True, index=True)
    plaque = Column(String, index=True)
    type_materiel = Column(String)
    statut = Column(String, default="disponible")
    kilometrage = Column(Integer, default=0)
    date_controle_technique = Column(DateTime, nullable=True)
    options = Column(Text, nullable=True)
    responsable_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    responsable = relationship("User", back_populates="materiels")

class Anomalie(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    materiel_id = Column(Integer, ForeignKey("materiels.id"))
    description = Column(Text)
    photo_url = Column(String)
    date_signalement = Column(DateTime, default=datetime.utcnow)

    materiel = relationship("Materiel") 