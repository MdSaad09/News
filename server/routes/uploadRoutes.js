const express = require('express');
const { uploadWithErrorHandling, multiUploadWithErrorHandling,  videoUpload } = require('../utils/fileUpload');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// @desc    Upload single file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, uploadWithErrorHandling, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Create the URL for the uploaded file
    const folder = req.file.fieldname === 'video' ? 'videos' : 
                   req.file.fieldname === 'videoThumbnail' ? 'thumbnails' : 
                   req.file.fieldname === 'image' && req.baseUrl.includes('/people') ? 'people' : 'images';
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${folder}/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      url: fileUrl, // Changed from fileUrl to url to match frontend expectations
      fileType: req.file.mimetype.startsWith('video/') ? 'video' : 'image'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Upload multiple files (image and video)
// @route   POST /api/upload/multi
// @access  Private
router.post('/multi', protect, multiUploadWithErrorHandling, (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    // Process all uploaded files and create URLs
    const fileUrls = {};
    
    Object.keys(req.files).forEach(fieldName => {
      const file = req.files[fieldName][0];
      fileUrls[fieldName] = `${req.protocol}://${req.get('host')}/uploads/${file.destination.split('uploads/')[1]}/${file.filename}`;
    });
    
    res.json({
      message: 'Files uploaded successfully',
      files: fileUrls
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



// @desc    Upload video file
// @route   POST /api/upload/video
// @access  Private
router.post('/video', protect, (req, res, next) => {
  videoUpload.single('video')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred (e.g., file too large)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: 'Video file too large. Maximum size is 100MB.' 
          });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else {
        // An unknown error occurred
        return res.status(500).json({ message: `Server error: ${err.message}` });
      }
    }
    
    // No error, continue
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }
    
    // Create the URL for the uploaded video
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/videos/${req.file.filename}`;
    
    res.json({
      message: 'Video uploaded successfully',
      url: fileUrl,
      fileType: 'video'
    });
  });
});

module.exports = router;