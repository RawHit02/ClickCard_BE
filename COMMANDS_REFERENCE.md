# 🖥️ ClickCard Backend - Command Reference

Quick reference for common commands and operations.

---

## 🚀 Server Commands

### Start Development Server (With Auto-Reload)
```bash
npm run dev
```
- Auto-restarts on file changes
- Shows console logs
- Great for development

### Start Production Server
```bash
npm start
```
- No auto-reload
- Optimized for performance
- Use for deployment

### Install Dependencies
```bash
npm install
```
- Installs all packages from package.json
- Required before first run
- Run if package.json changes

### Check Node Version
```bash
node --version
npm --version
```

---

## 📝 API Testing Commands

### Test Server Health
```bash
curl http://localhost:5000/health
```
✅ Response: `{"status":"OK"}`

---

## 👤 User Registration & Login

### 1. Register New User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'
```

### 2. Resend Email OTP
```bash
curl -X POST http://localhost:5000/api/users/resend-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 3. Verify Email with OTP
```bash
curl -X POST http://localhost:5000/api/users/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### 4. Login User
```bash
curl -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```
**Save:** `accessToken` and `refreshToken` from response

### 5. Get Current User
```bash
curl -X GET http://localhost:5000/api/users/current \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Complete User Profile
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

---

## 🔑 Token Management

### Refresh Access Token
```bash
curl -X POST http://localhost:5000/api/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Logout User
```bash
curl -X POST http://localhost:5000/api/users/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 🔐 Password Management

### Request Password Reset OTP
```bash
curl -X POST http://localhost:5000/api/users/forgot-password/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Verify Password Reset OTP
```bash
curl -X POST http://localhost:5000/api/users/forgot-password/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Reset Password
```bash
curl -X POST http://localhost:5000/api/users/forgot-password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "newPassword": "NewPass789",
    "confirmPassword": "NewPass789"
  }'
```

### Change Password (Authenticated)
```bash
curl -X POST http://localhost:5000/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentPassword": "TestPass123",
    "newPassword": "NewPass789",
    "confirmPassword": "NewPass789"
  }'
```

---

## 🛠️ Development Commands

### Check if Port 5000 is in Use (Windows)
```bash
netstat -ano | findstr :5000
```

### Kill Process on Port 5000 (Windows)
```bash
taskkill /PID <PID> /F
```
Replace `<PID>` with the process ID from netstat

### Change Port in .env
Edit `.env` file:
```
PORT=3000
```

### View Environment Variables
```bash
# Windows PowerShell
Get-Content .env

# Linux/Mac
cat .env
```

---

## 🗄️ Database Commands

### Connect to Database (Neon)
Use psql or database client with connection string from `.env`
```
DATABASE_URL=postgresql://user:pass@host/database
```

### Check Tables Created
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Check Users
```sql
SELECT id, email, is_email_verified, is_profile_complete, created_at FROM users;
```

### Check OTPs
```sql
SELECT email, otp_code, purpose, is_verified, expires_at 
FROM email_otps 
ORDER BY created_at DESC LIMIT 5;
```

### Check Refresh Tokens
```sql
SELECT user_id, is_revoked, expires_at 
FROM refresh_tokens 
ORDER BY created_at DESC LIMIT 5;
```

### Clear All Data (Development Only)
```sql
DELETE FROM refresh_tokens;
DELETE FROM email_otps;
DELETE FROM users;
```

---

## 📦 Package Management

### Install Specific Package
```bash
npm install package-name
```

### Install Dev Dependency
```bash
npm install --save-dev package-name
```

### Update All Packages
```bash
npm update
```

### Check for Vulnerabilities
```bash
npm audit
```

### Fix Vulnerabilities
```bash
npm audit fix
```

---

## 📂 File & Folder Commands

### List Project Structure
```bash
# Windows
tree /F

# Linux/Mac
tree -L 3

# or just
ls -la
```

### View File Contents
```bash
# Windows PowerShell
Get-Content src/app.js

# Linux/Mac
cat src/app.js
```

### Create New File
```bash
# Windows
type nul > filename.js

# Linux/Mac
touch filename.js
```

### Create Directory
```bash
mkdir folder-name
```

---

## 🔍 Searching & Debugging

### Search Files for Text
```bash
# Windows
findstr /R "searchTerm" src/*.js

# Linux/Mac
grep -r "searchTerm" src/
```

### Check Node Modules
```bash
# View package versions
npm list

# View specific package
npm list express
```

