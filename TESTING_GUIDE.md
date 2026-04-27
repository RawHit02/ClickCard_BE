# 🧪 Share Link Feature - Complete Testing Guide

## Prerequisites Checklist

Before testing, ensure you have:

- ✅ Node.js & npm installed
- ✅ PostgreSQL (Neon) database configured
- ✅ `.env` file with database credentials
- ✅ `qrcode` and `slugify` packages installed
- ✅ Server running on `http://localhost:5000`

---

## 🔧 STEP 0: Setup & Environment

### 1. Verify Dependencies Installed
```bash
cd c:\ClickCard_Backend\ClickCard_Backend
npm list | findstr "qrcode slugify"
```

**Expected Output:**
```
├── qrcode@1.5.4
├── slugify@1.6.9
```

### 2. Check Environment Variables
Open your `.env` file and verify:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret
SHARE_LINK_BASE_URL=http://localhost:5000
```

### 3. Start the Server
```bash
npm start
# or
node src/index.js
```

**Expected Output:**
```
Server is running on port 5000
Tables created or already exist
ClickCard API is running
```

### 4. Verify Health Check
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{ "status": "OK", "message": "ClickCard API is running" }
```

---

## 📋 STEP 1: Register User & Get JWT Token

### A. Register New User
```bash
curl -X POST http://localhost:5000/api/users/initiate-registration/unique \
  -H "Content-Type: application/json" \
  -d {
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "firstName": "Test",
    "lastName": "User"
  }
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "testuser@example.com",
    "first_name": "Test",
    "is_email_verified": false
  },
  "message": "Registration initiated. Check your email for OTP."
}
```

### B. Verify Email with OTP
```bash
# Check your email for OTP, then:
curl -X POST http://localhost:5000/api/users/verify-email-otp \
  -H "Content-Type: application/json" \
  -d {
    "email": "testuser@example.com",
    "otpCode": "123456"
  }
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "email": "testuser@example.com",
    "is_email_verified": true
  }
}
```

### C. Login to Get JWT Token
```bash
curl -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d {
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "testuser@example.com"
    }
  }
}
```

**⚠️ SAVE YOUR JWT TOKEN**
```
Copy: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Use it as: Authorization: Bearer TOKEN
```

---

## 🎯 STEP 2: PHASE 1 TESTING - Core Share Link Features

### Test 2.1: Create Basic Share Link

**Command:**
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "custom_slug": "test-user",
    "expiry_days": null,
    "requires_password": false
  }
```

**Expected Response (Success 201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "public_url": "http://localhost:5000/public/profile/test-user",
    "short_url": "http://localhost:5000/s/A7KF9M2X",
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "short_code": "A7KF9M2X",
    "custom_slug": "test-user",
    "is_active": true,
    "created_at": "2024-04-26T10:30:00Z"
  },
  "message": "Share link created successfully"
}
```

**✅ VERIFICATION:**
- [ ] Response status is 201
- [ ] `public_url` contains custom slug
- [ ] `short_url` contains short code
- [ ] `qr_code` is base64 PNG data
- [ ] `is_active` is `true`

---

### Test 2.2: Get List of Share Links

**Command:**
```bash
curl -X GET http://localhost:5000/api/share/links \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "short_code": "A7KF9M2X",
      "custom_slug": "test-user",
      "is_active": true,
      "expiry_date": null,
      "view_count": 0,
      "unique_visitors": 0,
      "last_viewed": null,
      "created_at": "2024-04-26T10:30:00Z",
      "updated_at": "2024-04-26T10:30:00Z"
    }
  ],
  "message": "Share links retrieved successfully"
}
```

**✅ VERIFICATION:**
- [ ] Response status is 200
- [ ] Array contains created share link
- [ ] `view_count` starts at 0

---

### Test 2.3: Create Link with Slug Collision

**Scenario:** Try creating another link with same slug name

