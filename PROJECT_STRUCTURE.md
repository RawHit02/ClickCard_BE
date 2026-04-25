# ClickCard Backend - Project Architecture

## Directory Structure

```
ClickCard_Backend/
├── src/
│   ├── config/
│   │   └── database.js           # Database connection setup
│   │
│   ├── models/
│   │   ├── User.js               # User model with database queries
│   │   ├── OTP.js                # OTP model for email verification
│   │   └── RefreshToken.js       # Refresh token model
│   │
│   ├── services/
│   │   └── AuthService.js        # Business logic for authentication
│   │
│   ├── controllers/
│   │   └── UserController.js     # API endpoint handlers
│   │
│   ├── routes/
│   │   └── userRoutes.js         # Route definitions
│   │
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   │
│   ├── utils/
│   │   ├── emailService.js       # Email sending utilities
│   │   ├── jwtUtils.js           # JWT token generation and verification
│   │   ├── responseHandler.js    # Standard response formatting
│   │   └── validator.js          # Input validation functions
│   │
│   ├── app.js                    # Express app configuration
│   ├── index.js                  # Server entry point
│   └── swagger.js                # Swagger API documentation
│
├── .env                          # Environment variables (local)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── package.json                  # Project dependencies and scripts
├── README.md                     # Project documentation
├── SETUP_GUIDE.md               # Setup and testing guide
├── API_REFERENCE.md             # API quick reference
└── PROJECT_STRUCTURE.md         # This file
```

## File Descriptions

### Configuration

#### `src/config/database.js`
- Establishes PostgreSQL connection with Neon
- Handles SSL configuration
- Error handling for connection issues

### Models (Database Layer)

#### `src/models/User.js`
**Exports:** `User` object, `createUserTable` function
**Methods:**
- `create(email, password)` - Create new user
- `findByEmail(email)` - Find user by email
- `findById(userId)` - Find user by ID
- `updateProfile(userId, data)` - Update user profile
- `verifyEmail(userId)` - Mark email as verified
- `updatePassword(userId, hash)` - Update password
- `updateLastLogin(userId)` - Update last login time

#### `src/models/OTP.js`
**Exports:** `OTP` object
**Methods:**
- `generate(email, purpose)` - Generate OTP
- `verify(email, code, purpose)` - Verify OTP
- `getLatest(email, purpose)` - Get latest OTP
- `cleanExpired()` - Remove expired OTPs

#### `src/models/RefreshToken.js`
**Exports:** `RefreshToken` object
**Methods:**
- `store(userId, token, expiry)` - Store refresh token
- `findByToken(token)` - Find token record
- `revoke(token)` - Revoke token
- `revokeAllUserTokens(userId)` - Logout from all devices

### Services (Business Logic Layer)

#### `src/services/AuthService.js`
**Exports:** `AuthService` object with all authentication methods
**Key Methods:**
- `register(email, password, confirmPassword)` - User registration
- `resendEmailOTP(email)` - Resend OTP
- `verifyEmailOTP(email, otp)` - Email verification
- `login(email, password)` - User login
- `completeProfile(userId, data)` - Profile setup
- `getCurrentUser(userId)` - Get user info
- `refreshAccessToken(refreshToken)` - Token refresh
- `logout(refreshToken)` - User logout
- `requestPasswordResetOTP(email)` - Password reset request
- `verifyPasswordResetOTP(email, otp)` - Verify password OTP
- `resetPassword(email, otp, newPassword, confirm)` - Password reset
- `changePassword(userId, current, newPassword, confirm)` - Change password

### Controllers (API Handler Layer)

#### `src/controllers/UserController.js`
**Exports:** `UserController` object with endpoint methods
**Maps to routes:** Each method handles a specific API endpoint
- Validates incoming requests
- Calls service methods
- Returns formatted responses
- Handles errors

### Routes

#### `src/routes/userRoutes.js`
**Exports:** Express router
**Defines:**
- All public endpoints (no auth required)
- All protected endpoints (auth required)
- Applies authentication middleware where needed

### Middleware

#### `src/middleware/auth.js`
**Exports:** `authenticateToken` middleware function
**Functionality:**
- Validates JWT token
- Extracts user info from token
- Passes to protected endpoints
- Returns 401 on invalid token

### Utilities

#### `src/utils/emailService.js`
**Exports:** `sendOTPEmail` function
**Functionality:**
- Configures Nodemailer with Gmail
- Sends OTP emails
- Formats email templates based on purpose

#### `src/utils/jwtUtils.js`
**Exports:** JWT utility functions
- `generateAccessToken(userId, email)` - Create access token
- `generateRefreshToken(userId)` - Create refresh token
- `verifyAccessToken(token)` - Validate access token
- `verifyRefreshToken(token)` - Validate refresh token

