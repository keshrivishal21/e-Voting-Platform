import { PrismaClient } from "@prisma/client";
import { triggerSchedulerCheck } from "../services/electionScheduler.js";
import { notifyElectionCreated, notifyElectionStarted, notifyElectionEnded, notifyResultsDeclared } from "../utils/notificationHelper.js";

const prisma = new PrismaClient();

// Create a new election (admin only)
export const createElection = async (req, res) => {
  try {
    const { title, startDate, endDate, autoDeclareResults, positions } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Title, startDate and endDate are required",
      });
    }

    if (!positions || !Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one position is required for the election",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();


    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (start < now) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    
    const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (end - start > maxDuration) {
      return res.status(400).json({
        success: false,
        message: "Election duration cannot exceed 30 days",
      });
    }

    const adminId = req.user && req.user.userId ? req.user.userId : null;
    if (adminId) {
      const adminExists = await prisma.aDMIN.findUnique({
        where: { Admin_id: adminId }
      });
      
      if (!adminExists) {
        return res.status(401).json({
          success: false,
          message: "Admin account not found. Please log in again or contact support.",
        });
      }
    }

    const election = await prisma.eLECTION.create({
      data: {
        Title: title,
        Start_date: start,
        End_date: end,
        Status: "Upcoming",
        Created_by: adminId,
        Auto_declare_results: autoDeclareResults !== undefined ? autoDeclareResults : true,
        Positions: JSON.stringify(positions), 
      },
    });

    notifyElectionCreated(title, start, end, adminId).catch(err => 
      console.error("Failed to send election created notification:", err)
    );

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

    const schedulerEnabled = process.env.ENABLE_SCHEDULER !== 'false';
    const now = new Date();
    const hasScheduledStart = election.Start_date && election.Start_date > now;

    if (schedulerEnabled && hasScheduledStart && !force) {
      return res.status(400).json({
        success: false,
        message: "This election is scheduled to start automatically. Use 'force: true' in request body to override and start immediately.",
        warning: "Automatic scheduler is enabled. Manual start will override the scheduled start time.",
        scheduledStartDate: election.Start_date,
      });
    }

    const updated = await prisma.eLECTION.update({
      where: { Election_id: parseInt(electionId) },
      data: {
        Status: "Ongoing",
        Start_date: now,
      },
    });

    notifyElectionStarted(updated.Title, updated.End_date).catch(err => 
      console.error("Failed to send election started notification:", err)
    );

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

    const schedulerEnabled = process.env.ENABLE_SCHEDULER !== 'false';
    const now = new Date();
    const hasScheduledEnd = election.End_date && election.End_date > now;

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

    notifyElectionEnded(updated.Title).catch(err => 
      console.error("Failed to send election ended notification:", err)
    );


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

export const getElections = async (req, res) => {
  try {
    const { status } = req.query; 

    const whereClause = status ? { Status: status } : {};

    const elections = await prisma.eLECTION.findMany({
      where: whereClause,
      orderBy: {
        Start_date: 'asc',
      },
    });

    const electionsWithPositions = elections.map(election => ({
      ...election,
      Positions: election.Positions ? JSON.parse(election.Positions) : []
    }));

    res.status(200).json({
      success: true,
      data: { elections: electionsWithPositions },
    });
  } catch (error) {
    console.error("Get elections error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

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

    const electionWithPositions = {
      ...election,
      Positions: election.Positions ? JSON.parse(election.Positions) : []
    };

    res.status(200).json({
      success: true,
      data: { election: electionWithPositions },
    });
  } catch (error) {
    console.error("Get election error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getElectionStats = async (req, res) => {
  try {
    const { electionId } = req.params;

    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: "Election ID is required",
      });
    }

    const electionIdInt = parseInt(electionId);

    // Get election details
    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: electionIdInt },
      include: {
        admin: {
          select: {
            Admin_id: true,
            Admin_name: true,
            Admin_email: true
          }
        }
      }
    });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Get all candidates for this election
    const candidates = await prisma.cANDIDATE.findMany({
      where: { Election_id: electionIdInt },
      select: {
        Can_id: true,
        Can_name: true,
        Position: true,
        Status: true,
        Branch: true,
        Year: true
      }
    });

    const votes = await prisma.vOTE.findMany({
      where: { Election_id: electionIdInt },
      select: {
        Vote_id: true,
        Std_id: true,
        Can_id: true,
        Vote_time: true
      }
    });

    const uniqueVoters = [...new Set(votes.map(v => v.Std_id.toString()))];

    const votesByCandidate = {};
    votes.forEach(vote => {
      const canId = vote.Can_id.toString();
      votesByCandidate[canId] = (votesByCandidate[canId] || 0) + 1;
    });

    const votesByPosition = {};
    votes.forEach(vote => {
      const candidate = candidates.find(c => c.Can_id === vote.Can_id);
      if (candidate) {
        const pos = candidate.Position;
        votesByPosition[pos] = (votesByPosition[pos] || 0) + 1;
      }
    });

    const candidatesByPosition = {};
    candidates.forEach(candidate => {
      const pos = candidate.Position;
      if (!candidatesByPosition[pos]) {
        candidatesByPosition[pos] = [];
      }
      candidatesByPosition[pos].push({
        ...candidate,
        Can_id: candidate.Can_id.toString(),
        voteCount: votesByCandidate[candidate.Can_id.toString()] || 0
      });
    });

    Object.keys(candidatesByPosition).forEach(position => {
      candidatesByPosition[position].sort((a, b) => b.voteCount - a.voteCount);
    });

    const declaredResults = await prisma.rESULT.findMany({
      where: { Election_id: electionIdInt }
    });

    const stats = {
      election: {
        id: election.Election_id,
        title: election.Title,
        startDate: election.Start_date,
        endDate: election.End_date,
        status: election.Status,
        autoDeclareResults: election.Auto_declare_results,
        createdBy: election.admin
      },
      candidates: {
        total: candidates.length,
        approved: candidates.filter(c => c.Status === 'Approved').length,
        pending: candidates.filter(c => c.Status === 'Pending').length,
        rejected: candidates.filter(c => c.Status === 'Rejected').length,
        byPosition: candidatesByPosition
      },
      votes: {
        total: votes.length,
        uniqueVoters: uniqueVoters.length,
        byPosition: votesByPosition,
        byCandidate: votesByCandidate
      },
      results: {
        declared: declaredResults.length > 0,
        count: declaredResults.length
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get election stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};

export const declareResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { tieBreaking } = req.body; 
    const adminId = req.user.userId;

    console.log(`Declaring results for election ${electionId} by admin ${adminId}`);
    if (tieBreaking) {
      console.log(`Tie-breaking decisions provided:`, tieBreaking);
    }

    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: "Election ID is required",
      });
    }

    const electionIdInt = parseInt(electionId);

    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: electionIdInt },
      select: {
        Election_id: true,
        Title: true,
        Status: true
      }
    });

    if (!election) {
      console.log(`Election ${electionId} not found`);
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    if (election.Status !== "Completed") {
      console.log(`Election ${electionId} is ${election.Status}, not Completed`);
      return res.status(400).json({
        success: false,
        message: `Can only declare results for completed elections. Current status: ${election.Status}`,
      });
    }

    const votes = await prisma.vOTE.findMany({
      where: { Election_id: electionIdInt },
      select: {
        Can_id: true,
        candidate: {
          select: {
            Can_id: true,
            Can_name: true,
            Position: true
          }
        }
      }
    });

    console.log(`Found ${votes.length} votes for election ${electionId}`);

    if (votes.length === 0) {
      console.log(`No votes found for election ${electionId}`);
      return res.status(400).json({
        success: false,
        message: "No votes found for this election",
      });
    }

    const voteCounts = new Map();
    votes.forEach(vote => {
      const candidateId = vote.Can_id.toString();
      voteCounts.set(candidateId, (voteCounts.get(candidateId) || 0) + 1);
    });

    const candidateIds = [...new Set(votes.map(v => v.Can_id))];

    const results = [];
    for (const candidateId of candidateIds) {
      const voteCount = voteCounts.get(candidateId.toString()) || 0;
      
      // Get the candidate's position for this election
      const candidate = await prisma.cANDIDATE.findFirst({
        where: {
          Can_id: candidateId,
          Election_id: electionIdInt
        },
        select: {
          Position: true
        }
      });

      if (!candidate) {
        console.error(`Candidate ${candidateId} not found for election ${electionIdInt}`);
        continue;
      }
      
      const result = await prisma.rESULT.upsert({
        where: {
          Election_id_Can_id: {
            Election_id: electionIdInt,
            Can_id: candidateId
          }
        },
        update: {
          Vote_count: voteCount,
          Position: candidate.Position
        },
        create: {
          Can_id: candidateId,
          Election_id: electionIdInt,
          Vote_count: voteCount,
          Position: candidate.Position,
          Admin_id: adminId
        },
        include: {
          candidate: {
            select: {
              Can_id: true,
              Can_name: true,
              Position: true
            }
          }
        }
      });
      results.push(result);
    }

    const resultsByPosition = {};
    results.forEach(result => {
      const position = result.candidate.Position;
      if (!resultsByPosition[position]) {
        resultsByPosition[position] = [];
      }
      resultsByPosition[position].push({
        candidateId: result.Can_id.toString(),
        candidateName: result.candidate.Can_name,
        voteCount: result.Vote_count
      });
    });

    Object.keys(resultsByPosition).forEach(position => {
      resultsByPosition[position].sort((a, b) => b.voteCount - a.voteCount);
    });

    notifyResultsDeclared(election.Title, votes.length).catch(err => 
      console.error("Failed to send results declared notification:", err)
    );

    console.log(`Results declared successfully for election ${electionId}`);
    console.log(`   - Total votes: ${votes.length}`);
    console.log(`   - Candidates with votes: ${results.length}`);
    console.log(`   - Positions: ${Object.keys(resultsByPosition).join(', ')}`);

    res.status(200).json({
      success: true,
      message: "Results declared successfully",
      data: {
        electionId: electionIdInt,
        electionTitle: election.Title,
        totalVotes: votes.length,
        candidatesCount: results.length,
        results: resultsByPosition
      }
    });
  } catch (error) {
    console.error("Declare results error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};

export const getElectionResults = async (req, res) => {
  try {
    const completedElections = await prisma.eLECTION.findMany({
      where: {
        Status: "Completed"
      },
      select: {
        Election_id: true,
        Title: true,
        Start_date: true,
        End_date: true,
        Status: true
      },
      orderBy: {
        End_date: 'desc'
      }
    });

    if (completedElections.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No completed elections found",
        data: { elections: [] }
      });
    }

    const electionsWithResults = await Promise.all(
      completedElections.map(async (election) => {
        // Only get results if they exist in RESULT table (results have been declared)
        const results = await prisma.rESULT.findMany({
          where: {
            Election_id: election.Election_id
          },
          include: {
            candidate: {
              select: {
                Can_id: true,
                Can_name: true,
                Can_email: true,
                Branch: true,
                Year: true,
                Profile: true
              }
            }
          },
          orderBy: {
            Vote_count: 'desc'
          }
        });

        // Skip this election if no results have been declared
        if (results.length === 0) {
          return null;
        }

        // Get all votes for transparency (timestamps only, no voter identity)
        const allVotes = await prisma.vOTE.findMany({
          where: {
            Election_id: election.Election_id
          },
          select: {
            Vote_id: true,
            Vote_time: true,
            Can_id: true,
            candidate: {
              select: {
                Position: true,
                Can_name: true
              }
            },
            receipt: {
              select: {
                Receipt_token: true,
                Generated_at: true
              }
            }
          },
          orderBy: {
            Vote_time: 'asc'
          }
        });

        const resultsByPosition = {};
        results.forEach(result => {
          const position = result.Position; // Use position from RESULT table, not CANDIDATE table
          if (!resultsByPosition[position]) {
            resultsByPosition[position] = [];
          }

          let profileBase64 = null;
          if (result.candidate.Profile) {
            let profileBuffer = result.candidate.Profile;
            
            if (profileBuffer instanceof Buffer) {
              profileBase64 = `data:image/jpeg;base64,${profileBuffer.toString('base64')}`;
            } 
            else if (typeof profileBuffer === 'object' && !Array.isArray(profileBuffer)) {
              profileBuffer = Buffer.from(Object.values(profileBuffer));
              profileBase64 = `data:image/jpeg;base64,${profileBuffer.toString('base64')}`;
            }
          }

          resultsByPosition[position].push({
            candidateId: result.Can_id.toString(),
            candidateName: result.candidate.Can_name,
            candidateEmail: result.candidate.Can_email,
            position: result.Position, // Use position from RESULT table
            branch: result.candidate.Branch,
            year: result.candidate.Year,
            profilePic: profileBase64,
            voteCount: result.Vote_count,
            isWinner: resultsByPosition[position].length === 0 
          });
        });

        // Format vote records for transparency (anonymous) - full receipt hash for verification
        const voteRecords = allVotes.map((vote, index) => ({
          voteNumber: index + 1,
          timestamp: vote.Vote_time,
          receiptHash: vote.receipt?.Receipt_token || null
        }));

        return {
          electionId: election.Election_id,
          title: election.Title,
          startDate: election.Start_date,
          endDate: election.End_date,
          status: election.Status,
          hasResults: results.length > 0,
          totalVotesCast: allVotes.length,
          results: resultsByPosition,
          voteRecords: voteRecords
        };
      })
    );

    // Filter out elections without declared results
    const electionsWithDeclaredResults = electionsWithResults.filter(election => election !== null);

    res.status(200).json({
      success: true,
      data: {
        elections: electionsWithDeclaredResults
      }
    });
  } catch (error) {
    console.error("Get election results error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};