**Command:**
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "custom_slug": "test-user",
    "requires_password": false
  }
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "custom_slug": "test-user-1",
    "short_code": "B8LG0N3Y",
    ...
  }
}
```

**✅ VERIFICATION:**
- [ ] System auto-appended "-1" to slug
- [ ] Short code is unique
- [ ] No error thrown

---

### Test 2.4: View Public Profile (No Auth)

**Command:**
```bash
curl -X GET http://localhost:5000/api/public/profile/test-user
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "Test User",
    "first_name": "Test",
    "last_name": "User",
    "profile_picture": null,
    "profile_bio": null,
    "phone": "***-***-****",
    "personal_identity": null,
    "contact_information": null,
    "education": null,
    "work_experience": null,
    "business_details": null,
    "products_services": null,
    "social_links": null,
    "digital_card": null
  },
  "message": "Profile retrieved successfully"
}
```

**✅ VERIFICATION:**
- [ ] Response status is 200
- [ ] No authentication required
- [ ] Phone is masked (***-***-****)
- [ ] Profile data returned

---

### Test 2.5: View Public Profile by Short Code

**Command:**
```bash
curl -X GET http://localhost:5000/api/public/profile/A7KF9M2X
```

**Expected Response:**
Same as Test 2.4 - profile data

**✅ VERIFICATION:**
- [ ] Works with short code as identifier
- [ ] Returns same user profile

---

### Test 2.6: View Public Profile by User ID

**Command:**
```bash
curl -X GET http://localhost:5000/api/public/profile/1
```

**Expected Response:**
Same as Test 2.4 - profile data

**✅ VERIFICATION:**
- [ ] Works with numeric user ID
- [ ] Returns the first active share link for user

---

### Test 2.7: Download QR Code (Public)

**Command - Get as Data URL:**
```bash
curl -X GET "http://localhost:5000/api/public/profile/test-user/qr?format=dataurl"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

**✅ VERIFICATION:**
- [ ] Response contains base64 PNG data
- [ ] Can be displayed in browser/app

---

### Test 2.8: Download QR Code (PNG Binary)

**Command:**
```bash
curl -X GET "http://localhost:5000/api/public/profile/test-user/qr?format=buffer" -o qr-code.png
```

**✅ VERIFICATION:**
- [ ] File `qr-code.png` created
- [ ] File size > 100 bytes
- [ ] Can open in image viewer

---

### Test 2.9: Get QR from Protected Route

**Command:**
```bash
curl -X GET http://localhost:5000/api/share/1/qr \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
Same as Test 2.7

**✅ VERIFICATION:**
- [ ] Requires valid JWT token
- [ ] Returns QR code for the share link

---

## 🔒 STEP 3: PHASE 2 TESTING - Security & Control Features

### Test 3.1: Create Password-Protected Link

**Command:**
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "custom_slug": "private-profile",
    "requires_password": true,
    "share_password": "SecurePass123",
    "expiry_days": null
  }
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "custom_slug": "private-profile",
    "requires_password": true,
    "is_active": true,
    ...
  }
}
```

**✅ VERIFICATION:**
- [ ] Response status is 201
- [ ] `requires_password` is `true`
- [ ] Password is stored (hashed in DB)

---

### Test 3.2: Access Protected Profile Without Password (Should Fail)

**Command:**
```bash
curl -X GET http://localhost:5000/api/public/profile/private-profile
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Password required to access this profile"
}
```

**✅ VERIFICATION:**
- [ ] Status code is 403
- [ ] Error message asks for password

---

### Test 3.3: Verify Password - Wrong Password (Should Fail)

