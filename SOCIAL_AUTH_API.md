# Social Authentication API Documentation

## Overview
The Social Authentication API enables users to sign up and log in using Google and Apple accounts. This endpoint handles both registration of new users and login of existing users seamlessly.

## Endpoint

### POST /api/auth/social-signin
**Description:** Login or Register via social accounts (Google, Apple)

**URL:** `http://localhost:5000/api/auth/social-signin`

---

## Request Parameters

### Request Body (application/json)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address from the social provider |
| authType | string | Yes | Authentication provider: `"google"` or `"apple"` |
| googleId | string | Conditional | Required when `authType` is `"google"` |
| appleId | string | Conditional | Required when `authType` is `"apple"` |
| name | string | No | User's full name |
| phoneNumber | string | No | User's phone number (10-15 digits) |
| deviceId | string | No | Device identifier (defaults to "UNKNOWN_DEVICE") |
| fcmToken | string | No | Firebase Cloud Messaging token for push notifications |

---

## Request Examples

### Example 1: Google Sign-In (New User)
```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "phoneNumber": "9876654352",
    "deviceId": "device-iphone-12-pro",
    "fcmToken": "fcm_token_ABC123XYZ",
    "googleId": "google-id-123456789",
    "authType": "google"
  }'
```

**Response (201 - New User):**
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
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "isNewUser": true
  }
}
```

---

### Example 2: Google Sign-In (Existing User)
```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@gmail.com",
    "googleId": "google-id-123456789",
    "authType": "google",
    "deviceId": "device-android-samsung",
    "fcmToken": "fcm_token_XYZ789"
  }'
```

**Response (200 - Existing User):**
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
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "isNewUser": false
  }
}
```

---

### Example 3: Apple Sign-In
```bash
curl -X POST http://localhost:5000/api/auth/social-signin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@icloud.com",
    "phoneNumber": "9123456789",
    "deviceId": "device-apple-iphone-14",
    "fcmToken": "fcm_token_APPLE_123",
    "appleId": "apple-id-987654321",
    "authType": "apple"
  }'
```

**Response:**
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
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "isNewUser": true
  }
}
```

---

## Response Codes

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 201 | User created successfully (new registration) | New user via social auth |
| 200 | Login successful (existing user) | Existing user login |
| 400 | Bad request / Validation error | Missing required fields |
| 409 | Conflict - Social ID already linked | Social ID linked to another account |
| 500 | Internal server error | Database or server error |

---

## Error Responses

### Example 1: Missing Email
```json
{
  "success": false,
  "message": "Email is required"
}
```

### Example 2: Missing Google ID when authType is "google"
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

### Example 3: Invalid authType
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

### Example 4: Social ID Already Linked to Another Account
```json
{
  "success": false,
  "message": "googleId is already linked to another account"
}
```

### Example 5: Account Created with Different Provider
```json
{
  "success": false,
  "message": "Account was created using apple. Please sign in with that provider."
}
```

### Example 6: Google ID Mismatch
```json
{
  "success": false,
  "message": "Google ID mismatch. This account is linked to a different Google account."
}
```

---

## Key Features

✅ **Unified Sign-In/Sign-Up:** Same endpoint handles both new registrations and existing user logins
✅ **Google & Apple Support:** Works with both social providers
✅ **Automatic User Creation:** New users are automatically registered on first sign-in
✅ **Token Generation:** Returns both access and refresh tokens for authentication
✅ **Device Tracking:** Stores device ID and FCM token for push notifications
✅ **Social ID Validation:** Prevents linking the same social ID to multiple accounts
✅ **Provider Consistency:** Ensures users don't mix different social providers on same account
✅ **Email Normalization:** Automatically normalizes email addresses to lowercase

---

## User Data Structure

When a user signs in via social auth, the following data is stored:

```javascript
{
  id: 1,                          // Auto-generated user ID
  email: "user@example.com",      // Email from social provider
  first_name: "John",             // Optional name
  phone_number: "9876654352",     // Optional phone
  google_id: "google-id-123",     // Google ID (if Google auth)
  apple_id: null,                 // Apple ID (if Apple auth)
  auth_provider: "google",        // Auth provider used
  device_id: "device-123",        // Device identifier
  fcm_token: "fcm-token-123",     // FCM token for notifications
  is_email_verified: false,       // Email verification status
  is_profile_complete: false,     // Profile completion status
  is_active: true,                // Account status
  created_at: "2024-01-15T...",   // Account creation timestamp
  updated_at: "2024-01-15T..."    // Last update timestamp
}
```

---

## Security Considerations

1. **Social ID Uniqueness:** Each social ID (Google/Apple) is unique and can only be linked to one account
2. **Email Uniqueness:** Emails are unique per provider (you can have the same email with different providers)
3. **Provider Binding:** Once an account is created with a provider, you must use the same provider to login
4. **Token Expiry:** 
   - Access Token: 7 days (configurable via JWT_EXPIRE in .env)
   - Refresh Token: 30 days (configurable via REFRESH_TOKEN_EXPIRE in .env)
5. **Password Generation:** Automatic secure random passwords are generated for social users

---

## Implementation Example (Frontend - React Native)

```javascript
// Example: Google Sign-In Integration
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const handleGoogleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    const response = await fetch('http://localhost:5000/api/auth/social-signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userInfo.user.email,
        name: userInfo.user.name,
        googleId: userInfo.user.id,
        authType: 'google',
        deviceId: 'device-id-here',
        fcmToken: 'fcm-token-here'
      })
    });
    
    const result = await response.json();
    if (result.success) {
      // Store tokens and user data
      localStorage.setItem('accessToken', result.data.tokens.accessToken);
      localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
      // Navigate to home or profile completion
    }
  } catch (error) {
    console.error('Google sign-in failed:', error);
  }
};
```

---

## Database Schema

### Users Table Changes
The `users` table now includes these social auth columns:

```sql
auth_provider VARCHAR(50) DEFAULT 'email'
google_id VARCHAR(255) UNIQUE
apple_id VARCHAR(255) UNIQUE
device_id VARCHAR(255)
```

These fields enable:
- Provider tracking for consistent sign-in
- Social ID storage for account linking verification
- Device identification for push notifications

---

## Troubleshooting

### Issue: "googleId is already linked to another account"
**Cause:** The Google ID is already associated with a different user account
**Solution:** Use a different Google account or contact support

### Issue: "Account was created using google. Please sign in with that provider"
**Cause:** User is trying to sign in with Apple, but account was created with Google
**Solution:** Sign in with the original provider (Google)

### Issue: "Google ID mismatch"
**Cause:** The provided Google ID doesn't match the one linked to the account
**Solution:** Ensure you're using the same Google account

### Issue: Token expired
**Cause:** Access token has expired
**Solution:** Use the refresh token to get a new access token (implement token refresh logic)

---

## API Swagger Documentation

Access the interactive API documentation at: `http://localhost:5000/api-docs`

The social signin endpoint is documented under the `/api/auth/social-signin` path with full request/response schemas.

---

## Related Endpoints

- `POST /api/users/refresh-token` - Refresh access token
- `POST /api/users/logout` - Logout and revoke token
- `GET /api/users/current` - Get current user profile
- `POST /api/users/profile/complete` - Complete user profile after signup

---

## Environment Variables Required

```env
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRE=30d
DATABASE_URL=postgresql://user:password@host/database
```

---

**Last Updated:** 2026-01-15
**API Version:** 1.0.0
