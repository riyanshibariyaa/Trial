// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const User = require('../models/User');
const otpService = require('../services/otpService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('phone').isMobilePhone('en-IN'),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['jobseeker', 'employer'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

// @route   POST /api/auth/register
// @desc    Register user with OTP
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }

    // Generate OTPs for email and phone
    const emailOTP = otpService.generateOTP(email, 'email');
    const phoneOTP = otpService.generateOTP(phone, 'sms');

    // Create user (unverified)
    const user = new User({
      email,
      phone,
      password,
      role,
      isVerified: false
    });

    await user.save();

    // TODO: Send OTP via email and SMS
    console.log(`Email OTP for ${email}: ${emailOTP}`);
    console.log(`SMS OTP for ${phone}: ${phoneOTP}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email and phone.',
      userId: user._id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for email/phone
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, email, phone, emailOTP, phoneOTP } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let emailVerified = false;
    let phoneVerified = false;

    // Verify email OTP
    if (emailOTP) {
      const emailResult = otpService.verifyOTP(email, emailOTP, 'email');
      if (emailResult.success) {
        emailVerified = true;
        user.emailVerified = true;
      }
    }

    // Verify phone OTP
    if (phoneOTP) {
      const phoneResult = otpService.verifyOTP(phone, phoneOTP, 'sms');
      if (phoneResult.success) {
        phoneVerified = true;
        user.phoneVerified = true;
      }
    }

    // If both are verified, activate account
    if (user.emailVerified && user.phoneVerified) {
      user.isVerified = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'OTP verification completed',
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      isVerified: user.isVerified
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your account first'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
// @access  Public
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, phone, type } = req.body;

    if (type === 'email' && email) {
      const otp = otpService.generateOTP(email, 'email');
      console.log(`Resent Email OTP for ${email}: ${otp}`);
    }

    if (type === 'sms' && phone) {
      const otp = otpService.generateOTP(phone, 'sms');
      console.log(`Resent SMS OTP for ${phone}: ${otp}`);
    }

    res.json({
      success: true,
      message: 'OTP resent successfully'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

module.exports = router;