import express from "express";
import {
  getDashboardStats,
  getRecentActivity,
} from "../controllers/dashboardController.js";
import { verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes - dashboard stats
router.get("/admin/stats", verifyAdmin, getDashboardStats);
router.get("/admin/activity", verifyAdmin, getRecentActivity);

export default router;
