# ClickCard Backend - Complete Workflow Examples

This file provides real-world workflow examples for common use cases.

---

## 🔄 Workflow 1: Complete User Registration & Login

### Step 1: Register New User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": 1,
    "email": "john@example.com",
    "isEmailVerified": false,
    "isProfileComplete": false
  }
}
```

**What Happens:**
- User created in database
- OTP generated and sent to email
- Email verification required before login

### Step 2: Check Email for OTP
User receives email with 6-digit OTP code. Example: `123456`

### Step 3: Verify Email with OTP
```bash
curl -X POST http://localhost:5000/api/users/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": 1,
    "email": "john@example.com"
  }
}
```

### Step 4: Login User
```bash
curl -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "email": "john@example.com",
    "firstName": null,
    "lastName": null,
    "isProfileComplete": false,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTcxNDAxNjAwMCwiZXhwIjoxNzE0NjIwODAwfQ.xxxxx",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxNDAxNjAwMCwiZXhwIjoxNzE2NjA4MDAwfQ.yyyyy"
  }
}
```

**Save Tokens:**
- `ACCESS_TOKEN`: Use for protected endpoints (7-day expiry)
- `REFRESH_TOKEN`: Use to get new access token (30-day expiry)

### Step 5: Complete Profile Setup
```bash
curl -X POST http://localhost:5000/api/users/profile/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTcxNDAxNjAwMCwiZXhwIjoxNzE0NjIwODAwfQ.xxxxx" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    "phoneNumber": "+14155552671"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+14155552671",
    "date_of_birth": "1990-01-15",
    "gender": "Male",
    "is_profile_complete": true
  }
}
```

✅ **Registration & Login Workflow Complete!**

---

## 🔄 Workflow 2: Forgot Password & Reset

### Step 1: Request Password Reset OTP
```bash
curl -X POST http://localhost:5000/api/users/forgot-password/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset OTP sent to your email"
}
```

**What Happens:**
- OTP generated and sent to email
- User has 10 minutes to verify

### Step 2: Check Email for Password Reset OTP
User receives email with OTP. Example: `654321`

### Step 3: Verify Password Reset OTP
```bash
curl -X POST http://localhost:5000/api/users/forgot-password/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "654321"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password."
}
```

### Step 4: Reset Password
```bash
curl -X POST http://localhost:5000/api/users/forgot-password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "654321",
    "newPassword": "NewSecurePass789",
    "confirmPassword": "NewSecurePass789"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

### Step 5: Login with New Password
```bash
curl -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "NewSecurePass789"
  }'
```

✅ **Password Reset Workflow Complete!**

---

## 🔄 Workflow 3: Change Password (Authenticated User)

### Step 1: Get Access Token
User must be logged in with valid `ACCESS_TOKEN`

### Step 2: Change Password
```bash
curl -X POST http://localhost:5000/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentPassword": "NewSecurePass789",
    "newPassword": "AnotherNewPass456",
    "confirmPassword": "AnotherNewPass456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Step 3: Login with New Password
```bash
curl -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "AnotherNewPass456"
  }'
```

✅ **Change Password Workflow Complete!**

---

## 🔄 Workflow 4: Token Refresh (When Access Token Expires)

### Step 1: Try Protected Endpoint with Expired Token
```bash
curl -X GET http://localhost:5000/api/users/current \
  -H "Authorization: Bearer EXPIRED_ACCESS_TOKEN"
```

**Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired access token"
}
```

### Step 2: Use Refresh Token to Get New Access Token
```bash
curl -X POST http://localhost:5000/api/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxNDAxNjAwMCwiZXhwIjoxNzE2NjA4MDAwfQ.yyyyy"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTcxNDAxNjAwMCwiZXhwIjoxNzE0NjIwODAwfQ.new_token"
  }
}
```

