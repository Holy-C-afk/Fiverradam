#!/bin/bash

# Script d'installation automatique de Billun sur VPS
# Usage: curl -fsSL https://raw.githubusercontent.com/Holy-C-afk/Fiverradam/main/install.sh | bash

set -e

echo "🚀 Installation de Billun sur VPS..."

# Variables
VPS_IP=$(curl -s ifconfig.me)
PROJECT_DIR="/opt/Fiverradam"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des privilèges root
if [[ $EUID -ne 0 ]]; then
   echo_error "Ce script doit être exécuté en tant que root (utilisez sudo)"
   exit 1
fi

echo_info "Détection de l'IP du VPS: $VPS_IP"

# Mise à jour du système
echo_info "Mise à jour du système..."
apt update && apt upgrade -y

# Installation des dépendances
echo_info "Installation des outils essentiels..."
apt install -y curl wget git nano ufw fail2ban

# Installation de Docker
echo_info "Installation de Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo_warning "Docker est déjà installé"
fi

# Installation de Docker Compose
echo_info "Installation de Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt install -y docker-compose
else
    echo_warning "Docker Compose est déjà installé"
fi

# Configuration du firewall
echo_info "Configuration du firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001
ufw allow 8000
echo "y" | ufw enable

# Configuration de Fail2Ban
echo_info "Configuration de Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Clonage du projet
echo_info "Clonage du projet Billun..."
if [ -d "$PROJECT_DIR" ]; then
    echo_warning "Le répertoire $PROJECT_DIR existe déjà. Mise à jour..."
    cd $PROJECT_DIR
    git pull origin main
else
    git clone https://github.com/Holy-C-afk/Fiverradam.git $PROJECT_DIR
    cd $PROJECT_DIR
fi

# Configuration des variables d'environnement
echo_info "Configuration des variables d'environnement..."
sed -i "s/http:\/\/localhost:8000/http:\/\/$VPS_IP:8000/g" docker-compose.prod.yml
sed -i "s/http:\/\/localhost:3001/http:\/\/$VPS_IP:3001/g" docker-compose.prod.yml

# Génération de secrets sécurisés
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

sed -i "s/votre_super_secret_key_production_2024_changez_moi/$SECRET_KEY/g" docker-compose.prod.yml
sed -i "s/votre_secret_jwt_super_securise_changez_moi/$JWT_SECRET/g" docker-compose.prod.yml

# Configuration du frontend
echo_info "Configuration du frontend..."
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://$VPS_IP:8000
NEXTAUTH_SECRET=$JWT_SECRET
NEXTAUTH_URL=http://$VPS_IP:3001
EOF

# Démarrage des services
echo_info "Construction et démarrage des conteneurs..."
docker-compose -f docker-compose.prod.yml up -d --build

# Attente du démarrage des services
echo_info "Attente du démarrage des services (60 secondes)..."
sleep 60

# Création de l'utilisateur admin
echo_info "Création de l'utilisateur administrateur..."
ADMIN_PASSWORD=$(openssl rand -base64 12)

curl -X POST "http://localhost:8000/auth/create-admin" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@billun.com\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"nom\": \"Admin\",
    \"prénom\": \"Super\",
    \"société\": \"Billun\",
    \"téléphone\": \"+33123456789\"
  }" > /dev/null 2>&1

# Création du script de sauvegarde
echo_info "Création du script de sauvegarde..."
cat > /opt/backup-billun.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
docker exec fiverradam-db-1 pg_dump -U billun_user billun_db > $BACKUP_DIR/billun_backup_$DATE.sql

# Suppression des sauvegardes de plus de 7 jours
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Sauvegarde terminée: billun_backup_$DATE.sql"
EOF

chmod +x /opt/backup-billun.sh

# Ajout au cron pour sauvegarde quotidienne à 2h du matin
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-billun.sh") | crontab -

# Création du script de mise à jour
echo_info "Création du script de mise à jour..."
cat > /opt/update-billun.sh << 'EOF'
#!/bin/bash
cd /opt/Fiverradam

echo "Arrêt des services..."
docker-compose -f docker-compose.prod.yml down

echo "Mise à jour du code..."
git pull origin main

echo "Reconstruction et redémarrage..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "Mise à jour terminée!"
EOF

chmod +x /opt/update-billun.sh

# Affichage des informations finales
echo ""
echo_info "🎉 Installation terminée avec succès!"
echo ""
echo "📋 Informations d'accès:"
echo "  Frontend: http://$VPS_IP:3001"
echo "  Backend API: http://$VPS_IP:8000"
echo "  Documentation API: http://$VPS_IP:8000/docs"
echo ""
echo "🔑 Identifiants administrateur:"
echo "  Email: admin@billun.com"
echo "  Mot de passe: $ADMIN_PASSWORD"
echo ""
echo "⚠️  IMPORTANT: Notez bien le mot de passe administrateur ci-dessus!"
echo ""
echo "🔧 Commandes utiles:"
echo "  Voir les logs: docker-compose -f /opt/Fiverradam/docker-compose.prod.yml logs -f"
echo "  Redémarrer: docker-compose -f /opt/Fiverradam/docker-compose.prod.yml restart"
echo "  Mettre à jour: /opt/update-billun.sh"
echo "  Sauvegarder: /opt/backup-billun.sh"
echo ""
echo_info "Installation terminée! Billun est maintenant accessible."

# Sauvegarde des informations dans un fichier
cat > /opt/billun-info.txt << EOF
Installation Billun - $(date)

IP du VPS: $VPS_IP
Frontend: http://$VPS_IP:3001
Backend: http://$VPS_IP:8000
Documentation: http://$VPS_IP:8000/docs

Admin Email: admin@billun.com
Admin Password: $ADMIN_PASSWORD

Secret Key: $SECRET_KEY
JWT Secret: $JWT_SECRET
EOF

echo_info "Les informations ont été sauvegardées dans /opt/billun-info.txt"
