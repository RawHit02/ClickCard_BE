const AuthService = require('../services/AuthService');
const { User } = require('../models/User');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');

const UserController = {
  // Step 1: Initiate registration (email only)
  initiateRegistration: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return sendErrorResponse(res, 400, 'Email is required');
      }

      const result = await AuthService.initiateRegistration(email);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        const statusCode = result.statusCode || 400;
        return sendErrorResponse(res, statusCode, result.message);
      }
    } catch (err) {
      console.error('Initiate registration error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // Step 2: Verify email OTP for registration
  verifyEmailOTPForRegistration: async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return sendErrorResponse(res, 400, 'Email and OTP are required');
      }

      const result = await AuthService.verifyEmailOTPForRegistration(email, otp);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        const statusCode = result.statusCode || 400;
        return sendErrorResponse(res, statusCode, result.message);
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // Step 3: Check username availability
  checkUsernameAvailability: async (req, res) => {
    try {
      const { username } = req.body;

      if (!username) {
        return sendErrorResponse(res, 400, 'Username is required');
      }

      const result = await AuthService.checkUsernameAvailability(username);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, { available: result.available });
      } else {
        const statusCode = result.statusCode || 400;
        return sendErrorResponse(res, statusCode, result.message);
      }
    } catch (err) {
      console.error('Check username error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // Step 4: Complete registration (create user)
  completeRegistration: async (req, res) => {
    try {
      const { email, username, name, phone, password, confirmPassword, fcmToken } = req.body;

      if (!email || !username || !name || !phone || !password || !confirmPassword) {
        return sendErrorResponse(res, 400, 'Email, username, name, phone, password, and confirm password are required');
      }

      const result = await AuthService.completeRegistration(
        email,
        username,
        name,
        phone,
        password,
        confirmPassword,
        fcmToken || ''
      );

      if (result.success) {
        return sendSuccessResponse(res, 201, result.message, result.data);
      } else {
        const statusCode = result.statusCode || 400;
        return sendErrorResponse(res, statusCode, result.message);
      }
    } catch (err) {
      console.error('Complete registration error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // Resend email OTP
  resendEmailOTP: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return sendErrorResponse(res, 400, 'Email is required');
      }

      const result = await AuthService.resendEmailOTP(email);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message);
      } else {
        return sendErrorResponse(res, 404, result.message);
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // Verify email OTP (for existing users)
  verifyEmailOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return sendErrorResponse(res, 400, 'Email and OTP are required');
      }

      const result = await AuthService.verifyEmailOTP(email, otp);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        return sendErrorResponse(res, 400, result.message);
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/login/user
  login: async (req, res) => {
    try {
      const { credential, password } = req.body;

      if (!credential || !password) {
        return sendErrorResponse(res, 400, 'Credential (email, username, or phone) and password are required');
      }

      const result = await AuthService.login(credential, password);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        const statusCode = result.statusCode || (result.message === 'Please verify your email first' ? 403 : 401);
        return sendErrorResponse(res, statusCode, result.message, result.data);
      }
    } catch (err) {
      console.error('Login error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/profile/create
  createFullProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      const profileData = req.body;

      const result = await AuthService.createOrUpdateFullProfile(userId, profileData);

      if (result.success) {
        return sendSuccessResponse(res, 201, result.message, result.data);
      } else {
        return sendErrorResponse(res, 400, result.message, result.errors || result.error);
      }
    } catch (err) {
      console.error('Create profile error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // GET /api/users/profile/full
  getFullProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      const result = await AuthService.getCurrentUser(userId); // This already returns user info

      // We might want to get the specific profile data from the new table
      const profile = await AuthService.getFullProfileData(userId);

      if (profile.success) {
        return sendSuccessResponse(res, 200, profile.message, profile.data);
      } else {
        return sendErrorResponse(res, 404, profile.message);
      }
    } catch (err) {
      console.error('Get profile error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },


  // GET /api/users/current
  getCurrentUser: async (req, res) => {
    try {
      const userId = req.user.userId;

      const result = await AuthService.getCurrentUser(userId);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        return sendErrorResponse(res, 404, result.message);
      }
    } catch (err) {
      console.error('Get current user error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/refresh-token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return sendErrorResponse(res, 400, 'Refresh token is required');
      }

      const result = await AuthService.refreshAccessToken(refreshToken);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        return sendErrorResponse(res, 401, result.message);
      }
    } catch (err) {
      console.error('Refresh token error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/logout
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return sendErrorResponse(res, 400, 'Refresh token is required');
      }

      const result = await AuthService.logout(refreshToken);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message);
      } else {
        return sendErrorResponse(res, 400, result.message);
      }
    } catch (err) {
      console.error('Logout error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/forgot-password/request-otp
  requestPasswordResetOTP: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return sendErrorResponse(res, 400, 'Email is required');
      }

      const result = await AuthService.requestPasswordResetOTP(email);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message);
      } else {
        return sendErrorResponse(res, 404, result.message);
      }
    } catch (err) {
      console.error('Request password reset OTP error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/forgot-password/verify-otp
  verifyPasswordResetOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return sendErrorResponse(res, 400, 'Email and OTP are required');
      }

      const result = await AuthService.verifyPasswordResetOTP(email, otp);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message);
      } else {
        return sendErrorResponse(res, 400, result.message);
      }
    } catch (err) {
      console.error('Verify password reset OTP error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/forgot-password/reset
  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;

      if (!email || !otp || !newPassword || !confirmPassword) {
        return sendErrorResponse(res, 400, 'Email, OTP, and passwords are required');
      }

      const result = await AuthService.resetPassword(email, otp, newPassword, confirmPassword);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message);
      } else {
        return sendErrorResponse(res, 400, result.message);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/change-password
  changePassword: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return sendErrorResponse(res, 400, 'All password fields are required');
      }

      const result = await AuthService.changePassword(
        userId,
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message);
      } else {
        return sendErrorResponse(res, 400, result.message);
      }
    } catch (err) {
      console.error('Change password error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/profile/make-public
  makeProfilePublic: async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return sendErrorResponse(res, 401, 'Unauthorized - User ID not found');
      }

      // Check if profile is complete
      const user = await User.getProfileWithVisibility(userId);

      if (!user) {
        return sendErrorResponse(res, 404, 'User not found');
      }

      if (!user.is_profile_complete) {
        return sendErrorResponse(
          res,
          400,
          'Profile must be complete before making it public. Please complete your profile first.'
        );
      }

      // Update profile visibility to public
      const result = await User.updateProfileVisibility(userId, true);

      return sendSuccessResponse(res, 200, 'Profile is now public', {
        profileId: result.id,
        email: result.email,
        name: result.first_name,
        isPublic: result.public_profile_enabled,
        message: 'Your public profile is now active and accessible via share links',
      });
    } catch (err) {
      console.error('Make profile public error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/profile/make-private
  makeProfilePrivate: async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return sendErrorResponse(res, 401, 'Unauthorized - User ID not found');
      }

      const user = await User.findById(userId);

      if (!user) {
        return sendErrorResponse(res, 404, 'User not found');
      }

      // Update profile visibility to private
      const result = await User.updateProfileVisibility(userId, false);

      return sendSuccessResponse(res, 200, 'Profile is now private', {
        profileId: result.id,
        email: result.email,
        name: result.first_name,
        isPublic: result.public_profile_enabled,
        message: 'Your public profile has been deactivated. Share links will no longer work.',
      });
    } catch (err) {
      console.error('Make profile private error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // GET /api/users/profile/visibility
  getProfileVisibility: async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return sendErrorResponse(res, 401, 'Unauthorized - User ID not found');
      }

      const user = await User.getProfileWithVisibility(userId);

      if (!user) {
        return sendErrorResponse(res, 404, 'User not found');
      }

      return sendSuccessResponse(res, 200, 'Profile visibility retrieved', {
        profileId: user.id,
        email: user.email,
        name: user.first_name,
        isPublic: user.public_profile_enabled,
        isProfileComplete: user.is_profile_complete,
        isEmailVerified: user.is_email_verified,
      });
    } catch (err) {
      console.error('Get profile visibility error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },
};

module.exports = UserController;
