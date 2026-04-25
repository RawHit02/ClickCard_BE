# ClickCard Backend - Quick Installation & Start Guide

## ⚡ Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy the provided `.env` file and update these values:
```env
DATABASE_URL=postgresql://neondb_owner:npg_ZVn7IbHTU1cv@ep-curly-frost-ahthy79d-pooler.c-3.us-east-1.aws.neon.tech/clickcard?sslmode=require&channel_binding=require
JWT_SECRET=clickcard_super_secret_key_2026_production_level_security_token_generation_@#$%
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

### Step 3: Start the Server
```bash
# Development mode (auto-reload with Nodemon)
npm run dev

# Production mode
npm start
```

✅ Server running on `http://localhost:5000`

---

## 📁 Project Structure Created

```
ClickCard_Backend/
├── src/
│   ├── config/          → Database configuration
│   ├── models/          → Database models (User, OTP, RefreshToken)
│   ├── services/        → Business logic (AuthService)
│   ├── controllers/     → API handlers (UserController)
│   ├── routes/          → Route definitions (userRoutes)
│   ├── middleware/      → Authentication middleware
│   ├── utils/           → Helper functions (JWT, Email, Validators)
│   ├── app.js          → Express app setup
│   └── index.js        → Server entry point
├── .env                → Environment variables
├── package.json        → Dependencies
├── README.md          → Full documentation
├── SETUP_GUIDE.md     → Detailed setup & testing
├── API_REFERENCE.md   → API quick reference
└── PROJECT_STRUCTURE.md → Architecture details
```

---

## 🔌 Database

**Provider:** Neon PostgreSQL
**Connection String:** Already provided in `.env`
**Tables Created Automatically:**
- `users` - User account data
- `email_otps` - OTP verification codes
- `refresh_tokens` - Authentication tokens

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Complete project documentation |
| SETUP_GUIDE.md | Step-by-step setup with curl examples |
| API_REFERENCE.md | Quick API reference guide |
| PROJECT_STRUCTURE.md | Detailed architecture explanation |

---

## 🚀 API Endpoints

### Authentication (Public)
```
POST   /api/users/register
POST   /api/users/login/user
POST   /api/users/resend-email-otp
POST   /api/users/verify-email-otp
POST   /api/users/forgot-password/request-otp
POST   /api/users/forgot-password/verify-otp
POST   /api/users/forgot-password/reset
POST   /api/users/refresh-token
POST   /api/users/logout
```

### User Profile (Protected - Requires Token)
```
GET    /api/users/current
POST   /api/users/profile/complete
POST   /api/users/change-password
```

---

## ✨ Key Features

✅ User Registration with Email Verification
✅ Email OTP System (10-minute expiry)
✅ Secure Login with JWT Tokens
✅ Password Reset Flow
✅ Profile Management
✅ Password Change
✅ Token Refresh
✅ Logout (Token Revocation)
✅ Input Validation
✅ Bcrypt Password Hashing
✅ CORS Enabled
✅ Error Handling

---

## 📧 Gmail Setup (For OTP Emails)

1. Go to myaccount.google.com
2. Enable "2-Step Verification"
3. Generate "App Password"
4. Copy app password to `.env` EMAIL_PASSWORD

---

## 🧪 First API Test

```bash
# Register a new user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": 1,
    "email": "test@example.com",
    "isEmailVerified": false,
    "isProfileComplete": false
  }
}
```

---

## 🔑 Password Requirements

- 🔒 Minimum 8 characters
- 🔤 At least 1 uppercase letter
- 🔡 At least 1 lowercase letter  
- 🔢 At least 1 number

Example: `SecurePass123`

---

## 📋 Typical User Journey

1. **Register** - User creates account with email & password
2. **Verify Email** - User receives OTP and verifies
3. **Login** - User logs in, receives tokens
4. **Complete Profile** - User fills in profile details
5. **Use App** - User can now use all features
6. **Logout** - User logs out, token revoked

---

## ⚙️ Configuration

| Setting | Default | Location |
|---------|---------|----------|
| Port | 5000 | .env |
| Access Token Expiry | 7 days | .env |
| Refresh Token Expiry | 30 days | .env |
| OTP Expiry | 10 minutes | .env |
| OTP Max Attempts | 3 | AuthService.js |

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'express'"
```bash
npm install
```

### Issue: "Database connection failed"
- Verify DATABASE_URL in `.env`
- Check Neon database is active

### Issue: "Email not sending"
- Check EMAIL_USER and EMAIL_PASSWORD
- Verify 2-step verification on Gmail
- Check app password is correct

### Issue: "Port already in use"
- Change PORT in `.env`
- Or kill process on port 5000

---

## 📞 Support Resources

**Documentation:**
- See README.md for full documentation
- See SETUP_GUIDE.md for detailed testing examples
- See API_REFERENCE.md for quick endpoint reference
- See PROJECT_STRUCTURE.md for architecture details

**Common Issues:**
- Check .env configuration
- Verify database connection
- Check email service setup
- Review console logs for errors

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure .env file
3. ✅ Start server: `npm run dev`
4. ✅ Test endpoints (see SETUP_GUIDE.md)
5. ✅ Read full documentation in README.md

---

## 📦 Production Checklist

Before deploying to production:

- [ ] Update .env with production values
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Configure proper email service
- [ ] Use production database
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring
- [ ] Configure backup strategy
- [ ] Test all endpoints
- [ ] Review security settings

---

## 🎉 Ready to Go!

Your ClickCard Backend is now set up and ready to use. 

Start with `npm run dev` and enjoy! 🚀
