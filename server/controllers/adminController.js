const { User, News } = require('../models');
const { Op } = require('sequelize');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.count({ where: { role: 'user' } });
    
    // Get total reporters count
    const totalReporters = await User.count({ where: { role: 'reporter' } });
    
    // Get total articles count
    const totalArticles = await News.count();
    
    // Get pending articles count
    const pendingArticles = await News.count({ where: { isPublished: false } });
    
    // Get pending reporter applications
    const pendingApplications = await User.count({
      where: { reporterApplicationStatus: 'pending' }
    });
    
    // Get recent views (sum of views from all articles in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentArticles = await News.findAll({
      where: {
        updatedAt: { [Op.gte]: sevenDaysAgo }
      }
    });
    
    const recentViews = recentArticles.reduce((total, article) => {
      return total + (article.views || 0);
    }, 0);
    
    // Get recent activity
    const recentActivity = await getRecentActivity();
    
    res.json({
      totalUsers,
      totalReporters,
      totalArticles,
      pendingArticles,
      pendingApplications,
      recentViews,
      recentActivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Helper function to get recent activity
const getRecentActivity = async () => {
  try {
    // Get recent articles (created in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentArticles = await News.findAll({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{
        model: User,
        as: 'author',
        attributes: ['name']
      }]
    });
    
    // Get recent reporter applications
    const recentApplications = await User.findAll({
      where: {
        reporterApplicationDate: { [Op.gte]: sevenDaysAgo },
        reporterApplicationStatus: { [Op.ne]: 'none' }  // Add this to filter out users with no application
      },
      order: [['reporterApplicationDate', 'DESC']],
      limit: 5,
      attributes: ['name', 'reporterApplicationDate']
    });
    
    // Get recent user registrations
    const recentUsers = await User.findAll({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['name', 'createdAt']
    });
    
    // Combine and sort all activities by date
    const activities = [
      ...recentArticles.map(article => ({
        type: 'article',
        user: article.author ? article.author.name : 'Unknown', // Add null check
        timestamp: article.createdAt,
        title: article.title
      })),
      ...recentApplications.map(user => ({
        type: 'application',
        user: user.name,
        timestamp: user.reporterApplicationDate
      })),
      ...recentUsers.map(user => ({
        type: 'registration',
        user: user.name,
        timestamp: user.createdAt
      }))
    ];
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Updated to handle Date objects properly
    
    // Return the 5 most recent activities
    return activities.slice(0, 5);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
};

module.exports = {
  getAdminStats
};