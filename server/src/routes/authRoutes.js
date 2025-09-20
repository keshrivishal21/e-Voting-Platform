import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { 
  adminLogin, 
  studentLogin, 
  candidateLogin,
  studentRegister,
  candidateRegister
} from "../controllers/authController.js";
import { 
  verifyToken, 
  verifyAdmin, 
  verifyStudent, 
  verifyCandidate,
  verifyStudentOrCandidate
} from "../middlewares/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// Generate JWT Token helper function
const generateToken = (userId,userType) => {
  return jwt.sign(
    { userId, role, userType },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" }
  );
};


router.post("/admin/login", adminLogin); // Admin-specific login
router.post("/student/login", studentLogin); // Student-specific login
router.post("/candidate/login", candidateLogin); // Candidate-specific login

// Registration Routes
router.post("/student/register", studentRegister); // Student registration
router.post("/candidate/register", verifyStudent, candidateRegister); // Candidate registration (requires student login)

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
      const candidateToken = generateToken(candidate.id, "candidate", "candidate");
      
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