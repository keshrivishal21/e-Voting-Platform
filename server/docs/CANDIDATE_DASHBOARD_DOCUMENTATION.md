# Candidate Dashboard Documentation

## Overview
The Candidate Dashboard is designed for students who have registered as candidates in elections. It provides tools to manage campaigns, track performance, view manifesto, monitor votes, and communicate with the admin.

---

## 1. Dashboard Home

### Features:

#### **📊 Candidate Profile Card**
- **Profile Picture**: Your campaign photo
- **Name**: Full name
- **Position**: Position you're contesting for
- **Election**: Name of the election
- **Status**: Application status badge
  - 🟡 **Pending**: Awaiting admin approval
  - 🟢 **Approved**: Eligible to contest
  - 🔴 **Rejected**: Application declined (with reason)

#### **📈 Election-Specific Statistics**
Stats are scoped to YOUR election only:

- **Total Votes in Election**: 
  - Overall votes cast in your election
  - Updated in real-time during voting
  
- **Voter Turnout**:
  - Percentage of students who voted
  - Helps gauge election participation
  
- **Total Candidates**:
  - Number of candidates in your election
  - Broken down by position
  
- **Positions Available**:
  - All positions in the election
  - Shows competition landscape

#### **🏆 Personal Campaign Statistics**
- **Your Vote Count**: Number of votes received (shown after results declared)
- **Your Ranking**: Position among candidates for your role
- **Vote Percentage**: Your share of votes for your position

#### **🔔 Recent Notifications**
- Last 3 notifications relevant to you
- Single-line preview with ellipsis
- Notifications include:
  - Application status updates
  - Election schedule changes
  - Result declarations
  - Admin messages

#### **⚡ Quick Actions**
- Edit Manifesto
- View Live Votes (during election)
- View Full Campaign Overview
- Update Profile

---

## 2. Campaign Overview

### Purpose:
Comprehensive view of your campaign performance and election details.

### Features:

#### **Election Information**
- **Election Title**: Name of the election
- **Election Status**: Upcoming/Ongoing/Completed
- **Start Date**: When voting begins
- **End Date**: When voting closes
- **Time Remaining**: Countdown for ongoing elections
- **Auto-Declare**: Whether results will be auto-declared

#### **Your Campaign Details**
- **Position**: Role you're contesting for
- **Application Date**: When you registered
- **Approval Status**: Current status of your application
- **Approval Date**: When admin approved (if approved)
- **Rejection Reason**: Detailed explanation (if rejected)

#### **Performance Metrics**
Available during and after election:

##### **During Election (Ongoing)**
- Current vote count (if visible)
- Estimated ranking
- Voter turnout percentage
- Competition analysis

##### **After Election (Results Declared)**
- **Final Vote Count**: Total votes received
- **Vote Percentage**: Your share of position votes
- **Ranking**: Where you placed
- **Winner Status**: Did you win? 🏆
- **Vote Breakdown**: Detailed analytics

#### **Competition Analysis**
- Number of candidates for your position
- Position-wise candidate distribution
- Historical comparison (if available)

#### **Campaign Timeline**
- Registration date
- Approval/Rejection date
- Election start date
- Election end date
- Result declaration date

---

## 3. Live Votes

### Purpose:
Real-time monitoring of vote progress during ongoing elections (if admin enables this feature).

### Features:

#### **⚡ Real-Time Vote Tracking**
- Live vote count updates
- Position-wise vote distribution
- Overall election progress

#### **📊 Vote Statistics**
- **Total Votes Cast**: Overall votes in election
- **Votes for Your Position**: Votes cast for your role
- **Your Current Count**: Your vote count (if visible)
- **Voter Turnout**: Percentage participation

#### **📈 Visual Analytics**
- **Progress Bars**: Vote distribution visualization
- **Pie Charts**: Position-wise voting breakdown
- **Line Graphs**: Voting trends over time
- **Comparison View**: You vs other candidates (if enabled)

#### **🔄 Auto-Refresh**
- Updates every 30 seconds
- Real-time data synchronization
- No manual refresh needed
- Live status indicators

#### **Note**: 
*Live vote visibility depends on admin configuration. Some elections may hide live counts to prevent vote manipulation.*

---

## 4. Manifesto Management

