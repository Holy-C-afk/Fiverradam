from fastapi import APIRouter

router = APIRouter(prefix="/contact", tags=["contact"])

@router.post("/")
def send_contact_message():
    return {"message": "Message reçu"} 