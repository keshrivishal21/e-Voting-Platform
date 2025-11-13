import { PrismaClient } from "@prisma/client";
import { notifyCandidateApproved, notifyCandidateRejected } from "../utils/notificationHelper.js";

const prisma = new PrismaClient();

const serializeCandidate = (candidate) => {
  if (!candidate) return null;
  return {
    ...candidate,
    Can_id: candidate.Can_id.toString(),
  };
};

const serializeCandidates = (candidates) => {
  return candidates.map(serializeCandidate);
};

export const getPendingCandidates = async (req, res) => {
  try {
    const candidates = await prisma.cANDIDATE.findMany({
      where: { Status: "Pending" },
      include: {
        election: {
          select: {
            Title: true,
            Start_date: true,
            End_date: true,
          },
        },
      },
      orderBy: { Can_id: "desc" },
    });

    const serializedCandidates = serializeCandidates(candidates);

    res.status(200).json({
      success: true,
      message: "Pending candidates retrieved successfully",
      data: { candidates: serializedCandidates },
    });
  } catch (error) {
    console.error("Get pending candidates error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllCandidates = async (req, res) => {
  try {
    const { status } = req.query; 

    const whereClause = status ? { Status: status } : {};

    const candidates = await prisma.cANDIDATE.findMany({
      where: whereClause,
      include: {
        election: {
          select: {
            Title: true,
            Start_date: true,
            End_date: true,
            Status: true,
          },
        },
      },
      orderBy: { Can_id: "desc" },
    });

    const serializedCandidates = serializeCandidates(candidates);

    res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data: { candidates: serializedCandidates, count: candidates.length },
    });
  } catch (error) {
    console.error("Get all candidates error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const approveCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    const candidate = await prisma.cANDIDATE.findUnique({
      where: { Can_id: parseInt(candidateId) },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidate.Status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Candidate is already approved",
      });
    }

    const updatedCandidate = await prisma.cANDIDATE.update({
      where: { Can_id: parseInt(candidateId) },
      data: {
        Status: "Approved",
        Rejection_reason: null,
      },
      include: {
        election: {
          select: { Title: true },
        },
      },
    });

    try {
      const adminId = req.user?.userId || null;
      await notifyCandidateApproved(
        updatedCandidate.Can_id,
        updatedCandidate.Can_name,
        updatedCandidate.Position,
        updatedCandidate.election.Title,
        adminId
      );
    } catch (notifError) {
      console.error("Failed to send approval notification:", notifError);
    }

    const serializedCandidate = serializeCandidate(updatedCandidate);

    res.status(200).json({
      success: true,
      message: "Candidate approved successfully",
      data: { candidate: serializedCandidate },
    });
  } catch (error) {
    console.error("Approve candidate error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const rejectCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { reason } = req.body; 

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    const candidate = await prisma.cANDIDATE.findUnique({
      where: { Can_id: parseInt(candidateId) },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidate.Status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Candidate is already rejected",
      });
    }

    const updatedCandidate = await prisma.cANDIDATE.update({
      where: { Can_id: parseInt(candidateId) },
      data: {
        Status: "Rejected",
        Rejection_reason: reason || null,
      },
      include: {
        election: {
          select: { Title: true },
        },
      },
    });

    try {
      const adminId = req.user?.userId || null;
      await notifyCandidateRejected(
        updatedCandidate.Can_id,
        updatedCandidate.Can_name,
        updatedCandidate.Position,
        updatedCandidate.election.Title,
        reason,
        adminId
      );
    } catch (notifError) {
      console.error("Failed to send rejection notification:", notifError);
    }

    const serializedCandidate = serializeCandidate(updatedCandidate);

    res.status(200).json({
      success: true,
      message: "Candidate rejected",
      data: { candidate: serializedCandidate },
    });
  } catch (error) {
    console.error("Reject candidate error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCandidateStatus = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidate = await prisma.cANDIDATE.findUnique({
      where: { Can_id: parseInt(candidateId) },
      select: {
        Can_id: true,
        Can_name: true,
        Status: true,
        Rejection_reason: true,
        election: {
          select: {
            Title: true,
            Start_date: true,
            End_date: true,
            Status: true,
          },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const serializedCandidate = serializeCandidate(candidate);

    res.status(200).json({
      success: true,
      message: "Candidate status retrieved successfully",
      data: { candidate: serializedCandidate },
    });
  } catch (error) {
    console.error("Get candidate status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getApprovedCandidates = async (req, res) => {
  try {
    const candidates = await prisma.cANDIDATE.findMany({
      where: { Status: "Approved" },
      include: {
        election: {
          select: {
            Election_id: true,
            Title: true,
            Start_date: true,
            End_date: true,
            Status: true,
          },
        },
      },
      orderBy: [
        { election: { Start_date: "asc" } },
        { Can_name: "asc" },
      ],
    });

    const electionMap = new Map();

    candidates.forEach((candidate) => {
      if (!candidate.election) {
        return;
      }

      const electionId = candidate.election.Election_id;
      
      if (!electionMap.has(electionId)) {
        electionMap.set(electionId, {
          id: candidate.election.Election_id,
          title: candidate.election.Title,
          startDate: candidate.election.Start_date,
          endDate: candidate.election.End_date,
          status: candidate.election.Status,
          candidates: [],
        });
      }

      let profileBase64 = null;
      if (candidate.Profile) {
        let profileBuffer = candidate.Profile;
        
        if (profileBuffer instanceof Buffer) {
          profileBase64 = `data:image/jpeg;base64,${profileBuffer.toString('base64')}`;
        } 
        else if (typeof profileBuffer === 'object' && !Array.isArray(profileBuffer)) {
          profileBuffer = Buffer.from(Object.values(profileBuffer));
          profileBase64 = `data:image/jpeg;base64,${profileBuffer.toString('base64')}`;
        }
      }

      electionMap.get(electionId).candidates.push({
        id: candidate.Can_id.toString(), 
        scholarId: candidate.Can_id.toString(), 
        name: candidate.Can_name,
        email: candidate.Can_email,
        phone: candidate.Can_phone,
        branch: candidate.Branch,
        year: `${candidate.Year}${candidate.Year === 1 ? 'st' : candidate.Year === 2 ? 'nd' : candidate.Year === 3 ? 'rd' : 'th'} Year`,
        cgpa: candidate.Cgpa,
        position: candidate.Position,
        manifesto: candidate.Manifesto, 
        photo: profileBase64, 
      });
    });

    const elections = Array.from(electionMap.values());

    res.status(200).json({
      success: true,
      message: "Approved candidates retrieved successfully",
      data: { elections },
    });
  } catch (error) {
    console.error("Get approved candidates error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCandidateDocument = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    const candidate = await prisma.cANDIDATE.findUnique({
      where: { Can_id: BigInt(candidateId) },
      select: {
        Can_id: true,
        Can_name: true,
        Data: true,
      },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (!candidate.Data || candidate.Data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No document found for this candidate",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="marksheet_${candidate.Can_name.replace(/\s+/g, "_")}.pdf"`
    );
    
    res.send(candidate.Data);
  } catch (error) {
    console.error("Get candidate document error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getElectionVoteCount = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    const candidate = await prisma.cANDIDATE.findUnique({
      where: { Can_id: BigInt(candidateId) },
      select: {
        Can_id: true,
        Can_name: true,
        Position: true,
        Election_id: true,
        Status: true,
        election: {
          select: {
            Election_id: true,
            Title: true,
            Status: true,
            Start_date: true,
            End_date: true,
          }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (!candidate.Election_id) {
      return res.status(400).json({
        success: false,
        message: "Candidate is not assigned to an election",
      });
    }

    const totalVotesInElection = await prisma.vOTE.count({
      where: {
        Election_id: candidate.Election_id
      }
    });

    const studentsVoted = await prisma.vOTE.groupBy({
      by: ['Std_id'],
      where: {
        Election_id: candidate.Election_id
      }
    });

    const totalStudents = await prisma.sTUDENT.count();

    res.status(200).json({
      success: true,
      message: "Election vote count retrieved successfully",
      data: {
        candidate: {
          id: candidate.Can_id.toString(),
          name: candidate.Can_name,
          position: candidate.Position,
          status: candidate.Status
        },
        election: {
          id: candidate.election.Election_id,
          title: candidate.election.Title,
          status: candidate.election.Status,
          startDate: candidate.election.Start_date,
          endDate: candidate.election.End_date
        },
        totalVotesInElection,
        studentsVoted: studentsVoted.length,
        totalStudents,
        turnoutPercentage: totalStudents > 0 ? ((studentsVoted.length / totalStudents) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error("Get election vote count error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
