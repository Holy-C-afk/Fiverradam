import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.example.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "noreply@example.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "password")

def send_temp_password_email(email_to: str, temp_password: str):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Votre mot de passe temporaire - Billun"
    message["From"] = SMTP_USER
    message["To"] = email_to

    text = f"""Bonjour,

Voici votre mot de passe temporaire pour Billun : {temp_password}

Merci de le modifier après votre première connexion.

Cordialement,
L'équipe Billun."""
    part = MIMEText(text, "plain")
    message.attach(part)

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, email_to, message.as_string()) 