const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'reporter', 'admin'),
      defaultValue: 'user'
    },
    profilePicture: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    bio: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    reporterApplicationStatus: {
      type: DataTypes.ENUM('none', 'pending', 'approved', 'rejected'),
      defaultValue: 'none'
    },
    reporterApplicationDate: {
      type: DataTypes.DATE
    },
    reporterApplicationFeedback: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    articlesPublished: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    articlesRejected: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastArticleDate: {
      type: DataTypes.DATE
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ]
  });

  // Instance method to check password
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Hook to hash password before save
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  return User;
};