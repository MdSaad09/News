const { Category, News , sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    // More efficient approach using a subquery to count articles
    const categories = await Category.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM News
              WHERE
                News.categoryId = Category.id
            )`),
            'articleCount'
          ]
        ]
      },
      order: [['name', 'ASC']]
    });
    
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM News
              WHERE
                News.categoryId = Category.id
            )`),
            'articleCount'
          ]
        ]
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if category already exists
    const categoryExists = await Category.findOne({ 
      where: { 
        [Op.or]: [
          { slug },
          { name }
        ]
      }
    });
    
    if (categoryExists) {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }
    
    const category = await Category.create({
      name,
      description: description || '',
      slug
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Update fields
    if (name && name.trim() !== '') {
      const newSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Check if another category has this name or slug
      const categoryExists = await Category.findOne({ 
        where: { 
          [Op.or]: [
            { slug: newSlug },
            { name }
          ],
          id: { [Op.ne]: req.params.id } // Not the current category
        } 
      });
      
      if (categoryExists) {
        return res.status(400).json({ message: 'A category with this name already exists' });
      }
      
      category.name = name;
      category.slug = newSlug;
    }
    
    if (description !== undefined) {
      category.description = description;
    }
    
    await category.save();
    
    // Get updated category with article count
    const updatedCategory = await Category.findByPk(category.id, {
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM News
              WHERE
                News.categoryId = Category.id
            )`),
            'articleCount'
          ]
        ]
      }
    });
    
    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has articles
    const articleCount = await News.count({
      where: { categoryId: req.params.id }
    });
    
    if (articleCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with articles. Reassign articles first.' 
      });
    }
    
    await category.destroy();
    
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Set up default categories
// @route   POST /api/categories/setup
// @access  Private/Admin
const setupDefaultCategories = async (req, res) => {
  try {
    // Check if there are already categories
    const existingCount = await Category.count();
    
    if (existingCount > 0) {
      return res.status(400).json({ 
        message: 'Categories already exist', 
        count: existingCount 
      });
    }
    
    // Define default categories
    const defaultCategories = [
      { name: 'Politics', description: 'Political news and current affairs', slug: 'politics' },
      { name: 'Sports', description: 'Sports news and events', slug: 'sports' },
      { name: 'Technology', description: 'Technology and innovation news', slug: 'technology' },
      { name: 'Entertainment', description: 'Entertainment, celebrities and culture', slug: 'entertainment' },
      { name: 'Business', description: 'Business and financial news', slug: 'business' },
      { name: 'Health', description: 'Health, wellness and medical news', slug: 'health' },
      { name: 'Science', description: 'Science discoveries and research', slug: 'science' },
      { name: 'Other', description: 'Miscellaneous news', slug: 'other' }
    ];
    
    // Create all categories
    const createdCategories = await Category.bulkCreate(defaultCategories);
    
    res.status(201).json({
      message: 'Default categories created successfully',
      categories: createdCategories
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Some categories already exist' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  setupDefaultCategories
};