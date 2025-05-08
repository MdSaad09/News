const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};



// @desc    Get all reporter applications
// @route   GET /api/users/reporter-applications
// @access  Private (Admin only)
const getReporterApplications = async (req, res) => {
  try {
    const applications = await User.find({
      'reporterApplication.status': 'pending'
    }).select('name email bio reporterApplication createdAt');

    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Review reporter application (approve/reject)
// @route   PUT /api/users/reporter-applications/:userId
// @access  Private/Admin
const reviewReporterApplication = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    if (status === 'rejected' && (!feedback || feedback.trim() === '')) {
      return res.status(400).json({ message: 'Feedback is required for rejection' });
    }
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.reporterApplication.status !== 'pending') {
      return res.status(400).json({ message: 'This application is not pending' });
    }
    
    // Update user
    user.reporterApplication.status = status;
    user.reporterApplication.feedback = feedback || '';
    
    // If approved, update role to reporter
    if (status === 'approved') {
      user.role = 'reporter';
    }
    
    await user.save();
    
    res.status(200).json({ message: `Application ${status} successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getReporterApplications,
  reviewReporterApplication,
};