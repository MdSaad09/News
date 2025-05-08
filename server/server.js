const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes'); // If you added this from previous implementation
const categoryRoutes = require('./routes/categoryRoutes'); // If you added this from previous implementation
const pageRoutes = require('./routes/pageRoutes'); // Add this line
const settingsRoutes = require('./routes/settingsRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

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
app.use('/api/admin', adminRoutes); // If you added this from previous implementation
app.use('/api/categories', categoryRoutes); // If you added this from previous implementation
app.use('/api/pages', pageRoutes); // Add this line
app.use('/api/settings', settingsRoutes);

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