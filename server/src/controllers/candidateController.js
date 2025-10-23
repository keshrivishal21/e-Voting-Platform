import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to convert BigInt fields to strings
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

// Get all pending candidate applications (Admin only)
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

    // Serialize BigInt fields
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

// Get all candidates with status filter (Admin only)
export const getAllCandidates = async (req, res) => {
  try {
    const { status } = req.query; // Optional: Pending, Approved, Rejected

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

    // Serialize BigInt fields
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

// Approve candidate application (Admin only)
export const approveCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    // Check if candidate exists
    const candidate = await prisma.cANDIDATE.findUnique({
      where: { Can_id: parseInt(candidateId) },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Check if already approved
    if (candidate.Status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Candidate is already approved",
      });
    }

    // Approve candidate - just update status
    const updatedCandidate = await prisma.cANDIDATE.update({
      where: { Can_id: parseInt(candidateId) },
      data: {
        Status: "Approved",
        Rejection_reason: null, // Clear any previous rejection reason
      },
      include: {
        election: {
          select: { Title: true },
        },
      },
    });

    // Serialize BigInt fields
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

// Reject candidate application (Admin only)
export const rejectCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { reason } = req.body; // Optional rejection reason

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    // Check if candidate exists
    const candidate = await prisma.cANDIDATE.findUnique({
      where: { Can_id: parseInt(candidateId) },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Check if already rejected
    if (candidate.Status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Candidate is already rejected",
      });
    }

    // Reject candidate with optional reason
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

    // Serialize BigInt fields
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

// Get candidate status (for candidate to check their application)
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

    // Serialize BigInt fields
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

// Get all approved candidates grouped by election (for students to view)
export const getApprovedCandidates = async (req, res) => {
  try {
    // Fetch all approved candidates with their election details
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

    // Group candidates by election
    const electionMap = new Map();

    candidates.forEach((candidate) => {
      // Skip candidates without an election assigned
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

      electionMap.get(electionId).candidates.push({
        id: candidate.Can_id.toString(), // Convert BigInt to string
        scholarId: candidate.Can_id.toString(), // Scholar ID
        name: candidate.Can_name,
        email: candidate.Can_email,
        phone: candidate.Can_phone,
        branch: candidate.Branch,
        year: `${candidate.Year}${candidate.Year === 1 ? 'st' : candidate.Year === 2 ? 'nd' : candidate.Year === 3 ? 'rd' : 'th'} Year`,
        cgpa: candidate.Cgpa,
        position: candidate.Position,
        manifesto: candidate.Manifesto, // This is text, not a URL
        photo: candidate.Profile ? `data:image/jpeg;base64,${candidate.Profile.toString('base64')}` : null, // Convert profile picture to base64
      });
    });

    // Convert map to array
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

// Get candidate document/marksheet (Admin only)
export const getCandidateDocument = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    // Fetch only the document data
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

    // Set appropriate headers for PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="marksheet_${candidate.Can_name.replace(/\s+/g, "_")}.pdf"`
    );
    
    // Send the binary data
    res.send(candidate.Data);
  } catch (error) {
    console.error("Get candidate document error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
