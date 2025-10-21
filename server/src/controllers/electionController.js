import { PrismaClient } from "@prisma/client";
import { triggerSchedulerCheck } from "../services/electionScheduler.js";

const prisma = new PrismaClient();

// Create a new election (admin only)
export const createElection = async (req, res) => {
  try {
    const { title, startDate, endDate } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Title, startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Create election record
    const election = await prisma.eLECTION.create({
      data: {
        Title: title,
        Start_date: start,
        End_date: end,
        Status: "Upcoming",
        Created_by: req.user && req.user.userId ? req.user.userId : null,
      },
    });

    // Trigger scheduler to recalculate next run time (don't wait for it)
    triggerSchedulerCheck().catch(err => 
      console.error("Failed to trigger scheduler check:", err)
    );

    res.status(201).json({
      success: true,
      message: "Election created successfully",
      data: { election },
    });
  } catch (error) {
    console.error("Create election error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Start an election (admin only) - sets status to Ongoing and optionally updates start_date
export const startElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { force } = req.body;

    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: "Election ID is required",
      });
    }

    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: parseInt(electionId) },
    });

    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    if (election.Status === "Ongoing") {
      return res.status(400).json({ success: false, message: "Election already started" });
    }

    if (election.Status === "Completed") {
      return res.status(400).json({ success: false, message: "Cannot start a completed election" });
    }

    // Check if automatic scheduler is enabled and election has a future start date
    const schedulerEnabled = process.env.ENABLE_SCHEDULER !== 'false';
    const now = new Date();
    const hasScheduledStart = election.Start_date && election.Start_date > now;

    // Validation warning: require force flag if scheduler is active and election is scheduled
    if (schedulerEnabled && hasScheduledStart && !force) {
      return res.status(400).json({
        success: false,
        message: "This election is scheduled to start automatically. Use 'force: true' in request body to override and start immediately.",
        warning: "Automatic scheduler is enabled. Manual start will override the scheduled start time.",
        scheduledStartDate: election.Start_date,
      });
    }

    // Update status and set start date to now (manual override)
    const updated = await prisma.eLECTION.update({
      where: { Election_id: parseInt(electionId) },
      data: {
        Status: "Ongoing",
        Start_date: now,
      },
    });

    const responseMessage = force 
      ? "Election started manually (forced override)" 
      : "Election started";

    res.status(200).json({
      success: true,
      message: responseMessage,
      data: { election: updated },
    });
  } catch (error) {
    console.error("Start election error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Optional: End an election - sets status to Completed and optionally run result aggregation
export const endElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { force } = req.body;

    if (!electionId) {
      return res.status(400).json({ success: false, message: "Election ID is required" });
    }

    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: parseInt(electionId) },
    });

    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    if (election.Status === "Completed") {
      return res.status(400).json({ success: false, message: "Election already completed" });
    }

    if (election.Status === "Upcoming") {
      return res.status(400).json({ success: false, message: "Cannot end an election that hasn't started yet" });
    }

    // Check if automatic scheduler is enabled and election has a future end date
    const schedulerEnabled = process.env.ENABLE_SCHEDULER !== 'false';
    const now = new Date();
    const hasScheduledEnd = election.End_date && election.End_date > now;

    // Validation warning: require force flag if scheduler is active and election is scheduled to end later
    if (schedulerEnabled && hasScheduledEnd && !force) {
      return res.status(400).json({
        success: false,
        message: "This election is scheduled to end automatically. Use 'force: true' in request body to override and end immediately.",
        warning: "Automatic scheduler is enabled. Manual end will override the scheduled end time.",
        scheduledEndDate: election.End_date,
      });
    }

    const updated = await prisma.eLECTION.update({
      where: { Election_id: parseInt(electionId) },
      data: {
        Status: "Completed",
        End_date: now,
      },
    });

    // Optionally you might want to compute results here and persist them.

    const responseMessage = force 
      ? "Election ended manually (forced override)" 
      : "Election ended";

    res.status(200).json({ 
      success: true, 
      message: responseMessage, 
      data: { election: updated } 
    });
  } catch (error) {
    console.error("End election error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all elections (filtered by status if provided)
export const getElections = async (req, res) => {
  try {
    const { status } = req.query; // status can be: Upcoming, Ongoing, Completed

    const whereClause = status ? { Status: status } : {};

    const elections = await prisma.eLECTION.findMany({
      where: whereClause,
      orderBy: {
        Start_date: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: { elections },
    });
  } catch (error) {
    console.error("Get elections error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get a single election by ID
export const getElectionById = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: "Election ID is required",
      });
    }

    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: parseInt(electionId) },
    });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { election },
    });
  } catch (error) {
    console.error("Get election error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
