// utils/fileUpload.js - FIXED VERSION
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Create base uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
fs.ensureDirSync(uploadDir);

// Create subdirectories for different content types
const directories = ['images', 'videos', 'thumbnails', 'people', 'temp'];
directories.forEach(dir => {
  fs.ensureDirSync(path.join(uploadDir, dir));
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine appropriate folder based on field name and file type
    let folder = 'images'; // Default folder
    
    console.log('File field name:', file.fieldname); // Debug log
    console.log('Request base URL:', req.baseUrl); // Debug log
    
    if (file.fieldname === 'video') {
      folder = 'videos';
    } else if (file.fieldname === 'videoThumbnail') {
      folder = 'thumbnails';
    } else if (file.fieldname === 'image' && req.baseUrl && req.baseUrl.includes('/people')) {
      folder = 'people';
    } else if (file.fieldname === 'coverImage') {
      folder = 'images'; // Explicitly handle coverImage
    }
    // For any other image-related field, default to 'images'
    
    console.log('Selected folder:', folder); // Debug log
    
    const destPath = path.join(uploadDir, folder);
    cb(null, destPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    
    console.log('Generated filename:', filename); // Debug log
    
    cb(null, filename);
  }
});

// File filter to validate uploads based on field name
const fileFilter = (req, file, cb) => {
  console.log('File filter - fieldname:', file.fieldname, 'mimetype:', file.mimetype); // Debug log
  
  if (file.fieldname === 'video') {
    // Accept video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for video uploads'), false);
    }
  } else {
    // Accept image files for other fields (image, coverImage, videoThumbnail, etc.)
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for this field'), false);
    }
  }
};

// Create the multer upload instance for single files
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  }
});

// Create the multer upload instance for videos (larger size limit)
const videoUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  }
});

// Configure multi-field upload
const multiUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: function(req, file, cb) {
      if (file.fieldname === 'video') {
        cb(null, 100 * 1024 * 1024); // 100MB for videos
      } else {
        cb(null, 10 * 1024 * 1024); // 10MB for images
      }
    }
  }
});

// Middleware for handling multiple file uploads
const uploadFields = multiUpload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'videoThumbnail', maxCount: 1 },
  { name: 'image', maxCount: 1 } // For person images
]);

// Wrap multer middleware to catch errors
const uploadWithErrorHandling = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err); // Debug log
      if (err instanceof multer.MulterError) {
        // A Multer error occurred (e.g., file too large)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: 'File too large. Maximum size is 10MB for images and 100MB for videos.' 
          });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else {
        // An unknown error occurred
        return res.status(500).json({ message: `Server error: ${err.message}` });
      }
    }
    // No error, continue
    next();
  });
};

// Handle multiple field uploads with error handling
const multiUploadWithErrorHandling = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      console.error('Multi-upload error:', err); // Debug log
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: 'File too large. Maximum size is 10MB for images and 100MB for videos.' 
          });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else {
        return res.status(500).json({ message: `Server error: ${err.message}` });
      }
    }
    next();
  });
};

module.exports = {
  upload,
  videoUpload,
  multiUpload,
  uploadWithErrorHandling,
  multiUploadWithErrorHandling,
  uploadFields
};