# 💻 Practical Curl Commands - Ready to Copy & Paste

**Before Starting:**
1. Ensure server is running: `npm start`
2. Have a registered user with email & password
3. Replace `YOUR_JWT_TOKEN` with actual JWT token from login
4. Replace `YOUR_EMAIL` and `YOUR_PASSWORD` with your credentials

---

## 📌 SETUP: Get Your JWT Token

```bash
# STEP 1: Register User (if not already registered)
curl -X POST http://localhost:5000/api/users/initiate-registration/unique \
  -H "Content-Type: application/json" \
  -d {
    \"email\":\"testuser@example.com\",
    \"password\":\"TestPassword123\",
    \"firstName\":\"Test\",
    \"lastName\":\"User\"
  }

# STEP 2: Verify Email (check your email for OTP)
curl -X POST http://localhost:5000/api/users/verify-email-otp \
  -H "Content-Type: application/json" \
  -d {
    \"email\":\"testuser@example.com\",
    \"otpCode\":\"123456\"
  }

# STEP 3: Login to Get JWT
curl -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d {
    \"email\":\"testuser@example.com\",
    \"password\":\"TestPassword123\"
  }

# 📌 COPY THE access_token VALUE and use it in commands below as:
# Authorization: Bearer YOUR_JWT_TOKEN
```

---

## ✨ PHASE 1: CORE FEATURES

### 1️⃣ Create Basic Share Link
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    \"custom_slug\":\"my-profile\",
    \"expiry_days\":null,
    \"requires_password\":false
  }
```

### 2️⃣ Create Share Link with Custom Slug
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    \"custom_slug\":\"john-doe-2024\",
    \"requires_password\":false
  }
```

### 3️⃣ Create Link with 30-Day Expiry
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    \"custom_slug\":\"temp-job-interview\",
    \"expiry_days\":30,
    \"requires_password\":false
  }
```

### 4️⃣ List All Your Share Links
```bash
curl -X GET http://localhost:5000/api/share/links \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5️⃣ View Public Profile (By Slug)
```bash
# No authentication required!
curl -X GET http://localhost:5000/api/public/profile/my-profile
```

### 6️⃣ View Public Profile (By Short Code)
```bash
# Short code format: A7KF9M2X (from create response)
curl -X GET http://localhost:5000/api/public/profile/A7KF9M2X
```

### 7️⃣ View Public Profile (By User ID)
```bash
# User ID: 1 (your user ID)
curl -X GET http://localhost:5000/api/public/profile/1
```

### 8️⃣ Get QR Code as Data URL
```bash
curl -X GET http://localhost:5000/api/share/1/qr \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9️⃣ Download QR Code as PNG File
```bash
curl -X GET "http://localhost:5000/api/public/profile/my-profile/qr?format=buffer" \
  -o qr-code.png
```

### 🔟 Get QR Code (Public URL)
```bash
curl -X GET "http://localhost:5000/api/public/profile/my-profile/qr?format=dataurl"
```

---

## 🔒 PHASE 2: SECURITY FEATURES

### 1️⃣ Create Password-Protected Link
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    \"custom_slug\":\"private-profile\",
    \"requires_password\":true,
    \"share_password\":\"SecurePass123\",
    \"expiry_days\":null
  }
```

### 2️⃣ Verify Password for Protected Profile
```bash
curl -X POST http://localhost:5000/api/public/profile/private-profile/verify-password \
  -H "Content-Type: application/json" \
  -d {
    \"password\":\"SecurePass123\"
  }
```

### 3️⃣ Access Protected Profile with Password
```bash
# In URL as query parameter
curl -X GET "http://localhost:5000/api/public/profile/private-profile?password=SecurePass123"
```

### 4️⃣ Try Access Without Password (Should Fail)
```bash
curl -X GET http://localhost:5000/api/public/profile/private-profile
# Expected: 403 - Password required
```

### 5️⃣ Try Wrong Password (Should Fail)
```bash
curl -X POST http://localhost:5000/api/public/profile/private-profile/verify-password \
  -H "Content-Type: application/json" \
  -d {
    \"password\":\"WrongPassword\"
  }
# Expected: 403 - Invalid password
```

### 6️⃣ Update Link Settings
```bash
curl -X POST http://localhost:5000/api/share/update/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    \"is_active\":true,
    \"custom_slug\":\"updated-slug\",
    \"expiry_date\":\"2024-05-26T23:59:59Z\"
  }
```

### 7️⃣ Deactivate Link (Block Access)
```bash
curl -X POST http://localhost:5000/api/share/update/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    \"is_active\":false
  }
```

### 8️⃣ Reactivate Link (Allow Access)
```bash
curl -X POST http://localhost:5000/api/share/update/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    \"is_active\":true
  }
```

### 9️⃣ Set Link Expiration to Past Date (Test Expiry)
```bash
curl -X POST http://localhost:5000/api/share/update/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    \"expiry_date\":\"2020-01-01T00:00:00Z\"
  }
```

