import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all notifications (Admin only)
export const getAllNotifications = async (req, res) => {
  try {
    // Get recent system logs related to notifications
    const logs = await prisma.sYSTEM_LOGS.findMany({
      where: {
        Log_type: "Audit",
        Action: {
          contains: "Notification sent",
        },
      },
      orderBy: { Log_time: "desc" },
      take: 50,
      include: {
        admin: {
          select: {
            Admin_name: true,
          },
        },
      },
    });

    // Format logs as notifications
    const formattedNotifications = logs.map((log) => {
      // Extract recipient type from action string
      const recipientMatch = log.Action.match(/Notification sent to (\w+):/);
      const messageMatch = log.Action.match(/: "(.+)"/);
      
      return {
        id: log.Log_id,
        recipient: recipientMatch ? recipientMatch[1] : "Unknown",
        message: messageMatch ? messageMatch[1] : log.Action,
        sentBy: log.admin?.Admin_name || "System",
        sentAt: log.Log_time,
      };
    });

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: { notifications: formattedNotifications },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Send notification (Admin only)
export const sendNotification = async (req, res) => {
  try {
    const { recipientType, message } = req.body;
    const adminId = req.user.userId; // From JWT token

    if (!recipientType || !message) {
      return res.status(400).json({
        success: false,
        message: "Recipient type and message are required",
      });
    }

    // Validate recipient type
    const validRecipients = ["Students", "Candidates", "All"];
    if (!validRecipients.includes(recipientType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient type",
      });
    }

    // Get all recipients based on type
    let recipients = [];
    
    if (recipientType === "Students" || recipientType === "All") {
      const students = await prisma.sTUDENT.findMany({ select: { Std_id: true } });
      recipients.push(...students.map(s => ({ User_id: s.Std_id, User_type: "Student" })));
    }
    
    if (recipientType === "Candidates" || recipientType === "All") {
      const candidates = await prisma.cANDIDATE.findMany({ select: { Can_id: true } });
      recipients.push(...candidates.map(c => ({ User_id: c.Can_id, User_type: "Candidate" })));
    }

    // Create notifications for all recipients
    const notifications = await Promise.all(
      recipients.map(recipient =>
        prisma.nOTIFICATION.create({
          data: {
            User_id: recipient.User_id,
            User_type: recipient.User_type,
            Notif_message: message,
            Notif_time: new Date(),
            Admin_id: parseInt(adminId),
          },
        })
      )
    );

    // Logging for notification sends is disabled by configuration/user request.
    // Previous behavior created a SYSTEM_LOGS entry here, but per project
    // preference we avoid persisting logs for sending notifications.

    res.status(201).json({
      success: true,
      message: `Notification sent successfully to ${notifications.length} recipient(s)`,
      data: {
        recipientCount: notifications.length,
      },
    });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get recent notifications for users (Students/Candidates)
export const getUserNotifications = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId); // From JWT token
    const userType = req.user.userType; // From JWT token
    const limit = parseInt(req.query.limit) || 10;

    const notifications = await prisma.nOTIFICATION.findMany({
      where: {
        User_id: userId,
        User_type: userType,
      },
      orderBy: { Notif_time: "desc" },
      take: limit,
      select: {
        N_id: true,
        Notif_message: true,
        Notif_time: true,
      },
    });

    // Convert BigInt for JSON serialization
    const formattedNotifications = notifications.map(n => ({
      id: n.N_id,
      message: n.Notif_message,
      time: n.Notif_time,
    }));

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: { notifications: formattedNotifications },
    });
  } catch (error) {
    console.error("Get user notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
