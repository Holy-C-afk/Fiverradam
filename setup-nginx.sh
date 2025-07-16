#!/bin/bash

# Script de configuration Nginx + SSL pour Billun
# Usage: ./setup-nginx.sh votre-domaine.com

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 votre-domaine.com"
    exit 1
fi

echo "🌐 Configuration de Nginx et SSL pour $DOMAIN"

# Installation de Nginx et Certbot
apt update
apt install -y nginx certbot python3-certbot-nginx

# Configuration Nginx
cat > /etc/nginx/sites-available/billun << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Documentation API
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Activation du site
ln -sf /etc/nginx/sites-available/billun /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test de la configuration
nginx -t

# Redémarrage de Nginx
systemctl reload nginx

# Configuration SSL avec Let's Encrypt
echo "🔒 Configuration SSL..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Mise à jour des variables d'environnement pour utiliser HTTPS
cd /opt/Fiverradam
sed -i "s/http:\/\/.*:3001/https:\/\/$DOMAIN/g" frontend/.env.local
sed -i "s/NEXTAUTH_URL=.*/NEXTAUTH_URL=https:\/\/$DOMAIN/g" frontend/.env.local

# Redémarrage du frontend pour prendre en compte les nouveaux paramètres
docker-compose -f docker-compose.prod.yml restart frontend

# Configuration du renouvellement automatique SSL
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ Configuration terminée!"
echo "Votre site est maintenant accessible sur:"
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
