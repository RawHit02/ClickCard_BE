const { ShareLink } = require('../models/ShareLink');
const { User } = require('../models/User');
const AnalyticsService = require('../services/AnalyticsService');
const ShareLinkService = require('../services/ShareLinkService');
const { responseHandler } = require('../utils/responseHandler');
const pool = require('../config/database');

class PublicProfileController {
  /**
   * GET /public/profile/:identifier - View public profile
   * Identifier can be: custom_slug, short_code, or user_id
   */
  static async getPublicProfile(req, res) {
    try {
      const { identifier } = req.params;
      const { password } = req.query;

      // Try to find share link by slug, short code, or user_id
      let shareLink = null;

      // Try slug first
      shareLink = await ShareLink.findBySlug(identifier);

      // Try short code
      if (!shareLink) {
        shareLink = await ShareLink.findByShortCode(identifier);
      }

      // Try as user_id if it's a number
      if (!shareLink && !isNaN(identifier)) {
        shareLink = await ShareLink.findByUserId(parseInt(identifier));
        if (shareLink && shareLink.length > 0) {
          // Get the first active share link for this user
          shareLink = shareLink.find((sl) => sl.is_active);
        } else {
          shareLink = null;
        }
      }

      if (!shareLink) {
        return responseHandler(res, 404, false, null, 'Profile not found');
      }

      // Check accessibility (active, not expired, etc.)
      const accessibility = ShareLinkService.checkAccessibility(shareLink);
      if (!accessibility.accessible) {
        return responseHandler(res, 403, false, null, accessibility.message);
      }

      // Check if password protected
      if (shareLink.is_password_protected) {
        if (!password) {
          return responseHandler(res, 403, false, null, 'Password required to access this profile');
        }

        const passwordValid = await ShareLinkService.verifyShareLinkPassword(password, shareLink.share_password);
        if (!passwordValid) {
          return responseHandler(res, 403, false, null, 'Invalid password');
        }
      }

      // Record analytics (non-blocking)
      PublicProfileController.recordAnalyticsAsync(shareLink.id, req);

      // Get user profile
      const user = await User.findById(shareLink.user_id);
      if (!user) {
        return responseHandler(res, 404, false, null, 'User not found');
      }

      // Get detailed profile
      const profileQuery = `
        SELECT * FROM user_profiles
        WHERE user_id = $1
      `;

      const profileResult = await pool.query(profileQuery, [shareLink.user_id]);
      const userProfile = profileResult.rows[0] || {};

      // Prepare response
      const profile = {
        user_id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile_picture,
        profile_bio: user.profile_bio,
        profile_header_image: user.profile_header_image,
        phone: user.phone_number ? PublicProfileController.maskPhone(user.phone_number) : null,
        personal_identity: userProfile.personal_identity,
        contact_information: userProfile.contact_information,
        education: userProfile.education,
        work_experience: userProfile.work_experience,
        business_details: userProfile.business_details,
        products_services: userProfile.products_services,
        social_links: userProfile.social_links,
        digital_card: userProfile.digital_card,
      };

      return responseHandler(res, 200, true, profile, 'Profile retrieved successfully');
    } catch (err) {
      console.error('Error fetching public profile:', err);
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }

  /**
   * GET /public/profile/:identifier/qr - Get QR code for public sharing
   */
  static async getPublicQRCode(req, res) {
    try {
      const { identifier } = req.params;

      let shareLink = await ShareLink.findBySlug(identifier);

      if (!shareLink) {
        shareLink = await ShareLink.findByShortCode(identifier);
      }

      if (!shareLink) {
        return responseHandler(res, 404, false, null, 'Profile not found');
      }

      // Check accessibility
      const accessibility = ShareLinkService.checkAccessibility(shareLink);
      if (!accessibility.accessible) {
        return responseHandler(res, 403, false, null, accessibility.message);
      }

      // Get QR code as buffer
      const qrBuffer = await ShareLinkService.getQRCode(shareLink.id, shareLink.user_id, 'buffer');

      res.setHeader('Content-Type', 'image/png');
      return res.send(qrBuffer);
    } catch (err) {
      console.error('Error generating public QR code:', err);
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }

  /**
   * POST /public/profile/:identifier/verify-password - Verify password for protected profiles
   */
  static async verifyPassword(req, res) {
    try {
      const { identifier } = req.params;
      const { password } = req.body;

      if (!password) {
        return responseHandler(res, 400, false, null, 'Password is required');
      }

      let shareLink = await ShareLink.findBySlug(identifier);

      if (!shareLink) {
        shareLink = await ShareLink.findByShortCode(identifier);
      }

      if (!shareLink) {
        return responseHandler(res, 404, false, null, 'Profile not found');
      }

      if (!shareLink.is_password_protected) {
        return responseHandler(res, 400, false, null, 'This profile does not require a password');
      }

      const passwordValid = await ShareLinkService.verifyShareLinkPassword(password, shareLink.share_password);

      if (!passwordValid) {
        return responseHandler(res, 403, false, null, 'Invalid password');
      }

      return responseHandler(res, 200, true, { verified: true }, 'Password verified');
    } catch (err) {
      console.error('Error verifying password:', err);
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }

  /**
   * Record analytics asynchronously (non-blocking)
   */
  static async recordAnalyticsAsync(shareLinkId, req) {
    try {
      const userAgent = req.get('user-agent') || '';
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const referrer = req.get('referer') || 'direct';

      const deviceType = AnalyticsService.extractDeviceType(userAgent);
      const platform = AnalyticsService.extractPlatform(userAgent);

      // Record view (non-blocking)
      AnalyticsService.recordView(shareLinkId, {
        visitorIp: clientIP,
        visitorUserAgent: userAgent,
        referrerSource: referrer,
        deviceType,
        platform,
      }).catch((err) => {
        console.error('Error recording analytics:', err);
      });
    } catch (err) {
      console.error('Error in analytics recording:', err);
    }
  }

  /**
   * Mask phone number for privacy
   */
  static maskPhone(phone) {
    if (!phone || phone.length < 4) return '***-***-****';
    return `***-***-${phone.slice(-4)}`;
  }
}

module.exports = PublicProfileController;
