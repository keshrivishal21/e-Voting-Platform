import express from "express";
import {
	createElection,
	startElection,
	endElection,
	getElections,
	getElectionById,
	getElectionStats,
	declareResults,
	getElectionResults,
} from "../controllers/electionController.js";
import { verifyAdmin, verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/public/elections", getElections);

router.get("/results", getElectionResults);

router.get("/elections", verifyToken, getElections);

router.get("/elections/:electionId", verifyToken, getElectionById);

router.get("/admin/elections/:electionId/stats", verifyAdmin, getElectionStats);

router.post("/admin/elections", verifyAdmin, createElection);

router.post("/admin/elections/:electionId/start", verifyAdmin, startElection);

router.post("/admin/elections/:electionId/end", verifyAdmin, endElection);

router.post("/admin/elections/:electionId/declare-results", verifyAdmin, declareResults);

export default router;
