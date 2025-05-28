const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const initializeDatabase = require('./utils/initDb');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const pageRoutes = require('./routes/pageRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const personRoutes = require('./routes/personRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize database models
initializeDatabase();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/people', personRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
