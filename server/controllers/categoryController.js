const Category = require('../models/Category');
const News = require('../models/News');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('articleCount').sort('name');
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
    const category = await Category.findById(req.params.id).populate('articleCount');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if category already exists
    const categoryExists = await Category.findOne({ slug });
    
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const category = await Category.create({
      name,
      slug,
      description: description || '',
      createdBy: req.user._id
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if category with new slug already exists (and it's not the current category)
    const categoryExists = await Category.findOne({ slug, _id: { $ne: req.params.id } });
    
    if (categoryExists) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    category.name = name || category.name;
    category.slug = slug;
    category.description = description !== undefined ? description : category.description;
    
    const updatedCategory = await category.save();
    
    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('articleCount');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has articles
    if (category.articleCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category with articles' });
    }
    
    await category.remove();
    
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};