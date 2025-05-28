module.exports = (sequelize, DataTypes) => {
    const NewsPersons = sequelize.define('NewsPersons', {
      newsId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'News',
          key: 'id'
        }
      },
      personId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'People',
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
          fields: ['personId']
        }
      ]
    });
    
    return NewsPersons;
  };