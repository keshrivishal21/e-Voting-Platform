import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Send automatic system notification to all users
 * @param {string} message - The notification message
 * @param {number|null} adminId - Admin ID (optional, defaults to system admin)
 * @returns {Promise<number>} Number of notifications sent
 */
export async function sendSystemNotification(message, adminId = null) {
  try {
    // If no adminId provided, use the first admin or default to 1
    if (!adminId) {
      const admin = await prisma.aDMIN.findFirst({
        select: { Admin_id: true }
      });
      adminId = admin?.Admin_id || 1;
    }

    // Get all students and candidates
    const students = await prisma.sTUDENT.findMany({ select: { Std_id: true } });
    const candidates = await prisma.cANDIDATE.findMany({ select: { Can_id: true } });

    // Prepare recipients
    const recipients = [
      ...students.map(s => ({ User_id: s.Std_id, User_type: "Student" })),
      ...candidates.map(c => ({ User_id: c.Can_id, User_type: "Candidate" }))
    ];

    if (recipients.length === 0) {
      console.log("No recipients found for system notification");
      return 0;
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

    console.log(`Sent system notification to ${notifications.length} recipient(s): "${message}"`);
    return notifications.length;
  } catch (error) {
    console.error("Error sending system notification:", error);
    throw error;
  }
}

/**
 * Send notification when a new election is created
 * @param {string} electionTitle - The title of the election
 * @param {Date} startDate - The start date of the election
 * @param {Date} endDate - The end date of the election
 * @param {number} adminId - Admin ID who created the election
 */
export async function notifyElectionCreated(electionTitle, startDate, endDate, adminId) {
  const startDateStr = startDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const endDateStr = endDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const message = `🗳️ New Election Created: "${electionTitle}" will be held from ${startDateStr} to ${endDateStr}. Stay tuned for more updates!`;
  return await sendSystemNotification(message, adminId);
}

/**
 * Send notification when an election starts
 * @param {string} electionTitle - The title of the election
 * @param {Date} endDate - The end date of the election
 */
export async function notifyElectionStarted(electionTitle, endDate) {
  const endDateStr = endDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const message = `🎯 Election Started: "${electionTitle}" is now LIVE! Cast your vote before ${endDateStr}. Your vote matters!`;
  return await sendSystemNotification(message);
}

/**
 * Send notification when an election ends
 * @param {string} electionTitle - The title of the election
 */
export async function notifyElectionEnded(electionTitle) {
  const message = `⏱️ Election Ended: "${electionTitle}" has concluded. Thank you for participating! Results will be declared shortly.`;
  return await sendSystemNotification(message);
}

/**
 * Send notification when election results are declared
 * @param {string} electionTitle - The title of the election
 * @param {number} totalVotes - Total number of votes cast
 */
export async function notifyResultsDeclared(electionTitle, totalVotes) {
  const message = `🏆 Results Declared: The results for "${electionTitle}" are now available! ${totalVotes} votes were cast. Check the results page to see the winners!`;
  return await sendSystemNotification(message);
}
