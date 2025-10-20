import express from "express";
import {
  getPendingCandidates,
  getAllCandidates,
  approveCandidate,
  rejectCandidate,
  getCandidateStatus,
} from "../controllers/candidateController.js";
import { verifyAdmin, verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes - manage candidate applications
router.get("/admin/candidates/pending", verifyAdmin, getPendingCandidates);
router.get("/admin/candidates", verifyAdmin, getAllCandidates);
router.post("/admin/candidates/:candidateId/approve", verifyAdmin, approveCandidate);
router.post("/admin/candidates/:candidateId/reject", verifyAdmin, rejectCandidate);

// Candidate routes - check own application status
router.get("/candidates/:candidateId/status", verifyToken, getCandidateStatus);

export default router;
