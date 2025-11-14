import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const otpStore = new Map();

const electionKeys = new Map();

// Helper function to hash student ID for anonymity
const hashStudentId = (studentId, electionId) => {
  const salt = process.env.VOTE_HASH_SALT || 'evoting-platform-secure-salt-2024';
  return crypto
    .createHash('sha256')
    .update(`${studentId}-${electionId}-${salt}`)
    .digest('hex');
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: true
  }
});

transporter.verify()
  .then(() => {
    console.log('Email transporter is ready to send emails');
  })
  .catch((error) => {
    console.warn('Email transporter verification failed:', error.message);
    console.log('Email service will still attempt to send emails when needed');
  });

const generateElectionKeys = (electionId) => {
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

  electionKeys.set(electionId, { publicKey, privateKey });
  return publicKey;
};

const getElectionPublicKey = async (req, res) => {
  try {
    const { electionId } = req.params;
    const electionIdInt = parseInt(electionId);

    // Verify election exists and is ongoing
    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: electionIdInt }
    });

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.Status !== 'Ongoing') {
      return res.status(400).json({ message: 'Election is not currently ongoing' });
    }

    const now = new Date();
    if (election.Start_date && now < election.Start_date) {
      return res.status(400).json({ 
        message: 'Election has not started yet',
        startDate: election.Start_date
      });
    }

    if (election.End_date && now > election.End_date) {
      return res.status(400).json({ 
        message: 'Election has already ended',
        endDate: election.End_date
      });
    }

    // Generate or get existing public key
    let publicKey = electionKeys.get(electionIdInt)?.publicKey;
    if (!publicKey) {
      publicKey = generateElectionKeys(electionIdInt);
    }

    res.status(200).json({ publicKey });
  } catch (error) {
    console.error('Error getting election public key:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request OTP for voting
const requestVotingOTP = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { electionId } = req.body;
    const electionIdInt = parseInt(electionId);

    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: electionIdInt },
      include: {
        candidates: {
          where: { Status: 'Approved' }
        }
      }
    });

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.Status !== 'Ongoing') {
      return res.status(400).json({ message: 'Election is not currently ongoing' });
    }

    const now = new Date();
    if (election.Start_date && now < election.Start_date) {
      return res.status(400).json({ 
        message: 'Election has not started yet',
        startDate: election.Start_date
      });
    }

    if (election.End_date && now > election.End_date) {
      return res.status(400).json({ 
        message: 'Election has already ended',
        endDate: election.End_date
      });
    }

    // Check if student has already voted using hashed ID
    const studentIdHash = hashStudentId(studentId, electionIdInt);
    const existingVote = await prisma.vOTE.findFirst({
      where: {
        Std_id_hash: studentIdHash,
        Election_id: electionIdInt
      }
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Get student email
    const student = await prisma.sTUDENT.findUnique({
      where: { Std_id: studentId }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(`${studentId}-${electionIdInt}`, { otp, expiry: otpExpiry });

    const mailOptions = {
      from: `"e-Voting Platform" <${process.env.EMAIL_USER}>`,
      to: student.Std_email,
      subject: 'Voting OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Voting Verification</h2>
          <p>Your OTP for voting in <strong>${election.Title}</strong> is:</p>
          <div style="background-color: #EEF2FF; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #6B7280; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `
    };

    console.log(`Attempting to send voting OTP to: ${student.Std_email}`);
    console.log(`Generated OTP: ${otp} (valid for 10 minutes)`);
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Voting OTP email sent successfully:', info.messageId);
      console.log('Email accepted by:', info.accepted);
      
      res.status(200).json({ 
        message: 'OTP sent successfully to your registered email',
        expiresIn: 600 // seconds
      });
    } catch (emailError) {
      console.error('Failed to send voting OTP email:', emailError);
      
      // Check specific error types
      if (emailError.code === 'ETIMEDOUT') {
        console.error('Connection timeout - Check your internet connection and firewall settings');
      } else if (emailError.code === 'EAUTH') {
        console.error('Authentication failed - Check EMAIL_USER and EMAIL_PASSWORD in .env');
      } else if (emailError.code === 'ECONNECTION') {
        console.error('Connection failed - SMTP server may be unreachable');
      }
      
      
      
      // Still return success so user can continue with OTP from console
      res.status(200).json({ 
        message: 'OTP generated. Check server console for OTP (email service unavailable)',
        expiresIn: 600 // seconds
      });
    }
  } catch (error) {
    console.error('Error requesting voting OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify OTP
const verifyVotingOTP = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { electionId, otp } = req.body;
    const electionIdInt = parseInt(electionId);

    const storedData = otpStore.get(`${studentId}-${electionIdInt}`);

    if (!storedData) {
      return res.status(400).json({ message: 'No OTP requested or OTP expired' });
    }

    if (Date.now() > storedData.expiry) {
      otpStore.delete(`${studentId}-${electionIdInt}`);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.status(200).json({ 
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get ballot for election (after OTP verification)
const getBallot = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { electionId } = req.params;
    const electionIdInt = parseInt(electionId);

    const storedData = otpStore.get(`${studentId}-${electionIdInt}`);
    if (!storedData) {
      return res.status(401).json({ message: 'OTP verification required' });
    }

    // Check if student has already voted using hashed ID
    const studentIdHash = hashStudentId(studentId, electionIdInt);
    const existingVote = await prisma.vOTE.findFirst({
      where: {
        Std_id_hash: studentIdHash,
        Election_id: electionIdInt
      }
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Get election with candidates grouped by position
    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: electionIdInt },
      include: {
        candidates: {
          where: { Status: 'Approved' },
          select: {
            Can_id: true,
            Can_name: true,
            Position: true,
            Can_email: true,
            Branch: true,
            Year: true,
            Cgpa: true,
            Manifesto: true,
            Data: true,
            Profile: true 
          }
        }
      }
    });

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.Status !== 'Ongoing') {
      return res.status(400).json({ message: 'Election is not currently ongoing' });
    }

    const now = new Date();
    if (election.Start_date && now < election.Start_date) {
      return res.status(400).json({ 
        message: 'Election has not started yet',
        startDate: election.Start_date
      });
    }

    if (election.End_date && now > election.End_date) {
      return res.status(400).json({ 
        message: 'Election has already ended',
        endDate: election.End_date
      });
    }

    // Group candidates by position
    const positions = {};
    election.candidates.forEach(candidate => {
      if (!positions[candidate.Position]) {
        positions[candidate.Position] = [];
      }
      
      // Convert profile picture buffer to base64 with proper handling
      let profileBase64 = null;
      if (candidate.Profile) {
        let profileBuffer = candidate.Profile;
        
        if (profileBuffer instanceof Buffer) {
          profileBase64 = `data:image/jpeg;base64,${profileBuffer.toString('base64')}`;
        } 
        else if (typeof profileBuffer === 'object' && !Array.isArray(profileBuffer)) {
          profileBuffer = Buffer.from(Object.values(profileBuffer));
          profileBase64 = `data:image/jpeg;base64,${profileBuffer.toString('base64')}`;
        }
      }

      positions[candidate.Position].push({
        Can_id: candidate.Can_id.toString(),
        Can_name: candidate.Can_name,
        Position: candidate.Position,
        Can_email: candidate.Can_email,
        Branch: candidate.Branch,
        Year: candidate.Year,
        Cgpa: candidate.Cgpa,
        Manifesto: candidate.Manifesto,
        profileImage: profileBase64
      });
    });

    res.status(200).json({
      election: {
        Election_id: election.Election_id,
        Title: election.Title,
        Start_date: election.Start_date,
        End_date: election.End_date
      },
      positions
    });
  } catch (error) {
    console.error('Error getting ballot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cast vote
const castVote = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { electionId, encryptedVotes } = req.body;
    const electionIdInt = parseInt(electionId);

    // Validate that encrypted votes exist and are not empty
    if (!encryptedVotes || typeof encryptedVotes !== 'object' || Object.keys(encryptedVotes).length === 0) {
      return res.status(400).json({ message: 'No votes provided. Please select at least one candidate.' });
    }

    // Validate that all votes have valid candidate IDs
    for (const [position, voteData] of Object.entries(encryptedVotes)) {
      if (!voteData || !voteData.candidateId) {
        return res.status(400).json({ 
          message: `No candidate selected for position: ${position}` 
        });
      }
    }

    // Verify OTP was verified
    const storedData = otpStore.get(`${studentId}-${electionIdInt}`);
    if (!storedData) {
      return res.status(401).json({ message: 'OTP verification required' });
    }

    // Check if student has already voted using hashed ID
    const studentIdHash = hashStudentId(studentId, electionIdInt);
    const existingVote = await prisma.vOTE.findFirst({
      where: {
        Std_id_hash: studentIdHash,
        Election_id: electionIdInt
      }
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: electionIdInt }
    });

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.Status !== 'Ongoing') {
      return res.status(400).json({ message: 'Election is not currently ongoing' });
    }

    // Additional time-based validation
    const now = new Date();
    if (election.Start_date && now < election.Start_date) {
      return res.status(400).json({ 
        message: 'Election has not started yet',
        startDate: election.Start_date
      });
    }

    if (election.End_date && now > election.End_date) {
      return res.status(400).json({ 
        message: 'Election has already ended',
        endDate: election.End_date
      });
    }

    const candidateIds = Object.values(encryptedVotes).map(v => BigInt(v.candidateId));
    const candidates = await prisma.cANDIDATE.findMany({
      where: {
        Can_id: { in: candidateIds },
        Election_id: electionIdInt,
        Status: 'Approved'
      },
      select: {
        Can_id: true,
        Position: true
      }
    });

    if (candidates.length !== candidateIds.length) {
      return res.status(400).json({ message: 'Invalid candidate selection' });
    }

    const candidatePositionMap = new Map();
    candidates.forEach(c => {
      candidatePositionMap.set(c.Can_id.toString(), c.Position);
    });

    // Validate that each position has exactly one vote and matches candidate's position
    const positionsVoted = new Set();
    for (const [position, voteData] of Object.entries(encryptedVotes)) {
      const candidateId = BigInt(voteData.candidateId);
      const candidatePosition = candidatePositionMap.get(candidateId.toString());

      if (candidatePosition !== position) {
        return res.status(400).json({ 
          message: `Candidate does not belong to position: ${position}` 
        });
      }

      // Check for duplicate position voting
      if (positionsVoted.has(position)) {
        return res.status(400).json({ 
          message: `Cannot vote for multiple candidates in the same position: ${position}` 
        });
      }

      positionsVoted.add(position);
    }

    const allPositions = await prisma.cANDIDATE.findMany({
      where: {
        Election_id: electionIdInt,
        Status: 'Approved'
      },
      select: {
        Position: true
      },
      distinct: ['Position']
    });

    const requiredPositions = new Set(allPositions.map(p => p.Position));
    
    // Check if all positions have been voted for
    if (requiredPositions.size !== positionsVoted.size) {
      return res.status(400).json({ 
        message: 'You must vote for all positions in this election' 
      });
    }

    for (const position of requiredPositions) {
      if (!positionsVoted.has(position)) {
        return res.status(400).json({ 
          message: `Missing vote for position: ${position}` 
        });
      }
    }

    const voteReceipts = [];
    for (const [position, voteData] of Object.entries(encryptedVotes)) {
      const candidateId = BigInt(voteData.candidateId);
      const encryptedVote = voteData.encryptedVote;

      // Create anonymous vote with hashed student ID
      const vote = await prisma.vOTE.create({
        data: {
          Std_id_hash: studentIdHash,
          Can_id: candidateId,
          Election_id: electionIdInt,
          Position: position,
          Encrypted_vote: encryptedVote
        }
      });

      const receiptHash = crypto
        .createHash('sha256')
        .update(`${vote.Vote_id}-${candidateId}-${electionIdInt}-${position}-${vote.Vote_time.toISOString()}`)
        .digest('hex');

      const voteReceipt = await prisma.vOTE_RECEIPT.create({
        data: {
          Vote_id: vote.Vote_id,
          Receipt_token: receiptHash,
          Generated_at: new Date()
        }
      });

      voteReceipts.push({
        position,
        voteId: vote.Vote_id,
        receiptId: voteReceipt.Receipt_id,
        receiptHash,
        timestamp: vote.Vote_time
      });
    }

    // Create audit log for vote casting
    await prisma.sYSTEM_LOGS.create({
      data: {
        User_id: studentId,
        User_type: 'Student',
        Log_time: new Date(),
        Log_type: 'Audit',
        Action: `Student cast ${voteReceipts.length} vote(s) in election ID ${electionIdInt} (${election.Title}). Positions: ${[...positionsVoted].join(', ')}`
      }
    });

    // Delete OTP after successful vote
    otpStore.delete(`${studentId}-${electionIdInt}`);

    res.status(201).json({
      message: 'Vote cast successfully',
      receipts: voteReceipts
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const checkVoteStatus = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { electionId } = req.params;
    const electionIdInt = parseInt(electionId);

    // Check if student has voted using hashed ID
    const studentIdHash = hashStudentId(studentId, electionIdInt);
    const vote = await prisma.vOTE.findFirst({
      where: {
        Std_id_hash: studentIdHash,
        Election_id: electionIdInt
      }
    });

    res.status(200).json({
      hasVoted: !!vote,
      voteTime: vote ? vote.Vote_time : null
    });
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get ongoing elections for voting
const getOngoingElections = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Fetch ongoing elections and their approved candidates
    const elections = await prisma.eLECTION.findMany({
      where: { Status: 'Ongoing' },
      include: {
        candidates: {
          where: { Status: 'Approved' },
          select: {
            Can_id: true,
            Position: true
          }
        }
      },
      orderBy: { Start_date: 'desc' }
    });

    // If no elections, return empty
    if (!elections || elections.length === 0) {
      return res.status(200).json({ elections: [] });
    }

    // Build hashes for each election to check if the student has voted
    const electionIds = elections.map(e => e.Election_id);
    const electionHashMap = new Map(); // electionId -> hash
    const hashes = elections.map(e => {
      const h = hashStudentId(studentId, e.Election_id);
      electionHashMap.set(e.Election_id, h);
      return h;
    });

    // Batch query votes for these elections where Std_id_hash matches any of the computed hashes
    const votes = await prisma.vOTE.findMany({
      where: {
        Election_id: { in: electionIds },
        Std_id_hash: { in: hashes }
      },
      select: {
        Election_id: true,
        Vote_time: true
      }
    });

    const voteMap = new Map(); // electionId -> Vote_time
    votes.forEach(v => {
      // Ensure only one entry per election (first vote)
      if (!voteMap.has(v.Election_id)) {
        voteMap.set(v.Election_id, v.Vote_time);
      }
    });

    const electionsWithStatus = elections.map(election => ({
      Election_id: election.Election_id,
      Title: election.Title,
      Start_date: election.Start_date,
      End_date: election.End_date,
      candidateCount: election.candidates.length,
      positions: [...new Set(election.candidates.map(c => c.Position))],
      hasVoted: voteMap.has(election.Election_id),
      voteTime: voteMap.has(election.Election_id) ? voteMap.get(election.Election_id) : null
    }));

    res.status(200).json({ elections: electionsWithStatus });
  } catch (error) {
    console.error('Error getting ongoing elections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getElectionPublicKey,
  requestVotingOTP,
  verifyVotingOTP,
  getBallot,
  castVote,
  checkVoteStatus,
  getOngoingElections
};
