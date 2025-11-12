# Email Service Setup Guide

## Current Issue: EHOSTUNREACH Error

The `EHOSTUNREACH` error means the server cannot connect to Gmail's SMTP server. This can happen due to:

1. **Network/Firewall blocking port 465**
2. **ISP blocking SMTP connections**
3. **Gmail security settings**
4. **Incorrect credentials**

---

## Development Mode (Quick Fix)

For **development/testing**, you can disable email and use console logging:

### In `.env` file:
```env
EMAIL_ENABLED=false
```

When disabled:
- ✅ OTP codes are logged to the server console
- ✅ Password reset links are logged to the server console
- ✅ Application works without email service
- ✅ Perfect for development and testing

### Console Output Example:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL VERIFICATION (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 To: student@example.com
🔑 OTP Code: 123456
⏰ Expires in: 10 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Production Mode (Email Enabled)

### Step 1: Enable Gmail App Password

1. Go to Google Account Settings
2. Security → 2-Step Verification (enable it)
3. Security → App passwords
4. Generate new app password for "Mail"
5. Copy the 16-character password

### Step 2: Update `.env` file:
```env
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASSWORD="your-16-char-app-password"
EMAIL_ENABLED=true
```

### Step 3: Allow Less Secure Apps (if needed)
- Go to: https://myaccount.google.com/lesssecureapps
- Turn ON "Allow less secure apps"

### Step 4: Network Configuration

**If still getting EHOSTUNREACH:**

1. **Check Firewall:**
   ```bash
   # Windows Firewall - allow port 465
   netsh advfirewall firewall add rule name="SMTP" dir=out action=allow protocol=TCP localport=465
   ```

2. **Try Alternative Port (587 - TLS):**
   
   Update `emailService.js`:
   ```javascript
   return nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     secure: false, // true for 465, false for 587
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASSWORD,
     },
   });
   ```

3. **VPN/Proxy:**
   - If behind corporate network/VPN, email might be blocked
   - Try disabling VPN temporarily

4. **ISP Blocking:**
   - Some ISPs block outgoing SMTP (port 465/587)
   - Contact ISP or use alternative service

---

## Alternative Email Services

### Using Outlook/Hotmail:
```javascript
return nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### Using SendGrid (Recommended for Production):
```bash
npm install @sendgrid/mail
```

```javascript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'recipient@example.com',
  from: 'verified-sender@yourdomain.com',
  subject: 'Subject',
  html: '<p>Content</p>',
};

await sgMail.send(msg);
```

---

## Testing Email Service

### Test Command (with email enabled):
```bash
cd server
node -e "
const { sendEmailVerification } = require('./src/utils/emailService.js');
sendEmailVerification('test@example.com', '123456', 'Test User')
  .then(() => console.log('✅ Email sent'))
  .catch(err => console.error('❌ Error:', err));
"
```

---

## Troubleshooting Checklist

- [ ] Environment variables set correctly in `.env`
- [ ] Using Gmail App Password (not regular password)
- [ ] 2-Step Verification enabled in Google Account
- [ ] Port 465 or 587 not blocked by firewall
- [ ] Not behind corporate VPN/proxy
- [ ] "Less secure apps" enabled (if applicable)
- [ ] Correct email format in EMAIL_USER

---

## Current Configuration

**Development Mode (Recommended):**
```env
EMAIL_ENABLED=false  # Emails logged to console
```

**Production Mode:**
```env
EMAIL_ENABLED=true   # Emails sent via Gmail
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

---

## Support

If you continue to face issues:

1. **Use Development Mode** (`EMAIL_ENABLED=false`) for testing
2. **Check server console** for OTP codes and reset links
3. **Consider SendGrid** or similar service for production
4. **Contact your network administrator** if behind corporate network
