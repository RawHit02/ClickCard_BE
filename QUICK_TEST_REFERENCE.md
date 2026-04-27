# 🚀 Quick Testing Reference Card

## ⏱️ 5-Minute Quick Test

### 1. Get JWT Token (from your existing user)
```bash
curl -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d {"email":"your@email.com","password":"YourPassword123"}
```
📌 **Save the `access_token` value as `YOUR_JWT_TOKEN`**

---

### 2. Create Share Link
```bash
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {"custom_slug":"my-profile","requires_password":false}
```
✅ **Should return:** ID, public_url, short_code, qr_code

---

### 3. View Public Profile (No Auth Needed!)
```bash
curl http://localhost:5000/api/public/profile/my-profile
```
✅ **Should return:** Your profile data with masked phone

---

### 4. Check Analytics
```bash
curl -X GET "http://localhost:5000/api/share/1/analytics?period=30days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
✅ **Should return:** View counts, unique visitors, device breakdown

---

## 📋 Testing Commands Quick Reference

| Feature | Command | Expected |
|---------|---------|----------|
| **Create Link** | `POST /api/share/create` | 201 + URL + QR |
| **List Links** | `GET /api/share/links` | 200 + Array |
| **View Profile** | `GET /api/public/profile/:slug` | 200 + Profile |
| **View by Code** | `GET /api/public/profile/:code` | 200 + Profile |
| **Get Analytics** | `GET /api/share/:id/analytics` | 200 + Stats |
| **Update Link** | `POST /api/share/update/:id` | 200 + Updated |
| **Delete Link** | `DELETE /api/share/:id` | 200 + Deleted |
| **New QR Code** | `POST /api/share/:id/regenerate` | 200 + New QR |
| **Password Check** | `POST /api/public/profile/:id/verify-password` | 200 + Verified |

---

## 🧪 Test Scenarios (Copy-Paste Ready)

### Scenario A: Basic Sharing
```bash
# 1. Create
JWT="YOUR_JWT_TOKEN"
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"custom_slug":"john-doe"}'

# 2. Access (publicly, no auth!)
curl http://localhost:5000/api/public/profile/john-doe

# 3. Check views
curl http://localhost:5000/api/share/1/analytics \
  -H "Authorization: Bearer $JWT"
```

### Scenario B: Password Protection
```bash
JWT="YOUR_JWT_TOKEN"

# 1. Create protected link
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"custom_slug":"private","requires_password":true,"share_password":"Pass123"}'

# 2. Try without password (FAILS)
curl http://localhost:5000/api/public/profile/private

# 3. Verify password
curl -X POST http://localhost:5000/api/public/profile/private/verify-password \
  -H "Content-Type: application/json" \
  -d '{"password":"Pass123"}'
```

### Scenario C: Link Expiration
```bash
JWT="YOUR_JWT_TOKEN"

# 1. Create with 7-day expiry
curl -X POST http://localhost:5000/api/share/create \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"custom_slug":"temp-access","expiry_days":7}'

# 2. Update to expire now (for testing)
curl -X POST http://localhost:5000/api/share/update/2 \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"expiry_date":"2020-01-01T00:00:00Z"}'

# 3. Try to access (should fail)
curl http://localhost:5000/api/public/profile/temp-access
```

### Scenario D: Deactivation
```bash
JWT="YOUR_JWT_TOKEN"

# 1. Deactivate link
curl -X POST http://localhost:5000/api/share/update/1 \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"is_active":false}'

# 2. Try to access (should fail)
curl http://localhost:5000/api/public/profile/john-doe
```

---

## ✅ Success Indicators

| Step | Success Looks Like |
|------|-------------------|
| Server Running | `curl http://localhost:5000/health` returns `{"status":"OK"}` |
| JWT Valid | Response includes `access_token` in login |
| Link Created | Response includes `public_url`, `short_url`, `qr_code` |
| Public Access | Profile JSON returned WITHOUT authentication |
| Password Works | Correct password returns `"verified":true` |
| Analytics | Returns `"total_views":X`, `"unique_visitors":Y` |
| Expiration | Expired link returns `"This share link has expired"` |
| Deactivation | Inactive link returns `"has been deactivated"` |

---

## 🔧 Endpoint Summary

### Protected Routes (Require JWT)
```
POST   /api/share/create              Create share link
GET    /api/share/links               Get your links
POST   /api/share/update/:id          Update settings
DELETE /api/share/:id                 Delete link
POST   /api/share/:id/regenerate      New short code
GET    /api/share/:id/analytics       View analytics
GET    /api/share/:id/qr              Get QR code
GET    /api/share/analytics/all       All links stats
```

### Public Routes (No Auth)
```
GET    /api/public/profile/:id        View profile
GET    /api/public/profile/:id/qr     Get QR
POST   /api/public/profile/:id/verify-password  Check pass
```

---

## 🎯 Test Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ STEP 1: Get JWT Token (Login)                       │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ STEP 2: Create Share Link (With JWT)                │
│ - Get: id, public_url, short_code, qr_code          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ STEP 3: Access Profile Publicly (NO JWT!)           │
│ - Use: public_url, short_code, or user_id           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ STEP 4: Check Analytics (With JWT)                  │
│ - Shows: views, unique_visitors, devices, referrers │
└─────────────────────────────────────────────────────┘
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `401 Unauthorized` | Check JWT token is valid (not expired, correctly formatted) |
| `404 Profile not found` | Verify custom_slug or short_code exists |
| `403 Password required` | Include `?password=xxx` in URL or call verify endpoint |
| `QR code appears broken` | Ensure `SHARE_LINK_BASE_URL` in `.env` is correct |
| `0 views in analytics` | Make sure you're accessing `/api/public/profile/...` |
| `CORS error` | Ensure CORS middleware is enabled in app.js |

---

## 📊 Analytics Period Options

```bash
# Last 7 days
?period=7days

# Last 30 days
?period=30days

# All time
?period=all
```

---

**Status: Ready for Testing** ✅

For detailed testing guide, see: **TESTING_GUIDE.md**
