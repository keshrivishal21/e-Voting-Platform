# Candidate Approval System Documentation

## 📋 Overview
This document explains the candidate approval workflow where students apply to become candidates and admin approves/rejects their applications.

---

## 🗄️ Database Schema Changes

### New Enum: CandidateStatus
```prisma
enum CandidateStatus {
  Pending
  Approved
  Rejected
}
```

### Updated CANDIDATE Model
```prisma
model CANDIDATE {
  Can_id       Int       @id
  Can_name     String    @db.VarChar(30)
  Position     String    @db.VarChar(30)
  Can_email    String    @db.VarChar(50)
  Can_phone    String    @db.VarChar(15)
  Can_password String    @db.VarChar(255)
  Manifesto    String    @db.Text
  Election_id  Int
  Branch       String    @db.VarChar(50)
  Year         Int
  Cgpa         Float
  Data         Bytes     @db.MediumBlob
  User_type    UserType  @default(Candidate)
  
  // NEW APPROVAL FIELDS
  Status           CandidateStatus @default(Pending)
  Approved_by      Int?
  Approval_date    DateTime?
  Rejection_reason String?         @db.Text
  Applied_date     DateTime        @default(now())

  election     ELECTION  @relation(fields: [Election_id], references: [Election_id])
  user         USERS     @relation(fields: [Can_id, User_type], references: [User_id, User_type])
  approver     ADMIN?    @relation(fields: [Approved_by], references: [Admin_id])
  votes        VOTE[]
  results      RESULT[]

  @@unique([Can_id, User_type])
}
```

### Field Descriptions:
- **Status**: Current application status (Pending/Approved/Rejected)
- **Approved_by**: Admin ID who approved/rejected the application
- **Approval_date**: Timestamp when approved/rejected
- **Rejection_reason**: Optional reason for rejection
- **Applied_date**: When candidate submitted application (auto-set)

---

## 🔄 Workflow

### Student → Candidate Application Flow:
```
1. Student registers as candidate (POST /api/auth/candidate/register)
   ↓
2. Status automatically set to "Pending"
   ↓
3. Candidate appears in admin's pending list
   ↓
4. Admin reviews application
   ↓
5a. Admin approves → Status: "Approved" (can contest election)
   OR
5b. Admin rejects → Status: "Rejected" (with optional reason)
   ↓
6. Candidate can check their status
```

---

## 📡 API Endpoints

### Base URL: `/api/candidate`

### 1. Get Pending Candidates (Admin)
**Endpoint:** `GET /admin/candidates/pending`

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pending candidates retrieved successfully",
  "data": {
    "candidates": [
      {
        "Can_id": 123456,
        "Can_name": "John Doe",
        "Can_email": "123456@stu.manit.ac.in",
        "Position": "President",
        "Branch": "Computer Science",
        "Year": 3,
        "Cgpa": 8.5,
        "Status": "Pending",
        "Applied_date": "2025-10-19T10:30:00.000Z",
        "election": {
          "Title": "Student Union Election 2025",
          "Start_date": "2025-10-25T09:00:00.000Z",
          "End_date": "2025-10-27T17:00:00.000Z"
        }
      }
    ]
  }
}
```

---

### 2. Get All Candidates with Filter (Admin)
**Endpoint:** `GET /admin/candidates?status=Pending`

**Query Parameters:**
- `status` (optional): Filter by "Pending", "Approved", or "Rejected"

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidates retrieved successfully",
  "data": {
    "candidates": [...],
    "count": 5
  }
}
```

---

### 3. Approve Candidate (Admin)
**Endpoint:** `POST /admin/candidates/:candidateId/approve`

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Example:**
```bash
POST /api/candidate/admin/candidates/123456/approve
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidate approved successfully",
  "data": {
    "candidate": {
      "Can_id": 123456,
      "Can_name": "John Doe",
      "Status": "Approved",
      "Approved_by": 1,
      "Approval_date": "2025-10-19T11:00:00.000Z",
      "Rejection_reason": null,
      "election": {
        "Title": "Student Union Election 2025"
      }
    }
  }
}
```

**Error Responses:**
- 400: Candidate already approved
- 404: Candidate not found

