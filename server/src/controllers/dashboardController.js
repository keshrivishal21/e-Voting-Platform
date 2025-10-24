import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get dashboard statistics (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts for different entities
    const [
      totalStudents,
      activeElections,
      pendingCandidates,
      totalFeedbacks,
      completedElections,
    ] = await Promise.all([
      prisma.sTUDENT.count(),
      prisma.eLECTION.count({ where: { Status: "Ongoing" } }),
      prisma.cANDIDATE.count({ where: { Status: "Pending" } }),
      prisma.fEEDBACK.count(),
      prisma.eLECTION.count({ where: { Status: "Completed" } }),
    ]);

    // Get voting trends for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const votes = await prisma.vOTE.findMany({
      where: {
        Vote_time: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        Vote_time: true,
      },
    });

    // Group votes by month
    const votingTrends = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    votes.forEach((vote) => {
      const month = monthNames[vote.Vote_time.getMonth()];
      votingTrends[month] = (votingTrends[month] || 0) + 1;
    });

    const votingTrendsArray = Object.entries(votingTrends).map(([month, votes]) => ({
      month,
      votes,
    }));

    // Provide default data if no voting trends exist
    const defaultVotingTrends = votingTrendsArray.length > 0 
      ? votingTrendsArray 
      : [
          { month: "Jan", votes: 0 },
          { month: "Feb", votes: 0 },
          { month: "Mar", votes: 0 },
          { month: "Apr", votes: 0 },
          { month: "May", votes: 0 },
          { month: "Jun", votes: 0 },
        ];

    res.status(200).json({
      success: true,
      message: "Dashboard stats retrieved successfully",
      data: {
        stats: {
          totalStudents,
          activeElections,
          pendingCandidates,
          feedbackCount: totalFeedbacks,
        },
        electionData: [
          { name: "Active", value: activeElections },
          { name: "Completed", value: completedElections },
        ],
        votingTrends: defaultVotingTrends,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get recent activity logs (Admin only)
export const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const logs = await prisma.sYSTEM_LOGS.findMany({
      orderBy: { Log_time: "desc" },
      take: limit,
      include: {
        admin: {
          select: {
            Admin_name: true,
          },
        },
      },
    });

    // Format logs for display
    const formattedLogs = logs.map((log) => {
      const timeAgo = getTimeAgo(log.Log_time);
      return {
        id: log.Log_id,
        message: log.Action,
        icon: getIconForAction(log.Log_type),
        time: timeAgo,
        actionType: log.Log_type,
      };
    });

    res.status(200).json({
      success: true,
      message: "Recent activity retrieved successfully",
      data: { activity: formattedLogs },
    });
  } catch (error) {
    console.error("Get recent activity error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Helper function to get icon for action type
function getIconForAction(actionType) {
  const icons = {
    "Candidate Request": "📝",
    "Candidate Approved": "✅",
    "Candidate Rejected": "❌",
    "Election Created": "🗳️",
    "Voting Started": "🔴",
    "Feedback Received": "💬",
    "Results Published": "📊",
    "Notification Sent": "🔔",
  };
  return icons[actionType] || "📌";
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return `${seconds} sec ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}
