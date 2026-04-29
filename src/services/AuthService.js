const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const OTP = require('../models/OTP');
const RefreshToken = require('../models/RefreshToken');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwtUtils');
const {
  validateEmail,
  validatePhoneNumber,
  validateUsername,
  validateFieldsProfile,
} = require('../utils/validator');

const AuthService = {
  // Step 1: Initiate registration with email only (send OTP)
  initiateRegistration: async (email) => {
    try {
      // Validate email
      if (!email || !validateEmail(email)) {
        return { success: false, message: 'Invalid email address', statusCode: 400 };
      }

      // Check if email already exists
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return { success: false, message: 'Email already registered', statusCode: 409 };
      }

      // Generate and send OTP
      const otpResult = await OTP.generate(email, 'email_verification');
      await sendOTPEmail(email, otpResult.otp_code, 'email_verification', 'User');

      return {
        success: true,
        message: 'OTP sent to your email',
        data: {
          email: email,
        },
      };
    } catch (err) {
      console.error('Initiate registration error:', err);
      return { success: false, message: 'Registration initiation failed', error: err.message };
    }
  },

  // Step 2: Verify email OTP (before username/password entry)
  verifyEmailOTPForRegistration: async (email, otpCode) => {
    try {
      // Validate email
      if (!email || !validateEmail(email)) {
        return { success: false, message: 'Invalid email address', statusCode: 400 };
      }

      const otpResult = await OTP.verify(email, otpCode, 'email_verification');

      if (!otpResult.success) {
        return { success: false, message: otpResult.message, statusCode: 400 };
      }

      return {
        success: true,
        message: 'Email verified. Proceed to username selection.',
        data: {
          email: email,
          verified: true,
        },
      };
    } catch (err) {
      console.error('Verify OTP error:', err);
      return { success: false, message: 'OTP verification failed', error: err.message };
    }
  },

  // Step 3: Check username availability
  checkUsernameAvailability: async (username) => {
    try {
      // Validate username
      if (!username || !validateUsername(username)) {
        return {
          success: false,
          message: 'Username must be 3-20 characters (alphanumeric and underscores only)',
          statusCode: 400,
          available: false,
        };
      }

      // Check if username already exists
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return {
          success: false,
          message: 'Username already taken',
          statusCode: 409,
          available: false,
        };
      }

      return {
        success: true,
        message: 'Username is available',
        available: true,
      };
    } catch (err) {
      console.error('Check username error:', err);
      return { success: false, message: 'Failed to check username', error: err.message, available: false };
    }
  },

  // Step 4: Complete registration with username and optional referral code
  completeRegistration: async (email, username, referralCode = null) => {
    try {
      // 1. Validate username
      if (!username || !validateUsername(username)) {
        return { 
          success: false, 
          message: 'Username must be 3-20 characters (alphanumeric and underscores only)', 
          statusCode: 400 
        };
      }

      // 2. Check if username is already taken
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return { success: false, message: 'Username already taken', statusCode: 409 };
      }

      // 3. Generate unique referral code for the new user
      const userReferralCode = await AuthService.generateUniqueReferralCode();

      // 4. Create the user (Passwordless - no password needed)
      const user = await User.create(email.toLowerCase(), '', '', '', '', username, userReferralCode);

      // 5. Handle referral if code provided
      if (referralCode) {
        const referrer = await User.findByReferralCode(referralCode);
        if (referrer) {
          const Referral = require('../models/Referral');
          await Referral.create(referrer.id, user.id);
        }
      }

      // 6. Verify email immediately since it was verified in Step 2
      await User.verifyEmail(user.id);

      // 7. Send welcome email
      await sendWelcomeEmail(email, username);

      // 8. Generate tokens
      const accessToken = generateAccessToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token
      const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await RefreshToken.store(user.id, refreshToken, refreshTokenExpiry);

      return {
        success: true,
        message: 'Registration completed successfully',
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          referralCode: user.referral_code,
          accessToken,
          refreshToken,
        },
      };
    } catch (err) {
      console.error('Complete registration error:', err);
      return { success: false, message: 'Registration failed', error: err.message };
    }
  },

  // Helper: Generate a unique referral code
  generateUniqueReferralCode: async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let isUnique = false;
    let code = '';
    
    while (!isUnique) {
      code = 'CC-'; // ClickCard prefix
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const existing = await User.findByReferralCode(code);
      if (!existing) isUnique = true;
    }
    
    return code;
  },



  // Resend email OTP
  resendEmailOTP: async (email) => {
    try {
      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Generate new OTP
      const otpResult = await OTP.generate(email, 'email_verification');
      const emailResult = await sendOTPEmail(email, otpResult.otp_code, 'email_verification');

      if (!emailResult.success) {
        return emailResult;
      }

      return {
        success: true,
        message: 'OTP resent successfully',
      };
    } catch (err) {
      console.error('Resend OTP error:', err);
      return { success: false, message: 'Failed to resend OTP', error: err.message };
    }
  },

  // Verify email OTP (for existing users)
  verifyEmailOTP: async (email, otpCode) => {
    try {
      const otpResult = await OTP.verify(email, otpCode, 'email_verification');

      if (!otpResult.success) {
        return { success: false, message: otpResult.message };
      }

      // Get user and update email verification
      const user = await User.findByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      await User.verifyEmail(user.id);

      // Send welcome email
      await sendWelcomeEmail(email, user.first_name || 'User');

      // Generate tokens so user is immediately logged in
      const accessToken = generateAccessToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token
      const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await RefreshToken.store(user.id, refreshToken, refreshTokenExpiry);

      return {
        success: true,
        message: 'Email verified successfully',
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          accessToken,
          refreshToken,
          isProfileComplete: user.is_profile_complete,
        },
      };
    } catch (err) {
      console.error('Verify OTP error:', err);
      return { success: false, message: 'OTP verification failed', error: err.message };
    }
  },

  // Login Initiation (Send OTP)
  initiateLogin: async (credential) => {
    try {
      if (!credential) {
        return { success: false, message: 'Email or username is required', statusCode: 400 };
      }

      let user = null;
      // Try to find user by email first
      if (validateEmail(credential)) {
        user = await User.findByEmail(credential);
      }
      // Try to find user by username
      else {
        user = await User.findByUsername(credential);
      }

      if (!user) {
        return { success: false, message: 'No account found with this email/username', statusCode: 404 };
      }

      // Generate and send OTP for login
      const otpResult = await OTP.generate(user.email, 'login');
      await sendOTPEmail(user.email, otpResult.otp_code, 'login', user.first_name || 'User');

      return {
        success: true,
        message: 'OTP sent to your registered email',
        data: {
          email: user.email,
          username: user.username
        }
      };
    } catch (err) {
      console.error('Login initiation error:', err);
      return { success: false, message: 'Failed to initiate login', error: err.message };
    }
  },

  // Verify Login OTP
  verifyLoginOTP: async (credential, otpCode) => {
    try {
      if (!credential || !otpCode) {
        return { success: false, message: 'Credential and OTP are required', statusCode: 400 };
      }

      let user = null;
      if (validateEmail(credential)) {
        user = await User.findByEmail(credential);
      } else {
        user = await User.findByUsername(credential);
      }

      if (!user) {
        return { success: false, message: 'User not found', statusCode: 404 };
      }

      const otpResult = await OTP.verify(user.email, otpCode, 'login');

      if (!otpResult.success) {
        return { success: false, message: otpResult.message, statusCode: 400 };
      }

      // Check email verification (if not already verified)
      if (!user.is_email_verified) {
        await User.verifyEmail(user.id);
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate tokens
      const accessToken = generateAccessToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token
      const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await RefreshToken.store(user.id, refreshToken, refreshTokenExpiry);

      return {
        success: true,
        message: 'Login successful',
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          isProfileComplete: user.is_profile_complete,
          accessToken,
          refreshToken,
        },
      };
    } catch (err) {
      console.error('Login verification error:', err);
      return { success: false, message: 'Login verification failed', error: err.message };
    }
  },


  // Create or Update Full Profile
  createOrUpdateFullProfile: async (userId, data) => {
    try {
      // Basic validation for Personal Identity
      if (data.personalIdentity && data.personalIdentity.fullName === '') {
        return { success: false, message: 'Full name is required in personal identity' };
      }

      // Map incoming payload to the 8 sections for the model
      const profileData = {
        personalIdentity: data.personalIdentity || {},
        contactInformation: data.contactInformation || {},
        education: data.education || [],
        workExperience: data.workExperience || [],
        businessDetails: data.businessDetails || {},
        productsServices: data.productsServices || [],
        socialLinks: data.socialMediaLinks || {}, // Mapping socialMediaLinks from request to socialLinks for DB
        digitalCard: data.digitalCard || {},
      };

      const updatedProfile = await User.createOrUpdateProfile(userId, profileData);

      return {
        success: true,
        message: 'Full profile updated successfully',
        data: updatedProfile,
      };
    } catch (err) {
      console.error('Profile update error:', err);
      return { success: false, message: 'Failed to update profile', error: err.message };
    }
  },



  // Get full profile data
  getFullProfileData: async (userId) => {
    try {
      const profile = await User.getProfile(userId);
      if (!profile) {
        return { success: false, message: 'Profile not found' };
      }

      return {
        success: true,
        message: 'Profile retrieved successfully',
        data: profile,
      };
    } catch (err) {
      console.error('Get profile data error:', err);
      return { success: false, message: 'Failed to get profile data', error: err.message };
    }
  },

  // Get current user
  getCurrentUser: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (err) {
      console.error('Get user error:', err);
      return { success: false, message: 'Failed to get user', error: err.message };
    }
  },



  // Refresh access token
  refreshAccessToken: async (refreshToken) => {
    try {
      // Verify refresh token
      const verification = verifyRefreshToken(refreshToken);
      if (!verification.valid) {
        return { success: false, message: 'Invalid refresh token' };
      }

      // Check if token is in database and not revoked
      const tokenRecord = await RefreshToken.findByToken(refreshToken);
      if (!tokenRecord) {
        return { success: false, message: 'Refresh token not found or revoked' };
      }

      // Check expiry
      if (new Date() > new Date(tokenRecord.expires_at)) {
        return { success: false, message: 'Refresh token expired' };
      }

      // Get user info
      const user = await User.findById(tokenRecord.user_id);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user.id, user.email, user.role);

      return {
        success: true,
        message: 'Access token refreshed successfully',
        data: { accessToken: newAccessToken },
      };
    } catch (err) {
      console.error('Refresh token error:', err);
      return { success: false, message: 'Failed to refresh token', error: err.message };
    }
  },

  // Logout user
  logout: async (refreshToken) => {
    try {
      // Revoke refresh token
      await RefreshToken.revoke(refreshToken);

      return { success: true, message: 'Logout successful' };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, message: 'Logout failed', error: err.message };
    }
  },


};

module.exports = AuthService;
