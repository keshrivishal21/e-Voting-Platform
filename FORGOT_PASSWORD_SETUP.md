# Forgot Password Feature Setup Guide

## Overview
This feature allows users (students and candidates) to reset their passwords via email when they forget them.

## Setup Instructions

### 1. Email Configuration

#### For Gmail Users:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" - enter "e-Voting Platform"
   - Click "Generate"
   - Copy the 16-character password (without spaces)

3. **Update your `.env` file**:
```env
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASSWORD="your-16-char-app-password"
FRONTEND_URL="http://localhost:5173"
```

#### For Other Email Providers:

Update the `emailService.js` file to use your provider's SMTP settings:

**Outlook/Hotmail:**
```javascript
service: 'hotmail'
```

**Yahoo:**
```javascript
service: 'yahoo'
```

**Custom SMTP:**
```javascript
host: 'smtp.example.com',
port: 587,
secure: false, // true for 465, false for other ports
```

### 2. Database Migration

The password reset fields have been added to the database schema:
- `Reset_token` - Stores the hashed reset token
- `Reset_token_expiry` - Stores when the token expires (1 hour)

Migration already applied: `20251022072152_add_password_reset_fields`

### 3. Testing the Feature

#### As a User:

1. **Request Password Reset**:
   - Go to Student/Candidate login page
   - Click "Forgot your password?"
   - Enter your registered email
   - Click "Send Reset Link"

2. **Check Email**:
   - Check your inbox (and spam folder)
   - Click the reset link in the email
   - Link is valid for 1 hour

3. **Reset Password**:
   - Enter new password (minimum 6 characters)
   - Confirm new password
   - Click "Reset Password"
   - You'll be redirected to login with success message

4. **Login**:
   - Use your new password to login

#### Security Features:

✅ Passwords cannot contain whitespace
✅ Reset tokens are hashed before storing in database
✅ Tokens expire after 1 hour
✅ Email doesn't reveal if account exists (security best practice)
✅ Confirmation email sent after successful reset
✅ Tokens are single-use (cleared after successful reset)

### 4. API Endpoints

**Request Password Reset:**
- `POST /api/auth/student/forgot-password`
- `POST /api/auth/candidate/forgot-password`
- Body: `{ "email": "user@example.com" }`

**Reset Password:**
- `POST /api/auth/student/reset-password`
- `POST /api/auth/candidate/reset-password`
- Body: `{ "token": "reset-token", "newPassword": "newpass123" }`

### 5. Email Templates

The feature includes beautiful HTML email templates:

1. **Password Reset Request Email**:
   - Branded with gradient colors
   - Clear reset button
   - Link expires in 1 hour warning
   - Security tips

2. **Password Reset Confirmation Email**:
   - Confirms successful password change
   - Security recommendations
   - Contact support info

### 6. Frontend Routes

- `/forgot-password` - Request password reset
- `/reset-password?token=xxx&type=student` - Reset password page

### 7. Troubleshooting

**Email not sending?**
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Verify app password is correct (no spaces)
- Check if 2FA is enabled on Google account
- Look at server console for error messages

**Token expired?**
- Request a new reset link
- Tokens expire after 1 hour

**Email in spam folder?**
- This is common for development
- Production: Use proper email domain and SPF records

### 8. Production Considerations

For production deployment:

1. **Use a professional email service**:
   - SendGrid
   - Amazon SES
   - Mailgun
   - Twilio SendGrid

2. **Environment Variables**:
   - Never commit real credentials to Git
   - Use secure environment variable management
   - Update FRONTEND_URL to your production domain

3. **Email Deliverability**:
   - Set up SPF, DKIM, and DMARC records
   - Use a verified domain
   - Implement email verification
   - Monitor bounce rates

4. **Rate Limiting**:
   - Add rate limiting to prevent abuse
   - Limit reset requests per email per hour

5. **Logging**:
   - Log all password reset attempts
   - Monitor for suspicious activity

## File Structure

```
server/
├── src/
│   ├── controllers/
│   │   └── authController.js (forgot password functions)
│   ├── routes/
│   │   └── authRoutes.js (forgot password routes)
│   └── utils/
│       └── emailService.js (email sending logic)
├── prisma/
│   ├── schema.prisma (updated with reset fields)
│   └── migrations/
│       └── 20251022072152_add_password_reset_fields/
└── .env (email configuration)

client/
├── src/
│   ├── pages/
│   │   └── Auth/
│   │       ├── ForgotPassword.jsx
│   │       ├── ResetPassword.jsx
│   │       ├── StudentLogin.jsx (updated)
│   │       └── CandidateLogin.jsx (updated)
│   ├── utils/
│   │   └── authAPI.js (forgot password API methods)
│   └── App.jsx (routes added)
```

## Support

If you encounter any issues:
1. Check server console for error messages
2. Verify email configuration
3. Ensure database migration ran successfully
4. Test with a real email address

---

✨ **Feature Complete!** Users can now securely reset their passwords via email.
