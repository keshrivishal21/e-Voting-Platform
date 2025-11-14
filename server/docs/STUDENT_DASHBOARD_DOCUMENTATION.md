# Student Dashboard Documentation

## Overview
The Student Dashboard provides students with a secure, user-friendly interface to participate in elections, view candidates, cast votes, check results, and manage their profiles.

---

## 1. Dashboard Home

### Features:

#### **📊 Personal Statistics**
- **Elections Participated**: Count of elections you've voted in
- **Active Elections**: Ongoing elections you can vote in now
- **Upcoming Elections**: Future elections to watch
- **Completed Elections**: Past elections with results

#### **🗳️ Quick Vote Access**
- Direct "Vote Now" buttons for ongoing elections
- Time remaining indicator for each active election
- One-click navigation to voting interface

#### **📣 Recent Notifications**
- Last 3 system notifications
- Election announcements
- Result declarations
- Important updates from admin
- Truncated preview with ellipsis (single-line)

#### **🔔 Notification Center**
- View all notifications
- Timestamp for each notification
- Read/unread status tracking

#### **📈 Voting History Widget**
- Quick overview of your voting record
- Elections participated in
- Vote confirmation receipts
- Timestamps

---

## 2. Elections Page

### Purpose:
Browse and learn about all available elections.

### Features:

#### **Election Categories**

##### **🟢 Ongoing Elections**
- Elections currently accepting votes
- Real-time countdown timer
- "Vote Now" button (if not voted)
- "Already Voted" indicator (if voted)
- Number of positions available
- Candidate count per election

##### **🔵 Upcoming Elections**
- Elections scheduled for future
- Start date and time
- Position structure preview
- Expected candidate list
- "Remind Me" option

##### **⚫ Completed Elections**
- Past elections
- Final vote count (if results declared)
- "View Results" button
- Your participation status

#### **Election Details Card**
For each election:
- **Title**: Election name
- **Status**: Ongoing/Upcoming/Completed badge
- **Duration**: Start → End dates
- **Positions**: List of positions to vote for
- **Candidates**: Total approved candidates
- **Your Status**: Voted ✅ / Not Voted ⏳

#### **Filtering & Search**
- Filter by status
- Search by election title
- Sort by date (newest/oldest)
- View only elections you can vote in

---

## 3. Cast Vote (Voting Interface)

### Purpose:
Secure, user-friendly voting experience with end-to-end encryption.

### Features:

#### **🔐 Secure Voting Process**

##### **Step 1: OTP Verification**
- Enter your registered email
- Receive 6-digit OTP via email
- OTP valid for 10 minutes
- Email verification ensures security
- Prevents vote manipulation

##### **Step 2: OTP Input & Verification**
- Enter received OTP code
- Real-time validation
- Resend OTP option if not received
- Clear error messages for invalid OTP

##### **Step 3: Ballot Display**
- Grouped by position (President, VP, etc.)
- One vote per position required
- Candidate cards showing:
  - Profile picture
  - Name and academic details
  - Branch, Year, CGPA
  - Manifesto preview
  - "View Manifesto" button

##### **Step 4: Vote Selection**
- Radio button selection per position
- Visual feedback on selection
- Can change selection before submission
- Must select candidate for ALL positions

##### **Step 5: Vote Submission**
- **Encryption**: Vote encrypted with RSA before sending
- **Confirmation Dialog**: Review your selections
- **Submit Vote**: Send encrypted vote to server
- **Receipt Generation**: Unique receipt hash created

#### **Vote Confirmation**
After successful submission:
- ✅ Vote recorded successfully message
- **Vote Receipt**: Unique cryptographic receipt
- **Receipt Details**:
  - Vote ID
  - Receipt Token (SHA-256 hash)
  - Timestamp
  - Position-wise receipt breakdown
- **Download Receipt**: Save as proof
- **Print Option**: Physical copy for records

#### **Security Measures**
- **One Vote Per Election**: Cannot vote twice
- **Encrypted Transmission**: RSA encryption
- **Anonymous Voting**: Vote not linked to your identity after encryption
- **Tamper-Proof**: Cryptographic hashing prevents alterations
- **Audit Trail**: Receipt allows vote verification without revealing choice

