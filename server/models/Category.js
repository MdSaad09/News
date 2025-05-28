module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.STRING(200),
      validate: {
        len: [0, 200]
      }
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        unique: true,
        fields: ['slug']
      }
    ]
  });

  // Updated method to get article count using the relation
  Category.prototype.getArticleCount = async function() {
    const { News } = require('./index');
    return await News.count({ where: { categoryId: this.id } });
  };

  return Category;
};