#### `src/utils/responseHandler.js`
**Exports:** Response formatting functions
- `sendSuccessResponse(res, code, msg, data)` - Success response
- `sendErrorResponse(res, code, msg, error)` - Error response

#### `src/utils/validator.js`
**Exports:** Validation functions
- `validateEmail(email)` - Email validation
- `validatePassword(password)` - Password strength validation
- `validatePhoneNumber(phone)` - Phone validation
- `validateFieldsRegistration()` - Registration validation
- `validateFieldsProfile()` - Profile validation

### Main Files

#### `src/app.js`
- Express app initialization
- Middleware setup (CORS, body-parser)
- Route registration
- Database table creation
- Error handling

#### `src/index.js`
- Server startup
- Port configuration
- Logging

#### `src/swagger.js`
- Swagger/OpenAPI documentation (JSDoc format)
- API endpoint documentation
- Request/response schemas

## Data Flow

### Registration Flow
```
Client Request
    ↓
UserController.register()
    ↓
AuthService.register()
    ├─ Validate input
    ├─ Check email exists
    ├─ Hash password (bcrypt)
    ├─ User.create() → Database
    ├─ OTP.generate() → Database
    └─ sendOTPEmail() → Email service
    ↓
Response to Client
```

### Login Flow
```
Client Request
    ↓
UserController.login()
    ↓
AuthService.login()
    ├─ Validate email format
    ├─ User.findByEmail() → Database
    ├─ Compare password (bcrypt)
    ├─ Check email verification
    ├─ Update last login
    ├─ Generate tokens (JWT)
    ├─ RefreshToken.store() → Database
    └─ Return tokens
    ↓
Response to Client
```

### Protected Endpoint Flow
```
Client Request + Token
    ↓
auth.js Middleware
    ├─ Extract token from header
    ├─ verifyAccessToken() (JWT)
    ├─ Attach user info to request
    └─ Pass to controller
    ↓
Controller Handler
    ↓
Service Layer
    ↓
Database Query
    ↓
Response to Client
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  profile_picture VARCHAR(500),
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_profile_complete BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Email OTPs Table
```sql
CREATE TABLE email_otps (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  purpose VARCHAR(50),
  is_verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  verified_at TIMESTAMP
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```

## API Flow Summary

1. **Public Endpoints** (no auth needed)
   - Register
   - Login
   - Password Reset
   - OTP Operations

2. **Protected Endpoints** (JWT token required)
   - Get Current User
   - Complete Profile
   - Change Password

3. **Semi-Protected Endpoints** (work without auth but can use token)
   - Refresh Token
   - Logout

## Authentication Flow

### Access Token
- Generated on login
- Valid for 7 days
- Used to authenticate protected endpoints
- Included in `Authorization: Bearer {token}` header

### Refresh Token
- Generated on login
- Valid for 30 days
- Used to get new access token when expired
- Stored in database
- Can be revoked (logout)

### OTP
- Generated on registration and password reset
- Valid for 10 minutes
- Max 3 verification attempts
- Sent via email using Nodemailer

## Error Handling

All errors follow standard format:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Detailed error (dev only)"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation)
- 401: Unauthorized (auth)
- 403: Forbidden (email not verified)
- 404: Not Found
- 409: Conflict (duplicate email)
- 500: Server Error

## Security Features

1. **Password Hashing**: Bcrypt (10 rounds)
2. **JWT Tokens**: HMAC-SHA256
3. **HTTPS Ready**: SSL/TLS support for database
4. **CORS Enabled**: Cross-origin requests configured
5. **Input Validation**: All inputs validated
6. **Email Verification**: Required before login
7. **OTP Verification**: Prevents automated attacks
8. **Token Revocation**: Can revoke tokens on logout
9. **Password Requirements**: Strong password enforced

## Dependencies

**Runtime:**
- express: Web framework
- pg: PostgreSQL driver
- bcrypt: Password hashing
- jsonwebtoken: JWT handling
- nodemailer: Email sending
- dotenv: Environment variables
- cors: CORS support
- body-parser: Request parsing
- validator: Input validation

**Development:**
- nodemon: Auto-reload on file changes

## Deployment Considerations

1. Update `.env` for production
2. Set `NODE_ENV=production`
3. Use strong `JWT_SECRET`
4. Configure proper email credentials
5. Use production database URL
6. Set proper CORS origins
7. Enable HTTPS
8. Use environment-specific logging
9. Set up monitoring/alerting
10. Regular database backups

## Future Enhancements

- [ ] Rate limiting
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth integration (Google, GitHub)
- [ ] Email templates
- [ ] Audit logging
- [ ] User roles and permissions
- [ ] API versioning
- [ ] Caching layer (Redis)
- [ ] Request logging
- [ ] Swagger UI integration
- [ ] Unit/integration tests
- [ ] Performance monitoring
