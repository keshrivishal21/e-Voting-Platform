import express from "express";
import {
	createElection,
	startElection,
	endElection,
	getElections,
	getElectionById,
} from "../controllers/electionController.js";
import { verifyAdmin, verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all elections (public or authenticated) - can filter by status via query param
router.get("/elections", verifyToken, getElections);

// Get a single election by ID
router.get("/elections/:electionId", verifyToken, getElectionById);

// Admin creates a new election
router.post("/admin/elections", verifyAdmin, createElection);

// Admin starts an election
router.post("/admin/elections/:electionId/start", verifyAdmin, startElection);

// Admin ends an election
router.post("/admin/elections/:electionId/end", verifyAdmin, endElection);

export default router;