---

### 4. Reject Candidate (Admin)
**Endpoint:** `POST /admin/candidates/:candidateId/reject`

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Does not meet CGPA requirement"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidate rejected",
  "data": {
    "candidate": {
      "Can_id": 123456,
      "Can_name": "John Doe",
      "Status": "Rejected",
      "Approved_by": 1,
      "Approval_date": "2025-10-19T11:05:00.000Z",
      "Rejection_reason": "Does not meet CGPA requirement",
      "election": {
        "Title": "Student Union Election 2025"
      }
    }
  }
}
```

---

### 5. Check Application Status (Candidate)
**Endpoint:** `GET /candidates/:candidateId/status`

**Headers:**
```
Authorization: Bearer <CANDIDATE_JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidate status retrieved successfully",
  "data": {
    "candidate": {
      "Can_id": 123456,
      "Can_name": "John Doe",
      "Status": "Pending",
      "Applied_date": "2025-10-19T10:30:00.000Z",
      "Approval_date": null,
      "Rejection_reason": null,
      "election": {
        "Title": "Student Union Election 2025",
        "Start_date": "2025-10-25T09:00:00.000Z",
        "End_date": "2025-10-27T17:00:00.000Z",
        "Status": "Upcoming"
      }
    }
  }
}
```

---

## 🗄️ SQL Queries (Prisma Operations)

### 1. Candidate Registration (Auto Pending):
```sql
-- Create user entry
INSERT INTO USERS (User_id, User_type) 
VALUES (123456, 'Candidate');

-- Create candidate with Pending status
INSERT INTO CANDIDATE (
  Can_id, Can_name, Can_email, Can_phone, Can_password,
  Position, Manifesto, Election_id, Branch, Year, Cgpa, Data,
  User_type, Status, Applied_date
) VALUES (
  123456, 'John Doe', '123456@stu.manit.ac.in', '9876543210', '$hashed$',
  'President', 'My manifesto...', 1, 'Computer Science', 3, 8.5, BLOB,
  'Candidate', 'Pending', NOW()
);
```

### 2. Get Pending Candidates:
```sql
SELECT c.*, 
       e.Title, e.Start_date, e.End_date
FROM CANDIDATE c
JOIN ELECTION e ON c.Election_id = e.Election_id
WHERE c.Status = 'Pending'
ORDER BY c.Applied_date DESC;
```

### 3. Approve Candidate:
```sql
UPDATE CANDIDATE
SET Status = 'Approved',
    Approved_by = 1,
    Approval_date = NOW(),
    Rejection_reason = NULL
WHERE Can_id = 123456;
```

### 4. Reject Candidate:
```sql
UPDATE CANDIDATE
SET Status = 'Rejected',
    Approved_by = 1,
    Approval_date = NOW(),
    Rejection_reason = 'Does not meet CGPA requirement'
WHERE Can_id = 123456;
```

### 5. Get Candidates by Status:
```sql
SELECT c.*, 
       e.Title, e.Start_date, e.End_date, e.Status as Election_Status,
       a.Admin_name as Approver_Name
FROM CANDIDATE c
JOIN ELECTION e ON c.Election_id = e.Election_id
LEFT JOIN ADMIN a ON c.Approved_by = a.Admin_id
WHERE c.Status = 'Approved'  -- or 'Pending' or 'Rejected'
ORDER BY c.Applied_date DESC;
```

### 6. Check Candidate Status:
```sql
SELECT Can_id, Can_name, Status, Applied_date, Approval_date, Rejection_reason,
       e.Title, e.Start_date, e.End_date, e.Status as Election_Status