### Check for Errors
```bash
# Run linter (if configured)
npm run lint

# Run tests (if configured)
npm test
```

---

## 🔄 Git Commands (If Using Git)

### Initialize Git
```bash
git init
```

### Check Git Status
```bash
git status
```

### Add Files
```bash
git add .
```

### Commit Changes
```bash
git commit -m "Your commit message"
```

### Push to Remote
```bash
git push origin main
```

---

## 🐛 Troubleshooting Commands

### Check Node Process
```bash
# Windows
tasklist | findstr node

# Linux/Mac
ps aux | grep node
```

### Check Port Usage
```bash
# Windows
netstat -ano | findstr LISTENING

# Linux/Mac
lsof -i :5000
```

### View Recent Logs
```bash
# If logging to file
type last-100-lines.txt
```

### Test Database Connection
```bash
# Use psql with connection string
psql "your_database_url"
```

---

## 📝 Environment Configuration

### Regenerate .env from .env.example
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### View Environment Variables
```bash
# Windows PowerShell
$env:NODE_ENV

# Linux/Mac
echo $NODE_ENV
```

### Set Environment Variable (Temporary)
```bash
# Windows
set NODE_ENV=production

# Linux/Mac
export NODE_ENV=production
```

---

## 💾 Backup Commands

### Backup .env File
```bash
# Windows
copy .env .env.backup

# Linux/Mac
cp .env .env.backup
```

### Backup Database
```bash
# Export database
pg_dump "your_connection_string" > backup.sql

# Restore database
psql "your_connection_string" < backup.sql
```

---

## 📊 Testing Workflow Commands

### Complete Test Flow
```bash
# 1. Start server
npm run dev

# 2. In another terminal, register user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123","confirmPassword":"TestPass123"}'

# 3. Check email for OTP, then verify
curl -X POST http://localhost:5000/api/users/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","otp":"123456"}'

# 4. Login
curl -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123"}'

# 5. Get current user (use accessToken from login response)
curl -X GET http://localhost:5000/api/users/current \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Essential Shortcuts

| Task | Command |
|------|---------|
| Start Dev Server | `npm run dev` |
| Start Prod Server | `npm start` |
| Test Health | `curl http://localhost:5000/health` |
| Install Deps | `npm install` |
| List Packages | `npm list` |
| Update Packages | `npm update` |
| Check Security | `npm audit` |
| View .env | `Get-Content .env` (Windows) / `cat .env` (Linux) |
| Edit .env | Use text editor |
| Stop Server | `Ctrl+C` |

---

## 🔗 Quick URLs

| URL | Purpose |
|-----|---------|
| http://localhost:5000 | API Base |
| http://localhost:5000/health | Health Check |
| http://localhost:5000/api/users/register | Register |
| http://localhost:5000/api/users/login/user | Login |

---

## 💡 Tips & Tricks

### Pretty Print JSON Response
```bash
# PowerShell
curl "url" | ConvertFrom-Json | ConvertTo-Json

# bash with jq
curl "url" | jq .
```

### Save Token to Variable (bash)
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/users/login/user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123"}' | jq -r '.data.accessToken')

echo $TOKEN
```

### Use Saved Token
```bash
curl -X GET http://localhost:5000/api/users/current \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📞 Common Issues & Fixes

### Server won't start
```bash
# Check if port is in use
netstat -ano | findstr :5000

# Change port in .env
PORT=3000
```

### npm install fails
```bash
# Clear cache
npm cache clean --force

# Reinstall
npm install
```

### Database connection fails
```bash
# Check .env DATABASE_URL
cat .env

# Test connection with psql
psql "your_connection_string"
```

### OTP not received
```bash
# Check EMAIL_USER and EMAIL_PASSWORD in .env
# Verify Gmail app password is correct
```

---

## 📚 Documentation Commands

### View README
```bash
# Windows
type README.md

# Linux/Mac
cat README.md
```

### View Specific Doc
```bash
# View Quick Start
cat QUICK_START.md

# View Setup Guide
cat SETUP_GUIDE.md

# View API Reference
cat API_REFERENCE.md
```

---

## ✅ Pre-Launch Checklist Commands

```bash
# 1. Check Node version
node --version

# 2. Install dependencies
npm install

# 3. Check .env configuration
cat .env

# 4. Start server
npm run dev

# 5. Test health endpoint
curl http://localhost:5000/health

# 6. Test registration
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","confirmPassword":"TestPass123"}'
```

---

**Quick Reference Version:** 1.0
**Last Updated:** 2026-04-24
