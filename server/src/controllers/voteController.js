import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Store election public keys (in production, use secure key management)
const electionKeys = new Map();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate RSA key pair for election
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

// Get election public key
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

    // Verify election exists and is ongoing
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

    // Check if student has already voted
    const existingVote = await prisma.vOTE.findFirst({
      where: {
        Std_id: studentId,
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

    // Store OTP
    otpStore.set(`${studentId}-${electionIdInt}`, { otp, expiry: otpExpiry });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
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

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'OTP sent successfully to your registered email',
      expiresIn: 600 // seconds
    });
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

    // OTP verified successfully - don't delete yet, we'll delete after vote is cast
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

    // Verify OTP was verified
    const storedData = otpStore.get(`${studentId}-${electionIdInt}`);
    if (!storedData) {
      return res.status(401).json({ message: 'OTP verification required' });
    }

    // Check if student has already voted
    const existingVote = await prisma.vOTE.findFirst({
      where: {
        Std_id: studentId,
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
            Data: true, // Marksheet
            Profile: true // Profile picture
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

    // Verify OTP was verified
    const storedData = otpStore.get(`${studentId}-${electionIdInt}`);
    if (!storedData) {
      return res.status(401).json({ message: 'OTP verification required' });
    }

    // Check if student has already voted in this election
    const existingVote = await prisma.vOTE.findFirst({
      where: {
        Std_id: studentId,
        Election_id: electionIdInt
      }
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Verify election is ongoing
    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: electionIdInt }
    });

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.Status !== 'Ongoing') {
      return res.status(400).json({ message: 'Election is not currently ongoing' });
    }

    // Verify all candidates exist, are approved, and belong to correct election
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

    // Create a map of candidateId -> position for validation
    const candidatePositionMap = new Map();
    candidates.forEach(c => {
      candidatePositionMap.set(c.Can_id.toString(), c.Position);
    });

    // Validate that each position has exactly one vote and matches candidate's position
    const positionsVoted = new Set();
    for (const [position, voteData] of Object.entries(encryptedVotes)) {
      const candidateId = BigInt(voteData.candidateId);
      const candidatePosition = candidatePositionMap.get(candidateId.toString());

      // Check if candidate's actual position matches the position being voted for
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

    // Get all positions in this election to ensure all are voted
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

    // Store encrypted votes for each position
    const voteReceipts = [];
    for (const [position, voteData] of Object.entries(encryptedVotes)) {
      const candidateId = BigInt(voteData.candidateId);
      const encryptedVote = voteData.encryptedVote;

      // Create vote record (Vote_id is auto-incremented)
      const vote = await prisma.vOTE.create({
        data: {
          Std_id: studentId,
          Can_id: candidateId,
          Election_id: electionIdInt,
          Encrypted_vote: encryptedVote
        }
      });

      // Generate receipt hash with all critical information
      const receiptHash = crypto
        .createHash('sha256')
        .update(`${vote.Vote_id}-${studentId}-${candidateId}-${electionIdInt}-${position}-${vote.Vote_time.toISOString()}`)
        .digest('hex');

      // Save receipt in VOTE_RECEIPT table
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

// Check if student has voted
const checkVoteStatus = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { electionId } = req.params;
    const electionIdInt = parseInt(electionId);

    const vote = await prisma.vOTE.findFirst({
      where: {
        Std_id: studentId,
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

    const elections = await prisma.eLECTION.findMany({
      where: { Status: 'Ongoing' },
      include: {
        candidates: {
          where: { Status: 'Approved' },
          select: {
            Can_id: true,
            Position: true
          }
        },
        votes: {
          where: { Std_id: studentId },
          select: {
            Vote_id: true,
            Vote_time: true
          }
        }
      },
      orderBy: { Start_date: 'desc' }
    });

    const electionsWithStatus = elections.map(election => ({
      Election_id: election.Election_id,
      Title: election.Title,
      Start_date: election.Start_date,
      End_date: election.End_date,
      candidateCount: election.candidates.length,
      positions: [...new Set(election.candidates.map(c => c.Position))],
      hasVoted: election.votes.length > 0,
      voteTime: election.votes.length > 0 ? election.votes[0].Vote_time : null
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