#### **Voting Rules**
- Must vote for ALL positions in the election
- Cannot skip any position
- Cannot vote for multiple candidates per position
- Vote is final once submitted (no changes allowed)

---

## 4. Candidate List

### Purpose:
Explore all candidates and their campaign information.

### Features:

#### **Candidate Directory**
- View all approved candidates
- Filter by election
- Filter by position
- Search by candidate name

#### **Candidate Cards**
Each card displays:
- **Profile Picture**: Candidate photo
- **Name & Position**: What they're running for
- **Academic Info**: Branch, Year, CGPA
- **Election**: Which election they're contesting
- **"View Details" Button**: Always visible

#### **Candidate Details Modal**
Comprehensive information:
- **Personal Info**:
  - Full name
  - Email (for campaign queries)
  - Phone number
- **Academic Credentials**:
  - Branch of study
  - Current year
  - CGPA (eligibility proof)
- **Campaign Information**:
  - Full manifesto
  - Campaign promises
  - Vision and goals
  - Why vote for them
- **Documents**:
  - Academic marksheet viewer
  - Eligibility documents

#### **Manifesto Display**
- Full-text manifesto in modal
- Formatted for easy reading
- Fallback message if no manifesto
- Scrollable for long content

#### **Comparison Feature**
- View multiple candidates side-by-side
- Compare manifestos
- Compare academic credentials
- Make informed decisions

---

## 5. Results Page

### Purpose:
View transparent, detailed election results after declaration.

### Features:

#### **Results Availability**
- Only shown after admin declares results
- "Results not declared yet" message for pending elections
- Real-time updates when results are published

#### **Election Results Display**

##### **Overview Section**
- Election title
- Total votes cast
- Voter turnout percentage
- Number of positions
- Declaration timestamp

##### **Results by Position**
Organized by each position:
- **Winner Card** (🏆):
  - Green border and styling
  - "WINNER" badge
  - Candidate name and details
  - Vote count and percentage
  - Profile picture
  
