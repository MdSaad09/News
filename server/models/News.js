module.exports = (sequelize, DataTypes) => {
  const News = sequelize.define('News', {
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    summary: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    featuredVideo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasVideo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    videoThumbnail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    media: {
      type: DataTypes.JSON, // Use JSON if MySQL 5.7+
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('media');
        return rawValue ? rawValue : [];
      }
    },
    additionalCategories: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('additionalCategories');
        return rawValue ? rawValue : [];
      }
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    publishedAt: {
      type: DataTypes.DATE
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tags: {
      type: DataTypes.JSON, // Use JSON if MySQL 5.7+
      defaultValue: []
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['categoryId']
      },
      {
        fields: ['authorId']
      },
      {
        fields: ['isPublished']
      },
      // If your MySQL version supports FULLTEXT (5.6+)
      {
        type: 'FULLTEXT',
        name: 'news_search_idx',
        fields: ['title', 'content', 'summary']
      }
    ]
  });

  return News;
};