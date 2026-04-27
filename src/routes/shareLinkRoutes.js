const express = require('express');
const router = express.Router();
const ShareLinkController = require('../controllers/ShareLinkController');
const authenticateToken = require('../middleware/auth');

// All routes require authentication

// Create a new share link
router.post('/create', authenticateToken, ShareLinkController.createShareLink);

// Get all share links for user
router.get('/links', authenticateToken, ShareLinkController.getUserShareLinks);

// Update share link settings
router.post('/update/:id', authenticateToken, ShareLinkController.updateShareLink);

// Delete share link
router.delete('/:id', authenticateToken, ShareLinkController.deleteShareLink);

// Regenerate short code and QR
router.post('/:id/regenerate', authenticateToken, ShareLinkController.regenerateShortCode);

// Get analytics for a share link
router.get('/:id/analytics', authenticateToken, ShareLinkController.getShareLinkAnalytics);

// Get QR code for share link
router.get('/:id/qr', authenticateToken, ShareLinkController.getQRCode);

// Get analytics for all user's share links
router.get('/analytics/all', authenticateToken, ShareLinkController.getAllUserAnalytics);

module.exports = router;
