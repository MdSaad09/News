const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  applyForReporter
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/apply-reporter', protect, applyForReporter);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;