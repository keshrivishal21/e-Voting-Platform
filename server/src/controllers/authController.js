import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { parse } from "dotenv";
import jwt from "jsonwebtoken";
import fs from "fs";

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

    // parse scholar number from email assuming format: 123456@stu.manit.ac.in
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

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
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
      phone,
      email,
      password,
      confirmPassword,
      position,
      electionId,
      manifesto,
      branch,
      year,
      cgpa,
    } = req.body;

    // Get uploaded file info
    const uploadedFile = req.file;

    // Validate input
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !position ||
      !electionId ||
      !branch ||
      !year
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone, password, position, branch, and year are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate file upload
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    // Check if candidate already exists
    const existingCandidate = await prisma.cANDIDATE.findFirst({
      where: { Can_email: email },
    });

    if (existingCandidate) {
      return res.status(409).json({
        success: false,
        message: "Candidate with this email already exists",
      });
    }

    // Validate election exists
    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: parseInt(electionId) }
    });

    if (!election) {
      return res.status(400).json({
        success: false,
        message: `Election with ID ${electionId} does not exist`,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate candidate ID (you can modify this logic as needed)
    const candidateId = parseInt(email.split("@")[0]);

    // Read uploaded file and convert to buffer for database storage
    let fileBuffer = Buffer.from("");
    if (uploadedFile) {
      try {
        fileBuffer = fs.readFileSync(uploadedFile.path);
      } catch (error) {
        console.error("Error reading uploaded file:", error);
        return res.status(500).json({
          success: false,
          message: "Error processing uploaded file",
        });
      }
    }

    // Use transaction to ensure data consistency
    let user, candidate;
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Check if user record already exists for this combination
        let user = await tx.uSERS.findUnique({
          where: {
            User_id_User_type: {
              User_id: candidateId,
              User_type: "Candidate"
            }
          }
        });

        if (!user) {
          // Create new user entry if it doesn't exist
          user = await tx.uSERS.create({
            data: {
              User_id: candidateId,
              User_type: "Candidate",
            },
          });
        }

        // Create candidate
        const candidate = await tx.cANDIDATE.create({
          data: {
            Can_id: candidateId,
            Can_name: name,
            Can_email: email,
            Can_phone: phone,
            Can_password: hashedPassword,
            Position: position,
            Manifesto: manifesto || "",
            Election_id: parseInt(electionId),
            Branch: branch,
            Year: parseInt(year),
            Cgpa: cgpa ? parseFloat(cgpa) : 0.0,
            Data: fileBuffer, // Store uploaded file as buffer
            User_type: "Candidate", // Add the User_type field
          },
        });

        return { user, candidate };
      });

      user = result.user;
      candidate = result.candidate;

    } catch (dbError) {
      console.error("Database transaction error:", dbError);
      
      // Clean up temporary file in case of database error
      if (uploadedFile && uploadedFile.path) {
        try {
          fs.unlinkSync(uploadedFile.path);
        } catch (error) {
          console.error("Error deleting temporary file:", error);
        }
      }

      // Handle specific Prisma errors
      if (dbError.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: "Candidate with this information already exists",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Database error during candidate registration",
      });
    }

    // Clean up temporary file
    if (uploadedFile && uploadedFile.path) {
      try {
        fs.unlinkSync(uploadedFile.path);
      } catch (error) {
        console.error("Error deleting temporary file:", error);
      }
    }

    res.status(201).json({
      success: true,
      message: "Candidate registration successful",
      data: {
        candidate: {
          id: candidate.Can_id,
          name: candidate.Can_name,
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
    const candidate = await prisma.cANDIDATE.findFirst({
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
    const token = generateToken(candidate.Can_id, "Candidate");

    res.status(200).json({
      success: true,
      message: "Candidate login successful",
      data: {
        token,
        user: {
          id: candidate.Can_id,
          userType: "Candidate",
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
