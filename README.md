# Billun - Suivi de flotte

## Installation

1. Copier `.env.example` en `.env` et configurer tes variables d’environnement (base de données, SMTP, clé secrète JWT).

2. Lancer les containers Docker :
```bash
docker-compose up --build
```

- Backend : http://localhost:8000/docs
- Frontend : http://localhost:3000

Pour arrêter :
```bash
docker-compose down
```

Pour réinitialiser la base de données :
```bash
docker-compose down -v
```

**Modifie les variables SMTP dans .env pour activer l’envoi de mails.**

Par défaut, le frontend utilise un thème bleu et un design responsive avec Tailwind CSS. 