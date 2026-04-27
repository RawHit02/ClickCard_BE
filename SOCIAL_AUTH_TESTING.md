# Social Authentication Testing Guide

## Quick Test

### 1. Test Google Sign-In (New User)

```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "phoneNumber": "9876654352",
    "deviceId": "device-iphone-12",
    "fcmToken": "fcm_token_ABC123",
    "googleId": "google-user-123456",
    "authType": "google"
  }'
```

**Expected Output (201 - Created):**
```json
{
  "success": true,
  "message": "User registered successfully via social auth",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@gmail.com",
      "name": "John Doe",
      "phone": "9876654352",
      "isEmailVerified": false,
      "isProfileComplete": false,
      "authProvider": "google"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    },
    "isNewUser": true
  }
}
```

---

### 2. Test Google Sign-In (Existing User - Login)

Use the same email and Google ID from test 1:

```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@gmail.com",
    "googleId": "google-user-123456",
    "authType": "google",
    "deviceId": "device-iphone-12",
    "fcmToken": "fcm_token_NEW456"
  }'
```

**Expected Output (200 - OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@gmail.com",
      "name": "John Doe",
      "phone": "9876654352",
      "isEmailVerified": false,
      "isProfileComplete": false,
      "authProvider": "google"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    },
    "isNewUser": false
  }
}
```

---

### 3. Test Apple Sign-In (New User)

```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@icloud.com",
    "phoneNumber": "9123456789",
    "deviceId": "device-apple-iphone-14",
    "fcmToken": "fcm_token_APPLE_789",
    "appleId": "apple-user-987654",
    "authType": "apple"
  }'
```

**Expected Output (201):**
```json
{
  "success": true,
  "message": "User registered successfully via social auth",
  "data": {
    "user": {
      "id": 2,
      "email": "jane.smith@icloud.com",
      "name": "Jane Smith",
      "phone": "9123456789",
      "isEmailVerified": false,
      "isProfileComplete": false,
      "authProvider": "apple"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    },
    "isNewUser": true
  }
}
```

---

## Validation Testing

### Test 1: Missing Email

```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "google-user-123456",
    "authType": "google"
  }'
```

**Expected Error (400):**
```json
{
  "success": false,
  "message": "Email is required"
}
```

---

### Test 2: Missing authType

```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "googleId": "google-user-123456"
  }'
```

**Expected Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "authType",
      "message": "authType must be either \"google\" or \"apple\""
    }
  ]
}
```

---

### Test 3: Invalid authType

```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "authType": "facebook",
    "googleId": "google-123"
  }'
```

**Expected Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "authType",
      "message": "authType must be either \"google\" or \"apple\""
    }
  ]
}
```

---

### Test 4: Invalid Email Format

```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "authType": "google",
    "googleId": "google-user-123456"
  }'
```

**Expected Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

### Test 5: Missing googleId when authType is "google"

```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "authType": "google"
  }'
```

**Expected Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "googleId",
      "message": "googleId is required when authType is \"google\""
    }
  ]
}
```

---

### Test 6: Missing appleId when authType is "apple"

```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "authType": "apple"
  }'
```

**Expected Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "appleId",
      "message": "appleId is required when authType is \"apple\""
    }
  ]
}
```

---

## Conflict/Error Testing

### Test 1: Social ID Already Linked to Another Account

Create two users with different emails but attempt to reuse a Google ID:

```bash
# First, create user 1
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@gmail.com",
    "googleId": "google-user-SAME-ID",
    "authType": "google"
  }'

# Then try to create user 2 with same Google ID
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@gmail.com",
    "googleId": "google-user-SAME-ID",
    "authType": "google"
  }'
```

**Expected Error (409):**
```json
{
  "success": false,
  "message": "googleId is already linked to another account"
}
```

---

### Test 2: Mixed Provider on Same Email

Create account with Google, then try to login with Apple:

```bash
# First, create with Google
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mixed@gmail.com",
    "googleId": "google-123",
    "authType": "google"
  }'

# Then try to login with Apple
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mixed@gmail.com",
    "appleId": "apple-123",
    "authType": "apple"
  }'
```

**Expected Error (400):**
```json
{
  "success": false,
  "message": "Account was created using google. Please sign in with that provider."
}
```

---

### Test 3: Google ID Mismatch

```bash
# First, create with one Google ID
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mismatch@gmail.com",
    "googleId": "google-id-original",
    "authType": "google"
  }'

