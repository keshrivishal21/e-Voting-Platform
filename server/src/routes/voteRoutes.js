import express from 'express';
import {
  getElectionPublicKey,
  requestVotingOTP,
  verifyVotingOTP,
  getBallot,
  castVote,
  checkVoteStatus,
  getOngoingElections
} from '../controllers/voteController.js';
import { verifyStudent } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/elections/ongoing', verifyStudent, getOngoingElections);

// Get election public key for encryption
router.get('/election/:electionId/public-key', verifyStudent, getElectionPublicKey);

// Request OTP for voting
router.post('/request-otp', verifyStudent, requestVotingOTP);

// Verify OTP
router.post('/verify-otp', verifyStudent, verifyVotingOTP);

// Get ballot (after OTP verification)
router.get('/ballot/:electionId', verifyStudent, getBallot);

// Cast vote (encrypted)
router.post('/cast', verifyStudent, castVote);

// Check if student has voted in an election
router.get('/status/:electionId', verifyStudent, checkVoteStatus);

export default router;
