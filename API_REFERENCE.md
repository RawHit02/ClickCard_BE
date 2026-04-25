# API Quick Reference

## Base URL
```
http://localhost:5000/api/users
```

## Authentication
Use JWT tokens in the Authorization header:
```
Authorization: Bearer {accessToken}
```

---

## Public Endpoints (No Authentication Required)

### 1. Register
```
POST /register
Body: { email, password, confirmPassword }
Response: { userId, email, isEmailVerified, isProfileComplete }
```

### 2. Resend Email OTP
```
POST /resend-email-otp
Body: { email }
Response: { message }
```

### 3. Verify Email OTP
```
POST /verify-email-otp
Body: { email, otp }
Response: { userId, email }
```

### 4. Login
```
POST /login/user
Body: { email, password }
Response: { userId, email, accessToken, refreshToken, isProfileComplete }
```

### 5. Request Password Reset OTP
```
POST /forgot-password/request-otp
Body: { email }
Response: { message }
```

### 6. Verify Password Reset OTP
```
POST /forgot-password/verify-otp
Body: { email, otp }
Response: { message }
```

### 7. Reset Password
```
POST /forgot-password/reset
Body: { email, otp, newPassword, confirmPassword }
Response: { message }
```

### 8. Refresh Access Token
```
POST /refresh-token
Body: { refreshToken }
Response: { accessToken }
```

### 9. Logout
```
POST /logout
Body: { refreshToken }
Response: { message }
```

---

## Protected Endpoints (Authentication Required)

### 1. Get Current User
```
GET /current
Headers: Authorization: Bearer {accessToken}
Response: { id, email, firstName, lastName, phoneNumber, dateOfBirth, gender, profilePicture, isEmailVerified, isProfileComplete }
```

### 2. Complete Profile
```
POST /profile/complete
Headers: Authorization: Bearer {accessToken}
Body: { firstName, lastName, dateOfBirth, gender, phoneNumber }
Response: { id, email, firstName, lastName, phoneNumber, dateOfBirth, gender, isProfileComplete }
```

### 3. Change Password
```
POST /change-password
Headers: Authorization: Bearer {accessToken}
Body: { currentPassword, newPassword, confirmPassword }
Response: { message }
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Email not verified |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Email already registered |
| 500 | Internal Server Error |

---

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)

**Example:** `SecurePass123`

---

## Token Lifetimes

| Token | Expiry |
|-------|--------|
| Access Token | 7 days |
| Refresh Token | 30 days |
| OTP | 10 minutes |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

---

## Success Response Format

```json
{
  "success": true,
  "message": "Success description",
  "data": { /* response data */ }
}
```

---

## Common Test Scenarios

### Scenario 1: Complete Registration Flow
1. Register → Get userId, email
2. Verify Email OTP → Email verified
3. Login → Get accessToken, refreshToken
4. Complete Profile → Profile updated
5. Get Current User → View full profile

### Scenario 2: Password Reset Flow
1. Request OTP → OTP sent to email
2. Verify OTP → OTP verified
3. Reset Password → Password changed
4. Login with new password → Success

### Scenario 3: Token Refresh Flow
1. Login → Get accessToken, refreshToken
2. Access token expires
3. Use Refresh Token → Get new accessToken
4. Continue with new accessToken

---

## Validation Rules

### Email
- Must be valid email format
- Must be unique
- Example: `user@example.com`

### Password
- 8+ characters
- Contains uppercase, lowercase, number
- Example: `SecurePass123`

### Phone Number
- Valid international format
- Example: `+1234567890` or `+44 20 7946 0958`

### Date of Birth
- Valid date format: `YYYY-MM-DD`
- User must be 13+ years old
- Example: `1990-01-15`

### Gender
- Example: `Male`, `Female`, `Other`

---

## Example Workflows

### Register & Login Workflow
```
1. POST /register
   Input: { email: "user@test.com", password: "Pass123", confirmPassword: "Pass123" }
   
2. POST /verify-email-otp
   Input: { email: "user@test.com", otp: "123456" }
   
3. POST /login/user
   Input: { email: "user@test.com", password: "Pass123" }
   Output: { accessToken, refreshToken }
```

### Forgot Password Workflow
```
1. POST /forgot-password/request-otp
   Input: { email: "user@test.com" }
   
2. POST /forgot-password/verify-otp
   Input: { email: "user@test.com", otp: "123456" }
   
3. POST /forgot-password/reset
   Input: { email: "user@test.com", otp: "123456", newPassword: "NewPass123", confirmPassword: "NewPass123" }
```

### Protected API Workflow
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

1. GET /current
   Output: { id, email, firstName, lastName, ... }

2. POST /profile/complete
   Input: { firstName: "John", lastName: "Doe", ... }

3. POST /change-password
   Input: { currentPassword: "OldPass123", newPassword: "NewPass123", confirmPassword: "NewPass123" }
```