**Command:**
```bash
curl -X POST http://localhost:5000/api/public/profile/private-profile/verify-password \
  -H "Content-Type: application/json" \
  -d {
    "password": "WrongPassword"
  }
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

**✅ VERIFICATION:**
- [ ] Status code is 403
- [ ] Does not accept wrong password

---

### Test 3.4: Verify Password - Correct Password

**Command:**
```bash
curl -X POST http://localhost:5000/api/public/profile/private-profile/verify-password \
  -H "Content-Type: application/json" \
  -d {
    "password": "SecurePass123"
  }
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": { "verified": true },
  "message": "Password verified"
}
```

**✅ VERIFICATION:**
- [ ] Status code is 200
- [ ] `verified` is `true`

---

### Test 3.5: Access Protected Profile With Correct Password (in query)

**Command:**
```bash
curl -X GET "http://localhost:5000/api/public/profile/private-profile?password=SecurePass123"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "Test User",
    ...
  }
}
```

**✅ VERIFICATION:**
- [ ] Status code is 200
- [ ] Profile data accessible with correct password

---

### Test 3.6: Update Share Link Settings

**Command:**
```bash
curl -X POST http://localhost:5000/api/share/update/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "is_active": true,
    "expiry_date": "2024-05-26T23:59:59Z",
    "custom_slug": "updated-slug"
  }
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "custom_slug": "updated-slug",
    "is_active": true,
    "expiry_date": "2024-05-26T23:59:59Z",
    "updated_at": "2024-04-26T10:35:00Z"
  }
}
```

**✅ VERIFICATION:**
- [ ] Status code is 200
- [ ] Slug updated
- [ ] Expiry date set

---

### Test 3.7: Access Link After Expiration (Should Fail)

**Command - First, set expiry to past date:**
```bash
curl -X POST http://localhost:5000/api/share/update/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "expiry_date": "2020-01-01T00:00:00Z"
  }
```

**Then, try to access:**
```bash
curl -X GET http://localhost:5000/api/public/profile/updated-slug
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "This share link has expired"
}
```

**✅ VERIFICATION:**
- [ ] Status code is 403
- [ ] Expired link cannot be accessed

---

### Test 3.8: Deactivate Link (Should Block Access)

**Command:**
```bash
curl -X POST http://localhost:5000/api/share/update/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "is_active": false
  }
```

**Then, try to access:**
```bash
curl -X GET http://localhost:5000/api/public/profile/updated-slug
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "This share link has been deactivated"
}
```

**✅ VERIFICATION:**
- [ ] Link can be deactivated
- [ ] Deactivated links return 403

---

### Test 3.9: Regenerate Short Code

**Command:**
```bash
curl -X POST http://localhost:5000/api/share/1/regenerate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "short_code": "C9MH1O4Z",
    "short_url": "http://localhost:5000/s/C9MH1O4Z",
    "qr_code": "data:image/png;base64,...",
    "updated_at": "2024-04-26T10:40:00Z"
  }
}
```

**✅ VERIFICATION:**
- [ ] Status code is 200
- [ ] New short code generated
- [ ] QR code regenerated
- [ ] Old short code no longer works

---

### Test 3.10: Delete Share Link

**Command:**
```bash
curl -X DELETE http://localhost:5000/api/share/3 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "is_active": false
  }
}
```

**Then verify it's deleted:**
```bash
curl -X GET http://localhost:5000/api/public/profile/private-profile
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Profile not found"
}
```

**✅ VERIFICATION:**
- [ ] Delete returns 200
- [ ] Deleted link returns 404 when accessed

---

## 📊 STEP 4: PHASE 3 TESTING - Analytics & Tracking

### Test 4.1: Create Fresh Share Link for Analytics Testing

**Command:**
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "custom_slug": "analytics-test",
    "requires_password": false
  }
```

**Save the ID** from response (e.g., `id: 4`)

---

### Test 4.2: Simulate Multiple Views (Generate Analytics Data)

