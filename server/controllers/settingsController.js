const Settings = require('../models/Settings');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public/Admin
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.getSiteSettings();
    
    // Update fields
    settings.siteName = req.body.siteName || settings.siteName;
    settings.siteDescription = req.body.siteDescription || settings.siteDescription;
    settings.contactEmail = req.body.contactEmail || settings.contactEmail;
    settings.contactPhone = req.body.contactPhone || settings.contactPhone;
    settings.contactAddress = req.body.contactAddress || settings.contactAddress;
    
    // Update social links
    if (req.body.socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks,
        ...req.body.socialLinks
      };
    }
    
    // Update other fields
    settings.featuredCategories = req.body.featuredCategories || settings.featuredCategories;
    settings.homepageLayout = req.body.homepageLayout || settings.homepageLayout;
    settings.enableComments = req.body.enableComments !== undefined ? req.body.enableComments : settings.enableComments;
    settings.requireCommentApproval = req.body.requireCommentApproval !== undefined ? req.body.requireCommentApproval : settings.requireCommentApproval;
    settings.enableNewsletter = req.body.enableNewsletter !== undefined ? req.body.enableNewsletter : settings.enableNewsletter;
    settings.logoUrl = req.body.logoUrl || settings.logoUrl;
    settings.faviconUrl = req.body.faviconUrl || settings.faviconUrl;
    
    // Set updatedBy to current user
    settings.updatedBy = req.user._id;
    
    const updatedSettings = await settings.save();
    
    res.json(updatedSettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};