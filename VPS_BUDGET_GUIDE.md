# 💰 Guide VPS Budget (≤ 5€/mois) pour Billun

## 🏆 TOP 3 Recommandations

### 1. **Contabo VPS S** - €4.99/mois ⭐ **MEILLEUR CHOIX**
- **4GB RAM, 2 vCPU, 50GB SSD NVMe**
- **Bande passante illimitée**
- **Parfait pour Billun** (peut gérer 50+ utilisateurs simultanés)
- **Lien** : https://contabo.com
- **Localisation** : Allemagne, UK, USA, Singapour

### 2. **OVH VPS Starter** - €3.50/mois
- **2GB RAM, 1 vCPU, 20GB SSD**
- **100 Mbps illimité**
- **Support français**
- **Lien** : https://www.ovhcloud.com/fr/vps/
- **Localisation** : France (Gravelines, Strasbourg)

### 3. **Hetzner Cloud CX11** - €3.29/mois
- **2GB RAM, 1 vCPU, 20GB SSD**
- **20TB de trafic**
- **Excellent rapport qualité/prix**
- **Lien** : https://www.hetzner.com/cloud
- **Localisation** : Allemagne, Finlande

## 🚀 Configuration optimisée pour VPS Budget

### Pour VPS avec 1-2GB RAM :

```yaml
# docker-compose.budget.yml
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
    # Optimisation mémoire pour PostgreSQL
    command: >
      postgres 
      -c shared_buffers=128MB
      -c effective_cache_size=512MB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
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
    # Limitation mémoire
    deploy:
      resources:
        limits:
          memory: 512M
    networks:
      - billun_network

  frontend:
    build: ./frontend
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=http://VOTRE_IP:8000
      - NEXTAUTH_SECRET=votre_secret_jwt_securise
      - NEXTAUTH_URL=http://VOTRE_IP:3001
    depends_on:
      - backend
    ports:
      - "3001:3000"
    # Limitation mémoire
    deploy:
      resources:
        limits:
          memory: 512M
    networks:
      - billun_network

volumes:
  postgres_data:

networks:
  billun_network:
    driver: bridge
```

## 📋 Étapes d'achat et configuration

### 🛒 Achat chez Contabo (Recommandé)

1. **Aller sur** : https://contabo.com
2. **Choisir** : VPS S (€4.99/mois)
3. **Configuration** :
   - OS : Ubuntu 22.04 LTS
   - Région : Europe (Allemagne) pour la France
   - Pas d'options supplémentaires nécessaires
4. **Finaliser** l'achat
5. **Attendre l'email** avec les identifiants SSH (5-15 minutes)

### 🛒 Alternative OVH

1. **Aller sur** : https://www.ovhcloud.com/fr/vps/
2. **Choisir** : VPS Starter (€3.50/mois)
3. **Configuration** :
   - Distribution : Ubuntu 22.04
   - Localisation : France
4. **Commander**
5. **Récupérer les identifiants** dans l'espace client

## ⚡ Installation Express (5 minutes)

```bash
# 1. Connexion SSH au VPS
ssh root@VOTRE_IP_VPS

# 2. Installation automatique de Billun
curl -fsSL https://raw.githubusercontent.com/Holy-C-afk/Fiverradam/main/install.sh | bash

# 3. C'est tout ! ✅
```

## 🔧 Optimisations pour VPS Budget

### Script d'optimisation système :

```bash
# Création du script d'optimisation
nano /opt/optimize-budget-vps.sh
```

```bash
#!/bin/bash
# Optimisation pour VPS avec peu de RAM

# Optimisation Swap
echo "Configuration du swap..."
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Optimisation mémoire
echo "vm.swappiness=10" >> /etc/sysctl.conf
echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf

# Nettoyage automatique
echo "0 3 * * * docker system prune -f" | crontab -

# Redémarrage des paramètres
sysctl -p

echo "Optimisation terminée!"
```

```bash
chmod +x /opt/optimize-budget-vps.sh
/opt/optimize-budget-vps.sh
```

## 💡 Conseils pour VPS Budget

### ✅ **DO (À faire) :**
- Utiliser Ubuntu 22.04 LTS (plus optimisé)
- Configurer un swap de 2GB
- Nettoyer régulièrement Docker (`docker system prune`)
- Monitorer l'utilisation mémoire
- Utiliser Nginx pour servir les fichiers statiques

### ❌ **DON'T (À éviter) :**
- Installer des services inutiles
- Utiliser des images Docker non-alpine
- Garder des logs volumineux
- Lancer plusieurs projets sur le même VPS

## 📊 Performances attendues

### Avec Contabo VPS S (4GB RAM) :
- ✅ **50+ utilisateurs simultanés**
- ✅ **Temps de réponse < 200ms**
- ✅ **Upload d'images rapide**
- ✅ **Rapports PDF en < 2 secondes**

### Avec OVH Starter (2GB RAM) :
- ✅ **20-30 utilisateurs simultanés**
- ✅ **Temps de réponse < 500ms**
- ⚠️ **Upload d'images moyennement rapide**
- ⚠️ **Rapports PDF en 3-5 secondes**

## 🆘 Support et aide

### Si vous avez des problèmes :

1. **Vérifier les logs** :
   ```bash
   docker-compose logs -f
   ```

2. **Redémarrer les services** :
   ```bash
   docker-compose restart
   ```

3. **Vérifier l'espace disque** :
   ```bash
   df -h
   ```

4. **Vérifier la mémoire** :
   ```bash
   free -h
   ```

## 💰 Coût total mensuel

- **VPS Contabo** : €4.99
- **Nom de domaine** (optionnel) : €1/mois
- **Total** : **≈ €6/mois** pour un site professionnel avec SSL !

---

**🎯 Recommandation finale** : Prenez le **Contabo VPS S à €4.99/mois**, c'est le meilleur rapport qualité/prix pour faire tourner Billun en production avec d'excellentes performances !
