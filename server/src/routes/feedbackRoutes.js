import express from "express";
import {
  getAllFeedbacks,
  submitFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";
import { verifyAdmin, verifyStudent } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes - manage feedbacks
router.get("/admin/feedbacks", verifyAdmin, getAllFeedbacks);
router.delete("/admin/feedbacks/:feedbackId", verifyAdmin, deleteFeedback);

// Student routes - submit feedback
router.post("/feedbacks", verifyStudent, submitFeedback);

export default router;
