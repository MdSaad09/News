const express = require('express');
const { uploadWithErrorHandling, multiUploadWithErrorHandling, videoUpload } = require('../utils/fileUpload');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const router = express.Router();

// @desc    Upload single file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, uploadWithErrorHandling, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('Uploaded file details:', {
      fieldname: req.file.fieldname,
      filename: req.file.filename,
      destination: req.file.destination
    }); // Debug log
    
    // Determine folder from the actual destination path
    let folder = 'images'; // default
    
    if (req.file.destination.includes('videos')) {
      folder = 'videos';
    } else if (req.file.destination.includes('thumbnails')) {
      folder = 'thumbnails';
    } else if (req.file.destination.includes('people')) {
      folder = 'people';
    } else {
      folder = 'images';
    }
    
    console.log('Determined folder:', folder); // Debug log
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${folder}/${req.file.filename}`;
    
    console.log('Generated file URL:', fileUrl); // Debug log
    
    res.json({
      message: 'File uploaded successfully',
      url: fileUrl,
      urls: [fileUrl], // Also provide urls array for compatibility
      fileType: req.file.mimetype.startsWith('video/') ? 'video' : 'image'
    });
  } catch (error) {
    console.error('Upload route error:', error);
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
    
    console.log('Multi-upload files:', Object.keys(req.files)); // Debug log
    
    // Process all uploaded files and create URLs
    const fileUrls = {};
    
    Object.keys(req.files).forEach(fieldName => {
      const file = req.files[fieldName][0];
      
      // Determine folder from destination path
      let folder = 'images';
      if (file.destination.includes('videos')) {
        folder = 'videos';
      } else if (file.destination.includes('thumbnails')) {
        folder = 'thumbnails';
      } else if (file.destination.includes('people')) {
        folder = 'people';
      }
      
      fileUrls[fieldName] = `${req.protocol}://${req.get('host')}/uploads/${folder}/${file.filename}`;
    });
    
    console.log('Generated file URLs:', fileUrls); // Debug log
    
    res.json({
      message: 'Files uploaded successfully',
      files: fileUrls
    });
  } catch (error) {
    console.error('Multi-upload route error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Upload video file
// @route   POST /api/upload/video
// @access  Private
router.post('/video', protect, (req, res, next) => {
  videoUpload.single('video')(req, res, (err) => {
    if (err) {
      console.error('Video upload error:', err);
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
    
    console.log('Video upload URL:', fileUrl); // Debug log
    
    res.json({
      message: 'Video uploaded successfully',
      url: fileUrl,
      fileType: 'video'
    });
  });
});

module.exports = router;