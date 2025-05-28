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
  bulkImportNews,
  getVideoNews
} = require('../controllers/newsController');
const { protect, reporter, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const { upload, uploadWithErrorHandling } = require('../utils/fileUpload');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure upload directories exist
const directories = [
  path.join(process.cwd(), 'uploads', 'images'),
  path.join(process.cwd(), 'uploads', 'videos'),
  path.join(process.cwd(), 'uploads', 'thumbnails'),
  path.join(process.cwd(), 'uploads', 'temp')
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for document imports
const uploadConfig = multer({ 
  dest: 'uploads/temp/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure multer for multiple file types
const multiUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = 'uploads/';
      
      if (file.fieldname === 'video') {
        uploadPath += 'videos/';
      } else if (file.fieldname === 'videoThumbnail') {
        uploadPath += 'thumbnails/';
      } else {
        uploadPath += 'images/';
      }
      
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  }),
  limits: { 
    fileSize: file => {
      // Allow larger size for videos (50MB), standard size for images (10MB)
      return file.fieldname === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    }
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'video') {
      // Accept video files
      if (!file.originalname.match(/\.(mp4|webm|mov|avi|wmv)$/i)) {
        return cb(new Error('Only video files are allowed!'), false);
      }
    } else {
      // Accept image files
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
    }
    cb(null, true);
  }
});

// Public routes
router.route('/').get(getPublishedNews);
router.route('/videos').get(getVideoNews); // New route for video news

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
router.route('/:id').put(
  protect, 
  reporter, 
  multiUpload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'videoThumbnail', maxCount: 1 }
  ]), 
  updateNews
);
router.route('/:id').delete(protect, reporter, deleteNews);
router.route('/:id/publish').put(protect, admin, togglePublishNews);

// POST route for creating news with multiple file uploads
router.route('/').post(
  protect, 
  reporter, 
  multiUpload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'videoThumbnail', maxCount: 1 }
  ]), 
  createNews
);

module.exports = router;