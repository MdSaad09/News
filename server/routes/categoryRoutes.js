const express = require('express');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  setupDefaultCategories
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, admin, createCategory);


  router.post('/setup', protect, admin, setupDefaultCategories);
router.route('/:id')
  .get(getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);



module.exports = router;