const { sequelize, syncDatabase } = require('../models');

const initializeDatabase = async () => {
  try {
    // Sync all models with database
    await syncDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

module.exports = initializeDatabase;