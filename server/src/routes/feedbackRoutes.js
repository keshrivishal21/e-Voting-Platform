import express from "express";
import {
  getAllFeedbacks,
  getPublicFeedbacks,
  approveFeedback,
  submitFeedback,
  submitCandidateFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";
import { verifyAdmin, verifyStudent, verifyCandidate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes - view feedbacks
router.get('/feedbacks', getPublicFeedbacks);

// Admin routes - manage feedbacks
router.get("/admin/feedbacks", verifyAdmin, getAllFeedbacks);
router.post('/admin/feedbacks/:feedbackId/approve', verifyAdmin, approveFeedback);
router.delete("/admin/feedbacks/:feedbackId", verifyAdmin, deleteFeedback);

// Student routes - submit feedback
router.post("/feedbacks", verifyStudent, submitFeedback);

// Candidate routes - submit feedback
router.post("/candidate/feedbacks", verifyCandidate, submitCandidateFeedback);

export default router;
