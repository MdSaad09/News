const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getReporterApplications,
  reviewReporterApplication
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

// Reporter application routes
router.route('/reporter-applications')
  .get(protect, admin, getReporterApplications);

router.route('/reporter-applications/:userId')
  .put(protect, admin, reviewReporterApplication);

module.exports = router;