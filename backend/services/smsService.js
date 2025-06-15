class SMSService {
  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  async sendOTP(phone, otp) {
    try {
      if (!this.client) {
        // For development - just log the OTP
        console.log(`📱 SMS OTP for ${phone}: ${otp}`);
        return { success: true, method: 'console' };
      }

      const message = await this.client.messages.create({
        body: `Your Job Portal verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${phone}`
      });

      console.log('SMS sent successfully:', message.sid);
      return { success: true, sid: message.sid };
    } catch (error) {
      console.error('SMS sending failed:', error);
      // Fallback to console log in development
      console.log(`📱 SMS OTP for ${phone}: ${otp} (Fallback)`);
      return { success: true, method: 'fallback' };
    }
  }
}

module.exports = new SMSService();
