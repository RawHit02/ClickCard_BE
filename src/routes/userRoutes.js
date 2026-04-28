const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authenticateToken = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: User Authentication
 *   description: Multi-step user registration and authentication
 */

/* ---------------------- REGISTRATION FLOW (4 STEPS) ---------------------- */

/**
 * @swagger
 * /api/users/initiate-registration:
 *   post:
 *     summary: Step 1 - Initiate registration with email
 *     description: User enters email address. OTP is sent to the email for verification.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *       400:
 *         description: Invalid email or validation error
 *       409:
 *         description: Email already registered
 */
router.post('/initiate-registration', UserController.initiateRegistration);

/**
 * @swagger
 * /api/users/verify-email-otp-registration:
 *   post:
 *     summary: Step 2 - Verify email OTP during registration
 *     description: User enters OTP received in email. After verification, user can proceed to username selection.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     verified:
 *                       type: boolean
 *       400:
 *         description: Invalid OTP or email
 */
router.post('/verify-email-otp-registration', UserController.verifyEmailOTPForRegistration);

/**
 * @swagger
 * /api/users/check-username:
 *   post:
 *     summary: Step 3 - Check username availability
 *     description: User checks if desired username is available. Username must be 3-20 characters (alphanumeric and underscores).
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *     responses:
 *       200:
 *         description: Username availability checked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *       400:
 *         description: Invalid username format
 *       409:
 *         description: Username already taken
 */
router.post('/check-username', UserController.checkUsernameAvailability);

/**
 * @swagger
 * /api/users/complete-registration:
 *   post:
 *     summary: Step 4 - Complete registration
 *     description: User enters remaining details (username, name, phone, password) to complete signup. User is logged in immediately.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - name
 *               - phone
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 example: john_doe
 *               name:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 example: Password@123
 *               confirmPassword:
 *                 type: string
 *                 example: Password@123
 *               fcmToken:
 *                 type: string
 *                 example: "fcm_token_here"
 *     responses:
 *       201:
 *         description: Registration completed successfully. User is logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email, username, or phone already registered
 */
router.post('/complete-registration', UserController.completeRegistration);

/* ---------------------- EMAIL OTP MANAGEMENT ---------------------- */

/**
 * @swagger
 * /api/users/resend-email-otp:
 *   post:
 *     summary: Resend email OTP
 *     description: Resend OTP to email for users who didn't receive or want to regenerate it.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       404:
 *         description: User not found
 */
router.post('/resend-email-otp', UserController.resendEmailOTP);

/**
 * @swagger
 * /api/users/verify-email-otp:
 *   post:
 *     summary: Verify email OTP (existing users)
 *     description: Verify OTP for existing users (e.g., password reset flow). User is logged in after verification.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Invalid OTP or email
 */
router.post('/verify-email-otp', UserController.verifyEmailOTP);

/* ---------------------- LOGIN ---------------------- */

/**
 * @swagger
 * /api/users/login/user:
 *   post:
 *     summary: User login with flexible credentials
 *     description: Login with email, username, or phone number along with password. Returns access and refresh tokens.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *               - password
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Email, username, or phone number
 *                 example: "user@example.com or john_doe or +1234567890"
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     isProfileComplete:
 *                       type: boolean
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Missing credential or password
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */
router.post('/login/user', UserController.login);

/* ---------------------- PASSWORD MANAGEMENT ---------------------- */

/**
 * @swagger
 * /api/users/forgot-password/request-otp:
 *   post:
 *     summary: Request password reset OTP
 *     description: Request OTP for password reset. OTP will be sent to registered email.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       404:
 *         description: User not found
 */
router.post('/forgot-password/request-otp', UserController.requestPasswordResetOTP);

/**
 * @swagger
 * /api/users/forgot-password/verify-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     description: Verify OTP received for password reset.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post('/forgot-password/verify-otp', UserController.verifyPasswordResetOTP);

/**
 * @swagger
 * /api/users/forgot-password/reset:
 *   post:
 *     summary: Reset password
 *     description: Reset password with verified email and OTP.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation error
 */
router.post('/forgot-password/reset', UserController.resetPassword);

/* ---------------------- PROTECTED ROUTES (REQUIRE AUTHENTICATION) ---------------------- */

/**
 * @swagger
 * /api/users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh-token', UserController.refreshToken);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and revoke refresh token.
 *     tags: [User Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticateToken, UserController.logout);

/**
 * @swagger
 * /api/users/profile/create:
 *   post:
 *     summary: Create or update full profile
 *     description: Create or update user's full profile with personal, education, work, and business details.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/create', authenticateToken, UserController.createFullProfile);

/**
 * @swagger
 * /api/users/profile/full:
 *   get:
 *     summary: Get full profile
 *     description: Retrieve user's complete profile data.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile/full', authenticateToken, UserController.getFullProfile);

/**
 * @swagger
 * /api/users/current:
 *   get:
 *     summary: Get current user
 *     description: Retrieve current logged-in user details.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/current', authenticateToken, UserController.getCurrentUser);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change password
 *     description: Change password for authenticated user.
 *     tags: [User Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/change-password', authenticateToken, UserController.changePassword);

/**
 * @swagger
 * /api/users/profile/make-public:
 *   post:
 *     summary: Make profile public
 *     description: Make user's profile visible to public.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile made public
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/make-public', authenticateToken, UserController.makeProfilePublic);

/**
 * @swagger
 * /api/users/profile/make-private:
 *   post:
 *     summary: Make profile private
 *     description: Make user's profile private and hidden from public.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile made private
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/make-private', authenticateToken, UserController.makeProfilePrivate);

/**
 * @swagger
 * /api/users/profile/visibility:
 *   get:
 *     summary: Get profile visibility
 *     description: Check if user's profile is public or private.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile visibility retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/profile/visibility', authenticateToken, UserController.getProfileVisibility);

module.exports = router;
