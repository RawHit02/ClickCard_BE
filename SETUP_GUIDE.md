# ClickCard Backend - Setup & Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Update the following in `.env`:

#### Database Configuration
```
DATABASE_URL=postgresql://neondb_owner:npg_ZVn7IbHTU1cv@ep-curly-frost-ahthy79d-pooler.c-3.us-east-1.aws.neon.tech/clickcard?sslmode=require&channel_binding=require
```

#### JWT Configuration
```
JWT_SECRET=clickcard_super_secret_key_2026
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=clickcard_refresh_secret_2026
REFRESH_TOKEN_EXPIRE=30d
```

#### Email Configuration (Gmail)
1. Go to your Google Account settings
2. Enable 2-step verification
3. Create an "App Password" for Gmail
4. Update `.env`:
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=noreply@clickcard.com
```

### 3. Start the Server
```bash
# Development (with Nodemon auto-reload)
npm run dev

# Production
npm start
```

The server will run on `http://localhost:5000`

## Testing the APIs

### Using cURL

#### 1. Register a New User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": 1,
    "email": "testuser@example.com",
    "isEmailVerified": false,
    "isProfileComplete": false
  }
}
```

#### 2. Verify Email with OTP
Check your email for the OTP and use it:
```bash
curl -X POST http://localhost:5000/api/users/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "otp": "123456"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": 1,
    "email": "testuser@example.com"
  }
}
```

#### 3. Login User
```bash
curl -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "email": "testuser@example.com",
    "firstName": null,
    "lastName": null,
    "isProfileComplete": false,
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### 4. Complete Profile
```bash
curl -X POST http://localhost:5000/api/users/profile/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    "phoneNumber": "+1234567890"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "testuser@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "date_of_birth": "1990-01-15",
    "gender": "Male",
    "is_profile_complete": true
  }
}
```

#### 5. Get Current User
```bash
curl -X GET http://localhost:5000/api/users/current \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 6. Refresh Access Token
```bash
curl -X POST http://localhost:5000/api/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

#### 7. Change Password
```bash
curl -X POST http://localhost:5000/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentPassword": "TestPass123",
    "newPassword": "NewTestPass456",
    "confirmPassword": "NewTestPass456"
  }'
```

#### 8. Request Password Reset OTP
```bash
curl -X POST http://localhost:5000/api/users/forgot-password/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

#### 9. Verify Password Reset OTP
```bash
curl -X POST http://localhost:5000/api/users/forgot-password/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "otp": "123456"
  }'
```

#### 10. Reset Password
```bash
curl -X POST http://localhost:5000/api/users/forgot-password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "otp": "123456",
    "newPassword": "FinalNewPass789",
    "confirmPassword": "FinalNewPass789"
  }'
```

#### 11. Logout User
```bash
curl -X POST http://localhost:5000/api/users/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

#### 12. Resend Email OTP
```bash
curl -X POST http://localhost:5000/api/users/resend-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

### Using Postman

1. **Import Collection:** Create a new collection with the endpoints listed in README.md
2. **Set Environment Variables:**
   - `baseUrl`: `http://localhost:5000`
   - `accessToken`: Obtained from login response
   - `refreshToken`: Obtained from login response
   - `email`: Your test email
   - `otp`: OTP received via email

3. **Test Flow:**
   - Register → Verify Email → Login → Complete Profile → Get User

## Common Errors & Solutions

### 1. "Email already registered"
- Use a different email address for registration

### 2. "Invalid email or password"
- Ensure email is verified before login
- Check password contains uppercase, lowercase, and numbers

### 3. "OTP expired"
- OTP is valid for 10 minutes
- Request a new OTP using resend-email-otp endpoint

### 4. "Too many attempts"
- Maximum 3 OTP verification attempts
- Request a new OTP

### 5. "Invalid or expired access token"
- Use refresh-token endpoint to get a new access token
- Ensure token is in correct format: `Authorization: Bearer TOKEN`

### 6. "Email sending failed"
- Check Gmail credentials in .env
- Verify app password is correct (not regular password)
- Ensure 2-step verification is enabled on Gmail account

## Database Verification

### Check Tables Created
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Verify User Data
```sql
SELECT id, email, is_email_verified, is_profile_complete, created_at FROM users;
```

### Check OTP Records
```sql
SELECT email, otp_code, purpose, is_verified, expires_at FROM email_otps ORDER BY created_at DESC LIMIT 5;
```

### Check Refresh Tokens
```sql
SELECT user_id, is_revoked, expires_at FROM refresh_tokens ORDER BY created_at DESC LIMIT 5;
```

## Troubleshooting

### Issue: Database connection failed
- Verify DATABASE_URL in .env is correct
- Check if Neon database is active
- Ensure network allows connection to Neon endpoint

### Issue: Email not received
- Check spam/junk folder
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- Check Gmail app password is correct
- Verify sender email in EMAIL_FROM

### Issue: OTP verification always fails
- Ensure you're using the OTP from the email
- Check OTP hasn't expired (10 minutes)
- Verify email address matches

### Issue: Server not starting
- Check if port 5000 is already in use
- Change PORT in .env if needed
- Verify all dependencies are installed

## Next Steps

1. Set up Swagger documentation integration
2. Implement rate limiting
3. Add email templates
4. Implement 2FA (Two-Factor Authentication)
5. Add audit logging
6. Deploy to production

## Support

For issues, check:
1. Console logs (`npm run dev` output)
2. Email provider settings
3. Database connection status
4. Environment variables
