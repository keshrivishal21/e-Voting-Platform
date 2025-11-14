import express from "express";
import {
  getPendingCandidates,
  getAllCandidates,
  approveCandidate,
  rejectCandidate,
  getCandidateStatus,
  getApprovedCandidates,
  getCandidateDocument,
  getElectionVoteCount,
} from "../controllers/candidateController.js";
import { verifyAdmin, verifyToken, verifyAdminForDocument, verifyCandidate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/admin/candidates/pending", verifyAdmin, getPendingCandidates);
router.get("/admin/candidates", verifyAdmin, getAllCandidates);
router.get("/admin/candidates/:candidateId/document", verifyAdminForDocument, getCandidateDocument);
router.post("/admin/candidates/:candidateId/approve", verifyAdmin, approveCandidate);
router.post("/admin/candidates/:candidateId/reject", verifyAdmin, rejectCandidate);

router.get("/candidates/approved", verifyToken, getApprovedCandidates);

router.get("/candidates/:candidateId/status", verifyToken, getCandidateStatus);
router.get("/candidates/:candidateId/election-votes", verifyCandidate, getElectionVoteCount);

export default router;
