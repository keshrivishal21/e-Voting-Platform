import express from "express";
import {
  getAllNotifications,
  sendNotification,
  getUserNotifications,
} from "../controllers/notificationController.js";
import { verifyAdmin, verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes - manage notifications
router.get("/admin/notifications", verifyAdmin, getAllNotifications);
router.post("/admin/notifications", verifyAdmin, sendNotification);

// User routes - get notifications
router.get("/notifications", verifyToken, getUserNotifications);

export default router;
