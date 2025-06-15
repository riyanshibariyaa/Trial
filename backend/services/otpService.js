const crypto = require('crypto');

class OTPService {
  constructor() {
    this.otpStore = new Map(); // In production, use Redis
    
    // Clean expired OTPs every 5 minutes
    setInterval(() => {
      this.cleanExpiredOTPs();
    }, 5 * 60 * 1000);
  }

  generateOTP(identifier, type = 'email') {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `${identifier}_${type}`;
    
    // Store OTP with expiration (10 minutes)
    this.otpStore.set(key, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      attempts: 0,
      createdAt: Date.now()
    });

    console.log(`🔐 Generated ${type.toUpperCase()} OTP for ${identifier}: ${otp}`);
    return otp;
  }

  verifyOTP(identifier, otp, type = 'email') {
    const key = `${identifier}_${type}`;
    const stored = this.otpStore.get(key);

    if (!stored) {
      return { success: false, message: 'OTP not found or expired' };
    }

    if (Date.now() > stored.expires) {
      this.otpStore.delete(key);
      return { success: false, message: 'OTP has expired' };
    }

    if (stored.attempts >= 3) {
      this.otpStore.delete(key);
      return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    if (stored.otp !== otp) {
      stored.attempts += 1;
      return { success: false, message: 'Invalid OTP', attemptsLeft: 3 - stored.attempts };
    }

    this.otpStore.delete(key);
    console.log(`✅ OTP verified successfully for ${identifier}`);
    return { success: true, message: 'OTP verified successfully' };
  }

  resendOTP(identifier, type = 'email') {
    const key = `${identifier}_${type}`;
    const stored = this.otpStore.get(key);
    
    // Check if last OTP was sent less than 1 minute ago
    if (stored && (Date.now() - stored.createdAt) < 60 * 1000) {
      return { 
        success: false, 
        message: 'Please wait before requesting a new OTP',
        waitTime: Math.ceil((60 * 1000 - (Date.now() - stored.createdAt)) / 1000)
      };
    }

    return { success: true, message: 'New OTP can be generated' };
  }

  cleanExpiredOTPs() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.otpStore.entries()) {
      if (now > value.expires) {
        this.otpStore.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired OTPs`);
    }
  }

  getStats() {
    return {
      totalOTPs: this.otpStore.size,
      expired: Array.from(this.otpStore.values()).filter(otp => Date.now() > otp.expires).length
    };
  }
}

module.exports = new OTPService();
