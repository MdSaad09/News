const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a page title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add page content']
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [70, 'Meta title cannot be more than 70 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot be more than 160 characters']
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create a text index for search functionality
pageSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Page', pageSchema);