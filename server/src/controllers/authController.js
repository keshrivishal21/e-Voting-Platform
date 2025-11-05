import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import { sendPasswordResetEmail, sendPasswordResetConfirmationEmail, sendEmailVerification } from "../utils/emailService.js";
import { storePendingRegistration, getPendingRegistration, removePendingRegistration, updatePendingOTP } from "../utils/pendingRegistrations.js";

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (userId, userType) => {
  // Convert BigInt to string for JWT serialization
  const userIdString = typeof userId === 'bigint' ? userId.toString() : userId;
  return jwt.sign({ userId: userIdString, userType }, process.env.JWT_SECRET, {
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

    // Find admin by email
    const admin = await prisma.aDMIN.findFirst({
      where: { Admin_email: userId },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check password
    // const isPasswordValid = await bcrypt.compare(password, admin.Admin_password);
    if (password !== admin.Admin_password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(admin.Admin_id, "Admin");

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        token,
        user: {
          id: admin.Admin_id.toString(),
          email: admin.Admin_email,
          name: admin.Admin_name,
          phone: admin.Admin_phone,
          userType: "Admin",
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

    // Ensure email is verified before allowing login
    if (!student.Email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email before logging in.'
      });
    }

    // Generate token
    const token = generateToken(student.Std_id, "Student");

    res.status(200).json({
      success: true,
      message: "Student login successful",
      data: {
        token,
        user: {
          scholarNo: student.Std_id.toString(),
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

    // Get uploaded profile picture if exists
    const profileFile = req.file;

    // Validate input
    if (!name || !email || !dob || !phone || !password || !confirmPassword) {
      // Clean up uploaded file if validation fails
      if (profileFile && profileFile.path) {
        try {
          fs.unlinkSync(profileFile.path);
        } catch (error) {
          console.error("Error deleting temporary file:", error);
        }
      }
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      // Clean up uploaded file if validation fails
      if (profileFile && profileFile.path) {
        try {
          fs.unlinkSync(profileFile.path);
        } catch (error) {
          console.error("Error deleting temporary file:", error);
        }
      }
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if student already exists in database
    const existingStudent = await prisma.sTUDENT.findFirst({
      where: { Std_email: email },
    });

    if (existingStudent) {
      // Clean up uploaded file if student exists
      if (profileFile && profileFile.path) {
        try {
          fs.unlinkSync(profileFile.path);
        } catch (error) {
          console.error("Error deleting temporary file:", error);
        }
      }
      return res.status(409).json({
        success: false,
        message: "Student with this email already exists",
      });
    }

    // Check if email was verified via OTP
    const pendingData = getPendingRegistration(email);
    if (!pendingData || !pendingData.emailVerified) {
      // Clean up uploaded file
      if (profileFile && profileFile.path) {
        try {
          fs.unlinkSync(profileFile.path);
        } catch (error) {
          console.error("Error deleting temporary file:", error);
        }
      }
      return res.status(400).json({
        success: false,
        message: "Please verify your email before registering",
      });
    }

    // parse scholar number from email assuming format: 123456@stu.manit.ac.in
    const scholarNo = parseInt(email.split("@")[0]);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Read profile picture and convert to buffer if uploaded
    let profileBuffer = null;
    if (profileFile) {
      try {
        profileBuffer = fs.readFileSync(profileFile.path);
      } catch (error) {
        console.error("Error reading profile picture:", error);
        return res.status(500).json({
          success: false,
          message: "Error processing profile picture",
        });
      }
    }

    // Create USERS and STUDENT records (email already verified)
    try {
      // Create user entry
      await prisma.uSERS.create({
        data: {
          User_id: BigInt(scholarNo),
          User_type: "Student",
        },
      });

      // Create student record with Email_verified=true
      const student = await prisma.sTUDENT.create({
        data: {
          Std_id: BigInt(scholarNo),
          Std_name: name,
          Std_phone: phone,
          Std_password: hashedPassword,
          Dob: new Date(dob),
          Std_email: email,
          Profile: profileBuffer,
          Email_verified: true, // Email was verified via OTP
          Reset_token: null,
          Reset_token_expiry: null,
        },
      });

      // Clean up temporary file after saving to database
      if (profileFile && profileFile.path) {
        try {
          fs.unlinkSync(profileFile.path);
        } catch (error) {
          console.error("Error deleting temporary file:", error);
        }
      }

      // Remove pending registration data
      removePendingRegistration(email);

      res.status(201).json({
        success: true,
        message: "Registration successful! You can now log in.",
        data: {
          user: {
            scholarNo: student.Std_id.toString(),
            userType: "Student",
          },
        },
      });
    } catch (dbError) {
      console.error('Database error during student creation:', dbError);
      
      // Clean up uploaded file in case of error
      if (profileFile && profileFile.path) {
        try {
          fs.unlinkSync(profileFile.path);
        } catch (error) {
          console.error("Error deleting temporary file:", error);
        }
      }

      // Check if it's a duplicate key error
      if (dbError.code === 'P2002') {
        return res.status(409).json({ 
          success: false, 
          message: 'Student account already exists. Please login.' 
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error("Student registration error:", error);
    
    // Clean up uploaded file in case of error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error("Error deleting temporary file:", error);
      }
    }
    
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
      branch,
      year,
      cgpa,
      electionId,
    } = req.body;

    // Get uploaded files info
    const documentFile = req.files?.document?.[0];
    const profileFile = req.files?.profile?.[0];

    // Validate input
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !position ||
      !branch ||
      !year ||
      !electionId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone, password, position, branch, year, and election are required",
      });
    }

    // Specifically validate election selection
    if (!electionId || electionId === '' || electionId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "Please select an election to contest. Candidate registration requires election selection.",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate document file upload
    if (!documentFile) {
      return res.status(400).json({
        success: false,
        message: "Document file (marksheet) is required",
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

    // Check if candidate already exists for THIS specific election
    const existingCandidateInElection = await prisma.cANDIDATE.findFirst({
      where: { 
        Can_email: email,
        Election_id: parseInt(electionId)
      },
    });

    if (existingCandidateInElection) {
      return res.status(409).json({
        success: false,
        message: "You have already registered for this election",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate candidate ID (you can modify this logic as needed)
    const candidateId = parseInt(email.split("@")[0]);

    // Check if this is a re-registration (candidate existed for a previous election)
    const previousCandidateRecord = await prisma.cANDIDATE.findUnique({
      where: { Can_id: candidateId }
    });
    const isReRegistration = previousCandidateRecord !== null;

    // Read uploaded files and convert to buffer for database storage
    let documentBuffer = Buffer.from("");
    let profileBuffer = null;
    
    if (documentFile) {
      try {
        documentBuffer = fs.readFileSync(documentFile.path);
      } catch (error) {
        console.error("Error reading document file:", error);
        return res.status(500).json({
          success: false,
          message: "Error processing document file",
        });
      }
    }

    if (profileFile) {
      try {
        profileBuffer = fs.readFileSync(profileFile.path);
      } catch (error) {
        console.error("Error reading profile picture:", error);
        return res.status(500).json({
          success: false,
          message: "Error processing profile picture",
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

        // Upsert candidate - update if exists from previous election, create if new
        // This allows students to contest in multiple elections
        const candidate = await tx.cANDIDATE.upsert({
          where: {
            Can_id: candidateId
          },
          update: {
            // Update all fields for the new election
            Can_name: name,
            Can_email: email,
            Can_phone: phone,
            Can_password: hashedPassword,
            Position: position,
            Manifesto: manifesto || "",
            Election_id: parseInt(electionId), // Update to new election
            Branch: branch,
            Year: parseInt(year),
            Cgpa: cgpa ? parseFloat(cgpa) : 0.0,
            Data: documentBuffer,
            Profile: profileBuffer,
            Status: "Pending", // Reset status to Pending for new election
            Rejection_reason: null, // Clear any previous rejection reason
          },
          create: {
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
            Data: documentBuffer,
            Profile: profileBuffer,
            User_type: "Candidate",
          },
        });

        return { user, candidate };
      });

      user = result.user;
      candidate = result.candidate;

    } catch (dbError) {
      console.error("Database transaction error:", dbError);
      
      // Clean up temporary files in case of database error
      if (documentFile && documentFile.path) {
        try {
          fs.unlinkSync(documentFile.path);
        } catch (error) {
          console.error("Error deleting temporary document file:", error);
        }
      }
      if (profileFile && profileFile.path) {
        try {
          fs.unlinkSync(profileFile.path);
        } catch (error) {
          console.error("Error deleting temporary profile file:", error);
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

    // Clean up temporary files
    if (documentFile && documentFile.path) {
      try {
        fs.unlinkSync(documentFile.path);
      } catch (error) {
        console.error("Error deleting temporary document file:", error);
      }
    }
    if (profileFile && profileFile.path) {
      try {
        fs.unlinkSync(profileFile.path);
      } catch (error) {
        console.error("Error deleting temporary profile file:", error);
      }
    }

    const successMessage = isReRegistration 
      ? "Candidate re-registration successful! You have been registered for the new election."
      : "Candidate registration successful";

    res.status(201).json({
      success: true,
      message: successMessage,
      data: {
        candidate: {
          id: candidate.Can_id.toString(),
          name: candidate.Can_name,
        },
        isReRegistration: isReRegistration,
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

// Send OTP for inline email verification (before registration)
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Validate email format (must be college email: scholarNo@stu.manit.ac.in)
    const collegeEmailRegex = /^(\d+)@stu\.manit\.ac\.in$/;
    const match = email.match(collegeEmailRegex);
    if (!match) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid college email (e.g., 123456@stu.manit.ac.in)' 
      });
    }

    // Check if student already exists in database
    const existingStudent = await prisma.sTUDENT.findFirst({ where: { Std_email: email } });
    if (existingStudent) {
      return res.status(409).json({ success: false, message: 'This email is already registered' });
    }

    // Check if there's already a pending verification for this email
    const existingPending = getPendingRegistration(email);
    
    // Generate 6-digit OTP
    const verifyOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyOTPHashed = crypto.createHash('sha256').update(verifyOTP).digest('hex');
    const verifyExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingPending) {
      // Update existing pending registration with new OTP
      updatePendingOTP(email, verifyOTPHashed, verifyExpiry);
    } else {
      // Store minimal pending data (just for OTP verification, full registration data comes later)
      storePendingRegistration(email, {
        email,
        verificationOnly: true, // Flag to indicate this is just for email verification
      }, verifyOTPHashed, verifyExpiry);
    }

    // Send OTP email
    try {
      await sendEmailVerification(email, verifyOTP, 'Student');
      res.status(200).json({ 
        success: true, 
        message: 'OTP sent to your email. Valid for 10 minutes.' 
      });
    } catch (err) {
      console.error('Failed to send OTP email:', err?.message || err);
      // Don't fail completely - allow verification to proceed (useful for dev/testing)
      res.status(200).json({ 
        success: true, 
        message: 'OTP sent. If you don\'t receive it, please check your email address.' 
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get student details by scholar number (for candidate registration)
// Get authenticated student details for candidate registration
export const getStudentDetailsForCandidate = async (req, res) => {
  try {
    // Get student ID from authenticated user's token (set by verifyStudent middleware)
    const studentId = BigInt(req.user.userId);

    const student = await prisma.sTUDENT.findUnique({
      where: { Std_id: studentId },
      select: {
        Std_id: true,
        Std_name: true,
        Std_email: true,
        Std_phone: true,
        Email_verified: true,
      }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found. Please register as a student first.' });
    }

    if (!student.Email_verified) {
      return res.status(400).json({ success: false, message: 'Please verify your student email before registering as a candidate.' });
    }

    // Note: We allow re-registration for different elections
    // Check if already registered as candidate is done during registration based on election
    // Students can contest in multiple elections, so we don't block here

    res.status(200).json({
      success: true,
      data: {
        scholarNo: student.Std_id.toString(),
        name: student.Std_name,
        email: student.Std_email,
        phone: student.Std_phone,
      }
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Verify OTP (inline verification before registration)
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    // Get pending data
    const pendingData = getPendingRegistration(email);
    if (!pendingData) {
      return res.status(400).json({ 
        success: false, 
        message: 'No OTP found for this email. Please request a new OTP.' 
      });
    }

    // Check if OTP is expired
    if (pendingData.expiresAt < Date.now()) {
      removePendingRegistration(email);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired. Please request a new one.' 
      });
    }

    // Hash provided OTP and compare
    const otpHashed = crypto.createHash('sha256').update(otp).digest('hex');
    if (pendingData.otpHash !== otpHashed) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Mark email as verified in pending data (keep the verified status)
    pendingData.emailVerified = true;
    pendingData.verifiedAt = Date.now();

    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully! You can now complete your registration.' 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
          id: candidate.Can_id.toString(),
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

// Get Student Profile
export const getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Find student by ID
    const student = await prisma.sTUDENT.findUnique({
      where: { Std_id: BigInt(studentId) },
      select: {
        Std_id: true,
        Std_name: true,
        Std_email: true,
        Std_phone: true,
        Dob: true,
        Profile: true,
        // Don't include password in response
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Convert profile buffer to base64 if exists
    let profileBase64 = null;
    if (student.Profile) {
      try {
        // Handle different possible formats
        let buffer;
        if (Buffer.isBuffer(student.Profile)) {
          buffer = student.Profile;
        } else if (student.Profile.type === 'Buffer' && Array.isArray(student.Profile.data)) {
          // Prisma sometimes returns Buffer as {type: 'Buffer', data: [...]}
          buffer = Buffer.from(student.Profile.data);
        } else if (typeof student.Profile === 'object') {
          // If it's an object with numeric keys, convert to array first
          buffer = Buffer.from(Object.values(student.Profile));
        } else {
          buffer = Buffer.from(student.Profile);
        }
        
        profileBase64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        console.log('Profile image converted successfully, length:', profileBase64.length);
      } catch (error) {
        console.error('Error converting profile image:', error);
        console.error('Profile type:', typeof student.Profile);
        console.error('Profile sample:', JSON.stringify(student.Profile).substring(0, 200));
      }
    }

    res.status(200).json({
      success: true,
      message: "Student profile retrieved successfully",
      data: {
        profile: {
          Std_id: student.Std_id.toString(),
          Std_name: student.Std_name,
          Std_email: student.Std_email,
          Std_phone: student.Std_phone,
          Dob: student.Dob,
          Profile: profileBase64,
        },
      },
    });
  } catch (error) {
    console.error("Get student profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update Student Profile
export const updateStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { phone, dob } = req.body;
    const profileFile = req.file; // Get uploaded profile picture if any

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Validate input - only phone and dob are editable
    if (!phone || !dob) {
      return res.status(400).json({
        success: false,
        message: "Phone and date of birth are required",
      });
    }

    // Check if student exists
    const existingStudent = await prisma.sTUDENT.findUnique({
      where: { Std_id: BigInt(studentId) },
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Prepare update data
    const updateData = {
      Std_phone: phone,
      Dob: new Date(dob),
    };

    // Add profile picture if uploaded
    if (profileFile) {
      const profileBuffer = fs.readFileSync(profileFile.path);
      updateData.Profile = profileBuffer;

      // Clean up uploaded file after reading
      fs.unlinkSync(profileFile.path);
    }

    // Update student profile - phone, dob, and optionally profile picture
    const updatedStudent = await prisma.sTUDENT.update({
      where: { Std_id: BigInt(studentId) },
      data: updateData,
      select: {
        Std_id: true,
        Std_name: true,
        Std_email: true,
        Std_phone: true,
        Dob: true,
        Profile: true,
      },
    });

    // Convert profile to base64 if exists
    let profileBase64 = null;
    if (updatedStudent.Profile) {
      let profileBuffer = updatedStudent.Profile;
      
      // Handle if Profile is already a Buffer object
      if (profileBuffer instanceof Buffer) {
        profileBase64 = `data:image/jpeg;base64,${profileBuffer.toString('base64')}`;
      } 
      // Handle if Profile is serialized as object with numeric keys
      else if (typeof profileBuffer === 'object' && !Array.isArray(profileBuffer)) {
        profileBuffer = Buffer.from(Object.values(profileBuffer));
        profileBase64 = `data:image/jpeg;base64,${profileBuffer.toString('base64')}`;
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        profile: {
          ...updatedStudent,
          Std_id: updatedStudent.Std_id.toString(),
          Profile: profileBase64,
        },
      },
    });
  } catch (error) {
    console.error("Update student profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Change Student Password
export const changeStudentPassword = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find student
    const student = await prisma.sTUDENT.findUnique({
      where: { Std_id: BigInt(studentId) },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      student.Std_password
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.sTUDENT.update({
      where: { Std_id: BigInt(studentId) },
      data: {
        Std_password: hashedNewPassword,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change student password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Candidate Profile
export const getCandidateProfile = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    // Find candidate by ID
    const candidate = await prisma.cANDIDATE.findUnique({
      where: { Can_id: BigInt(candidateId) },
      select: {
        Can_id: true,
        Can_name: true,
        Can_email: true,
        Can_phone: true,
        Position: true,
        Branch: true,
        Year: true,
        Cgpa: true,
        Manifesto: true,
        Election_id: true,
        Status: true,
        Rejection_reason: true,
        Profile: true,
        
      },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Convert profile to base64 if exists
    let profileBase64 = null;
    if (candidate.Profile) {
      let profileBuffer = candidate.Profile;
      
      // Handle if Profile is already a Buffer object
      if (profileBuffer instanceof Buffer) {
        profileBase64 = `data:image/jpeg;base64,${profileBuffer.toString('base64')}`;
      } 
      // Handle if Profile is serialized as object with numeric keys
      else if (typeof profileBuffer === 'object' && !Array.isArray(profileBuffer)) {
        profileBuffer = Buffer.from(Object.values(profileBuffer));
        profileBase64 = `data:image/jpeg;base64,${profileBuffer.toString('base64')}`;
      }
    }

    res.status(200).json({
      success: true,
      message: "Candidate profile retrieved successfully",
      data: {
        profile: {
          ...candidate,
          Can_id: candidate.Can_id.toString(),
          Election_id: candidate.Election_id,
          Profile: profileBase64,
        },
      },
    });
  } catch (error) {
    console.error("Get candidate profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update Candidate Profile
export const updateCandidateProfile = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { phone, manifesto } = req.body;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    // Validate input - only phone and manifesto can be updated
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Check if candidate exists
    const existingCandidate = await prisma.cANDIDATE.findUnique({
      where: { Can_id: BigInt(candidateId) },
    });

    if (!existingCandidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Update candidate profile - only phone and manifesto
    const updatedCandidate = await prisma.cANDIDATE.update({
      where: { Can_id: BigInt(candidateId) },
      data: {
        Can_phone: phone,
        Manifesto: manifesto || existingCandidate.Manifesto,
      },
      select: {
        Can_id: true,
        Can_name: true,
        Can_email: true,
        Can_phone: true,
        Position: true,
        Branch: true,
        Year: true,
        Cgpa: true,
        Manifesto: true,
        Election_id: true,
        Status: true,
        Rejection_reason: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        profile: {
          ...updatedCandidate,
          Can_id: updatedCandidate.Can_id.toString(),
          Election_id: updatedCandidate.Election_id,
        },
      },
    });
  } catch (error) {
    console.error("Update candidate profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Change Candidate Password
export const changeCandidatePassword = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find candidate
    const candidate = await prisma.cANDIDATE.findUnique({
      where: { Can_id: BigInt(candidateId) },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      candidate.Can_password
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.cANDIDATE.update({
      where: { Can_id: BigInt(candidateId) },
      data: {
        Can_password: hashedNewPassword,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change candidate password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==================== FORGOT PASSWORD FUNCTIONALITY ====================

// Request password reset for Student
export const requestStudentPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find student by email
    const student = await prisma.sTUDENT.findFirst({
      where: { Std_email: email },
    });

    if (!student) {
      // Don't reveal if user exists - security best practice
      return res.status(200).json({
        success: true,
        message: "If your email is registered, you will receive a password reset link shortly.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Save hashed token to database
    await prisma.sTUDENT.update({
      where: { Std_id: student.Std_id },
      data: {
        Reset_token: hashedToken,
        Reset_token_expiry: tokenExpiry,
      },
    });

    // Send reset email
    try {
      await sendPasswordResetEmail(student.Std_email, resetToken, student.Std_name, 'student');
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "If your email is registered, you will receive a password reset link shortly.",
    });
  } catch (error) {
    console.error("Request student password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Request password reset for Candidate
export const requestCandidatePasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find candidate by email
    const candidate = await prisma.cANDIDATE.findFirst({
      where: { Can_email: email },
    });

    if (!candidate) {
      // Don't reveal if user exists - security best practice
      return res.status(200).json({
        success: true,
        message: "If your email is registered, you will receive a password reset link shortly.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Save hashed token to database
    await prisma.cANDIDATE.update({
      where: { Can_id: candidate.Can_id },
      data: {
        Reset_token: hashedToken,
        Reset_token_expiry: tokenExpiry,
      },
    });

    // Send reset email
    try {
      await sendPasswordResetEmail(candidate.Can_email, resetToken, candidate.Can_name, 'candidate');
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "If your email is registered, you will receive a password reset link shortly.",
    });
  } catch (error) {
    console.error("Request candidate password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset password for Student
export const resetStudentPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the token to match with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find student with valid token
    const student = await prisma.sTUDENT.findFirst({
      where: {
        Reset_token: hashedToken,
        Reset_token_expiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await prisma.sTUDENT.update({
      where: { Std_id: student.Std_id },
      data: {
        Std_password: hashedPassword,
        Reset_token: null,
        Reset_token_expiry: null,
      },
    });

    // Send confirmation email
    try {
      await sendPasswordResetConfirmationEmail(student.Std_email, student.Std_name);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if confirmation email fails
    }

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset student password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset password for Candidate
export const resetCandidatePassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the token to match with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find candidate with valid token
    const candidate = await prisma.cANDIDATE.findFirst({
      where: {
        Reset_token: hashedToken,
        Reset_token_expiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!candidate) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await prisma.cANDIDATE.update({
      where: { Can_id: candidate.Can_id },
      data: {
        Can_password: hashedPassword,
        Reset_token: null,
        Reset_token_expiry: null,
      },
    });

    // Send confirmation email
    try {
      await sendPasswordResetConfirmationEmail(candidate.Can_email, candidate.Can_name);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if confirmation email fails
    }

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset candidate password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
