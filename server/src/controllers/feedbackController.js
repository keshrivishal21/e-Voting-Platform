import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all feedbacks (Admin only)
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await prisma.fEEDBACK.findMany({
      orderBy: { FB_time: "desc" },
      include: {
        user: true,
      },
    });

    // Format feedbacks for display
    const formattedFeedbacks = feedbacks.map((feedback) => ({
      id: feedback.FB_id,
      sender: feedback.user.User_id.toString(),
      role: feedback.User_type,
      message: feedback.Message,
      date: feedback.FB_time.toISOString().split("T")[0],
      fullDate: feedback.FB_time,
      status: feedback.Status,
    }));

    res.status(200).json({
      success: true,
      message: "Feedbacks retrieved successfully",
      data: { feedbacks: formattedFeedbacks },
    });
  } catch (error) {
    console.error("Get feedbacks error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Submit feedback (Student only)
export const submitFeedback = async (req, res) => {
  try {
    const { studentId, feedbackText } = req.body;

    if (!studentId || !feedbackText) {
      return res.status(400).json({
        success: false,
        message: "Student ID and feedback text are required",
      });
    }

    const feedback = await prisma.fEEDBACK.create({
      data: {
        User_id: BigInt(studentId),
        User_type: "Student",
        Message: feedbackText,
        FB_time: new Date(),
        Status: "Pending",
      },
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: { feedback: { ...feedback, User_id: feedback.User_id.toString() } },
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Submit feedback (Candidate only)
export const submitCandidateFeedback = async (req, res) => {
  try {
    const { studentId, feedbackText } = req.body;

    if (!studentId || !feedbackText) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID and feedback text are required",
      });
    }

    const feedback = await prisma.fEEDBACK.create({
      data: {
        User_id: BigInt(studentId),
        User_type: "Candidate",
        Message: feedbackText,
        FB_time: new Date(),
        Status: "Pending",
      },
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: { feedback: { ...feedback, User_id: feedback.User_id.toString() } },
    });
  } catch (error) {
    console.error("Submit candidate feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete feedback (Admin only)
export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    if (!feedbackId) {
      return res.status(400).json({
        success: false,
        message: "Feedback ID is required",
      });
    }

    await prisma.fEEDBACK.delete({
      where: { FB_id: parseInt(feedbackId) },
    });

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
