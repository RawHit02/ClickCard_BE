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
  validatePassword,
  validateFieldsRegistration,
  validateFieldsProfile,
  validateEnhancedRegistration,
} = require('../utils/validator');

const AuthService = {
  // Initiate registration with name, phone, and fcmToken
  initiateRegistration: async (name, email, phone, password, confirmPassword, fcmToken = '') => {
    try {
      // Validate fields
      const validation = validateEnhancedRegistration(name, email, phone, password, confirmPassword);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        };
      }

      // Check if email already exists
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return { success: false, message: 'Email already registered', statusCode: 409 };
      }

      // Check if phone already exists
      const existingPhone = await User.findByPhone(phone);
      if (existingPhone) {
        return { success: false, message: 'Phone number already registered', statusCode: 409 };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with name, phone, and fcmToken
      const newUser = await User.create(email, hashedPassword, name, phone, fcmToken);

      // Generate and send OTP
      const otpResult = await OTP.generate(email, 'email_verification');
      await sendOTPEmail(email, otpResult.otp_code, 'email_verification', name);

      return {
        success: true,
        message: 'Registration initiated. Please verify your email.',
        data: {
          userId: newUser.id,
          email: newUser.email,
          name: newUser.first_name,
          phone: newUser.phone_number,
          isEmailVerified: newUser.is_email_verified,
          isProfileComplete: newUser.is_profile_complete,
        },
      };
    } catch (err) {
      console.error('Initiate registration error:', err);
      if (err.code === '23505') {
        // Unique constraint violation
        const detail = err.detail || '';
        if (detail.includes('email')) {
          return { success: false, message: 'Email already registered', statusCode: 409 };
        } else if (detail.includes('phone')) {
          return { success: false, message: 'Phone number already registered', statusCode: 409 };
        }
      }
      return { success: false, message: 'Registration failed', error: err.message };
    }
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

  // Verify email OTP
  verifyEmailOTP: async (email, otpCode) => {
    try {
      const otpResult = await OTP.verify(email, otpCode, 'email_verification');

      if (!otpResult.success) {
        return { success: false, message: otpResult.message };
      }

      // Get user and update email verification
      const user = await User.findByEmail(email);
      await User.verifyEmail(user.id);

      // Send welcome email
      await sendWelcomeEmail(email, user.first_name || 'User');

      // Generate tokens so user is immediately logged in
      const accessToken = generateAccessToken(user.id, user.email);
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

  // Login user
  login: async (email, password) => {
    try {
      // Validate email
      if (!validateEmail(email)) {
        return { success: false, message: 'Invalid email address' };
      }

      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Check email verification
      if (!user.is_email_verified) {
        return {
          success: false,
          message: 'Please verify your email first',
          data: { userId: user.id, email: user.email },
        };
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate tokens
      const accessToken = generateAccessToken(user.id, user.email);
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
          firstName: user.first_name,
          lastName: user.last_name,
          isProfileComplete: user.is_profile_complete,
          accessToken,
          refreshToken,
        },
      };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Login failed', error: err.message };
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
      const newAccessToken = generateAccessToken(user.id, user.email);

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

  // Request password reset OTP
  requestPasswordResetOTP: async (email) => {
    try {
      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Generate and send OTP
      const otpResult = await OTP.generate(email, 'password_reset');
      const emailResult = await sendOTPEmail(email, otpResult.otp_code, 'password_reset');

      if (!emailResult.success) {
        return emailResult;
      }

      return {
        success: true,
        message: 'Password reset OTP sent to your email',
      };
    } catch (err) {
      console.error('Password reset request error:', err);
      return { success: false, message: 'Failed to send OTP', error: err.message };
    }
  },

  // Verify password reset OTP
  verifyPasswordResetOTP: async (email, otpCode) => {
    try {
      const otpResult = await OTP.verify(email, otpCode, 'password_reset');

      if (!otpResult.success) {
        return { success: false, message: otpResult.message };
      }

      return {
        success: true,
        message: 'OTP verified successfully. You can now reset your password.',
      };
    } catch (err) {
      console.error('OTP verification error:', err);
      return { success: false, message: 'OTP verification failed', error: err.message };
    }
  },

  // Reset password
  resetPassword: async (email, otpCode, newPassword, confirmPassword) => {
    try {
      // Validate new password
      if (!validatePassword(newPassword)) {
        return {
          success: false,
          message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
        };
      }

      if (newPassword !== confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      // Verify OTP
      const otpResult = await OTP.verify(email, otpCode, 'password_reset');
      if (!otpResult.success) {
        return { success: false, message: otpResult.message };
      }

      // Get user
      const user = await User.findByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await User.updatePassword(user.id, hashedPassword);

      return {
        success: true,
        message: 'Password reset successfully. Please login with your new password.',
      };
    } catch (err) {
      console.error('Password reset error:', err);
      return { success: false, message: 'Password reset failed', error: err.message };
    }
  },

  // Change password
  changePassword: async (userId, currentPassword, newPassword, confirmPassword) => {
    try {
      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Validate new password
      if (!validatePassword(newPassword)) {
        return {
          success: false,
          message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
        };
      }

      if (newPassword !== confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await User.updatePassword(userId, hashedPassword);

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (err) {
      console.error('Change password error:', err);
      return { success: false, message: 'Failed to change password', error: err.message };
    }
  },
};

module.exports = AuthService;
