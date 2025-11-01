#!/usr/bin/env bash

BASE_URL="http://localhost:3000"

echo "🧪 Testing Uptick Talent LMS API"
echo "================================="

# Test 1: Health Check
echo "1. Health Check:"
curl -s "${BASE_URL}/health" | jq '.'
echo

# Test 2: Login as Admin
echo "2. Admin Login:"
ADMIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@upticktalent.com",
    "password": "admin123"
  }')

echo "$ADMIN_RESPONSE" | jq '.'

# Extract admin token
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.data.token')
echo "Admin Token: ${ADMIN_TOKEN:0:50}..."
echo

# Test 3: Get Admin Profile
echo "3. Admin Profile:"
curl -s "${BASE_URL}/auth/profile" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo

# Test 4: List Users (Admin only)
echo "4. List Users:"
curl -s "${BASE_URL}/users/" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo

# Test 5: Get Tracks
echo "5. List Tracks:"
curl -s "${BASE_URL}/tracks/" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo

# Test 6: Create a New Mentor
echo "6. Create New Mentor:"
curl -s -X POST "${BASE_URL}/users/" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice.mentor@upticktalent.com",
    "phoneNumber": "+1234567893",
    "gender": "female",
    "country": "Nigeria",
    "state": "Ogun",
    "role": "mentor"
  }' | jq '.'
echo

# Test 7: Login as Mentor
echo "7. Mentor Login:"
MENTOR_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mentor@upticktalent.com",
    "password": "mentor123"
  }')

echo "$MENTOR_RESPONSE" | jq '.'
MENTOR_TOKEN=$(echo "$MENTOR_RESPONSE" | jq -r '.data.token')
echo

# Test 8: Mentor tries to access user management (should fail)
echo "8. Mentor trying to list users (should fail):"
curl -s "${BASE_URL}/users/" \
  -H "Authorization: Bearer $MENTOR_TOKEN" | jq '.'
echo

# Test 9: Assign tracks to the new mentor
echo "9. Assign Tracks to New Mentor:"
NEW_MENTOR_ID=$(curl -s "${BASE_URL}/users/" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | \
  jq -r '.data.users[] | select(.email == "alice.mentor@upticktalent.com") | ._id')

if [ "$NEW_MENTOR_ID" != "null" ] && [ -n "$NEW_MENTOR_ID" ]; then
  echo "Found new mentor ID: $NEW_MENTOR_ID"
  curl -s -X PATCH "${BASE_URL}/users/${NEW_MENTOR_ID}/assign-tracks" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "trackIds": ["6905f784d0e696a1f328cc19", "6905f784d0e696a1f328cc1b"]
    }' | jq '.'
else
  echo "New mentor not found, skipping track assignment"
fi
echo

# Test 10: Create another admin user
echo "10. Create New Admin:"
curl -s -X POST "${BASE_URL}/users/" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sarah",
    "lastName": "Admin",
    "email": "sarah.admin@upticktalent.com",
    "phoneNumber": "+1234567894",
    "gender": "female",
    "country": "Nigeria",
    "state": "Rivers",
    "role": "admin"
  }' | jq '.'
echo

echo "🎉 API Testing Complete!"
