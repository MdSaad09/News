// models/Person.js - ENHANCED VERSION
module.exports = (sequelize, DataTypes) => {
  const Person = sequelize.define('Person', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
    },
    image: {
      type: DataTypes.STRING,
    },
    profession: {
      type: DataTypes.STRING(100),
    },
    // NEW FIELDS
    category: {
      type: DataTypes.ENUM('politician', 'celebrity', 'athlete', 'business', 'activist', 'journalist', 'scientist', 'artist', 'other'),
      defaultValue: 'other'
    },
    birthDate: {
      type: DataTypes.DATE,
    },
    nationality: {
      type: DataTypes.STRING(50),
    },
    website: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    // Social Media Links
    socialMedia: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Store social media links as JSON object'
    },
    // Statistics
    newsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total number of news articles mentioning this person'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total page views for this person'
    },
    // SEO & Status
    metaTitle: {
      type: DataTypes.STRING(60),
    },
    metaDescription: {
      type: DataTypes.STRING(160),
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Featured people show prominently'
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['category']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['isFeatured']
      },
      {
        fields: ['newsCount']
      },
      {
        fields: ['viewCount']
      }
    ],
    hooks: {
      beforeCreate: (person) => {
        // Auto-generate slug if not provided
        if (!person.slug && person.name) {
          person.slug = person.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        }
        
        // Auto-generate meta fields if not provided
        if (!person.metaTitle) {
          person.metaTitle = person.name;
        }
        if (!person.metaDescription && person.description) {
          person.metaDescription = person.description.substring(0, 157) + '...';
        }
      },
      beforeUpdate: (person) => {
        // Update slug if name changed
        if (person.changed('name') && person.name) {
          person.slug = person.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        }
        
        // Update meta fields
        if (person.changed('name') && !person.metaTitle) {
          person.metaTitle = person.name;
        }
        if (person.changed('description') && !person.metaDescription && person.description) {
          person.metaDescription = person.description.substring(0, 157) + '...';
        }
      }
    }
  });
  
  return Person;
};