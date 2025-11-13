import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all notifications (Admin only)
export const getAllNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const notifications = await prisma.nOTIFICATION.findMany({
      orderBy: { Notif_time: "desc" },
      take: limit,
      include: {
        admin: {
          select: {
            Admin_name: true,
          },
        },
      },
    });

    const groupedNotifications = {};
    notifications.forEach(notif => {
      const key = `${notif.Notif_message}_${notif.Notif_time.getTime()}_${notif.Admin_id}`;
      if (!groupedNotifications[key]) {
        groupedNotifications[key] = {
          id: notif.N_id,
          message: notif.Notif_message,
          sentBy: notif.admin?.Admin_name || "System",
          sentAt: notif.Notif_time,
          recipientTypes: new Set(),
          recipientCount: 0
        };
      }
      groupedNotifications[key].recipientTypes.add(notif.User_type);
      groupedNotifications[key].recipientCount++;
    });

    const formattedNotifications = Object.values(groupedNotifications).map(group => {
      const recipientTypes = Array.from(group.recipientTypes);
      let recipient = "";
      if (recipientTypes.length === 2) {
        recipient = "All";
      } else if (recipientTypes.includes("Student")) {
        recipient = "Students";
      } else if (recipientTypes.includes("Candidate")) {
        recipient = "Candidates";
      } else {
        recipient = "Unknown";
      }

      return {
        id: group.id,
        recipient: recipient,
        message: group.message,
        sentBy: group.sentBy,
        sentAt: group.sentAt,
        recipientCount: group.recipientCount
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

export const getUserNotifications = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId); 
    const userType = req.user.userType; 
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
