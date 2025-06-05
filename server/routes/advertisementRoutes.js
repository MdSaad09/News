// routes/advertisementRoutes.js
const express = require('express');
const {
  getAdminAdvertisements,
  getActiveAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  reorderAdvertisements,
  toggleAdvertisementStatus,
  trackImpression,
  trackClick,
  getAdvertisementAnalytics,
  getAdvertisementById,
} = require('../controllers/advertisementController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadWithErrorHandling } = require('../utils/fileUpload');

const router = express.Router();

// Public routes
router.get('/active', getActiveAdvertisements);
router.post('/:id/impression', trackImpression);
router.post('/:id/click', trackClick);

// Admin routes
router.get('/admin', protect, admin, getAdminAdvertisements);
router.post('/', protect, admin, uploadWithErrorHandling, createAdvertisement);
router.put('/reorder', protect, admin, reorderAdvertisements);
router.get('/:id/analytics', protect, admin, getAdvertisementAnalytics);
router.get('/:id', protect, admin, getAdvertisementById);
router.get('/test', getActiveAdvertisements);
router.put('/:id', protect, admin, uploadWithErrorHandling, updateAdvertisement);
router.put('/:id/toggle', protect, admin, toggleAdvertisementStatus);
router.delete('/:id', protect, admin, deleteAdvertisement);

module.exports = router;