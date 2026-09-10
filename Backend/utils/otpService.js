const crypto = require('crypto');
const nodemailer = require('nodemailer');
const OTP = require('../models/OTP');

const OTP_SECRET = process.env.OTP_SECRET || 'sahayog_sih2026_otp_secret_key';

const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(`${otp}_${OTP_SECRET}`).digest('hex');
};

const generateOTPCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const sendRegistrationOTP = async ({ email, name = 'User' }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Delete older OTPs for this email
  await OTP.deleteMany({ email: normalizedEmail });

  const otpCode = generateOTPCode();
  const otpHash = hashOTP(otpCode);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await OTP.create({
    email: normalizedEmail,
    otpHash,
    purpose: 'register',
    expiresAt,
  });

  // Log prominently in console
  console.log('\n========================================');
  console.log(`🔑 [Sahayog Verification] Registration OTP for: ${normalizedEmail}`);
  console.log(`🔢 OTP Code: [ ${otpCode} ] (Valid for 10 mins)`);
  console.log('========================================\n');

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Sahayog Platform" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: normalizedEmail,
        subject: 'Sahayog Account Verification OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0E4B4C; text-align: center;">Sahayog Account Verification</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your one-time verification code to join the Sahayog platform is:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0E4B4C; background: #f0fdf9; padding: 10px 24px; border-radius: 8px; border: 1px solid #0E4B4C;">${otpCode}</span>
            </div>
            <p style="color: #666; font-size: 13px;">This code will expire in 10 minutes. Please do not share it with anyone.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error('[OTP Mailer Error]:', err.message);
    }
  }

  return {
    success: true,
    message: `Verification OTP sent to ${normalizedEmail}`,
    previewOtp: (!transporter || process.env.NODE_ENV !== 'production') ? otpCode : undefined,
  };
};

const verifyRegistrationOTP = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp || '').trim();

  // Support 123456 in local development
  if (process.env.NODE_ENV !== 'production' && cleanOtp === '123456') {
    return { success: true };
  }

  const record = await OTP.findOne({
    email: normalizedEmail,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    return { success: false, message: 'Invalid or expired OTP. Please request a new code.' };
  }

  const computedHash = hashOTP(cleanOtp);
  if (computedHash !== record.otpHash) {
    return { success: false, message: 'Incorrect OTP code. Please check and try again.' };
  }

  // Delete used OTP
  await OTP.deleteOne({ _id: record._id });
  return { success: true };
};

module.exports = {
  sendRegistrationOTP,
  verifyRegistrationOTP,
};
