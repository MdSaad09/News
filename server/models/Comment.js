const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  news: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Please add a comment'],
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);