### Purpose:
Create, view, and update your campaign manifesto - your vision statement to voters.

### Features:

#### **Manifesto Display**
- **Full Text View**: Your complete campaign statement
- **Rich Text Formatting**: Formatted for readability
- **Character Count**: Track manifesto length
- **Last Updated**: Timestamp of last edit

#### **Manifesto Editor**
- **Text Area**: Large input field for manifesto
- **Edit Mode**: Toggle to edit existing manifesto
- **Preview Mode**: See how voters will view it
- **Auto-Save Draft**: Prevents data loss

#### **Manifesto Content Guidelines**
What to include:
- Your vision for the position
- Campaign promises
- Why students should vote for you
- Your qualifications and achievements
- Plans for improvement
- Contact information for queries

#### **Best Practices**
- Keep it concise (500-1000 words recommended)
- Use bullet points for key promises
- Be specific and realistic
- Highlight your unique qualities
- Proofread before saving

#### **Manifesto Visibility**
- Visible to all students
- Shown in candidate list
- Displayed in voting interface
- Helps voters make informed decisions

#### **Edit Restrictions**
- Can edit anytime before election ends
- Cannot edit during ongoing voting (frozen)
- Can update after election for future reference

---

## 5. Profile Management

### Purpose:
Manage your candidate profile information and account settings.

### Features:

#### **Profile Information Display**
- **Personal Details**:
  - Full name
  - Email address
  - Phone number
  
- **Academic Information**:
  - Branch of study
  - Current year
  - CGPA (eligibility requirement)
  
- **Election Details**:
  - Election contesting
  - Position applied for
  - Application status

- **Campaign Information**:
  - Manifesto preview
  - Profile picture
  - Contact details

#### **Editable Profile Fields**
You can update:
- **Phone Number**: For campaign communications
- **Manifesto**: Your campaign statement

Cannot edit (locked after registration):
- Name
- Email (login credential)
- Branch, Year, CGPA (verified academic data)
- Position (cannot change after applying)
- Election (cannot switch elections)

#### **Profile Picture**
- Upload professional photo
- Max size: 2MB
- Formats: JPG, JPEG, PNG
- Used in candidate listings and voting interface
- Helps voters identify you

#### **Change Password**
Secure password management:
- **Current Password**: Verification required
- **New Password**: 
  - Minimum 6 characters
  - No whitespace allowed
  - Must differ from current password
- **Confirm Password**: Must match new password

#### **Password Security**
- Bcrypt encryption
- Session refresh after change
- Email notification on password update
- Logout from other devices option

#### **Profile Completion**
- Profile completion percentage
- Missing fields highlighted
- Complete profile gets better visibility
- Improves credibility with voters

---

## 6. Campaign Strategy Tools

### Features:

#### **Voter Engagement Insights**
- Demographics of voters (if available)
- Popular candidate traits
- Voting patterns analysis

#### **Communication Tools**
- Email address for campaign queries
- Phone number for direct contact
- Social media integration (optional)

#### **Performance Tracking**
- Campaign milestones
- Voter feedback
- Manifesto views
- Profile visits

---

## Candidate Application Status Flow

### 1. Pending Status 🟡
**What it means:**
- Application submitted successfully
- Awaiting admin review
- Documents under verification

**What you can do:**
- Wait for admin approval (typically 24-48 hours)
- Check notifications regularly
- Update manifesto
- Complete profile

**What you cannot do:**
- Vote in the election you're contesting
- Change position or election
- See vote counts

---

### 2. Approved Status 🟢
**What it means:**
- Admin verified your documents
- You're officially a candidate
- Visible to all students
- Eligible to receive votes

**What you can do:**
- Update manifesto anytime before election
- Monitor campaign statistics
- View live votes (if enabled)
- Engage with voters
- Update profile picture and details

**What you cannot do:**
- Vote in your own election
- Withdraw application after election starts

---

### 3. Rejected Status 🔴
**What it means:**
- Application did not meet criteria
- Admin provided rejection reason
- Not eligible for this election

**What you see:**
- Detailed rejection reason from admin
- Feedback for improvement
- Option to apply for future elections

**What you can do:**
- Read rejection reason carefully
- Apply for future elections
- Contact admin for clarification (via feedback)
- Improve qualifications for next time

