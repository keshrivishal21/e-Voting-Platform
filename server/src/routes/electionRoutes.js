import express from "express";
import {
	createElection,
	startElection,
	endElection,
} from "../controllers/electionController.js";
import { verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin creates a new election
router.post("/admin/elections", verifyAdmin, createElection);

// Admin starts an election
router.post("/admin/elections/:electionId/start", verifyAdmin, startElection);

// Admin ends an election
router.post("/admin/elections/:electionId/end", verifyAdmin, endElection);

export default router;
