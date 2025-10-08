import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { parse } from "dotenv";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (userId, userType) => {
  return jwt.sign({ userId, userType }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate input
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: "User ID and password are required",
      });
    }

    // Find admin by userId
    const admin = await prisma.aDMIN.findUnique({
      where: { userId: userId },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
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
          userType: "admin",
        },
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
        message: "Email and password are required",
      });
    }

    // Find student by email
    const student = await prisma.sTUDENT.findFirst({
      where: { Std_email: email },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      student.Std_password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(student.Std_id, "student");

    res.status(200).json({
      success: true,
      message: "Student login successful",
      data: {
        token,
        user: {
          scholarNo: student.Std_id,
          userType: "Student",
        },
      },
    });
  } catch (error) {
    console.error("Student login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Student Registration
export const studentRegister = async (req, res) => {
  try {
    const { name, email, dob, phone, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !dob || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if student already exists
    const existingStudent = await prisma.sTUDENT.findFirst({
      where: { Std_email: email },
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Student with this email already exist",
      });
    }

    // parse scholar number from email assuming format: 123456@stu.maint.ac.in
    const scholarNo = parseInt(email.split("@")[0]);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    // Create user entry
    const user = await prisma.uSERS.create({
      data: {
        User_id: scholarNo,
        User_type: "Student",
      },
    });
    // Create student
    const student = await prisma.sTUDENT.create({
      data: {
        Std_id: scholarNo,
        Std_name: name,
        Std_phone: phone,
        Std_password: hashedPassword,
        Dob: new Date(dob),
        Std_email: email,
      },
    });

    // Generate token
    const token = generateToken(student.Std_id, "student");

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        token,
        user: {
          scholarNo: student.Std_id,
          userType: "student",
        },
      },
    });
  } catch (error) {
    console.error("Student registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Candidate Registration
export const candidateRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      position,
      manifesto,
      electionId,
      cgpa,
    } = req.body;

    // Validate input
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !position ||
      !electionId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone, password, position, and election ID are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if candidate already exists
    const existingCandidate = await prisma.cANDIDATE.findUnique({
      where: { Can_email: email },
    });

    if (existingCandidate) {
      return res.status(409).json({
        success: false,
        message: "Candidate with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate candidate ID (you can modify this logic as needed)
    const candidateId = Date.now();

    // Create candidate
    const candidate = await prisma.cANDIDATE.create({
      data: {
        Can_id: candidateId,
        Can_name: name,
        Can_email: email,
        Can_phone: phone,
        Can_password: hashedPassword,
        Position: position,
        Manifesto: manifesto || "",
        Election_id: parseInt(electionId),
        Cgpa: cgpa ? parseFloat(cgpa) : 0.0,
        Data: Buffer.from(""), // Empty buffer for now
        user: {
          create: {
            User_id: candidateId,
            User_type: "Candidate",
          },
        },
      },
    });

    // Generate token
    const token = generateToken(candidate.Can_id, "candidate");

    res.status(201).json({
      success: true,
      message: "Candidate registration successful",
      data: {
        token,
        candidate: {
          id: candidate.Can_id,
          name: candidate.Can_name,
          email: candidate.Can_email,
          phone: candidate.Can_phone,
          position: candidate.Position,
          manifesto: candidate.Manifesto,
          electionId: candidate.Election_id,
          cgpa: candidate.Cgpa,
        },
      },
    });
  } catch (error) {
    console.error("Candidate registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// candidateLogin
export const candidateLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find candidate by email
    const candidate = await prisma.cANDIDATE.findUnique({
      where: { Can_email: email },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      candidate.Can_password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(candidate.Can_id, "candidate");

    res.status(200).json({
      success: true,
      message: "Candidate login successful",
      data: {
        token,
        user: {
          id: candidate.Can_id,
          name: candidate.Can_name,
          email: candidate.Can_email,
          phone: candidate.Can_phone,
          position: candidate.Position,
          manifesto: candidate.Manifesto,
          userType: "candidate",
        },
      },
    });
  } catch (error) {
    console.error("Candidate login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
