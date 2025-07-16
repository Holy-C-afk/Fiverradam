#!/bin/bash

# 🔍 Script de test complet du backend Billun

echo "🚀 Test du Backend Billun"
echo "=========================="

BACKEND_URL="http://localhost:8000"

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5
    
    echo -n "Testing $description... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method "$BACKEND_URL$endpoint" \
                   -H "Content-Type: application/json" \
                   -d "$data")
    else
        response=$(curl -s -w "%{http_code}" -X $method "$BACKEND_URL$endpoint")
    fi
    
    status_code="${response: -3}"
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo "✅ OK ($status_code)"
        return 0
    else
        echo "❌ FAIL ($status_code, expected $expected_status)"
        return 1
    fi
}

# Tests de base
echo ""
echo "📋 Tests de base"
echo "-----------------"
test_endpoint "GET" "/" 200 "Endpoint racine"
test_endpoint "GET" "/health" 200 "Health check"
test_endpoint "GET" "/docs" 200 "Documentation Swagger"

# Tests d'authentification
echo ""
echo "🔐 Tests d'authentification"
echo "---------------------------"
test_endpoint "GET" "/users/" 200 "Liste des utilisateurs"

# Test de création d'utilisateur
echo ""
echo "👤 Tests de gestion d'utilisateurs"
echo "----------------------------------"

# Créer un utilisateur de test
USER_DATA='{
    "email": "test@billun.com",
    "password": "TestPassword123!",
    "prénom": "Test",
    "nom": "User",
    "société": "Test Corp",
    "téléphone": "+33987654321"
}'

test_endpoint "POST" "/auth/register" 200 "Création d'utilisateur" "$USER_DATA"

# Test de connexion
echo ""
echo "🔑 Test de connexion"
echo "--------------------"

LOGIN_DATA='{
    "username": "test@billun.com",
    "password": "TestPassword123!"
}'

echo -n "Testing connexion utilisateur... "
login_response=$(curl -s -X POST "$BACKEND_URL/auth/token" \
                 -H "Content-Type: application/x-www-form-urlencoded" \
                 -d "username=test@billun.com&password=TestPassword123!")

if echo "$login_response" | grep -q "access_token"; then
    echo "✅ OK"
    TOKEN=$(echo $login_response | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
    echo "🔑 Token obtenu: ${TOKEN:0:20}..."
else
    echo "❌ FAIL"
    echo "Response: $login_response"
fi

# Tests avec authentification
if [ -n "$TOKEN" ]; then
    echo ""
    echo "🔒 Tests avec authentification"
    echo "------------------------------"
    
    # Test endpoint protégé
    echo -n "Testing endpoint protégé... "
    protected_response=$(curl -s -w "%{http_code}" -X GET "$BACKEND_URL/users/me" \
                        -H "Authorization: Bearer $TOKEN")
    
    status_code="${protected_response: -3}"
    
    if [ "$status_code" -eq "200" ]; then
        echo "✅ OK ($status_code)"
    else
        echo "❌ FAIL ($status_code)"
    fi
fi

# Tests des autres endpoints
echo ""
echo "📊 Tests des endpoints métier"
echo "-----------------------------"
test_endpoint "GET" "/materiels/" 200 "Liste des matériels"
test_endpoint "GET" "/anomalies/" 200 "Liste des anomalies"
test_endpoint "GET" "/stats/users" 200 "Statistiques utilisateurs"

echo ""
echo "📧 Test de contact"
echo "------------------"

CONTACT_DATA='{
    "nom": "Test Contact",
    "email": "contact@test.com",
    "message": "Ceci est un message de test"
}'

test_endpoint "POST" "/contact/" 200 "Envoi de message de contact" "$CONTACT_DATA"

echo ""
echo "✅ Tests terminés !"
echo ""
echo "🌐 URLs importantes :"
echo "- API Backend: http://localhost:8000"
echo "- Documentation: http://localhost:8000/docs"
echo "- Health Check: http://localhost:8000/health"
echo ""
echo "👑 Compte Admin :"
echo "- Email: admin@billun.com"
echo "- Mot de passe: Admin123!"