**Simulate 5 different views:**
```bash
# View 1 from desktop via LinkedIn
curl -X GET http://localhost:5000/api/public/profile/analytics-test

# View 2 from mobile via WhatsApp
curl -X GET http://localhost:5000/api/public/profile/analytics-test \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)"

# View 3 from tablet via Email
curl -X GET http://localhost:5000/api/public/profile/analytics-test \
  -H "User-Agent: Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X)"

# View 4 from desktop again (different referrer)
curl -X GET http://localhost:5000/api/public/profile/analytics-test \
  -H "Referer: https://linkedin.com"

# View 5 from mobile again
curl -X GET http://localhost:5000/api/public/profile/analytics-test \
  -H "User-Agent: Mozilla/5.0 (Linux; Android 11)"
```

**✅ VERIFICATION:**
- [ ] All requests return 200
- [ ] Profile data returned each time
- [ ] Analytics recorded in background (non-blocking)

---

### Test 4.3: Get Analytics for Share Link (30 days)

**Command:**
```bash
curl -X GET "http://localhost:5000/api/share/4/analytics?period=30days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_views": 5,
      "unique_visitors": 1,
      "mobile_views": 3,
      "desktop_views": 2,
      "tablet_views": 0
    },
    "device_breakdown": [
      { "type": "mobile", "count": 3, "unique_count": 1 },
      { "type": "desktop", "count": 2, "unique_count": 1 }
    ],
    "top_referrers": [
      { "source": "direct", "count": 3 },
      { "source": "https://linkedin.com", "count": 2 }
    ],
    "views_by_date": [
      { "date": "2024-04-26", "views": 5, "unique_visitors": 1 }
    ],
    "recent_visitors": [
      {
        "ip": "127.0.0.***",
        "device": "mobile",
        "platform": "android",
        "referrer": "direct",
        "viewed_at": "2024-04-26T10:45:00Z"
      }
    ],
    "period": "30days"
  }
}
```

**✅ VERIFICATION:**
- [ ] Status code is 200
- [ ] `total_views` = 5
- [ ] `device_breakdown` shows mobile and desktop
- [ ] `top_referrers` includes referrer source
- [ ] `views_by_date` shows aggregated data
- [ ] `recent_visitors` shows masked IPs

---

### Test 4.4: Get Analytics for 7 Days

**Command:**
```bash
curl -X GET "http://localhost:5000/api/share/4/analytics?period=7days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200):**
Similar structure, but filtered to last 7 days

**✅ VERIFICATION:**
- [ ] Period parameter works
- [ ] Data matches or less than 30-day data

---

### Test 4.5: Get Analytics for All Time

**Command:**
```bash
curl -X GET "http://localhost:5000/api/share/4/analytics?period=all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**✅ VERIFICATION:**
- [ ] Returns all historical data
- [ ] `period` is "all"

---

### Test 4.6: Get All User Analytics (Dashboard)

**Command:**
```bash
curl -X GET http://localhost:5000/api/share/analytics/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "short_code": "A7KF9M2X",
      "custom_slug": "test-user",
      "view_count": 0,
      "unique_visitors": 0,
      "last_viewed": null,
      "created_at": "2024-04-26T10:30:00Z"
    },
    {
      "id": 4,
      "short_code": "D0PI2Q5W",
      "custom_slug": "analytics-test",
      "view_count": 5,
      "unique_visitors": 1,
      "last_viewed": "2024-04-26T10:45:00Z",
      "created_at": "2024-04-26T10:42:00Z"
    }
  ]
}
```

**✅ VERIFICATION:**
- [ ] Status code is 200
- [ ] Returns all user's share links
- [ ] Shows aggregated stats for each

---

### Test 4.7: Verify Analytics Don't Count Duplicate Views Too Quickly

**Scenario:** Call the same profile twice within 10 seconds

**Command:**
```bash
# View 1
curl -X GET http://localhost:5000/api/public/profile/analytics-test

# Wait 2 seconds (within 10-sec threshold)
# View 2 (should NOT increment unique_visitors)
curl -X GET http://localhost:5000/api/public/profile/analytics-test

# Check analytics
curl -X GET "http://localhost:5000/api/share/4/analytics?period=30days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:**
```json
{
  "data": {
    "summary": {
      "total_views": 7,
      "unique_visitors": 1  // Still 1, not 2
    }
  }
}
```

**✅ VERIFICATION:**
- [ ] `total_views` incremented
- [ ] `unique_visitors` NOT incremented (duplicate within 10 sec)

---

### Test 4.8: Unique Visitors After 10+ Seconds

**Command:**
```bash
# View 1
curl -X GET http://localhost:5000/api/public/profile/analytics-test

