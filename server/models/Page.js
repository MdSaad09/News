module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define('Page', {
    title: {
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
      validate: {
        notEmpty: true
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    metaTitle: {
      type: DataTypes.STRING(70),
      validate: {
        len: [0, 70]
      }
    },
    metaDescription: {
      type: DataTypes.STRING(160),
      validate: {
        len: [0, 160]
      }
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Add these foreign key fields
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    lastUpdatedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['createdById']
      },
      {
        fields: ['lastUpdatedById']
      },
      // If your MySQL version supports FULLTEXT (5.6+)
      {
        type: 'FULLTEXT',
        name: 'page_search_idx',
        fields: ['title', 'content']
      }
    ]
  });

  return Page;
};