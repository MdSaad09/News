const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  summary: {
    type: String,
    required: [true, 'Please add a summary'],
    maxlength: [200, 'Summary cannot be more than 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['politics', 'sports', 'technology', 'entertainment', 'business', 'health', 'science', 'other']
  },
  coverImage: {
    type: String,
    required: [true, 'Please add a cover image']
  },
  media: [{
    type: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('News', newsSchema);