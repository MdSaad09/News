
const { parseDocumentContent } = require('../utils/documentParser');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/temp/' });
const asyncHandler = require('express-async-handler');
const { News, User, Category, Comment, Person } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all published news
// @route   GET /api/news
// @access  Public
const getPublishedNews = asyncHandler(async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    
    // Build where clause
    let whereClause = { isPublished: true };
    
    // Add keyword search if provided
    if (req.query.keyword) {
      whereClause.title = { [Op.like]: `%${req.query.keyword}%` };
    }
    
    // Add category filter if provided
    if (req.query.category) {
      whereClause.categoryId = req.query.category;
    }
    
    // Add video filter if provided
    if (req.query.hasVideo === 'true') {
      whereClause.hasVideo = true;
    }
    
    // Setup includes with base models
    const includeArray = [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'profilePicture']
      },
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }
    ];
    
    // Add person filter if provided
    if (req.query.personId) {
      includeArray.push({
        model: Person,
        where: { id: req.query.personId },
        through: { attributes: [] },
        attributes: ['id', 'name', 'slug', 'image', 'profession']
      });
    } else {
      // Include people without filtering
      includeArray.push({
        model: Person,
        through: { attributes: [] },
        attributes: ['id', 'name', 'slug', 'image', 'profession']
      });
    }
    
    // Count with proper filtering
    let countOptions = { where: whereClause };
    if (req.query.personId) {
      countOptions.include = [{
        model: Person,
        where: { id: req.query.personId },
        attributes: []
      }];
      countOptions.distinct = true;
    }
    
    const count = await News.count(countOptions);
    
    const news = await News.findAll({
      where: whereClause,
      include: includeArray,
      order: [['publishedAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true // Important for correct count with associations
    });
    
    res.json({
      news,
      page,
      pages: Math.ceil(count / pageSize),
      totalCount: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get single news article
// @route   GET /api/news/:id
// @access  Public
const getNewsById = asyncHandler(async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'profilePicture', 'bio']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Person,
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug', 'image', 'profession']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'profilePicture']
            }
          ]
        }
      ]
    });

    if (!news) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment views
    news.views = news.views + 1;
    await news.save();

    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a news article
