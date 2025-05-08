// Add asyncHandler if it's not already defined

const { parseDocumentContent } = require('../utils/documentParser');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/temp/' });
const asyncHandler = require('express-async-handler');
const News = require('../models/News'); // Adjust path if needed
const mongoose = require('mongoose');

// @desc    Get all published news
// @route   GET /api/news
// @access  Public
const getPublishedNews = asyncHandler(async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};
    
    const category = req.query.category ? { category: req.query.category } : {};
    
    // Update the query to check isPublished flag
    const filter = { 
      ...keyword, 
      ...category,
      isPublished: true
      // Note: Your model doesn't have a 'status' field, so we've removed it
    };
    
    const count = await News.countDocuments(filter);
    
    const news = await News.find(filter)
      .populate('author', 'name profilePicture')
      .sort({ publishedAt: -1 }) // Your model has publishedAt, so we'll use it
      .limit(pageSize)
      .skip(pageSize * (page - 1));

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

// @desc    Get news article by id
// @route   GET /api/news/:id
// @access  Public
const getNewsById = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid news ID format' });
    }
    
    const news = await News.findById(id)
      .populate('author', 'name profilePicture');
    
    if (news) {
      // Increment view count
      news.views = (news.views || 0) + 1;
      await news.save();
      
      res.json(news);
    } else {
      res.status(404).json({ message: 'News not found' });
    }
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a news article
// @route   POST /api/news
// @access  Private/Admin/Reporter
const createNews = asyncHandler(async (req, res) => {
  try {
    const { 
      title, 
      content, 
      summary, 
      category, 
      tags,
      coverImage, // Changed from imageUrl to coverImage to match your model
      isPublished
    } = req.body;

    if (!title || !content || !summary || !category) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    // Check if user is admin
    const isAdmin = req.user.role === 'admin';
    
    // Create news with admin auto-publish
    const newsData = {
      title,
      content,
      summary,
      category,
      tags: tags || [],
      author: req.user._id,
      coverImage: coverImage || (req.file ? req.file.path : null),
      media: [], // Initialize as empty array
      // Force publish for admin, otherwise use what was sent or default to false
      isPublished: isAdmin ? true : (isPublished || false),
    };

    // If the news is to be published, set publishedAt date
    if (newsData.isPublished) {
      newsData.publishedAt = new Date();
    }

    const news = new News(newsData);
    const createdNews = await news.save();

    // Log the created news item for debugging
    console.log('Created news:', {
      id: createdNews._id,
      title: createdNews.title,
      isPublished: createdNews.isPublished,
      publishedAt: createdNews.publishedAt
    });

    res.status(201).json(createdNews);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @desc    Update a news article
// @route   PUT /api/news/:id
// @access  Private/Admin/Reporter
const updateNews = asyncHandler(async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      res.status(404);
      throw new Error('News not found');
    }
    
    // Check if user is authorized to update this news
    // Admin can update any news, reporter can only update their own
    if (req.user.role !== 'admin' && news.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this news article');
    }
    
    const { 
      title, 
      content, 
      summary, 
      category, 
      tags,
      coverImage,
      isPublished
    } = req.body;
    
    // Check if user is admin
    const isAdmin = req.user.role === 'admin';
    
    // Update fields if provided
    if (title) news.title = title;
    if (content) news.content = content;
    if (summary) news.summary = summary;
    if (category) news.category = category;
    if (tags) news.tags = tags;
    if (coverImage) news.coverImage = coverImage;
    
    // Handle publication status
    // For admin, always publish unless explicitly set to false
    if (isAdmin) {
      const shouldPublish = isPublished !== false; // Default to true if not specified
      
      // If publication status is changing
      if (news.isPublished !== shouldPublish) {
        news.isPublished = shouldPublish;
        // Set publishedAt if being published for the first time
        if (shouldPublish && !news.publishedAt) {
          news.publishedAt = new Date();
        }
      }
    } else {
      // For non-admin, use the provided isPublished value
      if (isPublished !== undefined) {
        news.isPublished = isPublished;
        // Set publishedAt if being published for the first time
        if (isPublished && !news.publishedAt) {
          news.publishedAt = new Date();
        }
      }
    }
    
    const updatedNews = await news.save();
    
    // Log the updated news item for debugging
    console.log('Updated news:', {
      id: updatedNews._id,
      title: updatedNews.title,
      isPublished: updatedNews.isPublished,
      publishedAt: updatedNews.publishedAt
    });
    
    res.json(updatedNews);
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @desc    Get reporter's news articles
// @route   GET /api/news/reporter/mynews
// @access  Private/Reporter
const getReporterNews = asyncHandler(async (req, res) => {
  try {
    const news = await News.find({ author: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all news for admin
// @route   GET /api/news/admin
// @access  Private/Admin
const getAllNews = asyncHandler(async (req, res) => {
  try {
    // Build filter object based on query parameters
    const filter = {};
    
    // Add status filter if provided
    if (req.query.status) {
      if (req.query.status === 'pending') {
        filter.isPublished = false;
      } else if (req.query.status === 'published') {
        filter.isPublished = true;
      }
    }
    
    // Add search filter if provided
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Get all news with filters
    const news = await News.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Toggle publish status
// @route   PUT /api/news/:id/publish
// @access  Private/Admin
const togglePublishNews = asyncHandler(async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      res.status(404);
      throw new Error('News not found');
    }
    
    // Toggle publish status
    news.isPublished = !news.isPublished;
    
    // Set or clear publishedAt
    if (news.isPublished) {
      news.publishedAt = new Date();
    }
    
    const updatedNews = await news.save();
    
    res.json(updatedNews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a news article
// @route   DELETE /api/news/:id
// @access  Private/Admin
const deleteNews = asyncHandler(async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      res.status(404);
      throw new Error('News not found');
    }
    
    await news.deleteOne();
    
    res.json({ message: 'News removed' });
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
    const totalArticles = await News.countDocuments({ author: req.user._id });
    const publishedArticles = await News.countDocuments({ 
      author: req.user._id, 
      isPublished: true
    });
    const pendingArticles = await News.countDocuments({ 
      author: req.user._id, 
      isPublished: false
    });
    
    // Get total views
    const articles = await News.find({ author: req.user._id });
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
    
    // Get top articles by views
    const topArticles = await News.find({ author: req.user._id })
      .sort({ views: -1 })
      .limit(5);
    
    res.json({
      totalArticles,
      publishedArticles,
      pendingArticles,
      totalViews,
      topArticles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Import multiple news articles
// @route   POST /api/news/import
// @access  Private/Admin
const importNews = asyncHandler(async (req, res) => {
  try {
    const { newsItems } = req.body;
    
    if (!newsItems || !Array.isArray(newsItems) || newsItems.length === 0) {
      res.status(400);
      throw new Error('No valid news items provided');
    }
    
    const importedNews = [];
    const failedItems = [];
    
    for (const item of newsItems) {
      try {
        // Validate required fields based on your model
        if (!item.title || !item.content) {
          failedItems.push({
            title: item.title || 'Untitled',
            reason: 'Missing required fields (title or content)'
          });
          continue;
        }
        
        // Create news item - always published for admin
        const newsItem = new News({
          title: item.title,
          content: item.content,
          summary: item.summary || item.content.substring(0, Math.min(200, item.content.length)) + '...',
          category: item.category || 'other', // Default to 'other' since it's required
          tags: item.tags || [],
          coverImage: item.imageUrl || 'https://via.placeholder.com/800x400?text=No+Image+Available',
          media: [], // Initialize as empty array
          author: req.user._id,
          isPublished: true, // Always published for admin
          publishedAt: new Date() // Set publish date since it's published
        });
        
        const savedNews = await newsItem.save();
        importedNews.push(savedNews);
      } catch (error) {
        failedItems.push({
          title: item.title || 'Untitled',
          reason: error.message
        });
      }
    }
    
    res.status(201).json({
      success: true,
      imported: importedNews.length,
      failed: failedItems.length,
      failedItems,
      news: importedNews
    });
  } catch (error) {
    console.error('Error importing news:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

const bulkImportNews = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase().substring(1);
    
    // Parse the document based on file type
    const parsedArticles = await parseDocumentContent(filePath, fileExtension);
    
    if (!parsedArticles || parsedArticles.length === 0) {
      return res.status(400).json({ message: 'No valid articles found in file' });
    }
    
    // Return the parsed articles for review in the frontend
    res.status(200).json({
      message: `Successfully parsed ${parsedArticles.length} articles`,
      articles: parsedArticles
    });
    
    // Clean up the temp file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ message: error.message || 'Failed to parse document' });
  }
});


// Add a debug endpoint to check publication status
const debugNews = asyncHandler(async (req, res) => {
  try {
    const allNews = await News.find().lean();
    const publishedNews = await News.find({ isPublished: true }).lean();
    const adminNews = await News.find({ 
      author: { $in: await getUserIdsByRole('admin') } 
    }).lean();
    
    res.json({
      total: allNews.length,
      published: publishedNews.length,
      adminCreated: adminNews.length,
      samples: {
        all: allNews.slice(0, 3).map(n => ({ 
          id: n._id, 
          title: n.title, 
          isPublished: n.isPublished, 
          publishedAt: n.publishedAt,
          author: n.author,
          category: n.category,
          summary: n.summary && n.summary.substring(0, 30) + '...',
          coverImage: n.coverImage ? "✓" : "✗"
        })),
        published: publishedNews.slice(0, 3).map(n => ({ 
          id: n._id, 
          title: n.title, 
          isPublished: n.isPublished, 
          publishedAt: n.publishedAt,
          author: n.author,
          category: n.category
        }))
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get user IDs by role
const getUserIdsByRole = async (role) => {
  const User = require('../models/User'); // Adjust path if needed
  const users = await User.find({ role }).lean();
  return users.map(u => u._id);
};

module.exports = {
  getPublishedNews,
  getNewsById,
  createNews,
  updateNews,
  getReporterNews,
  getAllNews,
  togglePublishNews,
  deleteNews,
  getReporterStats,
  importNews,
  bulkImportNews,
  
};