### 🔟 Regenerate Short Code
```bash
curl -X POST http://localhost:5000/api/share/1/regenerate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 1️⃣1️⃣ Delete Share Link
```bash
curl -X DELETE http://localhost:5000/api/share/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 PHASE 3: ANALYTICS

### 1️⃣ Simulate Multiple Views (Generate Analytics Data)
```bash
# View 1: Desktop
curl -X GET http://localhost:5000/api/public/profile/my-profile

# View 2: Mobile (change user agent)
curl -X GET http://localhost:5000/api/public/profile/my-profile \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)"

# View 3: Tablet
curl -X GET http://localhost:5000/api/public/profile/my-profile \
  -H "User-Agent: Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X)"

# View 4: Desktop from LinkedIn
curl -X GET http://localhost:5000/api/public/profile/my-profile \
  -H "Referer: https://linkedin.com"

# View 5: Mobile Android
curl -X GET http://localhost:5000/api/public/profile/my-profile \
  -H "User-Agent: Mozilla/5.0 (Linux; Android 11)"
```

### 2️⃣ Get Analytics for 30 Days
```bash
curl -X GET "http://localhost:5000/api/share/1/analytics?period=30days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3️⃣ Get Analytics for 7 Days
```bash
curl -X GET "http://localhost:5000/api/share/1/analytics?period=7days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4️⃣ Get All-Time Analytics
```bash
curl -X GET "http://localhost:5000/api/share/1/analytics?period=all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5️⃣ Get All User Analytics (Dashboard)
```bash
curl -X GET http://localhost:5000/api/share/analytics/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🧪 ERROR HANDLING & EDGE CASES

### 1️⃣ Missing JWT Token (Should Fail)
```bash
curl -X GET http://localhost:5000/api/share/links
# Expected: 401 - Unauthorized
```

### 2️⃣ Invalid JWT Token (Should Fail)
```bash
curl -X GET http://localhost:5000/api/share/links \
  -H "Authorization: Bearer invalid_token_xyz"
# Expected: 401 - Invalid token
```

### 3️⃣ Non-Existent Link (Should Fail)
```bash
curl -X GET http://localhost:5000/api/public/profile/non-existent-slug
# Expected: 404 - Profile not found
```

### 4️⃣ Invalid Analytics Period (Should Fail)
```bash
curl -X GET "http://localhost:5000/api/share/1/analytics?period=invalid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
# Expected: 400 - Invalid period
```

### 5️⃣ Password Too Short (Should Fail)
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    \"custom_slug\":\"test\",
    \"requires_password\":true,
    \"share_password\":\"ab\"
  }
# Expected: 400 - Password must be at least 4 characters
```

### 6️⃣ Special Characters in Slug (Auto-Sanitized)
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    \"custom_slug\":\"test@#$%user\"
  }
# Expected: 201 - Creates with sanitized slug like "testuser"
```

---

## 🔄 WORKFLOW: Complete User Journey

```bash
# 1. Create profile
PROFILE=$(curl -s -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"custom_slug":"my-profile"}')

# 2. Extract ID from response (example: 1)
ID=1

# 3. Simulate some views
curl -s http://localhost:5000/api/public/profile/my-profile
curl -s http://localhost:5000/api/public/profile/my-profile
curl -s http://localhost:5000/api/public/profile/my-profile

# 4. Check analytics
curl -s "http://localhost:5000/api/share/$ID/analytics?period=30days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq .

# 5. Update settings
curl -s -X POST "http://localhost:5000/api/share/$ID/update" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"custom_slug":"my-updated-profile"}'

# 6. Regenerate QR
curl -s -X POST "http://localhost:5000/api/share/$ID/regenerate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📱 Bonus: Pretty Output with jq

### View Analytics Nicely Formatted
```bash
curl -s "http://localhost:5000/api/share/1/analytics?period=30days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.data.summary'
```

### View All Links (Pretty)
```bash
curl -s http://localhost:5000/api/share/links \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.data[] | {id, custom_slug, view_count}'
```

### Extract Just the Short Code
```bash
curl -s -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"custom_slug":"test"}' | jq '.data.short_code'
```

---

## 🎯 Quick Copy-Paste Snippets

### Save JWT to Variable (for subsequent commands)
```bash
JWT=$(curl -s -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"TestPassword123"}' \
  | jq -r '.data.access_token')

echo "JWT: $JWT"
```

### Now Use It
```bash
curl -X GET http://localhost:5000/api/share/links \
  -H "Authorization: Bearer $JWT"
```

### Create Link and Save ID
```bash
LINK_ID=$(curl -s -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"custom_slug":"my-profile"}' \
  | jq '.data.id')

echo "Link ID: $LINK_ID"

# Use it
curl -X GET "http://localhost:5000/api/share/$LINK_ID/analytics" \
  -H "Authorization: Bearer $JWT"
```

---

**💡 Pro Tip:** Save these commands in a file like `test-commands.sh` and run them when needed!

**Status: Ready for Testing** ✅
