// models/index.js - Updated with Advertisement model
const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./User')(sequelize, DataTypes);
const News = require('./News')(sequelize, DataTypes);
const Category = require('./Category')(sequelize, DataTypes);
const Comment = require('./Comment')(sequelize, DataTypes);
const Page = require('./Page')(sequelize, DataTypes);
const Settings = require('./Settings')(sequelize, DataTypes);
const Person = require('./Person')(sequelize, DataTypes);
const NewsPersons = require('./NewsPersons')(sequelize, DataTypes);
const Advertisement = require('./Advertisement')(sequelize, DataTypes);

// Define associations
User.hasMany(News, { foreignKey: 'authorId', as: 'articles' });
News.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Category.hasMany(News, { foreignKey: 'categoryId', as: 'articles' });
News.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

News.hasMany(Comment, { foreignKey: 'newsId', as: 'comments' });
Comment.belongsTo(News, { foreignKey: 'newsId', as: 'news' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Page, { foreignKey: 'createdById', as: 'createdPages' });
Page.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

User.hasMany(Page, { foreignKey: 'lastUpdatedById', as: 'updatedPages' });
Page.belongsTo(User, { foreignKey: 'lastUpdatedById', as: 'lastUpdatedBy' });

// Person model associations
News.belongsToMany(Person, { through: NewsPersons, foreignKey: 'newsId' });
Person.belongsToMany(News, { through: NewsPersons, foreignKey: 'personId' });

// Advertisement model associations
User.hasMany(Advertisement, { foreignKey: 'createdById', as: 'advertisements' });
Advertisement.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

// Sync all models with database
const syncDatabase = async () => {
  try {
    // For initial setup, you might want to use force: true once
    // After that, revert to alter: true for updates
    await sequelize.sync({ alter: true }); // Change to alter: true after first run
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  News,
  Category,
  Comment,
  Page,
  Settings,
  Person,
  NewsPersons,
  Advertisement,    // Export the new Advertisement model
  syncDatabase
};