FROM CANDIDATE c
JOIN ELECTION e ON c.Election_id = e.Election_id
WHERE Can_id = 123456;
```

---

## 🔒 Security & Business Rules

### Authorization Rules:
- ✅ **Admin** can view all candidates and approve/reject
- ✅ **Candidate** can only view their own status
- ✅ **Student** cannot view candidate applications
- ✅ All endpoints require JWT authentication

### Validation Rules:
- ✅ Cannot approve already approved candidate
- ✅ Cannot reject already rejected candidate
- ✅ Rejection reason is optional but recommended
- ✅ Admin ID and timestamp recorded for audit trail

### Voting Rules:
- ✅ Only **Approved** candidates can receive votes
- ✅ **Pending** candidates don't appear in voting lists
- ✅ **Rejected** candidates cannot contest

---

## 🧪 Testing Commands (PowerShell)

### 1. Student applies as candidate:
```powershell
curl -X POST "http://localhost:5000/api/auth/candidate/register" `
  -H "Content-Type: multipart/form-data" `
  -F "name=John Doe" `
  -F "email=123456@stu.manit.ac.in" `
  -F "phone=9876543210" `
  -F "password=securepass" `
  -F "confirmPassword=securepass" `
  -F "position=President" `
  -F "branch=Computer Science" `
  -F "year=3" `
  -F "cgpa=8.5" `
  -F "manifesto=My vision..." `
  -F "document=@path/to/file.pdf"
```

### 2. Admin gets pending candidates:
```powershell
$token = "ADMIN_TOKEN_HERE"
curl -X GET "http://localhost:5000/api/candidate/admin/candidates/pending" `
  -H "Authorization: Bearer $token"
```

### 3. Admin approves candidate:
```powershell
curl -X POST "http://localhost:5000/api/candidate/admin/candidates/123456/approve" `
  -H "Authorization: Bearer $token"
```

### 4. Admin rejects candidate:
```powershell
curl -X POST "http://localhost:5000/api/candidate/admin/candidates/123456/reject" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d "{\"reason\":\"Does not meet CGPA requirement\"}"
```

### 5. Candidate checks status:
```powershell
$candidateToken = "CANDIDATE_TOKEN_HERE"
curl -X GET "http://localhost:5000/api/candidate/candidates/123456/status" `
  -H "Authorization: Bearer $candidateToken"
```

---

## 🎨 Frontend Integration

### Admin Dashboard - Pending Candidates Section:
```javascript
// Fetch pending candidates
const fetchPendingCandidates = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch('http://localhost:5000/api/candidate/admin/candidates/pending', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  setPendingCandidates(data.data.candidates);
};

// Approve candidate
const approveCandidate = async (candidateId) => {
  const token = localStorage.getItem('adminToken');
  await fetch(`http://localhost:5000/api/candidate/admin/candidates/${candidateId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  // Refresh list
  fetchPendingCandidates();
};

// Reject candidate
const rejectCandidate = async (candidateId, reason) => {
  const token = localStorage.getItem('adminToken');
  await fetch(`http://localhost:5000/api/candidate/admin/candidates/${candidateId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  fetchPendingCandidates();
};
```

### Candidate Dashboard - Check Status:
```javascript
const checkStatus = async () => {
  const token = localStorage.getItem('candidateToken');
  const candidateId = getCurrentCandidateId(); // From token or state
  
  const response = await fetch(`http://localhost:5000/api/candidate/candidates/${candidateId}/status`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  const status = data.data.candidate.Status;
  // Show status badge: Pending (yellow), Approved (green), Rejected (red)
};
```

---

## 🎯 Next Steps After Schema Migration

### 1. Run Prisma Migration:
```bash
cd server
npx prisma migrate dev --name add_candidate_approval_system
```

### 2. Generate Prisma Client:
```bash
npx prisma generate
```

### 3. Update Frontend:
- Add "Pending Candidates" page in admin dashboard
- Add approval/rejection UI with buttons
- Add status badge in candidate dashboard
- Show rejection reason if rejected

### 4. Add Notifications (Optional):
- Email/SMS when approved
- Email/SMS when rejected with reason
- In-app notification system

---

## 📈 Benefits

✅ **Security**: Admin approval prevents unauthorized candidates  
✅ **Control**: Admin can verify eligibility (CGPA, documents, etc.)  
✅ **Transparency**: Candidates can track application status  
✅ **Audit Trail**: Records who approved/rejected and when  
✅ **Quality**: Ensures only qualified candidates contest elections  
✅ **Fair Process**: Clear rejection reasons for appeals  

---

**Document Version:** 1.0  
**Last Updated:** October 20, 2025  
**Status:** Ready for Migration
