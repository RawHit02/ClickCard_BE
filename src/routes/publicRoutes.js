const express = require('express');
const router = express.Router();
const PublicProfileController = require('../controllers/PublicProfileController');

// Get public profile by identifier (slug, short code, or user_id)
router.get('/profile/:identifier', PublicProfileController.getPublicProfile);

// Get QR code for public profile
router.get('/profile/:identifier/qr', PublicProfileController.getPublicQRCode);

// Verify password for protected profiles
router.post('/profile/:identifier/verify-password', PublicProfileController.verifyPassword);

module.exports = router;
