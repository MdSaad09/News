const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
fs.ensureDirSync(uploadDir);

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create separate folders for different media types
    let folder = 'images';
    if (file.mimetype.startsWith('video/')) {
      folder = 'videos';
    }
    
    const destPath = path.join(uploadDir, folder);
    fs.ensureDirSync(destPath); // Create folder if it doesn't exist
    cb(null, destPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

// Create the multer upload instance
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (adjust as needed)
  }
});

module.exports = upload;