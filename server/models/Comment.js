module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Add these foreign key fields
    newsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'News',
        key: 'id'
      }
    },
    userId: {
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
        fields: ['newsId']
      },
      {
        fields: ['userId']
      }
    ]
  });

  return Comment;
};