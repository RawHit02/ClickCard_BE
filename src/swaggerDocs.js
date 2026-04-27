/**
 * @swagger
 * /api/users/initiate-registration/unique:
 *   post:
 *     summary: Initiate user registration (Enhanced) - REPLACE FOR OLD REGISTER
 *     description: |
 *       Create a new user account with complete registration details including name, email, phone, password, and optional FCM token.
 *       Email and phone number must be unique across the system.
 *       Password must be strong with minimum 8 characters including uppercase, lowercase, number, and special character.
 *       OTP will be sent to the provided email for verification.
 *       After receiving this response, use /verify-email-otp endpoint to verify the email with the OTP code.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - E_Mai_l
 *               - phone
 *               - password
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *                 description: Full name of the user (required)
 *               E_Mai_l:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *                 description: Email address (must be unique, required)
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *                 description: Phone number in any international format (must be unique, required)
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass@123
 *                 description: Password with min 8 chars, uppercase, lowercase, number, special char (@$!%*?&) (required)
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: SecurePass@123
 *                 description: Must match password (required)
 *               fcmToken:
 *                 type: string
 *                 example: abc123xyz-device-token
 *                 description: Firebase Cloud Messaging token for push notifications (optional)
 *     responses:
 *       201:
 *         description: Registration initiated successfully. OTP sent to email. User must verify email before login.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration initiated. Please verify your email.
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     phone:
 *                       type: string
 *                       example: "9876543210"
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: false
 *                     isProfileComplete:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: |
 *           Validation failed. Common errors:
 *           - Missing required fields
 *           - Invalid email format
 *           - Invalid phone format
 *           - Password doesn't meet strength requirements
 *           - Passwords don't match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: object
 *                   example:
 *                     password: Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)
 *       409:
 *         description: Conflict - Email or phone already registered by another user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Email already registered
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
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     isProfileComplete:
 *                       type: boolean
 *       400:
 *         description: Invalid or expired OTP
 *
 * /api/users/profile/create:
 *   post:
 *     summary: Create/Update User Full Profile (8 Sections)
 *     description: |
 *       Comprehensive API to create or update user profile across 8 specific sections:
 *       1. Personal Identity
 *       2. Contact Information
 *       3. Education
 *       4. Work Experience
 *       5. Business Details
 *       6. Products & Services
 *       7. Social Media & Digital Links
 *       8. Digital Card
 *       This API accepts a single nested object and maps it to the authenticated user ID.
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personalIdentity:
 *                 type: object
 *                 properties:
 *                   fullName: { type: string, example: "John Doe" }
 *                   displayName: { type: string, example: "JohnD" }
 *                   pronouns: { type: string, example: "He/Him" }
 *                   profilePhoto: { type: string, example: "https://example.com/photo.jpg" }
 *                   coverImage: { type: string, example: "https://example.com/cover.jpg" }
 *                   dateOfBirth: { type: string, format: date, example: "1990-01-01" }
 *                   gender: { type: string, example: "Male" }
 *                   nationality: { type: string, example: "Indian" }
 *                   location: { type: string, example: "Mumbai, India" }
 *                   tagline: { type: string, example: "Creative Designer" }
 *                   bio: { type: string, example: "Experienced professional in tech..." }
 *               contactInformation:
 *                 type: object
 *                 properties:
 *                   primaryMobile: { type: string, example: "+919876543210" }
 *                   secondaryMobile: { type: string, example: "+919876543211" }
 *                   emails: { type: array, items: { type: string }, example: ["work@john.com", "home@john.com"] }
 *                   residentialAddress: { type: string, example: "123 Home St, City" }
 *                   officeAddress: { type: string, example: "456 Office Rd, City" }
 *                   whatsAppNumber: { type: string, example: "+919876543210" }
 *                   websiteUrl: { type: string, example: "https://johndoe.com" }
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     institutionName: { type: string, example: "University of Tech" }
 *                     degree: { type: string, example: "Bachelor of Engineering" }
 *                     fieldOfStudy: { type: string, example: "Computer Science" }
 *                     yearOfPassing: { type: string, example: "2012" }
 *                     grade: { type: string, example: "A+" }
 *                     certifications: { type: array, items: { type: string }, example: ["AWS Certified", "Google Cloud Professional"] }
 *               workExperience:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     company: { type: string, example: "Tech Solutions Inc" }
 *                     designation: { type: string, example: "Senior Developer" }
 *                     duration: { type: string, example: "2015 - Present" }
 *                     description: { type: string, example: "Heading the backend team..." }
 *                     skills: { type: array, items: { type: string }, example: ["Node.js", "PostgreSQL", "System Design"] }
 *                     awards: { type: array, items: { type: string }, example: ["Employee of the Year 2021"] }
 *               businessDetails:
 *                 type: object
 *                 properties:
 *                   companyName: { type: string, example: "ClickCard Global" }
 *                   logo: { type: string, example: "url_to_logo" }
 *                   businessType: { type: string, example: "Private Ltd" }
 *                   gstNumber: { type: string, example: "27AAAAA0000A1Z5" }
 *                   cin: { type: string, example: "U72200MH2021PTC123456" }
 *                   pan: { type: string, example: "ABCDE1234F" }
 *                   businessAddress: { type: string, example: "Corporate Hub, Sector 1" }
 *                   googleMapsLink: { type: string, example: "https://maps.google.com/..." }
 *                   businessHours: { type: object, description: "Day-wise schedule" }
 *                   industry: { type: string, example: "IT Services" }
 *               productsServices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string, example: "Premium Digital Card" }
 *                     description: { type: string, example: "Interactive business card..." }
 *                     price: { type: string, example: "$49" }
 *                     category: { type: string, example: "Subscription" }
 *                     image: { type: string, example: "url_to_product_image" }
 *               socialMediaLinks:
 *                 type: object
 *                 properties:
 *                   linkedIn: { type: string, example: "linkedin.com/in/johndoe" }
 *                   instagram: { type: string, example: "instagram.com/johndoe" }
 *                   twitter: { type: string, example: "twitter.com/johndoe" }
 *                   facebook: { type: string, example: "facebook.com/johndoe" }
 *                   youtube: { type: string, example: "youtube.com/johndoe" }
 *                   github: { type: string, example: "github.com/johndoe" }
 *               digitalCard:
 *                 type: object
 *                 properties:
 *                   templateId: { type: string, example: "classic_gold" }
 *                   brandingColor: { type: string, example: "#FFD700" }
 *                   qrCodeStatus: { type: boolean, example: true }
 *                   isPublic: { type: boolean, example: true }
 *     responses:
 *       201:
 *         description: Full User Profile created/updated successfully
 *       401:
 *         description: Unauthorized
 *
 *
 * /api/users/profile/full:
 *   get:
 *     summary: Get Full User Profile
 *     description: Retrieve all sections of the user profile.
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 *
 * /api/users/resend-email-otp:
 *   post:
 *     summary: Resend email OTP
 *     description: Request a new OTP to be sent to the email address
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       404:
 *         description: User not found
 *
 * /api/users/login/user:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password. Returns access and refresh tokens.
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
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123
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
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Please verify your email first
 *
 * /api/users/current:
 *   get:
 *     summary: Get current user
 *     description: Retrieve information about the currently authenticated user
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 *
 * /api/users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Generate a new access token using a valid refresh token
 *     tags:
 *       - Authentication
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
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
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
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: Invalid or expired refresh token
 *
 * /api/users/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout user and revoke refresh token
 *     tags:
 *       - Authentication
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
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Invalid request
 *
 * /api/users/forgot-password/request-otp:
 *   post:
 *     summary: Request password reset OTP
 *     description: Request OTP for password reset. OTP will be sent to registered email.
 *     tags:
 *       - Password Management
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
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Password reset OTP sent to email
 *       404:
 *         description: User not found
 *
 * /api/users/forgot-password/verify-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     description: Verify OTP for password reset
 *     tags:
 *       - Password Management
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
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *
 * /api/users/forgot-password/reset:
 *   post:
 *     summary: Reset password
 *     description: Reset user password after OTP verification
 *     tags:
 *       - Password Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePass789
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePass789
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid request or OTP
 *
 * /api/users/change-password:
 *   post:
 *     summary: Change password
 *     description: Change password for authenticated user (requires authentication)
 *     tags:
 *       - Password Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePass789
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePass789
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or validation failed
 *       401:
 *         description: Unauthorized
 *
 * /api/share/create:
 *   post:
 *     summary: Create a new share link
 *     description: Create a unique share link with custom slug, expiry, and optional password protection.
 *     tags:
 *       - Share Links
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               custom_slug:
 *                 type: string
 *                 example: john-doe
 *                 description: Optional custom URL slug
 *               expiry_days:
 *                 type: integer
 *                 example: 30
 *                 description: Number of days until link expires
 *               requires_password:
 *                 type: boolean
 *                 example: false
 *               share_password:
 *                 type: string
 *                 example: SecurePass123
 *                 description: Required if requires_password is true
 *     responses:
 *       201:
 *         description: Share link created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *
 * /api/share/links:
 *   get:
 *     summary: Get all share links for user
 *     description: Retrieve all share links created by the authenticated user.
 *     tags:
 *       - Share Links
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of share links retrieved successfully
 *       401:
 *         description: Unauthorized
 *
 * /api/share/update/{id}:
 *   post:
 *     summary: Update share link settings
 *     description: Update settings for an existing share link.
 *     tags:
 *       - Share Links
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               custom_slug:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               expiry_date:
 *                 type: string
 *                 format: date-time
 *               requires_password:
 *                 type: boolean
 *               share_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Share link updated successfully
 *       404:
 *         description: Share link not found
 *
 * /api/share/{id}:
 *   delete:
 *     summary: Delete share link
 *     description: Permanently delete a share link.
 *     tags:
 *       - Share Links
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Share link deleted successfully
 *       404:
 *         description: Share link not found
 *
 * /api/share/{id}/regenerate:
 *   post:
 *     summary: Regenerate short code and QR
 *     description: Generate a new random short code and QR code for the share link.
 *     tags:
 *       - Share Links
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Short code regenerated successfully
 *
 * /api/share/{id}/analytics:
 *   get:
 *     summary: Get analytics for a share link
 *     description: Retrieve detailed visitor analytics for a specific share link.
 *     tags:
 *       - Share Links
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7days, 30days, all]
 *           default: 30days
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *
 * /api/share/{id}/qr:
 *   get:
 *     summary: Get QR code for share link
 *     description: Retrieve the QR code for a specific share link.
 *     tags:
 *       - Share Links
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [dataurl, buffer]
 *           default: dataurl
 *     responses:
 *       200:
 *         description: QR code generated successfully
 *
 * /api/share/analytics/all:
 *   get:
 *     summary: Get analytics for all user's share links
 *     description: Retrieve high-level analytics summary for all links owned by the user.
 *     tags:
 *       - Share Links
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All analytics retrieved successfully
 *
 * /api/public/profile/{identifier}:
 *   get:
 *     summary: Get public profile
 *     description: Retrieve a public profile by its slug, short code, or user ID.
 *     tags:
 *       - Public Profile
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         description: Custom slug, short code, or numeric user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       403:
 *         description: Password required for this profile
 *       404:
 *         description: Profile not found
 *
 * /api/public/profile/{identifier}/qr:
 *   get:
 *     summary: Get public QR code
 *     description: Retrieve the QR code for a public profile.
 *     tags:
 *       - Public Profile
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [dataurl, buffer]
 *           default: dataurl
 *     responses:
 *       200:
 *         description: QR code retrieved successfully
 *
 * /api/public/profile/{identifier}/verify-password:
 *   post:
 *     summary: Verify password for protected profiles
 *     description: Verify the password for a password-protected public profile.
 *     tags:
 *       - Public Profile
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password verified successfully
 *       401:
 *         description: Invalid password
 */
