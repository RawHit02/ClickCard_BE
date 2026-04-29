const { User } = require('../models/User');
const { ShareLink } = require('../models/ShareLink');
const Lead = require('../models/Lead');

class AdminService {
  static async getDashboardStats() {
    try {
      const [
        totalUsers,
        newUsersToday,
        profileCompleteCount,
        publicProfileCount,
        totalViews,
        viewsToday,
        totalLeads,
        leadsToday
      ] = await Promise.all([
        User.getCount(),
        User.getTodayCount(),
        User.getProfileCompleteCount(),
        User.getPublicProfileCount(),
        ShareLink.getTotalViews(),
        ShareLink.getTodayViews(),
        Lead.getCount(),
        Lead.getTodayCount()
      ]);

      return {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          profileComplete: profileCompleteCount,
          publicEnabled: publicProfileCount
        },
        engagement: {
          totalViews: totalViews,
          viewsToday: viewsToday
        },
        leads: {
          total: totalLeads,
          today: leadsToday
        }
      };
    } catch (err) {
      throw err;
    }
  }

  static async getAllUsers() {
    try {
      return await User.findAll();
    } catch (err) {
      throw err;
    }
  }

  static async getAllLeads() {
    try {
      return await Lead.findAll();
    } catch (err) {
      throw err;
    }
  }

  static async getUserDetails(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const profile = await User.getProfile(userId);
      const links = await ShareLink.findByUserId(userId);
      const leads = await Lead.findByUserId(userId);

      return {
        ...user,
        profile,
        links,
        leads
      };
    } catch (err) {
      throw err;
    }
  }

  static async updateUserBlockStatus(userId, isBlocked) {
    try {
      return await User.updateBlockStatus(userId, isBlocked);
    } catch (err) {
      throw err;
    }
  }

  static async updateUserModerationStatus(userId, status) {
    try {
      return await User.updateModerationStatus(userId, status);
    } catch (err) {
      throw err;
    }
  }

  static async getSystemSettings() {
    try {
      const SystemSettings = require('../models/SystemSettings');
      return await SystemSettings.getAll();
    } catch (err) {
      throw err;
    }
  }

  static async updateSystemSetting(key, value) {
    try {
      const SystemSettings = require('../models/SystemSettings');
      return await SystemSettings.update(key, value);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = AdminService;
