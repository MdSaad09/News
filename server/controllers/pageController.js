const Page = require('../models/Page');

// @desc    Get all pages
// @route   GET /api/pages
// @access  Public/Admin
const getPages = async (req, res) => {
  try {
    const pages = await Page.find().sort('-createdAt');
    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single page by ID
// @route   GET /api/pages/:id
// @access  Private/Admin
const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single page by slug (for public viewing)
// @route   GET /api/pages/slug/:slug
// @access  Public
const getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ 
      slug: req.params.slug,
      isPublished: true 
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new page
// @route   POST /api/pages
// @access  Private/Admin
const createPage = async (req, res) => {
  try {
    const { title, slug, content, metaTitle, metaDescription, isPublished } = req.body;
    
    // Check if slug already exists
    const slugExists = await Page.findOne({ slug: slug.toLowerCase() });
    
    if (slugExists) {
      return res.status(400).json({ message: 'A page with this slug already exists' });
    }
    
    const page = await Page.create({
      title,
      slug: slug.toLowerCase(),
      content,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || '',
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user._id,
      lastUpdatedBy: req.user._id
    });
    
    res.status(201).json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update page
// @route   PUT /api/pages/:id
// @access  Private/Admin
const updatePage = async (req, res) => {
  try {
    const { title, slug, content, metaTitle, metaDescription, isPublished } = req.body;
    
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // If slug is being changed, check if new slug already exists
    if (slug && slug.toLowerCase() !== page.slug) {
      const slugExists = await Page.findOne({ 
        slug: slug.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      
      if (slugExists) {
        return res.status(400).json({ message: 'A page with this slug already exists' });
      }
    }
    
    page.title = title || page.title;
    page.slug = slug ? slug.toLowerCase() : page.slug;
    page.content = content || page.content;
    page.metaTitle = metaTitle || page.metaTitle;
    page.metaDescription = metaDescription !== undefined ? metaDescription : page.metaDescription;
    page.isPublished = isPublished !== undefined ? isPublished : page.isPublished;
    page.lastUpdatedBy = req.user._id;
    
    const updatedPage = await page.save();
    
    res.json(updatedPage);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete page
// @route   DELETE /api/pages/:id
// @access  Private/Admin
const deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    await page.remove();
    
    res.json({ message: 'Page removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage
};