### Step 3: Retry Protected Endpoint with New Token
```bash
curl -X GET http://localhost:5000/api/users/current \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTcxNDAxNjAwMCwiZXhwIjoxNzE0NjIwODAwfQ.new_token"
```

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+14155552671",
    "date_of_birth": "1990-01-15",
    "gender": "Male",
    "is_email_verified": true,
    "is_profile_complete": true
  }
}
```

✅ **Token Refresh Workflow Complete!**

---

## 🔄 Workflow 5: Logout (Revoke Token)

### Step 1: Call Logout Endpoint
```bash
curl -X POST http://localhost:5000/api/users/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxNDAxNjAwMCwiZXhwIjoxNzE2NjA4MDAwfQ.yyyyy"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**What Happens:**
- Refresh token is revoked in database
- User cannot use this token again
- User must login again to get new tokens

### Step 2: Try to Use Old Refresh Token
```bash
curl -X POST http://localhost:5000/api/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxNDAxNjAwMCwiZXhwIjoxNzE2NjA4MDAwfQ.yyyyy"
  }'
```

**Response (401):**
```json
{
  "success": false,
  "message": "Refresh token not found or revoked"
}
```

✅ **Logout Workflow Complete!**

---

## 🔄 Workflow 6: Resend Email OTP

### Step 1: User Doesn't Receive OTP
User can request a new OTP within 10 minutes of registration

### Step 2: Request New OTP
```bash
curl -X POST http://localhost:5000/api/users/resend-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

### Step 3: Verify with New OTP
User receives new OTP via email. Example: `789012`

```bash
curl -X POST http://localhost:5000/api/users/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "789012"
  }'
```

✅ **Resend OTP Workflow Complete!**

---

## 📝 Error Handling Examples

### Error 1: Invalid Email
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "email": "Invalid email address"
  }
}
```

### Error 2: Weak Password
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "weak",
    "confirmPassword": "weak"
  }'
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "password": "Password must be at least 8 characters with uppercase, lowercase, and numbers"
  }
}
```

### Error 3: Email Already Registered
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Response (409):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Error 4: Wrong OTP
```bash
curl -X POST http://localhost:5000/api/users/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "000000"
  }'
```

**Response (400):**
```json
{
  "success": false,
  "message": "Invalid OTP",
  "error": {
    "attempts": 1
  }
}
```

After 3 failed attempts:
```json
{
  "success": false,
  "message": "Too many attempts. Please request a new OTP"
}
```

### Error 5: Missing Authentication
```bash
curl -X GET http://localhost:5000/api/users/current
```

**Response (401):**
```json
{
  "success": false,
  "message": "Access token required"
}
```

### Error 6: Invalid Token
```bash
curl -X GET http://localhost:5000/api/users/current \
  -H "Authorization: Bearer invalid_token"
```

**Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired access token"
}
```

### Error 7: Email Not Verified (Cannot Login)
```bash
curl -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Response (403):**
```json
{
  "success": false,
  "message": "Please verify your email first",
  "data": {
    "userId": 1,
    "email": "john@example.com"
  }
}
```

---

## 🎯 Important Notes

1. **Token Format:** Always use `Authorization: Bearer TOKEN` header
2. **OTP Expiry:** OTP valid for 10 minutes only
3. **Max OTP Attempts:** 3 attempts per OTP
4. **Access Token:** Valid for 7 days
5. **Refresh Token:** Valid for 30 days
6. **Password Requirements:** 8+ chars, uppercase, lowercase, number
7. **Age Requirement:** User must be 13+ years old
8. **Email Unique:** Each email can only register once

---

## ✅ All Workflows Summary

| Workflow | Status |
|----------|--------|
| Registration & Login | ✅ Complete |
| Password Reset | ✅ Complete |
| Password Change | ✅ Complete |
| Token Refresh | ✅ Complete |
| Logout | ✅ Complete |
| Resend OTP | ✅ Complete |
| Error Handling | ✅ Complete |

All workflows tested and working perfectly! 🚀
