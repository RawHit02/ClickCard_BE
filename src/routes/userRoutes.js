const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authenticateToken = require('../middleware/auth');

// Public routes
router.post('/initiate-registration/unique', UserController.initiateRegistration);
router.post('/resend-email-otp', UserController.resendEmailOTP);
router.post('/verify-email-otp', UserController.verifyEmailOTP);
router.post('/login/user', UserController.login);
router.post('/forgot-password/request-otp', UserController.requestPasswordResetOTP);
router.post('/forgot-password/verify-otp', UserController.verifyPasswordResetOTP);
router.post('/forgot-password/reset', UserController.resetPassword);

// Protected routes (require authentication)
router.post('/refresh-token', UserController.refreshToken);
router.post('/logout', UserController.logout);
router.post('/profile/create', authenticateToken, UserController.createFullProfile);
router.get('/profile/full', authenticateToken, UserController.getFullProfile);
router.get('/current', authenticateToken, UserController.getCurrentUser);
router.post('/change-password', authenticateToken, UserController.changePassword);


module.exports = router;
