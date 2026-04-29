const express = require('express');
const router = express.Router();
const PublicProfileController = require('../controllers/PublicProfileController');
const PDFController = require('../controllers/PDFController');
const LeadController = require('../controllers/LeadController');

// Get public profile by identifier (slug, short code, or user_id)
router.get('/profile/:identifier', PublicProfileController.getPublicProfile);

/**
 * @swagger
 * /api/public/profile/{identifier}/resume.pdf:
 *   get:
 *     summary: Download PDF resume for a public profile
 *     description: Returns a professionally generated PDF resume for the profile identified by slug, short-code, or user ID.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: The custom slug, short-code, or user ID of the profile.
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         description: Required if the share link is password-protected.
 *     responses:
 *       200:
 *         description: PDF file stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Access denied (e.g., password required, link expired, or profile visibility disabled)
 *       404:
 *         description: Profile not found
 */
router.get('/profile/:identifier/resume.pdf', PDFController.downloadPublicResumePDF);

// Get QR code for public profile
router.get('/profile/:identifier/qr', PublicProfileController.getPublicQRCode);

// Verify password for protected profiles
router.post('/profile/:identifier/verify-password', PublicProfileController.verifyPassword);

// Submit a lead (contact form) on a public profile
router.post('/profile/:identifier/lead', LeadController.captureLead);

module.exports = router;
