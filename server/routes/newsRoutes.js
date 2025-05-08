const express = require('express');
const {
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
  bulkImportNews
} = require('../controllers/newsController');
const { protect, reporter, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = require('../utils/fileUpload');
const router = express.Router();
const uploadConfig = multer({ 
  dest: 'uploads/temp/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Public routes
router.route('/').get(getPublishedNews);

// Admin routes - Placing these BEFORE the ID parameter routes
router.route('/admin').get(protect, admin, getAllNews);
router.route('/import').post(protect, admin, importNews);
router.route('/import/parse').post(
  protect, 
  admin, 
  uploadConfig.single('file'), 
  bulkImportNews
);

// Reporter routes - Also placing these BEFORE the ID parameter routes
router.route('/reporter/mynews').get(protect, reporter, getReporterNews);
router.route('/reporter/stats').get(protect, reporter, getReporterStats);

// Routes with path parameters - Must be AFTER all specific routes
router.route('/:id').get(getNewsById);
router.route('/:id').put(protect, reporter, updateNews);
router.route('/:id').delete(protect, admin, deleteNews);
router.route('/:id/publish').put(protect, admin, togglePublishNews);

// POST route for creating news
router.route('/').post(protect, reporter, upload.single('coverImage'), createNews);

module.exports = router;