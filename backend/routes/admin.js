const express = require('express');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Admin dashboard endpoint',
      stats: {
        totalUsers: 0,
        totalJobs: 0,
        totalApplications: 0
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Get all users endpoint',
      users: []
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;