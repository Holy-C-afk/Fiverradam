#!/bin/bash

# Script d'optimisation pour VPS Budget (1-2GB RAM)
# Usage: ./optimize-budget-vps.sh

set -e

echo "🔧 Optimisation du VPS pour Billun (Configuration Budget)"

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérification des privilèges root
if [[ $EUID -ne 0 ]]; then
   echo "Ce script doit être exécuté en tant que root"
   exit 1
fi

# 1. Configuration du swap pour VPS avec peu de RAM
echo_info "Configuration du fichier swap (2GB)..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # Ajout au fstab pour persistance
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    echo_info "Swap de 2GB créé et activé"
else
    echo_warning "Fichier swap déjà existant"
fi

# 2. Optimisation des paramètres système
echo_info "Optimisation des paramètres système..."

# Configuration de la mémoire virtuelle
cat >> /etc/sysctl.conf << EOF

# Optimisations Billun VPS Budget
vm.swappiness=10
vm.vfs_cache_pressure=50
vm.dirty_ratio=15
vm.dirty_background_ratio=5
net.core.rmem_default = 31457280
net.core.rmem_max = 134217728
net.core.wmem_default = 31457280
net.core.wmem_max = 134217728
net.core.somaxconn = 4096
net.core.netdev_max_backlog = 65536
net.ipv4.tcp_rmem = 4096 31457280 134217728
net.ipv4.tcp_wmem = 4096 31457280 134217728
EOF

# Application des paramètres
sysctl -p

# 3. Optimisation Docker
echo_info "Optimisation Docker..."

# Configuration Docker daemon pour limiter l'utilisation des ressources
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
EOF

# Redémarrage Docker pour appliquer la configuration
systemctl restart docker

# 4. Configuration automatique du nettoyage
echo_info "Configuration du nettoyage automatique..."

# Script de nettoyage quotidien
cat > /opt/cleanup-billun.sh << 'EOF'
#!/bin/bash
# Nettoyage automatique quotidien

echo "$(date): Début du nettoyage automatique"

# Nettoyage Docker
docker system prune -f --volumes

# Nettoyage des logs système
journalctl --vacuum-time=7d

# Nettoyage du cache APT
apt-get clean
apt-get autoclean

# Nettoyage des fichiers temporaires
find /tmp -type f -atime +7 -delete

echo "$(date): Nettoyage terminé"
EOF

chmod +x /opt/cleanup-billun.sh

# Ajout au cron pour exécution quotidienne à 3h du matin
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/cleanup-billun.sh >> /var/log/cleanup-billun.log 2>&1") | crontab -

# 5. Configuration des limites utilisateur
echo_info "Configuration des limites utilisateur..."
cat >> /etc/security/limits.conf << EOF

# Limites pour Billun
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

# 6. Optimisation du backend FastAPI pour VPS budget
echo_info "Création du Dockerfile optimisé pour le backend..."
if [ -d "/opt/Fiverradam/backend" ]; then
    cat > /opt/Fiverradam/backend/Dockerfile.budget << 'EOF'
FROM python:3.11-alpine

WORKDIR /app

# Installation des dépendances système minimales
RUN apk add --no-cache postgresql-dev gcc musl-dev

# Copie et installation des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code
COPY ./app /app/app

# Configuration pour VPS budget (un seul worker)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
EOF
fi

# 7. Optimisation du frontend Next.js
echo_info "Création du Dockerfile optimisé pour le frontend..."
if [ -d "/opt/Fiverradam/frontend" ]; then
    cat > /opt/Fiverradam/frontend/Dockerfile.budget << 'EOF'
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
EOF
fi

# 8. Surveillance des ressources
echo_info "Installation d'outils de surveillance..."

# Script de monitoring simple
cat > /opt/monitor-resources.sh << 'EOF'
#!/bin/bash
# Monitoring simple des ressources

LOG_FILE="/var/log/billun-monitoring.log"

echo "$(date): === Monitoring Billun ===" >> $LOG_FILE
echo "Mémoire:" >> $LOG_FILE
free -h >> $LOG_FILE
echo "Disque:" >> $LOG_FILE
df -h >> $LOG_FILE
echo "CPU:" >> $LOG_FILE
top -bn1 | grep "Cpu(s)" >> $LOG_FILE
echo "Docker:" >> $LOG_FILE
docker stats --no-stream >> $LOG_FILE
echo "================================" >> $LOG_FILE
EOF

chmod +x /opt/monitor-resources.sh

# Monitoring toutes les heures
(crontab -l 2>/dev/null; echo "0 * * * * /opt/monitor-resources.sh") | crontab -

# 9. Configuration d'alertes simples
echo_info "Configuration des alertes de mémoire..."
cat > /opt/check-memory.sh << 'EOF'
#!/bin/bash
# Alerte si utilisation mémoire > 90%

MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')

if [ $MEMORY_USAGE -gt 90 ]; then
    echo "$(date): ALERTE - Utilisation mémoire: ${MEMORY_USAGE}%" >> /var/log/billun-alerts.log
    # Redémarrage automatique si mémoire critique
    if [ $MEMORY_USAGE -gt 95 ]; then
        echo "$(date): Redémarrage automatique - Mémoire critique: ${MEMORY_USAGE}%" >> /var/log/billun-alerts.log
        cd /opt/Fiverradam && docker-compose restart
    fi
fi
EOF

chmod +x /opt/check-memory.sh

# Vérification de la mémoire toutes les 15 minutes
(crontab -l 2>/dev/null; echo "*/15 * * * * /opt/check-memory.sh") | crontab -

echo ""
echo_info "✅ Optimisation terminée!"
echo ""
echo "📊 Optimisations appliquées:"
echo "  - Swap de 2GB configuré"
echo "  - Paramètres système optimisés"
echo "  - Docker optimisé pour VPS budget"
echo "  - Nettoyage automatique configuré"
echo "  - Monitoring des ressources activé"
echo "  - Alertes mémoire configurées"
echo ""
echo "📝 Logs importants:"
echo "  - Nettoyage: /var/log/cleanup-billun.log"
echo "  - Monitoring: /var/log/billun-monitoring.log"
echo "  - Alertes: /var/log/billun-alerts.log"
echo ""
echo "🔄 Redémarrage recommandé pour appliquer toutes les optimisations:"
echo "  sudo reboot"
