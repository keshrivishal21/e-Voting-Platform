# Admin Dashboard Documentation

## Overview
The Admin Dashboard is the central control panel for managing the entire e-Voting platform. Administrators have complete oversight of elections, candidates, students, and system activities.

---

## 1. Dashboard Home (Overview)

### Features:

#### **📊 Statistics Cards**
- **Total Students**: Real-time count of registered students
- **Active Elections**: Number of currently ongoing elections
- **Pending Candidates**: Candidates awaiting approval
- **Feedback Count**: Total feedback submissions received

#### **📈 Data Visualizations**
1. **Election Status Distribution (Pie Chart)**
   - Visual breakdown of Upcoming, Ongoing, and Completed elections
   - Interactive hover tooltips showing exact counts
   
2. **Voting Trends (Bar Chart)**
   - Vote participation trends across different elections
   - Helps identify voter engagement patterns

#### **🔔 Recent Activity Feed**
- Real-time log of system activities
- Shows last 8 activities including:
  - Student registrations
  - Candidate approvals/rejections
  - Election status changes
  - Vote submissions
- Each activity includes timestamp and type

#### **➕ Quick Actions**
- **Create New Election** button with instant modal access

---

## 2. Create Election

### Purpose:
Set up new elections with customizable parameters and positions.

### Features:

#### **Election Configuration**
- **Title**: Election name (e.g., "Student Council Election 2025")
- **Start Date & Time**: When voting begins
- **End Date & Time**: When voting ends
- **Auto-Declare Results**: Toggle to automatically declare results when election ends

#### **Dynamic Position Management**
- Add custom positions (President, Vice President, Secretary, etc.)
- Remove positions with one click
- Supports unlimited positions per election
- Each election can have different position structures

#### **Validations**
- Start date cannot be in the past
- End date must be after start date
- At least one position required
- Duplicate position names prevented

#### **Smart Scheduling**
- Automatic status transitions (Upcoming → Ongoing → Completed)
- System scheduler handles election lifecycle
- Optional auto-declaration of results on completion

### Workflow:
1. Click "Create New Election"
2. Fill in election details
3. Add positions dynamically
4. Configure auto-declare option
5. Submit → Election created with "Upcoming" status

---

## 3. Election Control

### Purpose:
Monitor and manage all elections throughout their lifecycle.

### Features:

#### **Election Listing**
- View all elections (Upcoming, Ongoing, Completed)
- Filter by status
- Search by election title
- Sortable columns

#### **Election Details Panel**
For each election, view:
- **Basic Info**: Title, dates, status, creator
- **Candidate Statistics**:
  - Total candidates
  - Approved/Pending/Rejected counts
  - Breakdown by position
- **Voting Statistics**:
  - Total votes cast
  - Unique voters
  - Votes by position
  - Vote distribution by candidate
- **Result Status**: Whether results are declared

#### **Election Management Actions**

##### **For Upcoming Elections:**
- ✅ **Start Election Early**: Manually begin voting before scheduled time
- 🗑️ **Delete Election**: Remove if created by mistake

##### **For Ongoing Elections:**
- 🛑 **End Election**: Manually close voting
- 📊 View real-time voting progress

##### **For Completed Elections:**
- 🏆 **Declare Results**: 
  - View all candidates with vote counts
  - Sorted by position and votes
  - Winners automatically highlighted
  - Handle tie-breaking scenarios
  - Confirm and publish results
- 📈 **View Declared Results**:
  - Winner badges (🏆 WINNER)
  - Vote percentages
  - Progress bars showing vote distribution
  - Winners Summary section showing top candidate per position

#### **Results Display**
Once declared:
- Green "WINNER" badges for top candidates
- Detailed vote counts and percentages
- Visual progress bars
- Winners summary grid by position
- Complete transparency of vote tallies

---

## 4. Candidate Management

### Purpose:
Review, approve, or reject candidate applications with complete transparency.

### Features:

#### **Candidate List View**
- **All Candidates Tab**: Complete list of applicants
- **Pending Approval Tab**: Candidates awaiting review
- **Approved Tab**: Accepted candidates
- **Rejected Tab**: Declined applications with reasons

#### **Candidate Information Display**
For each candidate:
- Name, Email, Phone
- Election contesting
- Position applied for
- Academic details (Branch, Year, CGPA)
- Application status
- Submission timestamp

#### **Review Actions**

##### **Approve Candidate**
- One-click approval
- Candidate immediately eligible for election
- Automatic notification sent to candidate
- Updates candidate status to "Approved"

##### **Reject Candidate**
- Provide detailed rejection reason
- Transparent feedback to candidate
- Rejection reason saved in database
- Notification sent with explanation

#### **Document Verification**
- **View Marksheet**: Opens candidate's uploaded academic document
- Supports PDF, images (JPG, PNG)
- Full-screen document viewer
- Download option available

#### **Candidate Details Modal**
Comprehensive view including:
- Profile picture
- Complete academic profile
- Manifesto (campaign statement)
- All uploaded documents
- Application timeline

#### **Filtering & Search**
- Filter by status (Pending/Approved/Rejected)
- Search by name or election
- Sort by submission date

---

## 5. Student Management

### Purpose:
Manage and monitor all registered students in the platform.

### Features:

