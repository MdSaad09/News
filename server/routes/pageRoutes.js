const express = require('express');
const {
  getPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage
} = require('../controllers/pageController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.route('/slug/:slug').get(getPageBySlug);

// Admin routes
router.route('/')
  .get(protect, admin, getPages)
  .post(protect, admin, createPage);

router.route('/:id')
  .get(protect, admin, getPageById)
  .put(protect, admin, updatePage)
  .delete(protect, admin, deletePage);

module.exports = router;