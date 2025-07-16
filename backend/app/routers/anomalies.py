from fastapi import APIRouter

router = APIRouter(prefix="/anomalies", tags=["anomalies"])

@router.get("/")
def get_anomalies():
    return [{"id":1, "materiel_id":1, "description":"Rayure sur porte", "photo_url":"url_photo"}] 