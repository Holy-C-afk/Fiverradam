# 🚀 Configuration VPS Contabo pour Billun

## 📧 Informations reçues par email (exemple)
```
Serveur: 1.2.3.4
Utilisateur: root
Mot de passe temporaire: TempPass123
```

## 🔌 Étape 1 : Première connexion SSH

### Sur macOS/Linux :
```bash
ssh root@VOTRE_IP_VPS
# Exemple: ssh root@1.2.3.4
```

### Sur Windows :
- Utilisez **PuTTY** ou **Windows Terminal**
- Host: VOTRE_IP_VPS
- Port: 22
- User: root

## 🔐 Étape 2 : Sécurisation immédiate

### Changement du mot de passe root :
```bash
passwd
# Entrez un nouveau mot de passe fort
```

### Mise à jour du système :
```bash
apt update && apt upgrade -y
```

## 🐳 Étape 3 : Installation automatique de Billun

### Cloner le projet :
```bash
cd /opt
git clone https://github.com/Holy-C-afk/XXXX.git billun
cd billun
```

### Lancer l'installation automatique :
```bash
chmod +x install.sh
./install.sh
```

L'installation va automatiquement :
- ✅ Installer Docker et Docker Compose
- ✅ Configurer le pare-feu (ports 80, 443, 22)
- ✅ Démarrer l'application Billun
- ✅ Créer l'utilisateur admin
- ✅ Configurer les sauvegardes automatiques

## 🌐 Étape 4 : Accès à l'application

### Sans nom de domaine :
- **Frontend** : http://VOTRE_IP_VPS:3000
- **Backend API** : http://VOTRE_IP_VPS:8000

### Avec nom de domaine (optionnel) :
```bash
# Après avoir pointé votre domaine vers l'IP
./setup-nginx.sh
# Suivez les instructions pour SSL automatique
```

## 👑 Étape 5 : Connexion Admin

### Identifiants par défaut :
- **Email** : admin@billun.com
- **Mot de passe** : Admin123!

**⚠️ IMPORTANT** : Changez immédiatement le mot de passe admin après la première connexion !

## 📊 Étape 6 : Vérification du déploiement

### Vérifier que tous les services fonctionnent :
```bash
docker-compose ps
```

### Voir les logs en cas de problème :
```bash
# Logs backend
docker-compose logs backend

# Logs frontend
docker-compose logs frontend

# Logs base de données
docker-compose logs db
```

## 🔧 Optimisation pour VPS Budget

### Pour VPS avec 2GB RAM ou moins :
```bash
# Utiliser la configuration budget
cp docker-compose.budget.yml docker-compose.yml
docker-compose down
docker-compose up -d

# Optimiser le VPS
chmod +x optimize-budget-vps.sh
./optimize-budget-vps.sh
```

## 🔄 Maintenance et Sauvegardes

### Sauvegardes automatiques (déjà configurées) :
- **Base de données** : Sauvegarde quotidienne à 2h00
- **Fichiers** : Sauvegarde hebdomadaire
- **Localisation** : `/opt/backups/`

### Mise à jour de l'application :
```bash
cd /opt/billun
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

## 🆘 Support et Dépannage

### Redémarrer tous les services :
```bash
cd /opt/billun
docker-compose restart
```

### Restaurer une sauvegarde :
```bash
# Lister les sauvegardes
ls -la /opt/backups/

# Restaurer (exemple)
./restore-backup.sh /opt/backups/backup_2025-07-16.tar.gz
```

## 📞 Contacts d'urgence

- **Contabo Support** : https://my.contabo.com/
- **Documentation Billun** : Voir README.md
- **Logs système** : `/var/log/`

---

## ✅ Checklist de déploiement

- [ ] VPS acheté et email reçu
- [ ] Connexion SSH réussie
- [ ] Mot de passe root changé
- [ ] Système mis à jour
- [ ] Billun installé avec `install.sh`
- [ ] Application accessible via IP
- [ ] Connexion admin testée
- [ ] Mot de passe admin changé
- [ ] (Optionnel) Domaine configuré avec SSL

**🎉 Félicitations ! Votre application Billun est maintenant en production !**
