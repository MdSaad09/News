const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: 'Breaking News'
  },
  siteDescription: {
    type: String,
    default: 'Your trusted source for the latest news and updates from around the world.'
  },
  contactEmail: {
    type: String,
    default: 'contact@breakingnews.com'
  },
  contactPhone: {
    type: String,
    default: '+1 (555) 123-4567'
  },
  contactAddress: {
    type: String,
    default: '123 News Street, City, Country'
  },
  socialLinks: {
    facebook: {
      type: String,
      default: 'https://facebook.com/breakingnews'
    },
    twitter: {
      type: String,
      default: 'https://twitter.com/breakingnews'
    },
    instagram: {
      type: String,
      default: 'https://instagram.com/breakingnews'
    },
    youtube: {
      type: String,
      default: 'https://youtube.com/breakingnews'
    }
  },
  featuredCategories: {
    type: [String],
    default: ['politics', 'technology', 'sports', 'entertainment']
  },
  homepageLayout: {
    type: String,
    enum: ['standard', 'magazine', 'blog', 'grid'],
    default: 'standard'
  },
  enableComments: {
    type: Boolean,
    default: true
  },
  requireCommentApproval: {
    type: Boolean,
    default: true
  },
  enableNewsletter: {
    type: Boolean,
    default: true
  },
  logoUrl: {
    type: String,
    default: '/logo.png'
  },
  faviconUrl: {
    type: String,
    default: '/favicon.ico'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// There should only be one settings document
settingsSchema.statics.getSiteSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({});
  }
  
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);