const SocialAuthService = require('../services/SocialAuthService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');

const SocialController = {
  // POST /api/auth/social-signin
  // Handles both login and registration via social providers (Google, Apple)
  socialSignIn: async (req, res) => {
    try {
      const {
        name,
        email,
        phoneNumber,
        deviceId,
        appleId,
        googleId,
        authType,
      } = req.body;

      // Validate required fields
      if (!email) {
        return sendErrorResponse(res, 400, 'Email is required');
      }

      if (!authType || !['google', 'apple'].includes(authType)) {
        return sendErrorResponse(
          res,
          400,
          'Invalid or missing authType (should be "google" or "apple")'
        );
      }

      if (authType === 'google' && !googleId) {
        return sendErrorResponse(res, 400, 'googleId is required when authType is "google"');
      }

      if (authType === 'apple' && !appleId) {
        return sendErrorResponse(res, 400, 'appleId is required when authType is "apple"');
      }

      // Call service
      const result = await SocialAuthService.socialSignIn({
        name: name || '',
        email: email.toLowerCase(),
        phoneNumber: phoneNumber || '',
        deviceId: deviceId || 'UNKNOWN_DEVICE',
        appleId: appleId || null,
        googleId: googleId || null,
        authType,
      });

      if (result.success) {
        return sendSuccessResponse(res, result.statusCode, result.message, result.data);
      } else {
        return sendErrorResponse(
          res,
          result.statusCode,
          result.message,
          result.errors || result.error
        );
      }
    } catch (err) {
      console.error('Social sign-in controller error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },
};

module.exports = SocialController;
