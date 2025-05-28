module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define('Settings', {
    siteName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Breaking News'
    },
    siteDescription: {
      type: DataTypes.TEXT,
      defaultValue: 'Your trusted source for the latest news and updates from around the world.'
    },
    contactEmail: {
      type: DataTypes.STRING,
      defaultValue: 'contact@breakingnews.com'
    },
    contactPhone: {
      type: DataTypes.STRING,
      defaultValue: '+1 (555) 123-4567'
    },
    contactAddress: {
      type: DataTypes.TEXT,
      defaultValue: '123 News Street, City, Country'
    },
    socialLinks: {
      type: DataTypes.JSON, // If MySQL 5.7+
      defaultValue: {
        facebook: 'https://facebook.com/breakingnews',
        twitter: 'https://twitter.com/breakingnews',
        instagram: 'https://instagram.com/breakingnews',
        youtube: 'https://youtube.com/breakingnews'
      }
    },
    featuredCategories: {
      type: DataTypes.JSON, // If MySQL 5.7+
      defaultValue: ['politics', 'technology', 'sports', 'entertainment']
    },
    homepageLayout: {
      type: DataTypes.ENUM('standard', 'magazine', 'blog', 'grid'),
      defaultValue: 'standard'
    },
    enableComments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    requireCommentApproval: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    enableNewsletter: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    logoUrl: {
      type: DataTypes.STRING,
      defaultValue: '/logo.png'
    },
    faviconUrl: {
      type: DataTypes.STRING,
      defaultValue: '/favicon.ico'
    },
    // Add this field if you want to track who last updated the settings
    lastUpdatedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // Static method to get site settings
  Settings.getSiteSettings = async function() {
    let settings = await this.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await this.create({});
    }
    
    return settings;
  };

  return Settings;
};