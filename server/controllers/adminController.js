const User = require('../models/User');
const News = require('../models/News');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get total reporters count
    const totalReporters = await User.countDocuments({ role: 'reporter' });
    
    // Get total articles count
    const totalArticles = await News.countDocuments();
    
    // Get pending articles count
    const pendingArticles = await News.countDocuments({ isPublished: false });
    
    // Get pending reporter applications
    const pendingApplications = await User.countDocuments({
      'reporterApplication.status': 'pending'
    });
    
    // Get recent views (sum of views from all articles in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentArticles = await News.find({
      updatedAt: { $gte: sevenDaysAgo }
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
    
    const recentArticles = await News.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).limit(5).populate('author', 'name');
    
    // Get recent reporter applications
    const recentApplications = await User.find({
      'reporterApplication.appliedAt': { $gte: sevenDaysAgo }
    }).sort({ 'reporterApplication.appliedAt': -1 }).limit(5).select('name reporterApplication.appliedAt');
    
    // Get recent user registrations
    const recentUsers = await User.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).limit(5).select('name createdAt');
    
    // Combine and sort all activities by date
    const activities = [
      ...recentArticles.map(article => ({
        type: 'article',
        user: article.author.name,
        timestamp: article.createdAt,
        title: article.title
      })),
      ...recentApplications.map(user => ({
        type: 'application',
        user: user.name,
        timestamp: user.reporterApplication.appliedAt
      })),
      ...recentUsers.map(user => ({
        type: 'registration',
        user: user.name,
        timestamp: user.createdAt
      }))
    ];
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
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