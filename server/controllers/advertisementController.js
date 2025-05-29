// controllers/advertisementController.js
const asyncHandler = require('express-async-handler');
const { Advertisement, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all advertisements for admin
// @route   GET /api/advertisements/admin
// @access  Private/Admin
const getAdminAdvertisements = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, position, status, type } = req.query;
    
    let whereClause = {};
    
    // Filter by position
    if (position && position !== 'all') {
      whereClause.position = position;
    }
    
    // Filter by status
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }
    
    // Filter by type
    if (type && type !== 'all') {
      whereClause.type = type;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: advertisements } = await Advertisement.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['priority', 'DESC'], ['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      advertisements,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin advertisements:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// // @desc    Get active advertisements for public display
// // @route   GET /api/advertisements/active
// // @access  Public
// const getActiveAdvertisements = asyncHandler(async (req, res) => {
//   try {
//     const { position, page, device = 'all' } = req.query;
    
//     console.log('🔍 Query params:', { position, page, device });
    
//     const now = new Date();
    
//     // Build where conditions as an array to avoid Op.or conflicts
//     let whereConditions = [
//       { isActive: true },
//       {
//         [Op.or]: [
//           { startDate: null },
//           { startDate: { [Op.lte]: now } }
//         ]
//       },
//       {
//         [Op.or]: [
//           { endDate: null },
//           { endDate: { [Op.gte]: now } }
//         ]
//       }
//     ];
    
//     console.log('📅 Date filters passed');
    
//     // Filter by position
//     if (position) {
//       whereConditions.push({ position: position });
//       console.log('📍 Position filter:', position);
//     }
    
//     // Filter by device
//     if (device !== 'all') {
//       whereConditions.push({
//         deviceTarget: { [Op.in]: ['all', device] }
//       });
//       console.log('📱 Device filter:', device);
//     }
    
//     // Filter by page
//     if (page) {
//       whereConditions.push({
//         [Op.or]: [
//           { pages: { [Op.like]: '%"all"%' } },
//           { pages: { [Op.like]: `%"${page}"%` } }
//         ]
//       });
//       console.log('📄 Page filter:', page);
//     }
    
//     // Combine all conditions with AND
//     const whereClause = {
//       [Op.and]: whereConditions
//     };
    
//     console.log('🔎 Final whereClause:', JSON.stringify(whereClause, null, 2));
    
//     const advertisements = await Advertisement.findAll({
//       where: whereClause,
//       attributes: [
//         'id', 'title', 'type', 'content', 'imageUrl', 'linkUrl', 'altText',
//         'position', 'size', 'width', 'height', 'backgroundColor', 'textColor',
//         'borderRadius', 'customCSS', 'priority', 'sortOrder'
//       ],
//       order: [['priority', 'DESC'], ['sortOrder', 'ASC']]
//     });
    
//     console.log('📺 Found ads:', advertisements.length);
//     console.log('📺 Ads:', advertisements.map(ad => ({ 
//       id: ad.id, 
//       title: ad.title, 
//       position: ad.position 
//     })));
    
//     res.json(advertisements);
//   } catch (error) {
//     console.error('Error fetching active advertisements:', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// // Simple version for testing (no filters)
// const getActiveAdvertisementsTest = asyncHandler(async (req, res) => {
//   try {
//     console.log('🧪 TEST: Getting all active ads without filters');
    
//     const advertisements = await Advertisement.findAll({
//       where: {
//         isActive: true
//       },
//       attributes: [
//         'id', 'title', 'type', 'content', 'imageUrl', 'linkUrl', 'altText',
//         'position', 'size', 'width', 'height', 'backgroundColor', 'textColor',
//         'borderRadius', 'customCSS', 'priority', 'sortOrder', 'pages', 'deviceTarget'
//       ],
//       order: [['priority', 'DESC'], ['sortOrder', 'ASC']]
//     });
    
//     console.log('🧪 Found ads:', advertisements.length);
//     advertisements.forEach(ad => {
//       console.log(`🧪 Ad: ${ad.title} | Position: ${ad.position} | Pages: ${JSON.stringify(ad.pages)} | Device: ${ad.deviceTarget}`);
//     });
    
//     res.json(advertisements);
//   } catch (error) {
//     console.error('🧪 Error in test:', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// @desc    Get active advertisements for public display
// @route   GET /api/advertisements/active
// @access  Public
const getActiveAdvertisements = asyncHandler(async (req, res) => {
  try {
    const { position, page, device = 'all' } = req.query;
    
    console.log('🔍 Query params:', { position, page, device });
    
    const now = new Date();
    
    // Build where conditions as an array to avoid Op.or conflicts
    let whereConditions = [
      { isActive: true },
      {
        [Op.or]: [
          { startDate: null },
          { startDate: { [Op.lte]: now } }
        ]
      },
      {
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: now } }
        ]
      }
    ];
    
    console.log('📅 Date filters passed');
    
    // Filter by position
    if (position) {
      whereConditions.push({ position: position });
      console.log('📍 Position filter:', position);
    }
    
    // Filter by device - FIXED VERSION
    if (device !== 'all') {
      whereConditions.push({
        [Op.or]: [
          { deviceTarget: 'all' },
          { deviceTarget: device }
        ]
      });
      console.log('📱 Device filter (fixed):', device);
    } else {
      console.log('📱 Device filter: showing for all devices');
    }
    
    // Filter by page - TEMPORARILY DISABLED FOR TESTING
    // if (page) {
    //   whereConditions.push({
    //     [Op.or]: [
    //       { pages: { [Op.like]: '%"all"%' } },
    //       { pages: { [Op.like]: `%"${page}"%` } },
    //       // Also try without quotes in case JSON is stored differently
    //       { pages: { [Op.like]: '%all%' } },
    //       { pages: { [Op.like]: `%${page}%` } }
    //     ]
    //   });
    //   console.log('📄 Page filter:', page);
    // }
    console.log('📄 Page filter: DISABLED FOR TESTING');
    
    // Combine all conditions with AND
    const whereClause = {
      [Op.and]: whereConditions
    };
    
    console.log('🔎 Final whereClause:', JSON.stringify(whereClause, null, 2));
    
    const advertisements = await Advertisement.findAll({
      where: whereClause,
      attributes: [
        'id', 'title', 'type', 'content', 'imageUrl', 'linkUrl', 'altText',
        'position', 'size', 'width', 'height', 'backgroundColor', 'textColor',
        'borderRadius', 'customCSS', 'priority', 'sortOrder'
      ],
      order: [['priority', 'DESC'], ['sortOrder', 'ASC']]
    });
    
    console.log('📺 Found ads:', advertisements.length);
    console.log('📺 Ads:', advertisements.map(ad => ({ 
      id: ad.id, 
      title: ad.title, 
      position: ad.position 
    })));
    
    res.json(advertisements);
  } catch (error) {
    console.error('Error fetching active advertisements:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Simple version for testing (no filters)
const getActiveAdvertisementsTest = asyncHandler(async (req, res) => {
  try {
    console.log('🧪 TEST: Getting all active ads without filters');
    
    const advertisements = await Advertisement.findAll({
      where: {
        isActive: true
      },
      attributes: [
        'id', 'title', 'type', 'content', 'imageUrl', 'linkUrl', 'altText',
        'position', 'size', 'width', 'height', 'backgroundColor', 'textColor',
        'borderRadius', 'customCSS', 'priority', 'sortOrder', 'pages', 'deviceTarget'
      ],
      order: [['priority', 'DESC'], ['sortOrder', 'ASC']]
    });
    
    console.log('🧪 Found ads:', advertisements.length);
    advertisements.forEach(ad => {
      console.log(`🧪 Ad: ${ad.title} | Position: ${ad.position} | Pages: ${JSON.stringify(ad.pages)} | Device: ${ad.deviceTarget}`);
    });
    
    res.json(advertisements);
  } catch (error) {
    console.error('🧪 Error in test:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create new advertisement
// @route   POST /api/advertisements
// @access  Private/Admin
const createAdvertisement = asyncHandler(async (req, res) => {
  try {
    const {
      title, type, content, linkUrl, altText, position, articlePosition,
      size, width, height, pages, excludePages, deviceTarget,
      startDate, endDate, priority, backgroundColor, textColor,
      borderRadius, customCSS
    } = req.body;
    
    // Handle file upload if present
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/images/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }
    
    // Get the highest sortOrder for the position
    const maxSortOrder = await Advertisement.max('sortOrder', {
      where: { position: position || 'sidebar-right' }
    });
    
    const advertisement = await Advertisement.create({
      title,
      type: type || 'image',
      content,
      imageUrl,
      linkUrl,
      altText,
      position: position || 'sidebar-right',
      articlePosition: articlePosition ? parseInt(articlePosition) : null,
      size: size || 'medium',
      width: width ? parseInt(width) : null,
      height: height ? parseInt(height) : null,
      pages: pages ? (typeof pages === 'string' ? JSON.parse(pages) : pages) : ['all'],
      excludePages: excludePages ? (typeof excludePages === 'string' ? JSON.parse(excludePages) : excludePages) : [],
      deviceTarget: deviceTarget || 'all',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      priority: priority ? parseInt(priority) : 1,
      backgroundColor,
      textColor,
      borderRadius: borderRadius ? parseInt(borderRadius) : 0,
      customCSS,
      sortOrder: (maxSortOrder || 0) + 1,
      createdById: req.user.id,
      isActive: true
    });
    
    // Get the created advertisement with associations
    const createdAd = await Advertisement.findByPk(advertisement.id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.status(201).json(createdAd);
  } catch (error) {
    console.error('Error creating advertisement:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update advertisement
// @route   PUT /api/advertisements/:id
// @access  Private/Admin
const updateAdvertisement = asyncHandler(async (req, res) => {
  try {
    const advertisement = await Advertisement.findByPk(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    const {
      title, type, content, linkUrl, altText, position, articlePosition,
      size, width, height, pages, excludePages, deviceTarget,
      startDate, endDate, priority, backgroundColor, textColor,
      borderRadius, customCSS, isActive
    } = req.body;
    
    // Handle file upload if present
    let imageUrl = advertisement.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/images/${req.file.filename}`;
    } else if (req.body.imageUrl !== undefined) {
      imageUrl = req.body.imageUrl;
    }
    
    // Update fields
    await advertisement.update({
      title: title || advertisement.title,
      type: type || advertisement.type,
      content: content !== undefined ? content : advertisement.content,
      imageUrl,
      linkUrl: linkUrl !== undefined ? linkUrl : advertisement.linkUrl,
      altText: altText !== undefined ? altText : advertisement.altText,
      position: position || advertisement.position,
      articlePosition: articlePosition ? parseInt(articlePosition) : advertisement.articlePosition,
      size: size || advertisement.size,
      width: width ? parseInt(width) : advertisement.width,
      height: height ? parseInt(height) : advertisement.height,
      pages: pages ? (typeof pages === 'string' ? JSON.parse(pages) : pages) : advertisement.pages,
      excludePages: excludePages ? (typeof excludePages === 'string' ? JSON.parse(excludePages) : excludePages) : advertisement.excludePages,
      deviceTarget: deviceTarget || advertisement.deviceTarget,
      startDate: startDate ? new Date(startDate) : advertisement.startDate,
      endDate: endDate ? new Date(endDate) : advertisement.endDate,
      priority: priority ? parseInt(priority) : advertisement.priority,
      backgroundColor: backgroundColor !== undefined ? backgroundColor : advertisement.backgroundColor,
      textColor: textColor !== undefined ? textColor : advertisement.textColor,
      borderRadius: borderRadius ? parseInt(borderRadius) : advertisement.borderRadius,
      customCSS: customCSS !== undefined ? customCSS : advertisement.customCSS,
      isActive: isActive !== undefined ? isActive : advertisement.isActive
    });
    
    // Get updated advertisement with associations
    const updatedAd = await Advertisement.findByPk(advertisement.id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.json(updatedAd);
  } catch (error) {
    console.error('Error updating advertisement:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete advertisement
// @route   DELETE /api/advertisements/:id
// @access  Private/Admin
const deleteAdvertisement = asyncHandler(async (req, res) => {
  try {
    const advertisement = await Advertisement.findByPk(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    await advertisement.destroy();
    
    res.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update advertisement order (for drag and drop)
// @route   PUT /api/advertisements/reorder
// @access  Private/Admin
const reorderAdvertisements = asyncHandler(async (req, res) => {
  try {
    const { advertisements } = req.body; // Array of {id, sortOrder}
    
    if (!Array.isArray(advertisements)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    
    // Update sort orders
    const updatePromises = advertisements.map(({ id, sortOrder }) =>
      Advertisement.update(
        { sortOrder: parseInt(sortOrder) },
        { where: { id: parseInt(id) } }
      )
    );
    
    await Promise.all(updatePromises);
    
    res.json({ message: 'Advertisement order updated successfully' });
  } catch (error) {
    console.error('Error reordering advertisements:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Toggle advertisement status
// @route   PUT /api/advertisements/:id/toggle
// @access  Private/Admin
const toggleAdvertisementStatus = asyncHandler(async (req, res) => {
  try {
    const advertisement = await Advertisement.findByPk(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    await advertisement.update({
      isActive: !advertisement.isActive
    });
    
    res.json({
      id: advertisement.id,
      isActive: advertisement.isActive,
      message: advertisement.isActive ? 'Advertisement activated' : 'Advertisement deactivated'
    });
  } catch (error) {
    console.error('Error toggling advertisement status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Track advertisement impression
// @route   POST /api/advertisements/:id/impression
// @access  Public
const trackImpression = asyncHandler(async (req, res) => {
  try {
    const advertisement = await Advertisement.findByPk(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    await advertisement.increment('impressions');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking impression:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Track advertisement click
// @route   POST /api/advertisements/:id/click
// @access  Public
const trackClick = asyncHandler(async (req, res) => {
  try {
    const advertisement = await Advertisement.findByPk(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    await advertisement.increment('clicks');
    
    res.json({ success: true, redirectUrl: advertisement.linkUrl });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get advertisement analytics
// @route   GET /api/advertisements/:id/analytics
// @access  Private/Admin
const getAdvertisementAnalytics = asyncHandler(async (req, res) => {
  try {
    const advertisement = await Advertisement.findByPk(req.params.id, {
      attributes: ['id', 'title', 'impressions', 'clicks', 'createdAt']
    });
    
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    const ctr = advertisement.impressions > 0 ? 
      ((advertisement.clicks / advertisement.impressions) * 100).toFixed(2) : 0;
    
    res.json({
      ...advertisement.toJSON(),
      clickThroughRate: parseFloat(ctr)
    });
  } catch (error) {
    console.error('Error fetching advertisement analytics:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get single advertisement by ID
// @route   GET /api/advertisements/:id
// @access  Private/Admin
const getAdvertisementById = asyncHandler(async (req, res) => {
  try {
    const advertisement = await Advertisement.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    res.json(advertisement);
  } catch (error) {
    console.error('Error fetching advertisement:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = {
  getAdminAdvertisements,
  getActiveAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  reorderAdvertisements,
  toggleAdvertisementStatus,
  trackImpression,
  trackClick,
  getAdvertisementAnalytics,
  getAdvertisementById,
  getActiveAdvertisementsTest
};