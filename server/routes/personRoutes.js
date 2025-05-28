const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { 
  getPeople, 
  getPersonById, 
  getNewsByPerson, 
  createPerson,
  updatePerson,
  deletePerson 
} = require('../controllers/personController');

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'people');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/people/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Public routes
router.get('/', getPeople);
router.get('/:id', getPersonById);
router.get('/:id/news', getNewsByPerson);

// Admin routes
router.post('/', protect, admin, upload.single('image'), createPerson);
router.put('/:id', protect, admin, upload.single('image'), updatePerson);
router.delete('/:id', protect, admin, deletePerson);

module.exports = router;