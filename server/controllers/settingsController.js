const { Settings } = require('../models');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public/Admin
const getSettings = async (req, res) => {
  try {
    // Find or create settings
    const [settings] = await Settings.findOrCreate({
      where: { id: 1 },
      defaults: {
        siteName: 'Breaking News',
        siteDescription: 'Latest news and updates',
        contactEmail: 'contact@example.com'
      }
    });
    
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
    // Find or create settings
    const [settings] = await Settings.findOrCreate({
      where: { id: 1 },
      defaults: {
        siteName: 'Breaking News',
        siteDescription: 'Latest news and updates',
        contactEmail: 'contact@example.com'
      }
    });
    
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
    
    // Set lastUpdatedById to current user if the field exists in the model
    if ('lastUpdatedById' in settings.dataValues) {
      settings.lastUpdatedById = req.user.id;
    }
    
    await settings.save();
    
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};