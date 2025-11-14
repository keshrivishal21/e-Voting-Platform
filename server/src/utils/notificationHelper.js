import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @param {string} message 
 * @param {number|null} adminId 
 * @returns {Promise<number>} 
 */
export async function sendSystemNotification(message, adminId = null) {
  try {
    if (!adminId) {
      const admin = await prisma.aDMIN.findFirst({
        select: { Admin_id: true }
      });
      adminId = admin?.Admin_id || 1;
    }

    const students = await prisma.sTUDENT.findMany({ select: { Std_id: true } });
    const candidates = await prisma.cANDIDATE.findMany({ select: { Can_id: true } });

    const recipients = [
      ...students.map(s => ({ User_id: s.Std_id, User_type: "Student" })),
      ...candidates.map(c => ({ User_id: c.Can_id, User_type: "Candidate" }))
    ];

    if (recipients.length === 0) {
      return;
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
 * @param {string} electionTitle 
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @param {number} adminId 
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
 * @param {string} electionTitle 
 * @param {Date} endDate 
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
 * @param {string} electionTitle 
 */
export async function notifyElectionEnded(electionTitle) {
  const message = `⏱️ Election Ended: "${electionTitle}" has concluded. Thank you for participating! Results will be declared shortly.`;
  return await sendSystemNotification(message);
}

/**
 * @param {string} electionTitle 
 * @param {number} totalVotes 
 */
export async function notifyResultsDeclared(electionTitle, totalVotes) {
  const message = `🏆 Results Declared: The results for "${electionTitle}" are now available! ${totalVotes} votes were cast. Check the results page to see the winners!`;
  return await sendSystemNotification(message);
}

/**
 * @param {number|bigint} userId 
 * @param {string} userType 
 * @param {string} message 
 * @param {number|null} adminId 
 */
export async function sendIndividualNotification(userId, userType, message, adminId = null) {
  try {
    if (!adminId) {
      const admin = await prisma.aDMIN.findFirst({
        select: { Admin_id: true }
      });
      adminId = admin?.Admin_id || 1;
    }

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
 * @param {number|bigint} candidateId 
 * @param {string} candidateName 
 * @param {string} position 
 * @param {string} electionTitle 
 * @param {number} adminId 
 */
export async function notifyCandidateApproved(candidateId, candidateName, position, electionTitle, adminId) {
  const message = `✅ Congratulations ${candidateName}! Your candidacy for ${position} in "${electionTitle}" has been APPROVED. Good luck with your campaign!`;
  return await sendIndividualNotification(candidateId, 'Candidate', message, adminId);
}

/**
 * @param {number|bigint} candidateId 
 * @param {string} candidateName 
 * @param {string} position 
 * @param {string} electionTitle 
 * @param {string|null} reason 
 * @param {number} adminId 
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
 * @param {number|bigint} studentId 
 * @param {string} userType 
 * @param {number} adminId 
 */
export async function notifyFeedbackApproved(studentId, userType, adminId) {
  const message = `✅ Great news! Your feedback has been approved and is now visible on the public testimonials page. Thank you for sharing your thoughts!`;
  return await sendIndividualNotification(studentId, userType, message, adminId);
}

/**
 * @param {number|bigint} studentId 
 * @param {string} userType 
 * @param {number} adminId 
 */
export async function notifyFeedbackDeleted(studentId, userType, adminId) {
  const message = `❌ Your feedback has been removed by the administrator. If you have questions, please contact the admin.`;
  return await sendIndividualNotification(studentId, userType, message, adminId);
}
