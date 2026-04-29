const PDFService = require('../services/PDFService');
const { ShareLink } = require('../models/ShareLink');
const ShareLinkService = require('../services/ShareLinkService');
const pool = require('../config/database');
const { responseHandler } = require('../utils/responseHandler');

class PDFController {
  /**
   * GET /api/public/profile/:identifier/resume.pdf
   * Download PDF resume for a public profile
   * Access: Public (respects share link settings)
   * Optional query: ?password=xxx (for password-protected profiles)
   */
  static async downloadPublicResumePDF(req, res) {
    try {
      const { identifier } = req.params;
      const { password } = req.query;

      // Resolve share link (same as public profile lookup)
      let shareLink = await ShareLink.findBySlug(identifier);
      if (!shareLink) shareLink = await ShareLink.findByShortCode(identifier);
      if (!shareLink && !isNaN(identifier)) {
        const links = await ShareLink.findByUserId(parseInt(identifier));
        shareLink = Array.isArray(links) ? links.find((sl) => sl.is_active) : null;
      }

      if (!shareLink) {
        return responseHandler(res, 404, false, null, 'Profile not found');
      }

      // Check share link accessibility (active, not expired, etc.)
      const accessibility = ShareLinkService.checkAccessibility(shareLink);
      if (!accessibility.accessible) {
        return responseHandler(res, 403, false, null, accessibility.message);
      }

      // Check password protection
      if (shareLink.is_password_protected) {
        if (!password) {
          return responseHandler(res, 403, false, null, 'Password required to access this PDF');
        }
        const passwordValid = await ShareLinkService.verifyShareLinkPassword(password, shareLink.share_password);
        if (!passwordValid) {
          return responseHandler(res, 403, false, null, 'Invalid password');
        }
      }

      // Check user's master visibility toggle
      const userResult = await pool.query('SELECT public_profile_enabled FROM users WHERE id = $1', [shareLink.user_id]);
      const user = userResult.rows[0];
      if (!user || !user.public_profile_enabled) {
        return responseHandler(res, 403, false, null, 'This profile has been made private by the owner');
      }

      // Generate and stream PDF
      await PDFService.generateResumePDF(shareLink.user_id, res);
    } catch (err) {
      console.error('Error generating public PDF:', err);
      if (!res.headersSent) {
        return responseHandler(res, 500, false, null, err.message || 'Failed to generate PDF');
      }
    }
  }

  /**
   * GET /api/users/profile/my-resume.pdf
   * Download own resume PDF (authenticated users only)
   */
  static async downloadMyResumePDF(req, res) {
    try {
      const userId = req.user.id;
      await PDFService.generateResumePDF(userId, res);
    } catch (err) {
      console.error('Error generating own PDF:', err);
      if (!res.headersSent) {
        return responseHandler(res, 500, false, null, err.message || 'Failed to generate PDF');
      }
    }
  }

  /**
   * GET /api/users/profile/pdf-url
   * Returns the public PDF URL for the authenticated user's first active share link
   */
  static async getMyPDFUrl(req, res) {
    try {
      const userId = req.user.id;

      // Get user's share link(s)
      const links = await ShareLink.findByUserId(userId);
      const activeLink = Array.isArray(links) ? links.find((sl) => sl.is_active) : null;

      if (!activeLink) {
        return responseHandler(res, 404, false, null, 'No active share link found. Create one first via /api/share/create');
      }

      const identifier = activeLink.custom_slug || activeLink.short_code;
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const pdfUrl = `${baseUrl}/api/public/profile/${identifier}/resume.pdf`;
      const profileUrl = `${baseUrl}/api/public/profile/${identifier}`;

      return responseHandler(res, 200, true, {
        pdfUrl,
        profileUrl,
        identifier,
        slug: activeLink.custom_slug,
        shortCode: activeLink.short_code,
        isPasswordProtected: activeLink.is_password_protected,
        isActive: activeLink.is_active,
      }, 'PDF URL retrieved successfully');
    } catch (err) {
      console.error('Error getting PDF URL:', err);
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }
}

module.exports = PDFController;
