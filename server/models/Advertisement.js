// models/Advertisement.js
module.exports = (sequelize, DataTypes) => {
  const Advertisement = sequelize.define('Advertisement', {
    // Basic Info
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    
    // Content & Type
    type: {
      type: DataTypes.ENUM('image', 'text', 'video', 'html'),
      allowNull: false,
      defaultValue: 'image'
    },
    
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'For text ads: the text content, For video: embed code, For HTML: raw HTML'
    },
    
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'For image ads'
    },
    
    linkUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Click destination URL'
    },
    
    altText: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Alt text for images'
    },
    
    // Position & Display
    position: {
      type: DataTypes.ENUM(
        'header-top', 'header-bottom', 
        'sidebar-left', 'sidebar-right',
        'content-top', 'content-middle', 'content-bottom',
        'footer-top', 'footer-bottom',
        'between-articles', 'floating-corner', 'overlay-center'
      ),
      allowNull: false,
      defaultValue: 'sidebar-right'
    },
    
    // For dynamic positioning (between articles)
    articlePosition: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Show after every N articles (for between-articles position)'
    },
    
    // Size & Dimensions
    size: {
      type: DataTypes.ENUM('small', 'medium', 'large', 'custom'),
      allowNull: false,
      defaultValue: 'medium'
    },
    
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Custom width in pixels'
    },
    
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Custom height in pixels'
    },
    
    // Page Targeting
    pages: {
      type: DataTypes.JSON,
      defaultValue: ['all'],
      comment: 'Array of pages: ["all"] or ["home", "news", "category-politics"]'
    },
    
    excludePages: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of pages to exclude'
    },
    
    // Device Targeting
    deviceTarget: {
      type: DataTypes.ENUM('all', 'desktop', 'mobile'),
      allowNull: false,
      defaultValue: 'all'
    },
    
    // Status & Scheduling
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Priority & Order
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Higher number = higher priority'
    },
    
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'For drag-and-drop ordering'
    },
    
    // Analytics
    impressions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of times ad was shown'
    },
    
    clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of clicks on ad'
    },
    
    // Styling
    customCSS: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Custom CSS for advanced styling'
    },
    
    backgroundColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
      comment: 'Hex color code'
    },
    
    textColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
      comment: 'Hex color code'
    },
    
    borderRadius: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Border radius in pixels'
    },
    
    // Relations
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['position']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['startDate', 'endDate']
      },
      {
        fields: ['priority', 'sortOrder']
      },
      {
        fields: ['createdById']
      }
    ]
  });
  
  return Advertisement;
};