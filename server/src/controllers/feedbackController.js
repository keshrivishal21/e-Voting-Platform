import { PrismaClient } from "@prisma/client";
import { notifyFeedbackApproved, notifyFeedbackDeleted } from "../utils/notificationHelper.js";

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

export const getPublicFeedbacks = async (req, res) => {
  try {
    const feedbacks = await prisma.fEEDBACK.findMany({
      where: { Status: 'Approved' },
      orderBy: { FB_time: 'desc' },
      include: {
        user: {
          include: {
            student: true,
            candidate: true,
          },
        },
      },
    });

    const formatted = feedbacks.map((fb) => {
      // Default avatar
      let avatar = null;
      let name = fb.User_type === 'Student' ? fb.user.student?.Std_name : fb.user.candidate?.Can_name;

      try {
        if (fb.user) {
          if (fb.User_type === 'Student' && fb.user.student && fb.user.student.Profile) {
            avatar = `data:image/jpeg;base64,${Buffer.from(fb.user.student.Profile).toString('base64')}`;
          } else if (fb.User_type === 'Candidate' && fb.user.candidate) {
            const candidateProfile = fb.user.candidate.Profile || fb.user.candidate.Data;
            if (candidateProfile) {
              avatar = `data:image/jpeg;base64,${Buffer.from(candidateProfile).toString('base64')}`;
            }
          }
        }
      } catch (err) {
        console.warn('Failed to convert profile blob to base64 for feedback avatar', err?.message || err);
      }

      return {
        id: fb.FB_id,
        name: name || fb.user?.User_id?.toString() || 'Anonymous',
        role: fb.User_type,
        message: fb.Message,
        date: fb.FB_time ? fb.FB_time.toISOString().split('T')[0] : null,
        fullDate: fb.FB_time,
        avatar,
      };
    });

    res.status(200).json({ success: true, message: 'Public feedbacks retrieved', data: { feedbacks: formatted } });
  } catch (error) {
    console.error('Get public feedbacks error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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

    const feedback = await prisma.fEEDBACK.findUnique({
      where: { FB_id: parseInt(feedbackId) },
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    await prisma.fEEDBACK.delete({
      where: { FB_id: parseInt(feedbackId) },
    });

    // Send notification to user
    try {
      const adminId = req.user?.userId || null;
      await notifyFeedbackDeleted(feedback.User_id, feedback.User_type, adminId);
    } catch (notifError) {
      console.error("Failed to send feedback deletion notification:", notifError);
    }

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

// Approve feedback
export const approveFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    if (!feedbackId) {
      return res.status(400).json({ success: false, message: 'Feedback ID is required' });
    }

    const updated = await prisma.fEEDBACK.update({
      where: { FB_id: parseInt(feedbackId) },
      data: { Status: 'Approved' },
    });

    // Send notification to user
    try {
      const adminId = req.user?.userId || null;
      await notifyFeedbackApproved(updated.User_id, updated.User_type, adminId);
    } catch (notifError) {
      console.error("Failed to send feedback approval notification:", notifError);
    }

    res.status(200).json({ success: true, message: 'Feedback approved', data: { feedback: { ...updated, User_id: updated.User_id.toString() } } });
  } catch (error) {
    console.error('Approve feedback error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
