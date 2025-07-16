# Guide de Déploiement VPS - Projet Billun

## 📋 Prérequis VPS

### Spécifications minimales recommandées :
- **RAM** : 2GB minimum (4GB recommandé)
- **CPU** : 2 vCPU minimum
- **Stockage** : 20GB SSD minimum
- **OS** : Ubuntu 20.04+ ou Debian 11+
- **Bande passante** : Illimitée ou minimum 1TB/mois

### Fournisseurs VPS recommandés (Budget ≤ 5€/mois) :

#### **🥇 Top Recommandations Budget :**
- **Contabo** : **€4.99/mois** (4GB RAM, 2 vCPU, 50GB SSD) - ⭐ Meilleur rapport qualité/prix
- **IONOS** : **€1/mois** les 6 premiers mois puis €4/mois (1GB RAM, 1 vCPU, 10GB SSD)
- **Hostinger** : **€3.99/mois** (1GB RAM, 1 vCPU, 20GB SSD)
- **OVH VPS Starter** : **€3.50/mois** (2GB RAM, 1 vCPU, 20GB SSD)

#### **🥈 Alternatives Budget :**
- **Vultr Regular** : **$3.50/mois** (512MB RAM, 1 vCPU, 10GB SSD) - Minimum pour Billun
- **DigitalOcean Basic** : **$4/mois** (512MB RAM, 1 vCPU, 10GB SSD)
- **Hetzner Cloud** : **€3.29/mois** (2GB RAM, 1 vCPU, 20GB SSD)
- **PulseHeberg** : **€2.99/mois** (1GB RAM, 1 vCPU, 15GB SSD) - Français

#### **🏆 RECOMMANDATION SPÉCIALE :**
**Contabo VPS S** - €4.99/mois est le meilleur choix car :
- ✅ 4GB RAM (largement suffisant pour Billun)
- ✅ 2 vCPU (bonnes performances)
- ✅ 50GB SSD NVMe (rapide)
- ✅ Bande passante illimitée
- ✅ Support 24/7
- ✅ Datacenters en Europe

## 🚀 Étapes de Déploiement

### 1. Préparation du VPS

```bash
# Connexion SSH au VPS
ssh root@VOTRE_IP_VPS

# Mise à jour du système
apt update && apt upgrade -y

# Installation des outils essentiels
apt install -y curl wget git nano ufw fail2ban

# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installation de Docker Compose
apt install -y docker-compose

# Vérification des installations
docker --version
docker-compose --version
```

### 2. Configuration de la sécurité

```bash
# Configuration du firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001  # Frontend
ufw allow 8000  # Backend API
ufw enable

# Configuration de Fail2Ban
systemctl enable fail2ban
systemctl start fail2ban
```

### 3. Clonage et configuration du projet

```bash
# Clonage du projet
cd /opt
git clone https://github.com/Holy-C-afk/Fiverradam.git
cd Fiverradam

# Création des variables d'environnement pour la production
cp frontend/.env.example frontend/.env.local
```

### 4. Configuration pour la production

```bash
# Éditer les variables d'environnement
nano frontend/.env.local
```

**Contenu du .env.local pour production :**
```env
NEXT_PUBLIC_API_URL=http://VOTRE_IP_VPS:8000
NEXTAUTH_SECRET=votre_secret_jwt_super_securise_ici
NEXTAUTH_URL=http://VOTRE_IP_VPS:3001
```

### 5. Configuration Docker pour production

Créer un fichier `docker-compose.prod.yml` :

```bash
nano docker-compose.prod.yml
```

