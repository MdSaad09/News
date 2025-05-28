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
      }
    }, {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['slug']
        }
      ]
    });
    
    return Person;
  };