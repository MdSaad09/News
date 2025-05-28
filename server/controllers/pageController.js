const { Page, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all pages
// @route   GET /api/pages
// @access  Public/Admin
const getPages = async (req, res) => {
  try {
    const pages = await Page.findAll({
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'name'] },
        { model: User, as: 'lastUpdatedBy', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
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
    const page = await Page.findByPk(req.params.id, {
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'name'] },
        { model: User, as: 'lastUpdatedBy', attributes: ['id', 'name'] }
      ]
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

// @desc    Get single page by slug (for public viewing)
// @route   GET /api/pages/slug/:slug
// @access  Public
const getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ 
      where: {
        slug: req.params.slug,
        isPublished: true 
      },
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'name'] }
      ]
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

// @desc    Create a page
// @route   POST /api/pages
// @access  Private/Admin
const createPage = async (req, res) => {
  try {
    const { title, content, metaTitle, metaDescription, isPublished } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' });
    }
    
    // Create slug from title
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if page with same slug exists
    const pageExists = await Page.findOne({ where: { slug } });
    
    if (pageExists) {
      return res.status(400).json({ message: 'A page with this title already exists' });
    }
    
    const page = await Page.create({
      title,
      content,
      slug,
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      isPublished: isPublished === true || isPublished === 'true',
      createdById: req.user.id,
      lastUpdatedById: req.user.id
    });
    
    // Fetch the created page with related user info
    const createdPage = await Page.findByPk(page.id, {
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'name'] },
        { model: User, as: 'lastUpdatedBy', attributes: ['id', 'name'] }
      ]
    });
    
    res.status(201).json(createdPage);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a page
// @route   PUT /api/pages/:id
// @access  Private/Admin
const updatePage = async (req, res) => {
  try {
    const { title, content, metaTitle, metaDescription, isPublished } = req.body;
    
    const page = await Page.findByPk(req.params.id);
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Update fields
    if (title) {
      const newSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Check if another page has this slug
      const slugExists = await Page.findOne({ 
        where: { 
          slug: newSlug,
          id: { [Op.ne]: req.params.id } // Not equal to current page
        } 
      });
      
      if (slugExists) {
        return res.status(400).json({ message: 'A page with this title already exists' });
      }
      
      page.title = title;
      page.slug = newSlug;
    }
    
    if (content !== undefined) page.content = content;
    if (metaTitle !== undefined) page.metaTitle = metaTitle;
    if (metaDescription !== undefined) page.metaDescription = metaDescription;
    if (isPublished !== undefined) page.isPublished = isPublished === true || isPublished === 'true';
    
    // Set lastUpdatedById to current user
    page.lastUpdatedById = req.user.id;
    
    await page.save();
    
    // Fetch the updated page with related user info
    const updatedPage = await Page.findByPk(page.id, {
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'name'] },
        { model: User, as: 'lastUpdatedBy', attributes: ['id', 'name'] }
      ]
    });
    
    res.json(updatedPage);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a page
// @route   DELETE /api/pages/:id
// @access  Private/Admin
const deletePage = async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    await page.destroy();
    
    res.json({ message: 'Page removed' });
  } catch (error) {
    console.error(error);
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