const { User, News } = require('../models');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
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
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

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
    const user = await User.findByPk(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      await user.save();

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (user) {
      // Check if user has published articles
      const articleCount = await News.count({
        where: { authorId: user.id }
      });

      if (articleCount > 0) {
        return res.status(400).json({
          message: 'Cannot delete user with published articles. Reassign or delete articles first.'
        });
      }

      await user.destroy();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get reporter applications
// @route   GET /api/users/reporter-applications
// @access  Private/Admin
const getReporterApplications = async (req, res) => {
  try {
    const applications = await User.findAll({
      where: {
        reporterApplicationStatus: 'pending'
      },
      attributes: { exclude: ['password'] }
    });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update reporter application status
// @route   PUT /api/users/reporter-applications/:userId
// @access  Private/Admin
const updateReporterStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const user = await User.findByPk(req.params.userId); // Changed to userId to match route

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.reporterApplicationStatus !== 'pending') {
      return res.status(400).json({ message: 'User does not have a pending application' });
    }

    if (status === 'approved') {
      user.role = 'reporter';
      user.reporterApplicationStatus = 'approved';
    } else if (status === 'rejected') {
      user.reporterApplicationStatus = 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Save feedback if provided
    if (feedback) {
      user.reporterApplicationFeedback = feedback;
    }

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      reporterApplicationStatus: user.reporterApplicationStatus,
      reporterApplicationFeedback: user.reporterApplicationFeedback
    });
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
  updateReporterStatus
};