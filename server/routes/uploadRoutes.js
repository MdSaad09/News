const express = require('express');
const upload = require('../utils/fileUpload');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// @desc    Upload file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Create the URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.destination.split('uploads/')[1]}/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      fileUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;