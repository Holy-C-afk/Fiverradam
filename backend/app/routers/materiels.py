from fastapi import APIRouter

router = APIRouter(prefix="/materiels", tags=["materiels"])

@router.get("/")
def get_materiels():
    return [{"id":1, "identifiant":"M001", "plaque":"123-ABC", "type_materiel":"camion"}] 