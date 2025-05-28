const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, applyAsReporter, motivation } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with reporter application if requested
    const userData = {
      name,
      email,
      password,
      role: role === 'reporter' ? 'reporter' : 'user',
    };

    // If applying as reporter, add application details
    if (applyAsReporter) {
      userData.bio = motivation;
      userData.reporterApplicationStatus = 'approved';
      userData.reporterApplicationDate = new Date();
    }

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        reporterApplicationStatus: user.reporterApplicationStatus,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.profilePicture = req.body.profilePicture || user.profilePicture;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        token: generateToken(updatedUser.id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Apply for reporter role
// @route   POST /api/auth/apply-reporter
// @access  Private (only regular users)
const applyForReporter = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a reporter or admin
    if (user.role === 'reporter' || user.role === 'admin') {
      return res.status(400).json({ 
        message: 'You already have reporter or higher privileges'
      });
    }

    // Check if there's a pending application
    if (user.reporterApplicationStatus === 'pending') {
      return res.status(400).json({ 
        message: 'You already have a pending application'
      });
    }

    // Get application details from request body
    const { motivation } = req.body;

    if (!motivation || motivation.trim().length < 50) {
      return res.status(400).json({ 
        message: 'Please provide a detailed motivation (at least 50 characters)'
      });
    }

    // Update user with application details
    user.reporterApplicationStatus = 'pending';
    user.reporterApplicationDate = new Date();
    user.bio = motivation; // Save motivation as bio

    await user.save();

    res.status(200).json({
      message: 'Application submitted successfully',
      applicationStatus: user.reporterApplicationStatus,
      appliedAt: user.reporterApplicationDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  applyForReporter,
};