**Common rejection reasons:**
- Insufficient CGPA
- Incomplete documents
- Duplicate application
- Ineligibility for position
- Document verification failed

---

## Candidate Workflow Examples

### Successful Campaign Journey
1. **Register as Candidate**:
   - Login as student
   - Go to "Register as Candidate"
   - Fill application form
   - Upload marksheet
   - Submit manifesto
   
2. **Await Approval**:
   - Status: Pending
   - Admin reviews application
   - Documents verified
   - Status changes to Approved
   
3. **Campaign Phase**:
   - Update manifesto
   - Monitor statistics
   - Engage with voters
   - Check notifications
   
4. **Election Day**:
   - Monitor live votes (if available)
   - Track voter turnout
   - Cannot vote yourself
   
5. **Results**:
   - Wait for admin declaration
   - View your vote count
   - Check if you won
   - See detailed analytics

### Handling Rejection
1. **Receive Rejection**:
   - Notification received
   - Status changes to Rejected
   - Reason displayed on dashboard
   
2. **Understand Reason**:
   - Read admin feedback
   - Identify areas for improvement
   
3. **Improve & Retry**:
   - Work on qualifications
   - Improve CGPA if needed
   - Gather proper documents
   - Apply for next election

---

## Notifications You'll Receive

### Application Stage
- "Application submitted successfully"
- "Application approved - You're now a candidate!"
- "Application rejected - See reason on dashboard"

### Election Stage
- "Election is now live - Voting has started"
- "Election ends in 24 hours"
- "Election has ended - Results pending"

### Results Stage
- "Results have been declared"
- "Congratulations! You won the election!" 🎉
- "Election results are now available"

### System Updates
- Profile update confirmations
- Password change alerts
- Manifesto update confirmations

---

## Best Practices for Candidates

### For Application Success
- Upload clear, legible documents
- Ensure CGPA meets requirements
- Write a compelling manifesto
- Complete all profile fields
- Use professional profile picture

### For Campaigning
- Update manifesto early
- Make it student-focused
- Be honest and realistic
- Highlight your achievements
- Show commitment to the role

### For Profile Management
- Keep contact info updated
- Respond to voter queries
- Maintain professional image
- Regular profile checks
- Update manifesto based on feedback

### For Election Day
- Don't constantly refresh live votes
- Stay positive regardless of interim results
- Focus on post-election plans
- Prepare for any outcome
- Respect the democratic process

---

## Security & Privacy

### Account Security
- Password encryption with bcrypt
- JWT token authentication
- Session management
- Email verification

### Campaign Integrity
- Cannot vote in your own election
- Vote counts are tamper-proof
- Admin audit trails
- Transparent result declaration

### Data Privacy
- Personal info protected
- Contact details only for campaign use
- GDPR-compliant data handling
- Right to data deletion (after election)

---

## Mobile Experience

### Responsive Dashboard
- Optimized for mobile devices
- Touch-friendly interface
- Quick access to key stats
- Fast loading times

### Mobile Features
- Push notifications
- Quick manifesto editing
- Profile picture upload from camera
- Real-time vote updates

---

## Troubleshooting

### Common Issues

**Application stuck in Pending:**
- Admin may need more time
- Typically reviewed within 48 hours
- Check notifications for updates
- Contact admin via feedback if > 3 days

**Cannot edit manifesto:**
- Manifesto frozen during active voting
- Can edit before and after election
- Save drafts frequently

**Wrong statistics showing:**
- Refresh dashboard
- Statistics are election-specific
- Check you're viewing correct election

**Profile update fails:**
- Check editable vs locked fields
- Verify file size for images
- Ensure valid phone number format
- Try after refreshing page

---

## Support & Help

### Get Help
- Submit feedback to admin
- Check notification for updates
- Review documentation
- Contact admin via email (shown in dashboard)

### Report Issues
- Use feedback system
- Describe issue clearly
- Include screenshots if possible
- Provide timestamps

---

## Conclusion

The Candidate Dashboard equips you with all the tools needed to run an effective campaign, monitor your performance, and engage with voters. Whether you're applying, campaigning, or checking results, everything you need is at your fingertips.

Good luck with your campaign! 🎓🗳️
