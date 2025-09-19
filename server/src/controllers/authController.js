import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (userId, role, userType) => {
  return jwt.sign(
    { userId, role, userType },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" }
  );
};

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate input
    if (!userId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID and password are required" 
      });
    }

    // Find admin by userId
    const admin = await prisma.aDMIN.findUnique({
      where: { userId: userId }
    });

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate token
    const token = generateToken(admin.id, admin.role, "admin");

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        token,
        user: {
          id: admin.id,
          userId: admin.userId,
          name: admin.name,
          role: admin.role,
          userType: "admin"
        }
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Student Login
export const studentLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate input
    if (!userId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID and password are required" 
      });
    }

    // Find student by userId (scholar number)
    const student = await prisma.sTUDENT.findUnique({
      where: { scholarNo: userId }
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate token
    const token = generateToken(student.id, "student", "student");

    res.status(200).json({
      success: true,
      message: "Student login successful",
      data: {
        token,
        user: {
          id: student.id,
          scholarNo: student.scholarNo,
          name: student.name,
          branch: student.branch,
          year: student.year,
          userType: "student"
        }
      }
    });

  } catch (error) {
    console.error("Student login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Candidate Login
export const candidateLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate input
    if (!userId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID and password are required" 
      });
    }

    // Find candidate by userId (scholar number)
    const candidate = await prisma.cANDIDATE.findUnique({
      where: { scholarNo: userId },
      include: {
        student: true // Include student details
      }
    });

    if (!candidate) {
      return res.status(404).json({ 
        success: false, 
        message: "Candidate not found" 
      });
    }

    // Check password (using student password)
    const isPasswordValid = await bcrypt.compare(password, candidate.student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate token
    const token = generateToken(candidate.id, "candidate", "candidate");

    res.status(200).json({
      success: true,
      message: "Candidate login successful",
      data: {
        token,
        user: {
          id: candidate.id,
          scholarNo: candidate.scholarNo,
          name: candidate.student.name,
          branch: candidate.student.branch,
          year: candidate.student.year,
          position: candidate.position,
          userType: "candidate"
        }
      }
    });

  } catch (error) {
    console.error("Candidate login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Universal Login Route (determines user type and routes accordingly)
export const login = async (req, res) => {
  try {
    const { userId, password, userType } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID and password are required" 
      });
    }

    if (!userType) {
      return res.status(400).json({ 
        success: false, 
        message: "User type is required (admin, student, or candidate)" 
      });
    }

    // Route to appropriate login function based on userType
    switch (userType.toLowerCase()) {
      case "admin":
        return await adminLogin(req, res);
      case "student":
        return await studentLogin(req, res);
      case "candidate":
        return await candidateLogin(req, res);
      default:
        return res.status(400).json({ 
          success: false, 
          message: "Invalid user type. Must be admin, student, or candidate" 
        });
    }

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};