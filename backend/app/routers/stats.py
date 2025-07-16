from fastapi import APIRouter

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/")
def get_stats():
    return {"materiels_total": 10, "anomalies_total": 2} 