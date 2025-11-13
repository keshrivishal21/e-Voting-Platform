import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Send automatic system notification to all users
 * @param {string} message 
 * @param {number|null} adminId 
 * @returns {Promise<number>} 
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

/**
 * Send individual notification to a specific user
 * @param {number|bigint} userId - The user ID
 * @param {string} userType - User type: 'Student' or 'Candidate'
 * @param {string} message - The notification message
 * @param {number|null} adminId - Admin ID who triggered the notification
 */
export async function sendIndividualNotification(userId, userType, message, adminId = null) {
  try {
    // If no adminId provided, use the first admin or default to 1
    if (!adminId) {
      const admin = await prisma.aDMIN.findFirst({
        select: { Admin_id: true }
      });
      adminId = admin?.Admin_id || 1;
    }

    // Convert BigInt to regular number if needed
    const userIdInt = typeof userId === 'bigint' ? Number(userId) : parseInt(userId);

    const notification = await prisma.nOTIFICATION.create({
      data: {
        User_id: userIdInt,
        User_type: userType,
        Notif_message: message,
        Notif_time: new Date(),
        Admin_id: parseInt(adminId),
      },
    });

    console.log(`Sent individual notification to ${userType} ${userId}: "${message}"`);
    return notification;
  } catch (error) {
    console.error("Error sending individual notification:", error);
    throw error;
  }
}

/**
 * Notify candidate when their application is approved
 * @param {number|bigint} candidateId - Candidate ID
 * @param {string} candidateName - Candidate name
 * @param {string} position - Position applied for
 * @param {string} electionTitle - Election title
 * @param {number} adminId - Admin who approved
 */
export async function notifyCandidateApproved(candidateId, candidateName, position, electionTitle, adminId) {
  const message = `✅ Congratulations ${candidateName}! Your candidacy for ${position} in "${electionTitle}" has been APPROVED. Good luck with your campaign!`;
  return await sendIndividualNotification(candidateId, 'Candidate', message, adminId);
}

/**
 * Notify candidate when their application is rejected
 * @param {number|bigint} candidateId - Candidate ID
 * @param {string} candidateName - Candidate name
 * @param {string} position - Position applied for
 * @param {string} electionTitle - Election title
 * @param {string|null} reason - Rejection reason
 * @param {number} adminId - Admin who rejected
 */
export async function notifyCandidateRejected(candidateId, candidateName, position, electionTitle, reason, adminId) {
  let message = `❌ Dear ${candidateName}, your candidacy for ${position} in "${electionTitle}" has been rejected.`;
  if (reason) {
    message += ` Reason: ${reason}`;
  }
  message += ` You may contact the admin for more information.`;
  return await sendIndividualNotification(candidateId, 'Candidate', message, adminId);
}

/**
 * Notify student when their feedback is approved
 * @param {number|bigint} studentId - Student ID
 * @param {string} userType - 'Student' or 'Candidate'
 * @param {number} adminId - Admin who approved
 */
export async function notifyFeedbackApproved(studentId, userType, adminId) {
  const message = `✅ Great news! Your feedback has been approved and is now visible on the public testimonials page. Thank you for sharing your thoughts!`;
  return await sendIndividualNotification(studentId, userType, message, adminId);
}

/**
 * Notify student when their feedback is deleted
 * @param {number|bigint} studentId - Student ID
 * @param {string} userType - 'Student' or 'Candidate'
 * @param {number} adminId - Admin who deleted
 */
export async function notifyFeedbackDeleted(studentId, userType, adminId) {
  const message = `❌ Your feedback has been removed by the administrator. If you have questions, please contact the admin.`;
  return await sendIndividualNotification(studentId, userType, message, adminId);
}
