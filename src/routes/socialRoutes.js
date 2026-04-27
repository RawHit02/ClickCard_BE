const express = require('express');
const { body, validationResult } = require('express-validator');
const SocialController = require('../controllers/SocialController');

const router = express.Router();

// Validation middleware for social signin
const validateSocialSignIn = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('authType')
    .isIn(['google', 'apple'])
    .withMessage('authType must be either "google" or "apple"'),
  body('googleId')
    .if(() => true)
    .optional()
    .isString()
    .trim(),
  body('appleId')
    .if(() => true)
    .optional()
    .isString()
    .trim(),
  body('name')
    .optional()
    .isString()
    .trim(),
  body('phoneNumber')
    .optional()
    .isString()
    .trim(),
  body('deviceId')
    .optional()
    .isString()
    .trim(),
  body('fcmToken')
    .optional()
    .isString()
    .trim(),
];

// Custom validation middleware
const validateCustomRules = (req, res, next) => {
  const { authType, googleId, appleId } = req.body;

  if (authType === 'google' && !googleId) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'googleId', message: 'googleId is required when authType is "google"' }],
    });
  }

  if (authType === 'apple' && !appleId) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'appleId', message: 'appleId is required when authType is "apple"' }],
    });
  }

  next();
};

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * POST /api/auth/social-signin
 * Login or Register via social accounts (Google, Apple)
 * 
 * Request body:
 * {
 *   "name": "John Doe",
 *   "email": "john.doe@gmail.com",
 *   "phoneNumber": "9876654352",
 *   "deviceId": "some-device-id",
 *   "fcmToken": "fcm_device_token_ABC123",
 *   "appleId": "apple-id-123",
 *   "googleId": "google-id-123",
 *   "authType": "google"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "User registered successfully via social auth",
 *   "data": {
 *     "user": {
 *       "id": 1,
 *       "email": "john.doe@gmail.com",
 *       "name": "John Doe",
 *       "phone": "9876654352",
 *       "isEmailVerified": false,
 *       "isProfileComplete": false,
 *       "authProvider": "google"
 *     },
 *     "tokens": {
 *       "accessToken": "eyJ...",
 *       "refreshToken": "eyJ..."
 *     },
 *     "isNewUser": true
 *   }
 * }
 */
router.post(
  '/social-signin',
  validateSocialSignIn,
  handleValidationErrors,
  validateCustomRules,
  SocialController.socialSignIn
);

module.exports = router;
