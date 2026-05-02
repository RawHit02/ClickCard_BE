/**
 * @swagger
 *
 * /api/users/verify-email-otp:
 *   post:
 *     summary: Verify email with OTP
 *     description: Verify user email using the OTP sent via email. Returns authentication tokens for immediate login.
 *     tags:
 *       - Authentication
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
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully. Returns tokens for immediate authentication.
 *
 * /api/users/complete-registration:
 *   post:
 *     summary: Complete registration
 *     description: Finalize registration with username and optional referral code.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               username:
 *                 type: string
 *                 example: john_doe
 *               referralCode:
 *                 type: string
 *                 example: CC-ABC123
 *     responses:
 *       201:
 *         description: Registration completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId: { type: integer }
 *                     email: { type: string }
 *                     username: { type: string }
 *                     role: { type: string, example: user }
 *                     accessToken: { type: string }
 *                     refreshToken: { type: string }
 *
 * /api/auth/social-signin:
 *   post:
 *     summary: Login or Register via social accounts (Google, Apple)
 *     description: |
 *       Unified endpoint for social authentication. Automatically creates accounts for new users.
 *       Supports referralCode for tracking invites.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, authType]
 *             properties:
 *               email: { type: string, format: email }
 *               authType: { type: string, enum: [google, apple] }
 *               googleId: { type: string }
 *               appleId: { type: string }
 *               name: { type: string }
 *               phoneNumber: { type: string }
 *               deviceId: { type: string }
 *               referralCode: { type: string, example: "CC-ABC123" }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id: { type: integer }
 *                         role: { type: string, example: user }
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken: { type: string }
 *       201:
 *         description: Social registration successful
 *

 *
 * /api/referrals/my:
 *   get:
 *     summary: Get my referral stats and list
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referrals retrieved successfully
 *
 * /api/public/profile/{identifier}:
 *   get:
 *     summary: Get public profile
 *     description: Retrieve a public profile by its slug, short code, or user ID.
 *     tags: [Public APIs]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *
 * /api/public/profile/{identifier}/resume.pdf:
 *   get:
 *     summary: Download PDF resume for a public profile
 *     tags: [Public APIs]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF file stream
 *
 * /api/public/profile/{identifier}/qr:
 *   get:
 *     summary: Get public QR code
 *     tags: [Public APIs]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: QR code retrieved successfully
 *
 * /api/public/profile/{identifier}/verify-password:
 *   post:
 *     summary: Verify password for protected profiles
 *     tags: [Public APIs]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Password verified successfully
 *
 * /api/public/profile/{identifier}/lead:
 *   post:
 *     summary: Submit contact details (Lead)
 *     tags: [Public APIs]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Lead submitted successfully
 *
 * /api/share/links:
 *   get:
 *     summary: Get all my share links
 *     tags: [Share Links]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Links retrieved
 *
 * /api/users/digital-card:
 *   get:
 *     summary: Get my digital card data
 *     description: Returns consolidated data for the user's digital card (Profile, QR, Public Link).
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Digital card data retrieved successfully
 */
