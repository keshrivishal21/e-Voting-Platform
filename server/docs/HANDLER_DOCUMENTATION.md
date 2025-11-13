# Handler Documentation: Prisma Functions with MySQL Equivalents

## Table of Contents
1. [Authentication Controller](#authentication-controller)
2. [Vote Controller](#vote-controller)
3. [Election Controller](#election-controller)
4. [Candidate Controller](#candidate-controller)
5. [Student Controller](#student-controller)
6. [Feedback Controller](#feedback-controller)
7. [Notification Controller](#notification-controller)
8. [Dashboard Controller](#dashboard-controller)
9. [Common Prisma Patterns](#common-prisma-patterns)

---

## Authentication Controller

### 📄 File: `server/src/controllers/authController.js`

### Purpose
Manages authentication, registration, profile management, and password operations for all user types (Admin, Student, Candidate).

---

### 1. Admin Login

**Function:** `adminLogin(req, res)`

**Purpose:** Authenticates admin users and issues JWT token

**Prisma Code:**
```javascript
const admin = await prisma.aDMIN.findFirst({
  where: { Admin_email: userId },
});
```

**MySQL Equivalent:**
```sql
SELECT Admin_id, Admin_email, Admin_name, Admin_phone, Admin_password
FROM ADMIN
WHERE Admin_email = ?
LIMIT 1;
```

**Business Logic:**
1. Validates input (userId, password)
2. Finds admin by email
3. Compares plain-text password (⚠️ should use bcrypt)
4. Generates JWT token with admin ID and "Admin" role
5. Returns token + admin profile

**Request:**
```json
POST /api/auth/admin/login
{
  "userId": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "email": "admin@example.com",
      "name": "Admin Name",
      "phone": "1234567890",
      "userType": "Admin"
    }
  }
}
```

---

### 2. Student Login

**Function:** `studentLogin(req, res)`

**Purpose:** Authenticates student users

**Prisma Code:**
```javascript
const student = await prisma.sTUDENT.findFirst({
  where: { Std_email: email },
});
```

**MySQL Equivalent:**
```sql
SELECT Std_id, Std_name, Std_email, Std_password, Std_phone, Std_address, Course, Year
FROM STUDENT
WHERE Std_email = ?
LIMIT 1;
```

**Business Logic:**
1. Validates email and password
2. Finds student by email
3. Uses bcrypt to compare hashed password
4. Generates JWT with student ID and "Student" role
5. Returns token + student profile

**Password Comparison:**
```javascript
const isPasswordValid = await bcrypt.compare(password, student.Std_password);
```

**MySQL Note:**
```sql
-- MySQL doesn't have bcrypt built-in
-- Password comparison done in application layer:
-- bcrypt.compare(inputPassword, hashedPasswordFromDB)
```

---

### 3. Student Registration (Two-Step Process)

**Function:** `studentRegister(req, res)`

**Purpose:** Registers new student (requires OTP verification)

**Step 1: Store Pending Registration**
```javascript
// No Prisma query yet - stored in memory
storePendingRegistration(email, registrationData);
```

**Step 2: Send OTP Email**
```javascript
await sendEmailVerification(email, name, otp);
```

**Business Logic:**
1. Validates all input fields (name, email, password, phone, address, course, year)
2. Checks if email already exists in STUDENT table
3. Hashes password with bcrypt
4. Generates 6-digit OTP
5. Stores registration data temporarily (in-memory Map)
6. Sends OTP to email
7. Returns pending status (requires OTP verification)

**Prisma Code (Email Check):**
```javascript
const existingStudent = await prisma.sTUDENT.findFirst({
  where: { Std_email: email },
});
```

**MySQL Equivalent:**
```sql
SELECT Std_id 
FROM STUDENT 
WHERE Std_email = ? 
LIMIT 1;
```

**Password Hashing:**
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

**MySQL Note:**
```sql
-- No direct MySQL equivalent for bcrypt
-- Use application-level hashing before INSERT
```

---

### 4. Verify OTP (Completes Registration)

**Function:** `verifyOTP(req, res)`

**Purpose:** Verifies OTP and creates student account

**Prisma Code:**
```javascript
const newStudent = await prisma.sTUDENT.create({
  data: {
    Std_name: pendingData.name,
    Std_email: pendingData.email,
    Std_password: pendingData.password, // Already hashed
    Std_phone: pendingData.phone,
    Std_address: pendingData.address,
    Course: pendingData.course,
    Year: pendingData.year,
  },
});
```

**MySQL Equivalent:**
```sql
INSERT INTO STUDENT 
  (Std_name, Std_email, Std_password, Std_phone, Std_address, Course, Year)
VALUES 
  (?, ?, ?, ?, ?, ?, ?);

-- Get the auto-generated Std_id
SELECT LAST_INSERT_ID() as Std_id;
```

**Business Logic:**
1. Retrieves pending registration from memory
2. Validates OTP (6-digit code, 10-minute expiry)
3. Creates STUDENT record in database
4. Generates JWT token
5. Removes pending registration from memory
6. Returns token + student profile

---

### 5. Candidate Registration

**Function:** `candidateRegister(req, res)`

**Purpose:** Registers candidate (linked to existing student)

**Prisma Code:**
```javascript
// Step 1: Verify student exists
const student = await prisma.sTUDENT.findUnique({
  where: { Std_id: parseInt(studentId) },
});

// Step 2: Check if already candidate
const existingCandidate = await prisma.cANDIDATE.findFirst({
  where: { Std_id: parseInt(studentId) },
});

// Step 3: Check election exists
const election = await prisma.eLECTION.findUnique({
  where: { Election_id: parseInt(electionId) },
});

// Step 4: Check position valid for election
const electionPositions = JSON.parse(election.Positions || '[]');
if (!electionPositions.includes(position)) {
  return error;
}

// Step 5: Check if already registered for this position
const existingForPosition = await prisma.cANDIDATE.findFirst({
  where: {
    Std_id: parseInt(studentId),
    Election_id: parseInt(electionId),
    Position: position,
  },
});

// Step 6: Create candidate record
const newCandidate = await prisma.cANDIDATE.create({
  data: {
    Std_id: parseInt(studentId),
    Can_name: student.Std_name,
    Can_email: student.Std_email,
    Can_phone: student.Std_phone,
    Position: position,
    Election_id: parseInt(electionId),
    Can_img: imagePath,
    Can_doc: documentPath,
    Status: "Pending",
  },
});
```

**MySQL Equivalent:**
```sql
-- Step 1: Verify student
SELECT Std_id, Std_name, Std_email, Std_phone 
FROM STUDENT 
WHERE Std_id = ?;

-- Step 2: Check existing candidate
SELECT Can_id 
FROM CANDIDATE 
WHERE Std_id = ?
LIMIT 1;

-- Step 3: Check election
SELECT Election_id, Positions, Status 
FROM ELECTION 
WHERE Election_id = ?;

-- Step 4: Position validation (application logic)

-- Step 5: Check duplicate position
SELECT Can_id 
FROM CANDIDATE 
WHERE Std_id = ? 
  AND Election_id = ? 
  AND Position = ?
LIMIT 1;

-- Step 6: Create candidate
INSERT INTO CANDIDATE 
  (Std_id, Can_name, Can_email, Can_phone, Position, Election_id, Can_img, Can_doc, Status)
VALUES 
  (?, ?, ?, ?, ?, ?, ?, ?, 'Pending');
```

**Business Logic:**
1. Validates student ID, position, election ID
2. Checks student exists
3. Verifies not already a candidate
4. Validates election exists and is Upcoming
5. Checks position is valid for this election
6. Prevents duplicate candidacy for same position
7. Handles file uploads (image + document)
8. Creates CANDIDATE record with "Pending" status
9. Sends notification to admin

**File Upload:**
```javascript
// Uses multer middleware
req.files.image[0] // Candidate photo
req.files.document[0] // Supporting document (ID, certificate)
```

---

### 6. Candidate Login

**Function:** `candidateLogin(req, res)`

**Purpose:** Authenticates candidate users

**Prisma Code:**
```javascript
const candidate = await prisma.cANDIDATE.findFirst({
  where: { Can_email: email },
  include: {
    student: {
      select: {
        Std_password: true,
      },
    },
  },
});
```

**MySQL Equivalent:**
```sql
SELECT 
  c.Can_id, c.Can_name, c.Can_email, c.Can_phone, c.Position, c.Status, c.Can_img,
  s.Std_password
FROM CANDIDATE c
INNER JOIN STUDENT s ON c.Std_id = s.Std_id
WHERE c.Can_email = ?
LIMIT 1;
```

**Business Logic:**
1. Finds candidate by email
2. Includes related student data (for password)
3. Verifies password using bcrypt
4. Checks candidate status (must be "Approved")
5. Generates JWT with candidate ID and "Candidate" role
6. Returns token + candidate profile

**Status Check:**
```javascript
if (candidate.Status !== "Approved") {
  return res.status(403).json({
    success: false,
    message: "Your candidacy has not been approved yet",
    status: candidate.Status,
  });
}
```

---

### 7. Get Student Profile

**Function:** `getStudentProfile(req, res)`

**Purpose:** Retrieves full student profile

**Prisma Code:**
```javascript
const student = await prisma.sTUDENT.findUnique({
  where: { Std_id: studentId },
  select: {
    Std_id: true,
    Std_name: true,
    Std_email: true,
    Std_phone: true,
    Std_address: true,
    Course: true,
    Year: true,
  },
});
```

**MySQL Equivalent:**
```sql
SELECT 
  Std_id, Std_name, Std_email, Std_phone, Std_address, Course, Year
FROM STUDENT
WHERE Std_id = ?;
```

**Business Logic:**
1. Extracts student ID from JWT token (middleware)
2. Fetches student data (excludes password)
3. Returns profile

---

### 8. Update Student Profile

**Function:** `updateStudentProfile(req, res)`

**Purpose:** Updates student information

**Prisma Code:**
```javascript
const updatedStudent = await prisma.sTUDENT.update({
  where: { Std_id: studentId },
  data: {
    Std_name: name,
    Std_phone: phone,
    Std_address: address,
    Course: course,
    Year: year,
  },
  select: {
    Std_id: true,
    Std_name: true,
    Std_email: true,
    Std_phone: true,
    Std_address: true,
    Course: true,
    Year: true,
  },
});
```

**MySQL Equivalent:**
```sql
UPDATE STUDENT
SET 
  Std_name = ?,
  Std_phone = ?,
  Std_address = ?,
  Course = ?,
  Year = ?
WHERE Std_id = ?;

-- Then SELECT to return updated data
SELECT Std_id, Std_name, Std_email, Std_phone, Std_address, Course, Year
FROM STUDENT
WHERE Std_id = ?;
```

**Business Logic:**
1. Validates input fields
2. Checks phone number format (10 digits)
3. Validates year (1-4)
4. Updates student record
5. Returns updated profile (excludes password)

---

### 9. Change Student Password

**Function:** `changeStudentPassword(req, res)`

**Purpose:** Changes student password

**Prisma Code:**
```javascript
// Step 1: Get current password
const student = await prisma.sTUDENT.findUnique({
  where: { Std_id: studentId },
  select: { Std_password: true },
});

// Step 2: Update with new password
const updatedStudent = await prisma.sTUDENT.update({
  where: { Std_id: studentId },
  data: { Std_password: hashedPassword },
});
```

**MySQL Equivalent:**
```sql
-- Step 1: Get current password
SELECT Std_password 
FROM STUDENT 
WHERE Std_id = ?;

-- Application verifies old password with bcrypt

-- Step 2: Update password
UPDATE STUDENT
SET Std_password = ?
WHERE Std_id = ?;
```

**Business Logic:**
1. Validates current password with bcrypt
2. Validates new password (min 6 characters)
3. Ensures new password different from old
4. Hashes new password with bcrypt
5. Updates STUDENT record
6. Returns success message

---

### 10. Request Password Reset (Student)

**Function:** `requestStudentPasswordReset(req, res)`

**Purpose:** Initiates password reset flow

**Prisma Code:**
```javascript
const student = await prisma.sTUDENT.findFirst({
  where: { Std_email: email },
});

const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

await prisma.sTUDENT.update({
  where: { Std_id: student.Std_id },
  data: {
    Reset_token: resetToken,
    Reset_token_expiry: resetTokenExpiry,
  },
});
```

**MySQL Equivalent:**
```sql
-- Find student
SELECT Std_id, Std_name, Std_email 
FROM STUDENT 
WHERE Std_email = ?;

-- Generate token in application (crypto.randomBytes)

-- Update with reset token
UPDATE STUDENT
SET 
  Reset_token = ?,
  Reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR)
WHERE Std_id = ?;
```

**Business Logic:**
1. Validates email exists
2. Generates secure random token (32 bytes)
3. Sets expiry time (1 hour from now)
4. Stores token and expiry in STUDENT record
5. Sends password reset email with link
6. Returns success message

**Email Link Format:**
```
http://localhost:5173/reset-password?token={resetToken}&type=student
```

---

### 11. Reset Password (Student)

**Function:** `resetStudentPassword(req, res)`

**Purpose:** Completes password reset with token

**Prisma Code:**
```javascript
const student = await prisma.sTUDENT.findFirst({
  where: {
    Reset_token: token,
    Reset_token_expiry: {
      gte: new Date(), // Token not expired
    },
  },
});

await prisma.sTUDENT.update({
  where: { Std_id: student.Std_id },
  data: {
    Std_password: hashedPassword,
    Reset_token: null,
    Reset_token_expiry: null,
  },
});
```

**MySQL Equivalent:**
```sql
-- Find student with valid token
SELECT Std_id, Std_name, Std_email 
FROM STUDENT 
WHERE Reset_token = ? 
  AND Reset_token_expiry >= NOW()
LIMIT 1;

-- Update password and clear token
UPDATE STUDENT
SET 
  Std_password = ?,
  Reset_token = NULL,
  Reset_token_expiry = NULL
WHERE Std_id = ?;
```

**Business Logic:**
1. Validates reset token exists
2. Checks token not expired (within 1 hour)
3. Hashes new password
4. Updates password
5. Clears reset token and expiry
6. Sends confirmation email
7. Returns success

---

## Vote Controller

### 📄 File: `server/src/controllers/voteController.js`

### Purpose
Handles the entire voting process with RSA encryption, OTP verification, and ballot management.

---

### 1. Get Election Public Key

**Function:** `getElectionPublicKey(req, res)`

**Purpose:** Provides RSA public key for vote encryption

**Prisma Code:**
```javascript
const election = await prisma.eLECTION.findUnique({
  where: { Election_id: electionIdInt }
});
```

**MySQL Equivalent:**
```sql
SELECT Election_id, Title, Status, Start_date, End_date
FROM ELECTION
WHERE Election_id = ?;
```

**Business Logic:**
1. Validates election exists
2. Checks election status is "Ongoing"
3. Verifies current time is within election period
4. Generates or retrieves RSA key pair (2048-bit)
5. Returns public key for client-side encryption

**Key Generation:**
```javascript
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});
```

**Note:** Keys stored in memory Map (in production, use secure key management system)

---

### 2. Request OTP for Voting

**Function:** `requestVotingOTP(req, res)`

**Purpose:** Sends OTP to student for vote verification

**Prisma Code:**
```javascript
// Verify student
const student = await prisma.sTUDENT.findUnique({
  where: { Std_id: studentId }
});

// Verify election
const election = await prisma.eLECTION.findUnique({
  where: { Election_id: electionId }
});

// Check if already voted
const existingVote = await prisma.vOTE.findFirst({
  where: {
    Std_id: studentId,
    Election_id: electionId
  }
});
```

**MySQL Equivalent:**
```sql
-- Verify student
SELECT Std_id, Std_name, Std_email 
FROM STUDENT 
WHERE Std_id = ?;

-- Verify election
SELECT Election_id, Title, Status, Start_date, End_date
FROM ELECTION
WHERE Election_id = ?;

-- Check existing vote
SELECT Vote_id 
FROM VOTE 
WHERE Std_id = ? AND Election_id = ?
LIMIT 1;
```

**Business Logic:**
1. Validates student and election exist
2. Checks election is "Ongoing"
3. Verifies student hasn't already voted
4. Generates 6-digit OTP
5. Stores OTP in memory (5-minute expiry)
6. Sends OTP to student's email
7. Returns success message

**OTP Generation:**
```javascript
const otp = Math.floor(100000 + Math.random() * 900000).toString();
const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes

otpStore.set(`${studentId}-${electionId}`, {
  otp,
  expiryTime,
  verified: false
});
```

---

### 3. Verify OTP

**Function:** `verifyVotingOTP(req, res)`

**Purpose:** Validates OTP before allowing vote

**Prisma Code:**
```javascript
// No Prisma query - OTP stored in memory
```

**Business Logic:**
1. Retrieves OTP from memory store
2. Checks OTP not expired (5 minutes)
3. Validates OTP matches input
4. Marks OTP as verified
5. Returns success (student can now vote)

**Verification Logic:**
```javascript
const storedData = otpStore.get(`${studentId}-${electionId}`);

if (!storedData) {
  return res.status(400).json({ message: 'No OTP request found' });
}

if (Date.now() > storedData.expiryTime) {
  otpStore.delete(`${studentId}-${electionId}`);
  return res.status(400).json({ message: 'OTP expired' });
}

if (storedData.otp !== otp) {
  return res.status(400).json({ message: 'Invalid OTP' });
}

storedData.verified = true;
```

---

### 4. Get Ballot

**Function:** `getBallot(req, res)`

**Purpose:** Returns all candidates for an election (grouped by position)

**Prisma Code:**
```javascript
const election = await prisma.eLECTION.findUnique({
  where: { Election_id: electionId }
});

const candidates = await prisma.cANDIDATE.findMany({
  where: {
    Election_id: electionId,
    Status: 'Approved'
  },
  select: {
    Can_id: true,
    Can_name: true,
    Position: true,
    Can_img: true
  }
});
```

**MySQL Equivalent:**
```sql
-- Get election
SELECT Election_id, Title, Positions, Status
FROM ELECTION
WHERE Election_id = ?;

-- Get approved candidates
SELECT Can_id, Can_name, Position, Can_img
FROM CANDIDATE
WHERE Election_id = ? 
  AND Status = 'Approved'
ORDER BY Position, Can_name;
```

**Business Logic:**
1. Verifies election exists and is "Ongoing"
2. Checks OTP verified for this student+election
3. Fetches all approved candidates
4. Groups candidates by position
5. Returns structured ballot data

**Response Format:**
```json
{
  "election": {
    "id": 1,
    "title": "Student Council 2025",
    "positions": ["President", "Vice President", "Secretary"]
  },
  "candidates": {
    "President": [
      {
        "id": "1",
        "name": "Alice Smith",
        "position": "President",
        "image": "/uploads/candidates/alice.jpg"
      }
    ],
    "Vice President": [...]
  }
}
```

---

### 5. Cast Vote (Encrypted)

**Function:** `castVote(req, res)`

**Purpose:** Records encrypted votes in database

**Prisma Code:**
```javascript
// Verify election
const election = await prisma.eLECTION.findUnique({
  where: { Election_id: electionId }
});

// Check already voted
const existingVote = await prisma.vOTE.findFirst({
  where: {
    Std_id: studentId,
    Election_id: electionId
  }
});

// Verify candidates exist and approved
const candidate = await prisma.cANDIDATE.findFirst({
  where: {
    Can_id: candidateId,
    Election_id: electionId,
    Status: 'Approved'
  }
});

// Create vote records in transaction
await prisma.$transaction(async (tx) => {
  for (const vote of votes) {
    await tx.vOTE.create({
      data: {
        Std_id: studentId,
        Can_id: vote.candidateId,
        Election_id: electionId
      }
    });
  }
});
```

**MySQL Equivalent:**
```sql
-- Verify election
SELECT Election_id, Status, End_date 
FROM ELECTION 
WHERE Election_id = ?;

-- Check existing vote
SELECT Vote_id 
FROM VOTE 
WHERE Std_id = ? AND Election_id = ?
LIMIT 1;

-- Verify each candidate
SELECT Can_id, Status 
FROM CANDIDATE 
WHERE Can_id = ? AND Election_id = ? AND Status = 'Approved';

-- Insert votes (in transaction)
START TRANSACTION;

INSERT INTO VOTE (Std_id, Can_id, Election_id)
VALUES (?, ?, ?);

INSERT INTO VOTE (Std_id, Can_id, Election_id)
VALUES (?, ?, ?);

-- ... more votes ...

COMMIT;
```

**Business Logic:**
1. Verifies OTP was verified
2. Checks election is "Ongoing"
3. Ensures student hasn't voted
4. Decrypts vote data using private RSA key
5. Validates all candidates approved
6. Creates VOTE records in transaction
7. Clears OTP from memory
8. Returns success

**Decryption:**
```javascript
const privateKey = electionKeys.get(electionId)?.privateKey;

const decryptedData = crypto.privateDecrypt(
  {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  Buffer.from(encryptedVote, 'base64')
);

const votes = JSON.parse(decryptedData.toString('utf8'));
```

**Vote Format (Decrypted):**
```json
[
  {
    "position": "President",
    "candidateId": 1
  },
  {
    "position": "Vice President",
    "candidateId": 5
  }
]
```

---

## Election Controller

### 📄 File: `server/src/controllers/electionController.js`

### Purpose
Manages election lifecycle: create, start, end, results, and statistics.

---

### 1. Create Election

**Function:** `createElection(req, res)`

**Purpose:** Creates new election

**Prisma Code:**
```javascript
const election = await prisma.eLECTION.create({
  data: {
    Title: title,
    Start_date: start,
    End_date: end,
    Status: "Upcoming",
    Created_by: adminId,
    Auto_declare_results: autoDeclareResults !== undefined ? autoDeclareResults : true,
    Positions: JSON.stringify(positions), // Store as JSON
  },
});

// Trigger scheduler to recalculate
await triggerSchedulerCheck();
```

**MySQL Equivalent:**
```sql
INSERT INTO ELECTION 
  (Title, Start_date, End_date, Status, Created_by, Auto_declare_results, Positions)
VALUES 
  (?, ?, ?, 'Upcoming', ?, ?, ?);

SELECT LAST_INSERT_ID() as Election_id;
```

**Business Logic:**
1. Validates title, startDate, endDate, positions
2. Checks start date not in past
3. Ensures end date after start date
4. Validates duration (max 30 days)
5. Verifies admin exists
6. Stores positions as JSON array
7. Creates ELECTION with "Upcoming" status
8. Triggers scheduler to calculate next run
9. Sends notification to all users

**Positions Format:**
```json
["President", "Vice President", "Secretary", "Treasurer"]
```

---

### 2. Start Election (Manual)

**Function:** `startElection(req, res)`

**Purpose:** Manually starts an election

**Prisma Code:**
```javascript
const election = await prisma.eLECTION.findUnique({
  where: { Election_id: electionId },
});

const updatedElection = await prisma.eLECTION.update({
  where: { Election_id: electionId },
  data: { Status: "Ongoing" },
});

await triggerSchedulerCheck();
```

**MySQL Equivalent:**
```sql
-- Find election
SELECT Election_id, Title, Status, Start_date, End_date
FROM ELECTION
WHERE Election_id = ?;

-- Update to Ongoing
UPDATE ELECTION
SET Status = 'Ongoing'
WHERE Election_id = ?;
```

**Business Logic:**
1. Verifies election exists
2. Checks current status is "Upcoming"
3. Validates current time >= start date
4. Updates status to "Ongoing"
5. Sends notification to all users
6. Triggers scheduler recalculation

---

### 3. End Election (Manual)

**Function:** `endElection(req, res)`

**Purpose:** Manually ends an ongoing election

**Prisma Code:**
```javascript
const election = await prisma.eLECTION.findUnique({
  where: { Election_id: electionId },
});

const updatedElection = await prisma.eLECTION.update({
  where: { Election_id: electionId },
  data: { Status: "Completed" },
});

await triggerSchedulerCheck();
```

**MySQL Equivalent:**
```sql
-- Find election
SELECT Election_id, Title, Status, End_date
FROM ELECTION
WHERE Election_id = ?;

-- Update to Completed
UPDATE ELECTION
SET Status = 'Completed'
WHERE Election_id = ?;
```

**Business Logic:**
1. Verifies election exists
2. Checks status is "Ongoing"
3. Updates status to "Completed"
4. Sends notification
5. Triggers scheduler

---

### 4. Get All Elections

**Function:** `getElections(req, res)`

**Purpose:** Lists all elections (with optional filtering)

**Prisma Code:**
```javascript
const elections = await prisma.eLECTION.findMany({
  orderBy: { Election_id: "desc" }, // Newest first
});
```

**MySQL Equivalent:**
```sql
SELECT 
  Election_id, Title, Start_date, End_date, Status, Auto_declare_results, Positions
FROM ELECTION
ORDER BY Election_id DESC;
```

**Business Logic:**
1. Fetches all elections
2. Orders by Election_id descending
3. Parses Positions JSON for each election
4. Returns array

---

### 5. Get Election Statistics

**Function:** `getElectionStats(req, res)`

**Purpose:** Returns comprehensive election statistics

**Prisma Code:**
```javascript
const election = await prisma.eLECTION.findUnique({
  where: { Election_id: electionId },
});

const totalStudents = await prisma.sTUDENT.count();

const totalVoters = await prisma.vOTE.findMany({
  where: { Election_id: electionId },
  distinct: ['Std_id'],
});

const candidates = await prisma.cANDIDATE.findMany({
  where: { Election_id: electionId },
});
```

**MySQL Equivalent:**
```sql
-- Get election
SELECT Election_id, Title, Status, Start_date, End_date, Positions
FROM ELECTION
WHERE Election_id = ?;

-- Total students
SELECT COUNT(*) as total_students 
FROM STUDENT;

-- Total voters (unique)
SELECT COUNT(DISTINCT Std_id) as total_voters
FROM VOTE
WHERE Election_id = ?;

-- Candidate counts by status
SELECT Status, COUNT(*) as count
FROM CANDIDATE
WHERE Election_id = ?
GROUP BY Status;
```

**Business Logic:**
1. Gets election details
2. Counts total students
3. Counts unique voters
4. Calculates turnout percentage
5. Groups candidates by status (Pending, Approved, Rejected)
6. Groups candidates by position
7. Returns comprehensive stats

**Response:**
```json
{
  "election": {
    "id": 1,
    "title": "Student Council 2025",
    "status": "Ongoing"
  },
  "participation": {
    "totalStudents": 500,
    "totalVoters": 350,
    "turnoutPercentage": 70
  },
  "candidates": {
    "total": 15,
    "byStatus": {
      "Approved": 12,
      "Pending": 2,
      "Rejected": 1
    },
    "byPosition": {
      "President": 4,
      "Vice President": 5,
      "Secretary": 3
    }
  }
}
```

---

### 6. Declare Results (Manual)

**Function:** `declareResults(req, res)`

**Purpose:** Calculates and declares election results

**Prisma Code:**
```javascript
const election = await prisma.eLECTION.findUnique({
  where: { Election_id: electionId },
});

// Count votes per candidate
const votes = await prisma.vOTE.findMany({
  where: { Election_id: electionId },
  select: {
    Can_id: true,
    candidate: {
      select: {
        Can_id: true,
        Can_name: true,
        Position: true,
        Status: true
      }
    }
  }
});

// Create/update results in transaction
await prisma.$transaction(async (tx) => {
  for (const [candidateId, voteCount] of voteCounts) {
    await tx.rESULT.upsert({
      where: {
        Election_id_Can_id: {
          Election_id: electionId,
          Can_id: candidateId
        }
      },
      update: {
        Vote_count: voteCount
      },
      create: {
        Can_id: candidateId,
        Election_id: electionId,
        Vote_count: voteCount,
        Admin_id: adminId
      }
    });
  }
});
```

**MySQL Equivalent:**
```sql
-- Get election
SELECT Election_id, Title, Status 
FROM ELECTION 
WHERE Election_id = ?;

-- Count votes per candidate
SELECT 
  Can_id, 
  COUNT(*) as vote_count
FROM VOTE
WHERE Election_id = ?
GROUP BY Can_id;

-- Insert/update results (for each candidate)
INSERT INTO RESULT (Can_id, Election_id, Vote_count, Admin_id)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  Vote_count = VALUES(Vote_count);
```

**Business Logic:**
1. Verifies election is "Completed"
2. Fetches all votes for election
3. Counts votes per candidate using Map
4. Groups candidates by position
5. Checks for ties (same vote count for top 2)
6. If tie detected: Returns error (admin must decide)
7. If no ties: Creates/updates RESULT records
8. Sends notification to all users
9. Returns success with results

**Tie Detection:**
```javascript
// For each position
candidatesByPosition.forEach((candidates, position) => {
  const sorted = Array.from(candidates).sort((a, b) => b.votes - a.votes);
  
  // Check if top 2 have same votes
  if (sorted.length >= 2 && sorted[0].votes === sorted[1].votes && sorted[0].votes > 0) {
    hasTie = true;
    tieDetails.push({
      position: position,
      votes: sorted[0].votes,
      candidates: [sorted[0].name, sorted[1].name]
    });
  }
});
```

---

### 7. Get Election Results

**Function:** `getElectionResults(req, res)`

**Purpose:** Retrieves declared results

**Prisma Code:**
```javascript
const election = await prisma.eLECTION.findUnique({
  where: { Election_id: electionId },
});

const results = await prisma.rESULT.findMany({
  where: { Election_id: electionId },
  include: {
    candidate: {
      select: {
        Can_id: true,
        Can_name: true,
        Position: true,
        Can_img: true
      }
    }
  },
  orderBy: {
    Vote_count: 'desc'
  }
});
```

**MySQL Equivalent:**
```sql
-- Get election
SELECT Election_id, Title, Status 
FROM ELECTION 
WHERE Election_id = ?;

-- Get results with candidate info
SELECT 
  r.Result_id,
  r.Can_id,
  r.Election_id,
  r.Vote_count,
  c.Can_name,
  c.Position,
  c.Can_img
FROM RESULT r
INNER JOIN CANDIDATE c ON r.Can_id = c.Can_id
WHERE r.Election_id = ?
ORDER BY r.Vote_count DESC;
```

**Business Logic:**
1. Checks election exists
2. Verifies results declared (RESULT records exist)
3. Fetches all results with candidate info
4. Groups results by position
5. Calculates total votes
6. Returns structured results

---

## Candidate Controller

### 📄 File: `server/src/controllers/candidateController.js`

### Purpose
Admin approval/rejection of candidate applications.

---

### 1. Get All Candidates

**Prisma Code:**
```javascript
const candidates = await prisma.cANDIDATE.findMany({
  include: {
    election: {
      select: {
        Title: true,
        Status: true
      }
    }
  },
  orderBy: { Can_id: 'desc' }
});
```

**MySQL Equivalent:**
```sql
SELECT 
  c.Can_id, c.Can_name, c.Can_email, c.Can_phone, c.Position, c.Status, 
  c.Can_img, c.Can_doc, c.Election_id,
  e.Title as election_title, e.Status as election_status
FROM CANDIDATE c
LEFT JOIN ELECTION e ON c.Election_id = e.Election_id
ORDER BY c.Can_id DESC;
```

---

### 2. Approve Candidate

**Prisma Code:**
```javascript
const candidate = await prisma.cANDIDATE.findUnique({
  where: { Can_id: candidateId },
});

const updated = await prisma.cANDIDATE.update({
  where: { Can_id: candidateId },
  data: { Status: 'Approved' }
});
```

**MySQL Equivalent:**
```sql
SELECT Can_id, Status FROM CANDIDATE WHERE Can_id = ?;

UPDATE CANDIDATE
SET Status = 'Approved'
WHERE Can_id = ?;
```

---

### 3. Reject Candidate

**Prisma Code:**
```javascript
const updated = await prisma.cANDIDATE.update({
  where: { Can_id: candidateId },
  data: { Status: 'Rejected' }
});
```

**MySQL Equivalent:**
```sql
UPDATE CANDIDATE
SET Status = 'Rejected'
WHERE Can_id = ?;
```

---

## Student Controller

### 📄 File: `server/src/controllers/studentController.js`

### Purpose
Student management and voting history.

---

### 1. Get All Students

**Prisma Code:**
```javascript
const students = await prisma.sTUDENT.findMany({
  select: {
    Std_id: true,
    Std_name: true,
    Std_email: true,
    Std_phone: true,
    Course: true,
    Year: true,
  },
  orderBy: { Std_id: 'desc' }
});
```

**MySQL Equivalent:**
```sql
SELECT Std_id, Std_name, Std_email, Std_phone, Course, Year
FROM STUDENT
ORDER BY Std_id DESC;
```

---

### 2. Get Student Voting History

**Function:** `getStudentVotingHistory(req, res)`

**Prisma Code:**
```javascript
const votedElections = await prisma.vOTE.findMany({
  where: { Std_id: studentId },
  distinct: ['Election_id'],
  select: {
    Election_id: true,
    election: {
      select: {
        Title: true,
        Start_date: true,
        End_date: true,
        Status: true
      }
    }
  }
});
```

**MySQL Equivalent:**
```sql
SELECT DISTINCT
  v.Election_id,
  e.Title,
  e.Start_date,
  e.End_date,
  e.Status
FROM VOTE v
INNER JOIN ELECTION e ON v.Election_id = e.Election_id
WHERE v.Std_id = ?
ORDER BY v.Election_id DESC;
```

---

## Feedback Controller

### 📄 File: `server/src/controllers/feedbackController.js`

### Purpose
Manages user feedback submission and moderation.

---

### 1. Submit Feedback

**Prisma Code:**
```javascript
const feedback = await prisma.fEEDBACK.create({
  data: {
    Std_id: studentId,
    Feedback_text: feedbackText,
    Status: 'Pending'
  }
});
```

**MySQL Equivalent:**
```sql
INSERT INTO FEEDBACK (Std_id, Feedback_text, Status, Feedback_date)
VALUES (?, ?, 'Pending', NOW());
```

---

### 2. Approve Feedback

**Prisma Code:**
```javascript
const feedback = await prisma.fEEDBACK.update({
  where: { Feedback_id: feedbackId },
  data: { Status: 'Approved' }
});
```

**MySQL Equivalent:**
```sql
UPDATE FEEDBACK
SET Status = 'Approved'
WHERE Feedback_id = ?;
```

---

### 3. Get Public Feedbacks

**Prisma Code:**
```javascript
const feedbacks = await prisma.fEEDBACK.findMany({
  where: { Status: 'Approved' },
  include: {
    student: {
      select: {
        Std_name: true,
        Course: true
      }
    }
  },
  orderBy: { Feedback_date: 'desc' }
});
```

**MySQL Equivalent:**
```sql
SELECT 
  f.Feedback_id, f.Feedback_text, f.Feedback_date,
  s.Std_name, s.Course
FROM FEEDBACK f
INNER JOIN STUDENT s ON f.Std_id = s.Std_id
WHERE f.Status = 'Approved'
ORDER BY f.Feedback_date DESC;
```

---

## Notification Controller

### 📄 File: `server/src/controllers/notificationController.js`

### Purpose
System-wide and targeted notifications.

---

### 1. Send Notification

**Prisma Code:**
```javascript
const notification = await prisma.nOTIFICATION.create({
  data: {
    Title: title,
    Description: description,
    Recipient_type: recipientType, // 'All', 'Student', 'Candidate'
    Created_by: adminId
  }
});
```

**MySQL Equivalent:**
```sql
INSERT INTO NOTIFICATION 
  (Title, Description, Recipient_type, Created_at, Created_by)
VALUES 
  (?, ?, ?, NOW(), ?);
```

---

### 2. Get User Notifications

**Prisma Code:**
```javascript
// For students
const notifications = await prisma.nOTIFICATION.findMany({
  where: {
    OR: [
      { Recipient_type: 'All' },
      { Recipient_type: 'Student' }
    ]
  },
  orderBy: { Created_at: 'desc' }
});
```

**MySQL Equivalent:**
```sql
SELECT 
  Notification_id, Title, Description, Created_at
FROM NOTIFICATION
WHERE Recipient_type IN ('All', 'Student')
ORDER BY Created_at DESC;
```

---

## Dashboard Controller

### 📄 File: `server/src/controllers/dashboardController.js`

### Purpose
Aggregates statistics for admin dashboard.

---

### 1. Get Dashboard Stats

**Prisma Code:**
```javascript
const totalStudents = await prisma.sTUDENT.count();
const totalCandidates = await prisma.cANDIDATE.count();
const totalElections = await prisma.eLECTION.count();

const ongoingElections = await prisma.eLECTION.count({
  where: { Status: 'Ongoing' }
});

const upcomingElections = await prisma.eLECTION.count({
  where: { Status: 'Upcoming' }
});

const completedElections = await prisma.eLECTION.count({
  where: { Status: 'Completed' }
});

const pendingCandidates = await prisma.cANDIDATE.count({
  where: { Status: 'Pending' }
});
```

**MySQL Equivalent:**
```sql
-- Total students
SELECT COUNT(*) as total_students FROM STUDENT;

-- Total candidates
SELECT COUNT(*) as total_candidates FROM CANDIDATE;

-- Total elections
SELECT COUNT(*) as total_elections FROM ELECTION;

-- Election counts by status
SELECT Status, COUNT(*) as count
FROM ELECTION
GROUP BY Status;

-- Pending candidates
SELECT COUNT(*) as pending_candidates
FROM CANDIDATE
WHERE Status = 'Pending';
```

---

## Common Prisma Patterns

### 1. Count Records
```javascript
// Prisma
const count = await prisma.sTUDENT.count();

// With filter
const count = await prisma.eLECTION.count({
  where: { Status: 'Ongoing' }
});
```

```sql
-- MySQL
SELECT COUNT(*) as count FROM STUDENT;

SELECT COUNT(*) as count 
FROM ELECTION 
WHERE Status = 'Ongoing';
```

---

### 2. Find One (Unique)
```javascript
// Prisma
const student = await prisma.sTUDENT.findUnique({
  where: { Std_id: 1 }
});
```

```sql
-- MySQL
SELECT * FROM STUDENT WHERE Std_id = 1 LIMIT 1;
```

---

### 3. Find First (With Filter)
```javascript
// Prisma
const admin = await prisma.aDMIN.findFirst({
  where: { Admin_email: 'admin@example.com' }
});
```

```sql
-- MySQL
SELECT * FROM ADMIN WHERE Admin_email = 'admin@example.com' LIMIT 1;
```

---

### 4. Find Many (List)
```javascript
// Prisma
const students = await prisma.sTUDENT.findMany({
  where: { Course: 'Computer Science' },
  orderBy: { Std_name: 'asc' }
});
```

```sql
-- MySQL
SELECT * FROM STUDENT 
WHERE Course = 'Computer Science'
ORDER BY Std_name ASC;
```

---

### 5. Create
```javascript
// Prisma
const student = await prisma.sTUDENT.create({
  data: {
    Std_name: 'John Doe',
    Std_email: 'john@example.com',
    Std_password: hashedPassword,
    Course: 'Computer Science',
    Year: 1
  }
});
```

```sql
-- MySQL
INSERT INTO STUDENT 
  (Std_name, Std_email, Std_password, Course, Year)
VALUES 
  ('John Doe', 'john@example.com', ?, 'Computer Science', 1);

SELECT LAST_INSERT_ID() as Std_id;
```

---

### 6. Update
```javascript
// Prisma
const updated = await prisma.sTUDENT.update({
  where: { Std_id: 1 },
  data: { Year: 2 }
});
```

```sql
-- MySQL
UPDATE STUDENT
SET Year = 2
WHERE Std_id = 1;

SELECT * FROM STUDENT WHERE Std_id = 1;
```

---

### 7. Upsert (Insert or Update)
```javascript
// Prisma
const result = await prisma.rESULT.upsert({
  where: {
    Election_id_Can_id: {
      Election_id: 1,
      Can_id: 5
    }
  },
  update: {
    Vote_count: 50
  },
  create: {
    Election_id: 1,
    Can_id: 5,
    Vote_count: 50,
    Admin_id: 1
  }
});
```

```sql
-- MySQL
INSERT INTO RESULT (Election_id, Can_id, Vote_count, Admin_id)
VALUES (1, 5, 50, 1)
ON DUPLICATE KEY UPDATE
  Vote_count = VALUES(Vote_count);
```

---

### 8. Delete
```javascript
// Prisma
await prisma.fEEDBACK.delete({
  where: { Feedback_id: 10 }
});
```

```sql
-- MySQL
DELETE FROM FEEDBACK WHERE Feedback_id = 10;
```

---

### 9. Transaction
```javascript
// Prisma
await prisma.$transaction(async (tx) => {
  await tx.vOTE.create({...});
  await tx.vOTE.create({...});
  await tx.vOTE.create({...});
});
```

```sql
-- MySQL
START TRANSACTION;

INSERT INTO VOTE (...) VALUES (...);
INSERT INTO VOTE (...) VALUES (...);
INSERT INTO VOTE (...) VALUES (...);

COMMIT;
```

---

### 10. Include (Join)
```javascript
// Prisma
const candidate = await prisma.cANDIDATE.findUnique({
  where: { Can_id: 1 },
  include: {
    election: true,
    student: true
  }
});
```

```sql
-- MySQL
SELECT 
  c.*,
  e.*,
  s.*
FROM CANDIDATE c
LEFT JOIN ELECTION e ON c.Election_id = e.Election_id
LEFT JOIN STUDENT s ON c.Std_id = s.Std_id
WHERE c.Can_id = 1;
```

---

### 11. Select (Specific Fields)
```javascript
// Prisma
const students = await prisma.sTUDENT.findMany({
  select: {
    Std_id: true,
    Std_name: true,
    Std_email: true
  }
});
```

```sql
-- MySQL
SELECT Std_id, Std_name, Std_email 
FROM STUDENT;
```

---

### 12. Distinct
```javascript
// Prisma
const uniqueVoters = await prisma.vOTE.findMany({
  distinct: ['Std_id'],
  where: { Election_id: 1 }
});
```

```sql
-- MySQL
SELECT DISTINCT Std_id 
FROM VOTE 
WHERE Election_id = 1;
```

---

## Key Differences: Prisma vs Raw MySQL

### 1. **BigInt Handling**
```javascript
// Prisma returns BigInt for BIGINT columns
const studentId = student.Std_id; // BigInt

// Must convert for JWT
const token = jwt.sign({ 
  userId: studentId.toString() 
}, secret);
```

```sql
-- MySQL BIGINT is just a number
-- No special handling needed
```

---

### 2. **Date Handling**
```javascript
// Prisma uses JavaScript Date objects
const start = new Date(startDate);

await prisma.eLECTION.create({
  data: { Start_date: start }
});
```

```sql
-- MySQL uses strings or DATE type
INSERT INTO ELECTION (Start_date)
VALUES ('2025-11-14 10:00:00');
```

---

### 3. **JSON Fields**
```javascript
// Prisma
const positions = JSON.parse(election.Positions || '[]');

await prisma.eLECTION.create({
  data: { Positions: JSON.stringify(['President', 'VP']) }
});
```

```sql
-- MySQL (JSON column)
SELECT Positions FROM ELECTION WHERE Election_id = 1;
-- Returns: '["President", "VP"]'

-- Application must parse JSON string
```

---

### 4. **Relations**
```javascript
// Prisma - automatic joins
const candidate = await prisma.cANDIDATE.findFirst({
  include: {
    student: true, // Automatic JOIN
    election: true
  }
});

// Access: candidate.student.Std_name
```

```sql
-- MySQL - manual JOIN
SELECT 
  c.*, 
  s.Std_name, 
  e.Title
FROM CANDIDATE c
LEFT JOIN STUDENT s ON c.Std_id = s.Std_id
LEFT JOIN ELECTION e ON c.Election_id = e.Election_id;
```

---

### 5. **Transactions**
```javascript
// Prisma - callback style
await prisma.$transaction(async (tx) => {
  await tx.vOTE.create({...});
  await tx.rESULT.create({...});
  // Auto COMMIT or ROLLBACK
});
```

```sql
-- MySQL - explicit
START TRANSACTION;

INSERT INTO VOTE (...) VALUES (...);
INSERT INTO RESULT (...) VALUES (...);

COMMIT; -- or ROLLBACK;
```

---

### 6. **Error Handling**
```javascript
// Prisma - throws exceptions
try {
  const student = await prisma.sTUDENT.findUnique({...});
  if (!student) {
    return res.status(404).json({ message: 'Not found' });
  }
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Database error' });
}
```

```sql
-- MySQL - returns NULL or empty set
SELECT * FROM STUDENT WHERE Std_id = 999;
-- Returns: Empty result set
```

---

## Security Considerations

### 1. **Password Hashing**
✅ **Current:** Students and candidates use bcrypt
⚠️ **Issue:** Admin uses plain-text password comparison

**Should be:**
```javascript
// Hash password on admin creation
const hashedPassword = await bcrypt.hash(password, 10);

// Compare on login
const isValid = await bcrypt.compare(password, admin.Admin_password);
```

---

### 2. **SQL Injection Prevention**
✅ **Prisma automatically prevents SQL injection**

```javascript
// SAFE - Prisma parameterizes
await prisma.sTUDENT.findFirst({
  where: { Std_email: userInput }
});

// Prisma converts to:
// SELECT * FROM STUDENT WHERE Std_email = ? -- parameterized
```

⚠️ **Raw MySQL requires careful parameterization:**
```javascript
// DANGEROUS
const query = `SELECT * FROM STUDENT WHERE Std_email = '${userInput}'`;

// SAFE
const query = `SELECT * FROM STUDENT WHERE Std_email = ?`;
connection.query(query, [userInput]);
```

---

### 3. **BigInt Serialization**
⚠️ **Issue:** BigInt can't be directly serialized to JSON

**Solution:**
```javascript
// Convert to string for API response
res.json({
  id: student.Std_id.toString(),
  name: student.Std_name
});
```

---

## Performance Tips

### 1. **Select Only Needed Fields**
```javascript
// ❌ BAD - Fetches all fields
const students = await prisma.sTUDENT.findMany();

// ✅ GOOD - Only needed fields
const students = await prisma.sTUDENT.findMany({
  select: {
    Std_id: true,
    Std_name: true,
    Std_email: true
  }
});
```

---

### 2. **Use Transactions for Multiple Writes**
```javascript
// ✅ GOOD - All succeed or all fail
await prisma.$transaction([
  prisma.vOTE.create({...}),
  prisma.vOTE.create({...}),
  prisma.vOTE.create({...})
]);
```

---

### 3. **Avoid N+1 Queries**
```javascript
// ❌ BAD - N+1 problem
const candidates = await prisma.cANDIDATE.findMany();
for (const candidate of candidates) {
  const election = await prisma.eLECTION.findUnique({
    where: { Election_id: candidate.Election_id }
  }); // Separate query for each candidate!
}

// ✅ GOOD - Single query with join
const candidates = await prisma.cANDIDATE.findMany({
  include: { election: true }
});
```

---

## Conclusion

This documentation covers all major handler functions with:
- Prisma ORM code
- Equivalent MySQL queries
- Business logic explanations
- Request/response examples
- Security considerations
- Performance tips

For your presentation, focus on:
1. **Authentication flow** (registration, login, JWT)
2. **Voting process** (OTP, encryption, recording)
3. **Election lifecycle** (creation, status transitions, results)
4. **Scheduler automation** (see SCHEDULER_DOCUMENTATION.md)
5. **Security measures** (bcrypt, RSA encryption, transactions)

**Key Talking Points:**
- Prisma provides type-safety and prevents SQL injection
- RSA encryption ensures vote confidentiality
- Transactions ensure data integrity
- Scheduler automates election management
- OTP system prevents voter fraud
