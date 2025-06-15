const { body, param, query } = require('express-validator');

const validationRules = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('phone')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
      .isIn(['jobseeker', 'employer'])
      .withMessage('Role must be either jobseeker or employer'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  verifyOTP: [
    body('userId')
      .isMongoId()
      .withMessage('Valid user ID is required'),
    body('emailOTP')
      .optional()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Email OTP must be 6 digits'),
    body('phoneOTP')
      .optional()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Phone OTP must be 6 digits')
  ],

  resendOTP: [
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail(),
    body('phone')
      .optional()
      .matches(/^[6-9]\d{9}$/),
    body('type')
      .isIn(['email', 'sms'])
      .withMessage('Type must be either email or sms')
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email')
  ],

  resetPassword: [
    param('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ]
};

module.exports = validationRules;
