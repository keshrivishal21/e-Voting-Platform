import express from "express";
import {
	createElection,
	startElection,
	endElection,
	getElections,
	getElectionById,
	declareResults,
	getElectionResults,
} from "../controllers/electionController.js";
import { verifyAdmin, verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public endpoint - Get upcoming/ongoing elections (for candidate registration)
router.get("/public/elections", getElections);

// Public endpoint - Get election results (completed elections)
router.get("/results", getElectionResults);

// Get all elections (authenticated) - can filter by status via query param
router.get("/elections", verifyToken, getElections);

// Get a single election by ID
router.get("/elections/:electionId", verifyToken, getElectionById);

// Admin creates a new election
router.post("/admin/elections", verifyAdmin, createElection);

// Admin starts an election
router.post("/admin/elections/:electionId/start", verifyAdmin, startElection);

// Admin ends an election
router.post("/admin/elections/:electionId/end", verifyAdmin, endElection);

// Admin declares/calculates results for an election
router.post("/admin/elections/:electionId/declare-results", verifyAdmin, declareResults);

export default router;