// @route   POST /api/news
// @access  Private/Reporter
const createNews = asyncHandler(async (req, res) => {
  try {
    const { 
      title, content, summary, categoryId, tags, isPublished,
      additionalCategories, people, featuredVideo
    } = req.body;
    
    // Create slug from title
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    
    // Check if article with same slug exists
    const newsExists = await News.findOne({ where: { slug } });
    
    if (newsExists) {
      return res.status(400).json({ message: 'An article with this title already exists' });
    }
    
    // Validate category
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    // Process files (images and videos)
    let coverImage = null;
    let videoFile = null;
    let videoThumbnail = null;
    let hasVideo = false;
    
    // Handle file uploads
    if (req.files) {
      // Handle cover image
      if (req.files.coverImage) {
        coverImage = `/uploads/images/${req.files.coverImage[0].filename}`;
      }
      
      // Handle video
      if (req.files.video) {
        videoFile = `/uploads/videos/${req.files.video[0].filename}`;
        hasVideo = true;
        
        // Use video thumbnail if provided
        if (req.files.videoThumbnail) {
          videoThumbnail = `/uploads/thumbnails/${req.files.videoThumbnail[0].filename}`;
        } else {
          // Fallback to cover image if no thumbnail
          videoThumbnail = coverImage;
        }
      }
    } else if (req.file) {
      // Handle single file upload (backward compatibility)
      coverImage = `/uploads/images/${req.file.filename}`;
    }

    // Check if we have URLs instead of files (for pre-uploaded content)
    if (!coverImage && req.body.coverImage) {
      coverImage = req.body.coverImage;
    }

    if (!videoFile && req.body.featuredVideo) {
      videoFile = req.body.featuredVideo;
      hasVideo = true;
    }

    if (!videoThumbnail && req.body.videoThumbnail) {
      videoThumbnail = req.body.videoThumbnail;
    }
    
    // Check if we have a featured video URL
    if (featuredVideo && !videoFile) {
      hasVideo = true;
      videoThumbnail = coverImage; // Use cover image as thumbnail
    }
    
    // Create news article
    const news = await News.create({
      title,
      content,
      summary,
      slug,
      categoryId,
      authorId: req.user.id,
      coverImage: coverImage || '/uploads/images/default.jpg', // Default image
      featuredVideo: videoFile || featuredVideo || null,
      hasVideo: hasVideo,
      videoThumbnail: videoThumbnail,
      additionalCategories: additionalCategories ? 
        (typeof additionalCategories === 'string' ? JSON.parse(additionalCategories) : additionalCategories) : 
        [],
      tags: tags ? 
        (typeof tags === 'string' ? JSON.parse(tags) : tags) : 
        [],
      isPublished: isPublished === 'true',
      publishedAt: isPublished === 'true' ? new Date() : null,
      views: 0
    });
    
    // Associate with people if provided
    if (people) {
      const peopleIds = typeof people === 'string' ? JSON.parse(people) : people;
      if (Array.isArray(peopleIds) && peopleIds.length > 0) {
        await news.addPeople(peopleIds);
      }
    }
    
    // If reporter publishes an article, increment their articlesPublished count
    if (isPublished === 'true' && req.user.role === 'reporter') {
      const reporter = await User.findByPk(req.user.id);
      reporter.articlesPublished = (reporter.articlesPublished || 0) + 1;
      await reporter.save();
    }
    
    // Return with associations
    const createdNews = await News.findByPk(news.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Person,
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug', 'image', 'profession']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'profilePicture']
        }
      ]
    });
    
    res.status(201).json(createdNews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a news article
// @route   PUT /api/news/:id
// @access  Private/Reporter
const updateNews = asyncHandler(async (req, res) => {
  try {
    const { 
      title, content, summary, categoryId, tags, isPublished,
      additionalCategories, people, featuredVideo, removeVideo
    } = req.body;
    
    const news = await News.findByPk(req.params.id, {
      include: [{ model: Person }]
    });
    
    if (!news) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Check if user is author or admin
    if (news.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to edit this article' });
    }
    
    // Update fields
    if (title) {
      news.title = title;
      news.slug = title.toLowerCase().replace(/\s+/g, '-');
    }
    
    if (content) news.content = content;
    if (summary) news.summary = summary;
    if (categoryId) news.categoryId = categoryId;
    
    if (tags) {
      news.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }
    
    if (additionalCategories) {
      news.additionalCategories = typeof additionalCategories === 'string' ? 
        JSON.parse(additionalCategories) : additionalCategories;
    }
    
    // Process files (images and videos)
    let videoFile = null;
    let videoThumbnail = null;
    
    // Handle file uploads
    if (req.files) {
      // Handle cover image
      if (req.files.coverImage) {
        news.coverImage = `/uploads/images/${req.files.coverImage[0].filename}`;
      }
      
      // Handle video
      if (req.files.video) {
        videoFile = `/uploads/videos/${req.files.video[0].filename}`;
        news.hasVideo = true;
        news.featuredVideo = videoFile;
        
        // Use video thumbnail if provided
        if (req.files.videoThumbnail) {
          videoThumbnail = `/uploads/thumbnails/${req.files.videoThumbnail[0].filename}`;
          news.videoThumbnail = videoThumbnail;
        } else if (!news.videoThumbnail) {
          // Fallback to cover image if no thumbnail exists
          news.videoThumbnail = news.coverImage;
        }
      }
    } else if (req.file) {
      // Handle single file upload (backward compatibility)
      news.coverImage = `/uploads/images/${req.file.filename}`;
    }
    
    // Handle featured video URL
    if (featuredVideo) {
      news.featuredVideo = featuredVideo;
      news.hasVideo = true;
      
      // If no video thumbnail, use cover image
      if (!news.videoThumbnail) {
        news.videoThumbnail = news.coverImage;
      }
    }
    
    // Handle video removal
    if (removeVideo === 'true') {
      news.featuredVideo = null;
      news.hasVideo = false;
      news.videoThumbnail = null;
    }
    
    // Handle publishing status change
    if (isPublished !== undefined) {
      const wasPublished = news.isPublished;
      news.isPublished = isPublished === 'true';
      
      // If publishing for the first time, set publishedAt
      if (!wasPublished && news.isPublished) {
        news.publishedAt = new Date();
        
        // Increment reporter's articlesPublished count
        if (req.user.role === 'reporter') {
          const reporter = await User.findByPk(req.user.id);
          reporter.articlesPublished = (reporter.articlesPublished || 0) + 1;
          await reporter.save();
        }
      }
    }
    
    await news.save();
    
    // Update person associations if provided
    if (people) {
      const peopleIds = typeof people === 'string' ? JSON.parse(people) : people;
      if (Array.isArray(peopleIds)) {
        // Remove all current associations
        await news.setPeople([]);
        
        // Add new associations
        if (peopleIds.length > 0) {
          await news.addPeople(peopleIds);
        }
      }
    }
    
    // Get updated news with associations
    const updatedNews = await News.findByPk(news.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Person,
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug', 'image', 'profession']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'profilePicture']
        }
      ]
    });
    
    res.json(updatedNews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get news with videos
// @route   GET /api/news/videos
// @access  Public
const getVideoNews = asyncHandler(async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    
    // Build where clause for videos
    const whereClause = { 
      isPublished: true,
      hasVideo: true
    };
    
    const count = await News.count({ where: whereClause });
    
    const news = await News.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'profilePicture']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Person,
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug', 'image']
        }
      ],
      order: [['publishedAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });
    
    res.json({
      news,
      page,
      pages: Math.ceil(count / pageSize),
      totalCount: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



// @desc    Delete a news article
// @route   DELETE /api/news/:id
// @access  Private/Reporter or Admin
const deleteNews = asyncHandler(async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Check if user is author or admin
    if (news.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this article' });
    }
    
    await news.destroy();
    
    res.json({ message: 'Article removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get reporter's news articles
// @route   GET /api/news/reporter/mynews
// @access  Private/Reporter
const getReporterNews = asyncHandler(async (req, res) => {
  try {
    const news = await News.findAll({
      where: { authorId: req.user.id },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Import news from document
// @route   POST /api/news/import
// @access  Private/Reporter
const importNews = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    const filePath = path.join(__dirname, '..', req.file.path);
    const { title, content } = await parseDocumentContent(filePath);
    
    res.json({ title, content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error importing document' });
  }
});

// @desc    Get all news (published and unpublished)
// @route   GET /api/news/admin
// @access  Private/Admin
const getAllNews = asyncHandler(async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    
    // Build where clause
    let whereClause = {};
    
    // Add keyword search if provided
    if (req.query.keyword) {
      whereClause.title = { [Op.like]: `%${req.query.keyword}%` };
    }
    
    // Add category filter if provided
    if (req.query.category) {
      whereClause.categoryId = req.query.category;
    }
    
    // Add status filter if provided
    if (req.query.status === 'published') {
      whereClause.isPublished = true;
    } else if (req.query.status === 'draft') {
      whereClause.isPublished = false;
    }
    
    const count = await News.count({ where: whereClause });
    
    const news = await News.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'profilePicture']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });
    
    res.json({
      news,
      page,
      pages: Math.ceil(count / pageSize),
      totalCount: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Toggle publish status of a news article
// @route   PUT /api/news/:id/publish
// @access  Private/Admin
const togglePublishNews = asyncHandler(async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Toggle publish status
    news.isPublished = !news.isPublished;
    
    // If publishing for the first time, set publishedAt
    if (news.isPublished && !news.publishedAt) {
      news.publishedAt = new Date();
      
      // Increment reporter's articlesPublished count
      const reporter = await User.findByPk(news.authorId);
      if (reporter && reporter.role === 'reporter') {
        reporter.articlesPublished = (reporter.articlesPublished || 0) + 1;
        await reporter.save();
      }
    }
    
    await news.save();
    
    res.json({
      id: news.id,
      isPublished: news.isPublished,
      message: news.isPublished ? 'Article published' : 'Article unpublished'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get reporter statistics
// @route   GET /api/news/reporter/stats
// @access  Private/Reporter
const getReporterStats = asyncHandler(async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'all';
    let dateFilter = {};
    
    // Set date filter based on time range
    if (timeRange !== 'all') {
      const now = new Date();
      let startDate;
      
      if (timeRange === 'week') {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (timeRange === 'month') {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
      } else if (timeRange === 'year') {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      }
      
      dateFilter = {
        createdAt: {
          [Op.gte]: startDate
        }
      };
    }
    
    // Get total articles count
    const totalArticles = await News.count({
      where: {
        authorId: req.user.id,
        ...dateFilter
      }
    });
    
    // Get published articles count
    const publishedArticles = await News.count({
      where: {
        authorId: req.user.id,
        isPublished: true,
        ...dateFilter
      }
    });
    
    // Get draft articles count
    const draftArticles = await News.count({
      where: {
        authorId: req.user.id,
        isPublished: false,
        ...dateFilter
      }
    });
    
    // Get total views
    const viewsResult = await News.sum('views', {
      where: {
        authorId: req.user.id,
        isPublished: true,
        ...dateFilter
      }
    });
    
    const totalViews = viewsResult || 0;
    
    // Get most viewed article
    const mostViewedArticle = await News.findOne({
      where: {
        authorId: req.user.id,
        isPublished: true,
        ...dateFilter
      },
      order: [['views', 'DESC']],
      attributes: ['id', 'title', 'views', 'publishedAt']
    });
    
    // Get latest published article
    const latestArticle = await News.findOne({
      where: {
        authorId: req.user.id,
        isPublished: true,
        ...dateFilter
      },
      order: [['publishedAt', 'DESC']],
      attributes: ['id', 'title', 'views', 'publishedAt']
    });
    
    res.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      mostViewedArticle,
      latestArticle,
      timeRange
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Bulk import news from parsed document
// @route   POST /api/news/import/parse
// @access  Private/Admin
const bulkImportNews = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    const filePath = path.join(__dirname, '..', req.file.path);
    const { articles } = await parseDocumentContent(filePath, true);
    
    if (!articles || articles.length === 0) {
      return res.status(400).json({ message: 'No articles found in document' });
    }
    
    // Process each article
    const results = [];
    for (const article of articles) {
      // Create slug from title
      const slug = article.title.toLowerCase().replace(/\s+/g, '-');
      
      // Check if article with same slug exists
      const newsExists = await News.findOne({ where: { slug } });
      
      if (newsExists) {
        results.push({
          title: article.title,
          status: 'skipped',
          reason: 'Article with this title already exists'
        });
        continue;
      }
      
      // Create news article
      const news = await News.create({
        title: article.title,
        content: article.content,
        summary: article.summary || article.content.substring(0, 150) + '...',
        slug,
        categoryId: article.categoryId || 1, // Default category
        authorId: req.user.id,
        coverImage: article.coverImage || null,
        tags: article.tags || [],
        isPublished: article.isPublished || false,
        publishedAt: article.isPublished ? new Date() : null,
        views: 0
      });
      
      results.push({
        id: news.id,
        title: news.title,
        status: 'imported',
        isPublished: news.isPublished
      });
    }
    
    res.json({
      message: `Imported ${results.filter(r => r.status === 'imported').length} articles`,
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error importing articles' });
  }
});

module.exports = {
  getPublishedNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getReporterNews,
  importNews,
  getAllNews,
  togglePublishNews,
  getReporterStats,
  bulkImportNews,
  getVideoNews
};