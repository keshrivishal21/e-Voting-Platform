import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (userId,userType) => {
  return jwt.sign(
    { userId,userType },
    process.env.JWT_SECRET,
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
    const token = generateToken(admin.id, "admin");

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
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Find student by email
    const student = await prisma.sTUDENT.findUnique({
      where: { email: email }
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
    const token = generateToken(student.id, "student");

    res.status(200).json({
      success: true,
      message: "Student login successful",
      data: {
        token,
        user: {
          scholarNo: student.Std_id,
          name: student.name,
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
    const token = generateToken(candidate.id,"candidate");

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


// Student Registration
export const studentRegister = async (req, res) => {
  try {
    const { name,email,dob,phone,password,confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !dob || !phone || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Passwords do not match" 
      });
    }

    // Check if student already exists
    const existingStudent = await prisma.sTUDENT.findUnique({
      where: { email: email }
    });

    if (existingStudent) {
      return res.status(409).json({ 
        success: false, 
        message: "Student with this email already exist" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const parts = email.split("@");
    const scholarNo = parts[0];
    // Create student
    const student = await prisma.sTUDENT.create({
      data: {
        id: scholarNo,
        name,
        phone, 
        password: hashedPassword,
        dob,
        email
      }
    });

    // Generate token
    const token = generateToken(student.id, "student");

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        token,
        user: {
          scholarNo: student.id,
          userType: "student"
        }
      }
    });

  } catch (error) {
    console.error("Student registration error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Candidate Registration (requires student to be logged in)
export const candidateRegister = async (req, res) => {
  try {
    const { position, manifesto } = req.body;
    const studentId = req.user.userId; // From JWT token

    // Validate input
    if (!position) {
      return res.status(400).json({ 
        success: false, 
        message: "Position is required" 
      });
    }

    // Get student details
    const student = await prisma.sTUDENT.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }

    // Check if student is already a candidate
    const existingCandidate = await prisma.cANDIDATE.findUnique({
      where: { scholarNo: student.scholarNo }
    });

    if (existingCandidate) {
      return res.status(409).json({ 
        success: false, 
        message: "You are already registered as a candidate" 
      });
    }

    // Create candidate
    const candidate = await prisma.cANDIDATE.create({
      data: {
        scholarNo: student.scholarNo,
        position,
        manifesto: manifesto || "",
        studentId: student.id
      }
    });

    res.status(201).json({
      success: true,
      message: "Candidate registration successful",
      data: {
        candidate: {
          id: candidate.id,
          scholarNo: candidate.scholarNo,
          position: candidate.position,
          manifesto: candidate.manifesto,
          studentInfo: {
            name: student.name,
            branch: student.branch,
            year: student.year
          }
        }
      }
    });

  } catch (error) {
    console.error("Candidate registration error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};