// routes/jobSeeker.js
const express = require('express');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobseeker/profile
// @desc    Get job seeker profile
// @access  Private (Job Seeker only)
router.get('/profile', auth, authorize('jobseeker'), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Job seeker profile endpoint',
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/jobseeker/profile
// @desc    Update job seeker profile
// @access  Private (Job Seeker only)
router.put('/profile', auth, authorize('jobseeker'), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Update job seeker profile endpoint'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/jobseeker/jobs
// @desc    Get available jobs
// @access  Private (Job Seeker only)
router.get('/jobs', auth, authorize('jobseeker'), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Get jobs endpoint',
      jobs: []
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;