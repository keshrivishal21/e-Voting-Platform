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

router.get('/election/:electionId/public-key', verifyStudent, getElectionPublicKey);

router.post('/request-otp', verifyStudent, requestVotingOTP);

router.post('/verify-otp', verifyStudent, verifyVotingOTP);

router.get('/ballot/:electionId', verifyStudent, getBallot);

router.post('/cast', verifyStudent, castVote);

router.get('/status/:electionId', verifyStudent, checkVoteStatus);

export default router;