#### **Student Directory**
- Complete list of all registered students
- Scholar Number (unique identifier)
- Name, Email, Contact
- Academic details (Branch, Year, CGPA)
- Registration status

#### **Student Profile View**
- Personal information
- Academic records
- Voting history
- Account creation date

#### **Student Statistics**
- Total registered students
- Students by branch
- Students by year
- Active vs inactive accounts

#### **Search & Filter**
- Search by name, email, or scholar number
- Filter by branch
- Filter by year
- Sort by registration date or CGPA

#### **Voting History**
For each student:
- Elections participated in
- Vote timestamp
- Receipt verification

---

## 6. Feedback Management

### Purpose:
Review, approve, and manage user feedback for public testimonials.

### Features:

#### **Feedback Dashboard**
- View all submitted feedback
- Sender name and role (Student/Candidate)
- Feedback message
- Submission date
- Status (Pending/Approved)

#### **Feedback Moderation**

##### **Approve Feedback**
- Make feedback public (visible on homepage testimonials)
- One-click approval
- Approved feedback shown to all users

##### **Delete Feedback**
- Remove inappropriate or spam feedback
- Permanent deletion
- No trace in public view

#### **Feedback Display**
- Tabular view with sortable columns
- Status indicators
- Action buttons per feedback
- Timestamp tracking

#### **Approved Feedback Usage**
- Automatically appears on public homepage
- Used in testimonials section
- Builds trust with future users

---

## 7. Notifications System

### Purpose:
Send system-wide or targeted announcements to users.

### Features:

#### **Send Notifications**
- **Recipient Selection**:
  - All Users (Students + Candidates)
  - Students Only
  - Candidates Only
- **Message Composition**: Rich text message field
- **Instant Delivery**: Real-time push to selected audience

#### **Notification History**
- View all sent notifications
- Recipient count per notification
- Timestamp of sending
- Message content preview

#### **Automatic Notifications**
System auto-sends notifications for:
- Election created
- Election started
- Election ended
- Results declared
- Candidate approval/rejection

#### **Notification Dashboard**
- Total notifications sent
- Recent notifications list
- Delivery status tracking

---

## Technical Features

### Security
- **Admin Authentication**: JWT-based secure login
- **Role-Based Access**: Admin-only routes
- **Action Logging**: All admin actions tracked in system logs
- **Data Validation**: Server-side validation for all inputs

### Performance
- **Lazy Loading**: Components loaded on demand
- **Caching**: Dashboard stats cached for performance
- **Optimized Queries**: Efficient database queries with pagination
- **Real-time Updates**: Automatic data refresh on actions

### User Experience
- **Responsive Design**: Works on desktop, tablet, mobile
- **Toast Notifications**: Instant feedback for all actions
- **Loading States**: Clear loading indicators
- **Error Handling**: User-friendly error messages
- **Confirmation Dialogs**: Prevents accidental actions

### Data Management
- **Export Capabilities**: Download reports (CSV/PDF)
- **Bulk Actions**: Process multiple items at once
- **Undo Functionality**: For reversible actions
- **Audit Trail**: Complete history of all changes

---

## Admin Workflow Examples

### Creating an Election
1. Navigate to Dashboard Home
2. Click "Create New Election"
3. Enter election title
4. Set start and end dates
5. Add positions (President, VP, etc.)
6. Toggle auto-declare if desired
7. Submit → Election created

### Approving a Candidate
1. Go to Candidate Management
2. Click "Pending Approval" tab
3. Review candidate details
4. Verify uploaded documents
5. Click "Approve" → Candidate eligible to contest

### Declaring Results
1. Go to Election Control
2. Select completed election
3. Click "Declare Results"
4. Review vote counts by position
5. Confirm declaration → Results published

### Managing Feedback
1. Go to Feedback Management
2. Review submitted feedback
3. Approve quality feedback for testimonials
4. Delete spam or inappropriate feedback

---

## Best Practices

### Election Management
- Create elections at least 2-3 days in advance
- Enable auto-declare for standard elections
- Manually declare if ties need resolution
- Keep election duration reasonable (minimum 24 hours recommended)

### Candidate Review
- Review candidates within 24-48 hours
- Provide clear rejection reasons
- Verify academic documents thoroughly
- Approve candidates well before election starts

### Communication
- Send notifications for major updates
- Keep messages clear and concise
- Use appropriate recipient targeting
- Avoid notification spam

### Data Integrity
- Regularly review system logs
- Monitor for unusual activity
- Keep student records updated
- Archive old election data periodically

---

## Troubleshooting

### Common Issues

**Election won't start:**
- Verify start date is set correctly
- Check no candidates are approved yet
- Ensure system time is synchronized

**Results can't be declared:**
- Confirm election status is "Completed"
- Verify votes have been cast
- Check for any system errors in logs

**Candidate approval fails:**
- Verify candidate meets eligibility
- Check for duplicate applications
- Ensure election hasn't started yet

---

## Support & Maintenance

### System Health
- Dashboard shows system status
- Monitor active users
- Track election progress
- Review error logs

### Backup & Recovery
- Regular database backups
- Election data preserved after completion
- Audit logs retained for compliance

---

## Conclusion

The Admin Dashboard provides comprehensive control over the entire e-Voting platform, ensuring smooth election operations, candidate management, and user engagement while maintaining security and transparency throughout the process.