# Wait 11+ seconds
# Then View 2 (should increment unique_visitors)
curl -X GET http://localhost:5000/api/public/profile/analytics-test

# Check analytics
curl -X GET "http://localhost:5000/api/share/4/analytics?period=30days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:**
```json
{
  "data": {
    "summary": {
      "unique_visitors": 2
    }
  }
}
```

**✅ VERIFICATION:**
- [ ] After 10+ second gap, unique_visitors increments

---

## 🔐 STEP 5: Authorization & Security Testing

### Test 5.1: Access Protected Route Without JWT (Should Fail)

**Command:**
```bash
curl -X GET http://localhost:5000/api/share/links
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized: No token provided"
}
```

**✅ VERIFICATION:**
- [ ] Status code is 401
- [ ] Returns unauthorized error

---

### Test 5.2: Access Protected Route With Invalid JWT (Should Fail)

**Command:**
```bash
curl -X GET http://localhost:5000/api/share/links \
  -H "Authorization: Bearer invalid_token_xyz"
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized: Invalid token"
}
```

**✅ VERIFICATION:**
- [ ] Status code is 401
- [ ] Rejects invalid tokens

---

### Test 5.3: User Cannot Access Another User's Share Link

**Scenario:** Register a second user and try to update first user's link

**Create Second User:**
```bash
# Register, verify email, login to get second JWT token
```

**Then Try to Update First User's Link:**
```bash
curl -X POST http://localhost:5000/api/share/update/1 \
  -H "Authorization: Bearer SECOND_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "is_active": false
  }
```

**Expected Response (403/404):**
```json
{
  "success": false,
  "message": "Share link not found or unauthorized"
}
```

**✅ VERIFICATION:**
- [ ] Status code is 403 or 404
- [ ] Cannot modify other user's links

---

## ❌ STEP 6: Error Handling & Edge Cases

### Test 6.1: Invalid Period Parameter in Analytics

**Command:**
```bash
curl -X GET "http://localhost:5000/api/share/4/analytics?period=invalid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid period. Use: 7days, 30days, or all"
}
```

**✅ VERIFICATION:**
- [ ] Status code is 400
- [ ] Returns helpful error message

---

### Test 6.2: Create Link With Too Short Password

**Command:**
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "custom_slug": "short-pass",
    "requires_password": true,
    "share_password": "abc"
  }
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Password must be at least 4 characters"
}
```

**✅ VERIFICATION:**
- [ ] Status code is 400
- [ ] Validates password length

---

### Test 6.3: Invalid Custom Slug (Special Characters)

**Command:**
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "custom_slug": "test@#$%user"
  }
```

**Expected Response (201):**
```json
{
  "data": {
    "custom_slug": "testuser"
  }
}
```

**✅ VERIFICATION:**
- [ ] Special characters removed
- [ ] Slug sanitized

---

### Test 6.4: Access Non-Existent Share Link

**Command:**
```bash
curl -X GET http://localhost:5000/api/public/profile/non-existent-link
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Profile not found"
}
```

**✅ VERIFICATION:**
- [ ] Status code is 404
- [ ] Returns not found error

---

### Test 6.5: Access Non-Existent Analytics

**Command:**
```bash
curl -X GET "http://localhost:5000/api/share/9999/analytics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Share link not found or unauthorized"
}
```

**✅ VERIFICATION:**
- [ ] Status code is 404
- [ ] Returns not found error

---

## 📱 STEP 7: Browser Testing (Manual)

### Test 7.1: Visit Public Profile in Browser