- **Other Candidates**:
  - Vote count
  - Vote percentage
  - Visual progress bar
  - Ranking (#2, #3, etc.)

##### **Visual Representation**
- **Progress Bars**: 
  - Winners have green gradient bars
  - Others have standard bars
  - Proportional to vote percentage
- **Vote Count**: Clear numeric display
- **Percentage**: Calculated relative to position votes

#### **Winners Summary Panel**
- Grid layout showing all winners
- One winner per position
- Quick overview of election outcome
- Position-wise champion display

#### **Detailed Analytics**
- Total votes by position
- Voting distribution charts
- Turnout statistics
- Historical comparison (if available)

#### **Download & Share**
- Download results as PDF
- Share results link
- Print-friendly format

---

## 6. Profile Management

### Purpose:
Manage your personal information and account security.

### Features:

#### **Profile Information Display**
- **Personal Details**:
  - Full name
  - Scholar number (unique ID)
  - Email address
  - Phone number
  - Date of birth
  
- **Academic Information**:
  - Branch of study
  - Current year
  - CGPA
  - Admission year

- **Account Details**:
  - Registration date
  - Last login
  - Account status

#### **Profile Picture**
- View current profile picture
- Upload new picture
- Crop and resize
- Max size: 2MB
- Supported formats: JPG, JPEG, PNG

#### **Edit Profile**
Editable fields:
- Phone number
- Date of birth
- Profile picture

Read-only fields (cannot edit):
- Name (from registration)
- Scholar number
- Email (used for login)
- Branch, Year, CGPA (academic records)

#### **Change Password**
Secure password update:
- **Current Password**: Verify identity
- **New Password**: Minimum 6 characters
- **Confirm Password**: Must match
- Validations:
  - No whitespace allowed
  - Password strength indicator
  - Cannot be same as current password

#### **Security Features**
- Password hashed with bcrypt
- Old password verification required
- Session refresh after password change
- Email notification on password change

#### **Success/Error Messages**
- Toast notifications for actions
- Real-time validation feedback
- Clear error descriptions
- Success confirmation

---

## 7. Notifications

### Purpose:
Stay updated with all platform activities and announcements.

### Features:

#### **Notification Types**
- **Election Announcements**:
  - New election created
  - Election started
  - Election ending soon
  - Results declared
  
- **System Updates**:
  - Platform maintenance
  - Feature updates
  - Important announcements
  
- **Personal Alerts**:
  - Vote confirmation
  - Profile updates
  - Password changes

#### **Notification Display**
- Reverse chronological order (newest first)
- Message content
- Timestamp
- Sender (Admin/System)
- Read/unread indicator

#### **Notification Management**
- Mark as read
- Mark all as read
- Delete notification
- Filter by type
- Search notifications

#### **Real-time Updates**
- Instant notification delivery
- Browser notifications (if enabled)
- Sound alerts (optional)
- Badge count on notification icon

---

## Student User Journey

### First-Time Student
1. **Register**:
   - Visit student signup page
   - Provide scholar number, email, details
   - Verify email with OTP
   - Account created

2. **Login**:
   - Enter email and password
   - Redirected to dashboard

3. **Explore**:
   - View ongoing elections
   - Browse candidates
   - Read manifestos

4. **Vote**:
   - Select election
   - Verify with OTP
   - Choose candidates
   - Submit encrypted vote
   - Receive receipt

5. **Check Results**:
   - Wait for declaration
   - View detailed results
   - See winners

### Returning Student
1. Login → Dashboard shows voting status
2. Instant access to ongoing elections
3. View notification updates
4. Check new results
5. Update profile as needed

---

## Security & Privacy

### Vote Security
- **Encryption**: RSA encryption for votes
- **Anonymity**: Vote detached from identity
- **One Vote Rule**: Strictly enforced
- **Audit Trail**: Receipt for verification
- **Tamper-Proof**: Cryptographic protection

### Account Security
- **Password Protection**: Bcrypt hashing
- **Session Management**: JWT tokens
- **Email Verification**: OTP-based auth
- **Forgot Password**: Secure reset flow
- **No Vote History**: Cannot see who you voted for (ensures privacy)

### Privacy
- Personal data protected
- No vote choice disclosure
- Minimal data collection
- GDPR-compliant practices

---

## Mobile Experience

### Responsive Design
- Fully mobile-optimized
- Touch-friendly buttons
- Optimized for small screens
- Smooth animations

### Mobile Features
- Swipe gestures
- Pull-to-refresh
- Mobile-optimized forms
- Quick vote from home screen

---

## Troubleshooting

### Common Issues

**Can't receive OTP:**
- Check spam/junk folder
- Verify email address is correct
- Use "Resend OTP" button
- Check console logs (displayed if email fails)

**Already voted:**
- Each student can vote once per election
- Receipt proves your vote was counted
- Cannot change vote after submission

**Can't see results:**
- Results shown only after admin declares
- Check "Completed Elections" section
- Refresh page if recently declared

**Profile update fails:**
- Check all required fields are filled
- Verify file size (images < 2MB)
- Ensure valid data format
- Try again after refreshing

---

## Best Practices

### For Voting
- Read all candidate manifestos before voting
- Vote during off-peak hours for faster processing
- Save your receipt immediately
- Don't share your OTP with anyone

### For Account Security
- Use strong, unique password
- Don't share login credentials
- Log out from shared computers
- Update profile information regularly

### For Platform Usage
- Check notifications daily
- Participate in all elections
- Provide feedback to admin
- Report any issues promptly

---

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Compatible**: ARIA labels
- **High Contrast Mode**: For visual impairment
- **Text Scaling**: Adjustable font sizes
- **Clear Feedback**: Toast messages, visual indicators

---

## Conclusion

The Student Dashboard empowers you to participate in democratic elections securely and conveniently. With features like encrypted voting, detailed candidate information, and transparent result viewing, you have everything needed for an informed and secure voting experience.
