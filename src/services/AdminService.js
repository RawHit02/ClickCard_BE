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
}

module.exports = AdminService;
