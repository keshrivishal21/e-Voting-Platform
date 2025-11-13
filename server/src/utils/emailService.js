import nodemailer from 'nodemailer';

const EMAIL_ENABLED = process.env.EMAIL_ENABLED !== 'false';

const createTransporter = () => {
  if (!EMAIL_ENABLED) {
    console.log('Email service disabled - using mock transporter for development');
    return {
      sendMail: async (options) => {
        console.log('[MOCK EMAIL] Would have sent email to:', options.to);
        console.log('[MOCK EMAIL] Subject:', options.subject);
        return { messageId: 'mock-' + Date.now() };
      }
    };
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: true
    }
  });
};

/**
 * @param {string} to 
 * @param {string} resetToken 
 * @param {string} userName 
 * @param {string} userType 
 */
export const sendPasswordResetEmail = async (to, resetToken, userName, userType) => {
  try {
    const transporter = createTransporter();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&type=${userType}`;

    if (!EMAIL_ENABLED) {
      console.log('============================================');
      console.log('PASSWORD RESET (Development Mode)');
      console.log('============================================');
      console.log(`To: ${to}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log(`Expires in: 15 minutes`);
      console.log('============================================');
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your password for your ${userType === 'student' ? 'Student' : 'Candidate'} account on the e-Voting Platform.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in <strong>15 minutes</strong></li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
            
            <p>Best regards,<br>
            <strong>e-Voting Platform Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} e-Voting Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: `"e-Voting Platform" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Password Reset Request - e-Voting Platform',
      html: htmlContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * @param {string} to 
 * @param {string} userName 
 */
export const sendPasswordResetConfirmationEmail = async (to, userName) => {
  try {
    const transporter = createTransporter();

    // Email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Successful</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Your password has been successfully reset for your e-Voting Platform account.</p>
            
            <p>If you did not make this change, please contact support immediately.</p>
            
            <p>For security reasons, we recommend that you:</p>
            <ul>
              <li>Use a strong, unique password</li>
              <li>Never share your password with anyone</li>
              <li>Enable two-factor authentication if available</li>
            </ul>
            
            <p>Best regards,<br>
            <strong>e-Voting Platform Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} e-Voting Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: `"e-Voting Platform" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Password Reset Successful - e-Voting Platform',
      html: htmlContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * @param {string} to 
 * @param {string} otp 
 * @param {string} userName 
 */
export const sendEmailVerification = async (to, otp, userName) => {
  try {
    const transporter = createTransporter();

    if (!EMAIL_ENABLED) {
      console.log('============================================');
      console.log('EMAIL VERIFICATION (Development Mode)');
      console.log('============================================');
      console.log(`To: ${to}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Expires in: 10 minutes`);
      console.log('============================================');
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    // Email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .otp-box {
            background-color: #f0f4ff;
            border: 2px dashed #667eea;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
            border-radius: 10px;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Email Verification</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Thank you for registering on the e-Voting Platform! To complete your registration, please verify your email address using the OTP below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Your Verification OTP</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 0; color: #666; font-size: 12px;">Enter this code in the verification page</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This OTP will expire in <strong>10 minutes</strong></li>
                <li>If you didn't create an account, please ignore this email</li>
                <li>Never share this OTP with anyone</li>
              </ul>
            </div>
            
            <p>If you didn't request this verification, you can safely ignore this email.</p>
            
            <p>Best regards,<br>
            <strong>e-Voting Platform Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} e-Voting Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: `"e-Voting Platform" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: '✉️ Email Verification OTP - e-Voting Platform',
      html: htmlContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
