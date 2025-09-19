import express from "express";
import { 
  login, 
  adminLogin, 
  studentLogin, 
  candidateLogin 
} from "../controllers/authController.js";
import { 
  verifyToken, 
  verifyAdmin, 
  verifyStudent, 
  verifyCandidate 
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Authentication Routes
router.post("/login", login); // Universal login route
router.post("/admin/login", adminLogin); // Admin-specific login
router.post("/student/login", studentLogin); // Student-specific login
router.post("/candidate/login", candidateLogin); // Candidate-specific login

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

// Logout route (client-side should remove token)
router.post("/logout", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

export default router;