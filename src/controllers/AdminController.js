const AdminService = require('../services/AdminService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');

class AdminController {
  static async getDashboardStats(req, res) {
    try {
      const stats = await AdminService.getDashboardStats();
      return sendSuccessResponse(res, 200, 'Dashboard stats retrieved successfully', stats);
    } catch (err) {
      console.error('Admin Dashboard Stats Error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve dashboard stats');
    }
  }

  static async getUsers(req, res) {
    try {
      const users = await AdminService.getAllUsers();
      return sendSuccessResponse(res, 200, 'Users retrieved successfully', users);
    } catch (err) {
      console.error('Admin Get Users Error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve users');
    }
  }

  static async getLeads(req, res) {
    try {
      const leads = await AdminService.getAllLeads();
      return sendSuccessResponse(res, 200, 'Leads retrieved successfully', leads);
    } catch (err) {
      console.error('Admin Get Leads Error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve leads');
    }
  }
}

module.exports = AdminController;