**Contenu :**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: billun_user
      POSTGRES_PASSWORD: billun_secure_password_2024
      POSTGRES_DB: billun_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - billun_network

  backend:
    build: ./backend
    restart: always
    environment:
      - DATABASE_URL=postgresql://billun_user:billun_secure_password_2024@db:5432/billun_db
      - SECRET_KEY=votre_super_secret_key_production_2024
    depends_on:
      - db
    ports:
      - "8000:8000"
    networks:
      - billun_network

  frontend:
    build: ./frontend
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=http://VOTRE_IP_VPS:8000
      - NEXTAUTH_SECRET=votre_secret_jwt_super_securise_ici
      - NEXTAUTH_URL=http://VOTRE_IP_VPS:3001
    depends_on:
      - backend
    ports:
      - "3001:3000"
    networks:
      - billun_network

volumes:
  postgres_data:

networks:
  billun_network:
    driver: bridge
```

### 6. Déploiement

```bash
# Construction et lancement des conteneurs
docker-compose -f docker-compose.prod.yml up -d --build

# Vérification du statut
docker-compose -f docker-compose.prod.yml ps

# Consultation des logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 7. Création de l'utilisateur admin

```bash
# Attendre que tous les services soient démarrés (30-60 secondes)
sleep 60

# Création de l'utilisateur admin
curl -X POST "http://localhost:8000/auth/create-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@billun.com",
    "password": "VotreMotDePasseSecurise2024!",
    "nom": "Admin",
    "prénom": "Super",
    "société": "Billun",
    "téléphone": "+33123456789"
  }'
```

## 🌐 Configuration avec nom de domaine (Optionnel)

### 1. Installation de Nginx et Certbot

```bash
# Installation
apt install -y nginx certbot python3-certbot-nginx

# Configuration Nginx
nano /etc/nginx/sites-available/billun
```

**Configuration Nginx :**
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Activation et SSL

```bash
# Activation du site
ln -s /etc/nginx/sites-available/billun /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Configuration SSL avec Let's Encrypt
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## 🔧 Scripts de maintenance

### Script de sauvegarde de la base de données

```bash
nano /opt/backup-billun.sh
```

**Contenu :**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
docker exec fiverradam-db-1 pg_dump -U billun_user billun_db > $BACKUP_DIR/billun_backup_$DATE.sql

# Suppression des sauvegardes de plus de 7 jours
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Sauvegarde terminée: billun_backup_$DATE.sql"
```

```bash
chmod +x /opt/backup-billun.sh

# Ajout au cron pour sauvegarde quotidienne
crontab -e
# Ajouter: 0 2 * * * /opt/backup-billun.sh
```

### Script de mise à jour

```bash
nano /opt/update-billun.sh
```

**Contenu :**
```bash
#!/bin/bash
cd /opt/Fiverradam

# Arrêt des services
docker-compose -f docker-compose.prod.yml down

# Mise à jour du code
git pull origin main

# Reconstruction et redémarrage
docker-compose -f docker-compose.prod.yml up -d --build

echo "Mise à jour terminée!"
```

```bash
chmod +x /opt/update-billun.sh
```

## 📱 Accès après déploiement

### URLs d'accès :
- **Frontend** : http://VOTRE_IP_VPS:3001 (ou https://votre-domaine.com)
- **API Backend** : http://VOTRE_IP_VPS:8000
- **Documentation API** : http://VOTRE_IP_VPS:8000/docs

### Identifiants admin :
- **Email** : admin@billun.com
- **Mot de passe** : VotreMotDePasseSecurise2024!

## 🔍 Surveillance et logs

```bash
# Voir les logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f

# Voir l'utilisation des ressources
docker stats

# Redémarrer un service spécifique
docker-compose -f docker-compose.prod.yml restart frontend

# Voir l'espace disque
df -h
```

## 🛡️ Sécurisation supplémentaire

1. **Changer les mots de passe par défaut**
2. **Configurer des sauvegardes automatiques**
3. **Mettre en place un monitoring (Uptime Robot)**
4. **Configurer les alertes email**
5. **Utiliser un CDN (Cloudflare) si nécessaire**

---

**Note** : Remplacez `VOTRE_IP_VPS` par l'IP réelle de votre serveur et configurez un nom de domaine si souhaité.
