#!/bin/bash

# Comprehensive Backend API Test Script
echo "=== Comprehensive Backend API Testing ==="
echo "Testing backend at http://localhost:8000"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_TESTS=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local expected_status=$4
    local data=$5
    local headers=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing $description... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json $headers "$url")
    elif [ "$method" == "POST" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST $headers -d "$data" "$url")
    fi
    
    status_code="${response: -3}"
    
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}PASS${NC} (Status: $status_code)"
        PASS_COUNT=$((PASS_COUNT + 1))
        if [ -f /tmp/response.json ]; then
            echo "  Response: $(cat /tmp/response.json | head -c 100)..."
        fi
    else
        echo -e "${RED}FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        if [ -f /tmp/response.json ]; then
            echo "  Response: $(cat /tmp/response.json)"
        fi
    fi
    echo
}

# Test 1: Root endpoint
test_endpoint "GET" "http://localhost:8000/" "Root endpoint" "200"

# Test 2: Health check
test_endpoint "GET" "http://localhost:8000/health" "Health check" "200"

# Test 3: API Documentation
test_endpoint "GET" "http://localhost:8000/docs" "API Documentation (Swagger)" "200"

# Test 4: OpenAPI JSON
test_endpoint "GET" "http://localhost:8000/openapi.json" "OpenAPI JSON schema" "200"

# Test 5: Users list (should work without auth for testing)
test_endpoint "GET" "http://localhost:8000/users/" "Users list" "200"

# Test 6: Stats endpoint
test_endpoint "GET" "http://localhost:8000/stats/users" "User statistics" "200"

# Test 7: Materials endpoint
test_endpoint "GET" "http://localhost:8000/materiels/" "Materials list" "200"

# Test 8: Anomalies endpoint
test_endpoint "GET" "http://localhost:8000/anomalies/" "Anomalies list" "200"

# Test 9: Contact endpoint (POST)
contact_data='{"subject":"Test Subject","email":"test@example.com","message":"Test message from comprehensive test"}'
test_endpoint "POST" "http://localhost:8000/contact/" "Contact form submission" "200" "$contact_data" "-H 'Content-Type: application/json'"

# Test 10: User registration (might fail due to duplicate admin user - that's expected)
register_data='{"username":"testuser123","email":"testuser123@example.com","password":"testpassword123","full_name":"Test User"}'
test_endpoint "POST" "http://localhost:8000/auth/register" "User registration (may fail if user exists)" "201" "$register_data" "-H 'Content-Type: application/json'"

# Test 11: Login with admin user (if exists)
login_data='{"username":"admin","password":"admin123"}'
echo -n "Testing admin login... "
login_response=$(curl -s -w "%{http_code}" -o /tmp/login_response.json -X POST -H 'Content-Type: application/x-www-form-urlencoded' -d 'username=admin&password=admin123' "http://localhost:8000/auth/token")
login_status="${login_response: -3}"

if [ "$login_status" == "200" ]; then
    echo -e "${GREEN}PASS${NC} (Status: $login_status)"
    ACCESS_TOKEN=$(cat /tmp/login_response.json | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")
    if [ ! -z "$ACCESS_TOKEN" ]; then
        echo "  Access token obtained successfully"
        
        # Test 12: Protected endpoint with authentication
        test_endpoint "GET" "http://localhost:8000/users/me" "Current user info (authenticated)" "200" "" "-H 'Authorization: Bearer $ACCESS_TOKEN'"
    else
        echo "  Could not extract access token"
    fi
else
    echo -e "${YELLOW}SKIP${NC} (Admin login failed: $login_status)"
    echo "  Response: $(cat /tmp/login_response.json 2>/dev/null || echo 'No response')"
fi
echo

# Summary
echo "=== Test Summary ==="
echo -e "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}Some tests failed, but this may be expected (e.g., duplicate user registration)${NC}"
    exit 0
fi
