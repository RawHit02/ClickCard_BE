const AuthService = require('../services/AuthService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');

const UserController = {
  // POST /api/users/initiate-registration/unique
  initiateRegistration: async (req, res) => {
    try {
      const { name, E_Mai_l, phone, password, confirmPassword, fcmToken } = req.body;

      // Validate required fields
      if (!name || !E_Mai_l || !phone || !password || !confirmPassword) {
        return sendErrorResponse(res, 400, 'Name, email, phone, password, and confirm password are required');
      }

      const result = await AuthService.initiateRegistration(
        name,
        E_Mai_l,
        phone,
        password,
        confirmPassword,
        fcmToken || ''
      );

      if (result.success) {
        return sendSuccessResponse(res, 201, result.message, result.data);
      } else {
        const statusCode = result.statusCode || (result.message === 'Validation failed' ? 400 : 409);
        return sendErrorResponse(res, statusCode, result.message, result.errors || result.error);
      }
    } catch (err) {
      console.error('Initiate registration error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/resend-email-otp
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

  // POST /api/users/verify-email-otp
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
      const { email, password } = req.body;

      if (!email || !password) {
        return sendErrorResponse(res, 400, 'Email and password are required');
      }

      const result = await AuthService.login(email, password);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        const statusCode = result.message === 'Please verify your email first' ? 403 : 401;
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
};

module.exports = UserController;
