import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { 
  adminLogin, 
  studentLogin, 
  candidateLogin,
  studentRegister,
  sendOTP,
  verifyOTP,
  getStudentDetailsForCandidate,
  candidateRegister,
  getStudentProfile,
  updateStudentProfile,
  changeStudentPassword,
  getCandidateProfile,
  updateCandidateProfile,
  changeCandidatePassword,
  requestStudentPasswordReset,
  requestCandidatePasswordReset,
  resetStudentPassword,
  resetCandidatePassword
} from "../controllers/authController.js";
import { 
  verifyToken, 
  verifyAdmin, 
  verifyStudent, 
  verifyCandidate,
  verifyStudentOrCandidate
} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();


const generateToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" }
  );
};


router.post("/admin/login", adminLogin); 
router.post("/student/login", studentLogin); 
router.post("/candidate/login", candidateLogin); 

// Registration Routes
router.post("/student/register", upload.single('profile'), studentRegister); // Student registration with optional profile picture
router.post('/student/send-otp', sendOTP); // Send OTP for inline email verification
router.post('/student/verify-otp', verifyOTP); // Verify OTP before registration
router.get('/student/details', verifyStudent, getStudentDetailsForCandidate); // Get authenticated student details for candidate registration
router.post("/candidate/register", upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'profile', maxCount: 1 }
]), candidateRegister); // Candidate registration with document and optional profile

// Forgot Password Routes
router.post("/student/forgot-password", requestStudentPasswordReset); // Request student password reset
router.post("/student/reset-password", resetStudentPassword); // Reset student password with token
router.post("/candidate/forgot-password", requestCandidatePasswordReset); // Request candidate password reset
router.post("/candidate/reset-password", resetCandidatePassword); // Reset candidate password with token

// Student Profile Routes
router.get("/student/:studentId/profile", verifyToken, getStudentProfile); // Get student profile
router.put("/student/:studentId/profile", verifyToken, upload.single('profile'), updateStudentProfile); // Update student profile with optional photo
router.put("/student/:studentId/change-password", verifyToken, changeStudentPassword); // Change student password

// Candidate Profile Routes
router.get("/candidate/:candidateId/profile", verifyToken, getCandidateProfile); // Get candidate profile
router.put("/candidate/:candidateId/profile", verifyToken, updateCandidateProfile); // Update candidate profile
router.put("/candidate/:candidateId/change-password", verifyToken, changeCandidatePassword); // Change candidate password

// Check student-candidate status
router.get("/student/candidate-status", verifyStudent, async (req, res) => {
  try {
    const studentId = req.user.userId;
    
    // Check if student is also a candidate
    const candidate = await prisma.cANDIDATE.findUnique({
      where: { scholarNo: studentId },
      include: {
        student: {
          select: {
            name: true,
            branch: true,
            year: true
          }
        }
      }
    });

    if (candidate) {
      // Generate candidate token for seamless access
      const candidateToken = generateToken(candidate.id, "Candidate");
      
      return res.status(200).json({
        success: true,
        isCandidate: true,
        candidateData: {
          id: candidate.id,
          position: candidate.position,
          scholarNo: candidate.scholarNo,
          name: candidate.student.name,
          branch: candidate.student.branch,
          year: candidate.student.year,
          token: candidateToken
        }
      });
    } else {
      return res.status(200).json({
        success: true,
        isCandidate: false
      });
    }
  } catch (error) {
    console.error("Candidate status check error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Protected route examples (to verify authentication is working)
router.get("/verify", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Token is valid",
    user: req.user
  });
});

// Optional validate endpoint used by clients to validate token and fetch user info
router.get("/validate", verifyToken, (req, res) => {
  // Return minimal user information for client-side session validation
  res.status(200).json({
    success: true,
    user: {
      userId: req.user.userId,
      userType: req.user.userType,
    }
  });
});

// Role-specific protected routes
router.get("/admin/dashboard", verifyAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Admin Dashboard",
    user: req.user
  });
});

router.get("/student/dashboard", verifyStudent, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Student Dashboard",
    user: req.user
  });
});

router.get("/candidate/dashboard", verifyCandidate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Candidate Dashboard",
    user: req.user
  });
});

// Dual access route - both students and candidates can access
router.get("/dashboard", verifyStudentOrCandidate, (req, res) => {
  const userType = req.user.userType;
  const dashboardType = userType === "candidate" ? "Candidate" : "Student";
  
  res.status(200).json({
    success: true,
    message: `Welcome to ${dashboardType} Dashboard`,
    user: req.user,
    userType: userType
  });
});

// Logout route (client-side should remove token)
router.post("/logout", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

export default router;