1. Create share link with custom slug
2. Open in browser: `http://localhost:5000/api/public/profile/your-slug`
3. Should display JSON profile data

**✅ VERIFICATION:**
- [ ] No 404 error
- [ ] JSON data readable
- [ ] Phone is masked

---

### Test 7.2: QR Code in Browser

1. Open: `http://localhost:5000/api/public/profile/your-slug/qr?format=dataurl`
2. Should display JSON with base64 image

**✅ VERIFICATION:**
- [ ] Base64 data present
- [ ] Can decode and view QR image

---

### Test 7.3: Download PNG QR Code

1. Open: `http://localhost:5000/api/public/profile/your-slug/qr?format=buffer`
2. Browser should download PNG file

**✅ VERIFICATION:**
- [ ] PNG file downloaded
- [ ] File is valid image

---

## 📝 STEP 8: Database Verification

### Test 8.1: Check Share Links Table

**Login to PostgreSQL:**
```bash
psql "postgresql://user:password@host:port/database"
```

**Query:**
```sql
SELECT * FROM share_links LIMIT 5;
```

**Expected Columns:**
- `id`, `user_id`, `custom_slug`, `short_code`
- `is_password_protected`, `is_active`, `expiry_date`
- `view_count`, `unique_visitors`, `last_viewed`

---

### Test 8.2: Check Analytics Table

**Query:**
```sql
SELECT * FROM share_link_analytics LIMIT 10;
```

**Expected Columns:**
- `id`, `share_link_id`
- `visitor_ip`, `visitor_user_agent`, `referrer_source`
- `device_type`, `platform`, `viewed_at`

---

### Test 8.3: Verify Password Hash

**Query:**
```sql
SELECT id, custom_slug, share_password FROM share_links WHERE is_password_protected = TRUE;
```

**Expected:**
- `share_password` should be hashed (starts with `$2a$` or `$2b$`)
- NOT plain text

**✅ VERIFICATION:**
- [ ] Passwords are hashed
- [ ] Not stored in plain text

---

## ✅ Final Testing Checklist

### Phase 1: Core Features
- [ ] Create basic share link
- [ ] Get list of links
- [ ] View public profile by slug
- [ ] View public profile by short code
- [ ] View public profile by user ID
- [ ] Download QR code (data URL)
- [ ] Download QR code (PNG binary)
- [ ] Handle slug collision (auto-append number)

### Phase 2: Security & Control
- [ ] Create password-protected link
- [ ] Block access without password
- [ ] Reject wrong password
- [ ] Accept correct password
- [ ] Update link settings
- [ ] Expire link and verify blocking
- [ ] Deactivate link and verify blocking
- [ ] Regenerate short code
- [ ] Delete link

### Phase 3: Analytics
- [ ] Simulate multiple views
- [ ] Get analytics (30 days)
- [ ] Get analytics (7 days)
- [ ] Get analytics (all time)
- [ ] Get all user analytics
- [ ] Verify duplicate view prevention (10-sec)
- [ ] Verify unique visitor increment after threshold

### Authorization & Security
- [ ] Block access without JWT
- [ ] Block access with invalid JWT
- [ ] Prevent cross-user access

### Error Handling
- [ ] Invalid period parameter
- [ ] Too short password
- [ ] Special characters in slug
- [ ] Non-existent link
- [ ] Non-existent analytics

---

## 🐛 Troubleshooting

### Issue: "Tables not created" Error
**Solution:** Restart server, tables auto-create on startup

### Issue: QR code appears broken
**Solution:** Verify `SHARE_LINK_BASE_URL` in `.env` is correct

### Issue: Analytics showing 0 views
**Solution:** Ensure you're accessing `/api/public/profile/...` path

### Issue: Password verification not working
**Solution:** Ensure password length >= 4 characters

### Issue: "Unauthorized" on all requests
**Solution:** Verify JWT token is valid and not expired

---

**Status: Ready for Comprehensive Testing** ✅
