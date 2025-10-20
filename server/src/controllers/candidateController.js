import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    res.status(200).json({
      success: true,
      message: "Pending candidates retrieved successfully",
      data: { candidates },
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

    res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data: { candidates, count: candidates.length },
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

    res.status(200).json({
      success: true,
      message: "Candidate approved successfully",
      data: { candidate: updatedCandidate },
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

    res.status(200).json({
      success: true,
      message: "Candidate rejected",
      data: { candidate: updatedCandidate },
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

    res.status(200).json({
      success: true,
      message: "Candidate status retrieved successfully",
      data: { candidate },
    });
  } catch (error) {
    console.error("Get candidate status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
