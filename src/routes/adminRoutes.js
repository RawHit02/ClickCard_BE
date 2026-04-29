const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

router.get('/stats', AdminController.getDashboardStats);
router.get('/users', AdminController.getUsers);
router.get('/leads', AdminController.getLeads);

module.exports = router;
