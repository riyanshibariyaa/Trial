const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOTP(email, otp, name = 'User') {
    try {
      const mailOptions = {
        from: `"Job Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Email Verification - Job Portal',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering with Job Portal. Please use the following OTP to verify your email address:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, name, role) {
    try {
      const mailOptions = {
        from: `"Job Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Job Portal!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Welcome to Job Portal!</h2>
            <p>Hello ${name},</p>
            <p>Your account has been successfully verified and activated.</p>
            <p>You can now access all features as a <strong>${role}</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Start Exploring</a>
            </div>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The Job Portal Team</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(email, resetToken, name) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: `"Job Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request - Job Portal',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>You have requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </div>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
            <p>Best regards,<br>The Job Portal Team</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Password reset email sending failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