# Then try to login with different Google ID
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mismatch@gmail.com",
    "googleId": "google-id-different",
    "authType": "google"
  }'
```

**Expected Error (400):**
```json
{
  "success": false,
  "message": "Google ID mismatch. This account is linked to a different Google account."
}
```

---

## Full Workflow Testing

### Complete User Journey

```bash
# Step 1: New user signs up with Google
echo "=== Step 1: Google Sign-Up ==="
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Complete Test User",
    "email": "complete.test@gmail.com",
    "phoneNumber": "9999999999",
    "deviceId": "device-complete-test",
    "fcmToken": "fcm_complete_test",
    "googleId": "google-complete-test-123",
    "authType": "google"
  }'

# Step 2: Same user logs in (retrieves different tokens)
echo -e "\n=== Step 2: Google Login (Same User) ==="
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "complete.test@gmail.com",
    "googleId": "google-complete-test-123",
    "authType": "google",
    "deviceId": "device-complete-test-2",
    "fcmToken": "fcm_complete_test_2"
  }'

# Step 3: Update device info on next login
echo -e "\n=== Step 3: Login from Different Device ==="
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "complete.test@gmail.com",
    "googleId": "google-complete-test-123",
    "authType": "google",
    "deviceId": "device-complete-test-android",
    "fcmToken": "fcm_complete_test_android"
  }'
```

---

## Testing with PowerShell (Windows)

```powershell
# Test 1: New Google User
$body = @{
    name = "John Doe"
    email = "john.doe@gmail.com"
    phoneNumber = "9876654352"
    deviceId = "device-iphone-12"
    fcmToken = "fcm_token_ABC123"
    googleId = "google-user-123456"
    authType = "google"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/social-signin" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body | Select-Object -Expand Content | ConvertFrom-Json | ConvertTo-Json
```

---

## Testing with Python

```python
import requests
import json

url = "http://localhost:5000/api/auth/social-signin"

# Test: New Google User
payload = {
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "phoneNumber": "9876654352",
    "deviceId": "device-iphone-12",
    "fcmToken": "fcm_token_ABC123",
    "googleId": "google-user-123456",
    "authType": "google"
}

headers = {"Content-Type": "application/json"}

response = requests.post(url, data=json.dumps(payload), headers=headers)
print("Status Code:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))
```

---

## Testing with JavaScript/Node.js

```javascript
// Test: New Google User
const payload = {
  name: "John Doe",
  email: "john.doe@gmail.com",
  phoneNumber: "9876654352",
  deviceId: "device-iphone-12",
  fcmToken: "fcm_token_ABC123",
  googleId: "google-user-123456",
  authType: "google"
};

fetch("http://localhost:5000/api/auth/social-signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error("Error:", err));
```

---

## Checklist for Manual Testing

- [ ] Test Google sign-up (new user)
- [ ] Test Google login (existing user)
- [ ] Test Apple sign-up (new user)
- [ ] Test Apple login (existing user)
- [ ] Test validation: missing email
- [ ] Test validation: missing authType
- [ ] Test validation: invalid authType
- [ ] Test validation: invalid email format
- [ ] Test validation: missing googleId for Google auth
- [ ] Test validation: missing appleId for Apple auth
- [ ] Test error: social ID already linked
- [ ] Test error: mixed providers on same email
- [ ] Test error: social ID mismatch
- [ ] Test with optional fields (name, phone, deviceId, fcmToken)
- [ ] Test without optional fields
- [ ] Verify tokens are returned
- [ ] Verify isNewUser flag is correct
- [ ] Verify database records are created
- [ ] Check refresh token is stored in database
- [ ] Verify email normalization (lowercase)

---

## Notes

- All emails are automatically normalized to lowercase
- Device ID defaults to "UNKNOWN_DEVICE" if not provided
- Access tokens expire in 7 days (configurable)
- Refresh tokens expire in 30 days (configurable)
- Tokens should be stored securely on the client side
- Each social provider (Google/Apple) is tracked separately
- A user can have both Google and Apple IDs if registered via different flows

---

**Last Updated:** 2026-01-15
**Test API Version:** 1.0.0
