import express from "express";
import {
  getAllStudents,
  getStudentById,
  getStudentStats,
  getStudentVotingHistory,
} from "../controllers/studentController.js";
import { verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/admin/students", verifyAdmin, getAllStudents);
router.get("/admin/students/stats", verifyAdmin, getStudentStats);
router.get("/admin/students/:studentId", verifyAdmin, getStudentById);
router.get("/admin/students/:studentId/voting-history", verifyAdmin, getStudentVotingHistory);

export default router;
