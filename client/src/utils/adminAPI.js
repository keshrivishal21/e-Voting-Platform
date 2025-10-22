// Admin API utility functions
const API_BASE_URL = "http://localhost:5000/api";

// Get current authentication token from localStorage
const getCurrentToken = () => {
  return localStorage.getItem("adminToken");
};

/**
 * Get all pending candidate applications
 * @returns {Promise} Response with pending candidates array
 */
export const getPendingCandidates = async () => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/candidate/admin/candidates/pending`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch pending candidates");
    }

    return data;
  } catch (error) {
    console.error("Error fetching pending candidates:", error);
    throw error;
  }
};

/**
 * Get all candidates with optional status filter
 * @param {string} status - Optional: "Pending", "Approved", "Rejected"
 * @returns {Promise} Response with candidates array
 */
export const getAllCandidates = async (status = null) => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = status 
      ? `${API_BASE_URL}/candidate/admin/candidates?status=${status}`
      : `${API_BASE_URL}/candidate/admin/candidates`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch candidates");
    }

    return data;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

/**
 * Approve a candidate application
 * @param {number} candidateId - The ID of the candidate to approve
 * @returns {Promise} Response with updated candidate data
 */
export const approveCandidate = async (candidateId) => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/candidate/admin/candidates/${candidateId}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to approve candidate");
    }

    return data;
  } catch (error) {
    console.error("Error approving candidate:", error);
    throw error;
  }
};

/**
 * Reject a candidate application
 * @param {number} candidateId - The ID of the candidate to reject
 * @param {string} reason - Optional rejection reason
 * @returns {Promise} Response with updated candidate data
 */
export const rejectCandidate = async (candidateId, reason = null) => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/candidate/admin/candidates/${candidateId}/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reject candidate");
    }

    return data;
  } catch (error) {
    console.error("Error rejecting candidate:", error);
    throw error;
  }
};

/**
 * Get candidate document/marksheet URL
 * @param {number} candidateId - The ID of the candidate
 * @returns {string} URL to view the document
 */
export const getCandidateDocumentUrl = (candidateId) => {
  const token = getCurrentToken();
  return `${API_BASE_URL}/candidate/admin/candidates/${candidateId}/document?token=${token}`;
};

/**
 * Get dashboard statistics
 * @returns {Promise} Response with dashboard stats
 */
export const getDashboardStats = async () => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/dashboard/admin/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch dashboard stats");
    }

    return data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

/**
 * Get recent activity logs
 * @param {number} limit - Number of records to fetch
 * @returns {Promise} Response with recent activity
 */
export const getRecentActivity = async (limit = 20) => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/dashboard/admin/activity?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch recent activity");
    }

    return data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw error;
  }
};

/**
 * Get all feedbacks
 * @returns {Promise} Response with feedbacks array
 */
export const getAllFeedbacks = async () => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/feedback/admin/feedbacks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch feedbacks");
    }

    return data;
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    throw error;
  }
};

/**
 * Get all notifications
 * @returns {Promise} Response with notifications array
 */
export const getAllNotifications = async () => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/notification/admin/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch notifications");
    }

    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Send notification
 * @param {string} recipientType - "Students", "Candidates", or "All"
 * @param {string} message - Notification message
 * @returns {Promise} Response with sent notification data
 */
export const sendNotification = async (recipientType, message) => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/notification/admin/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recipientType, message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send notification");
    }

    return data;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

/**
 * Get all students
 * @returns {Promise} Response with students array
 */
export const getAllStudents = async () => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/student/admin/students`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch students");
    }

    return data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

/**
 * Get student by ID
 * @param {string} studentId - Student ID
 * @returns {Promise} Response with student data
 */
export const getStudentById = async (studentId) => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/student/admin/students/${studentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch student");
    }

    return data;
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
};

/**
 * Get student statistics
 * @returns {Promise} Response with student stats
 */
export const getStudentStats = async () => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/student/admin/students/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch student statistics");
    }

    return data;
  } catch (error) {
    console.error("Error fetching student stats:", error);
    throw error;
  }
};

/**
 * Get student voting history
 * @param {string} studentId - Student ID
 * @returns {Promise} Response with voting history
 */
export const getStudentVotingHistory = async (studentId) => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/student/admin/students/${studentId}/voting-history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch voting history");
    }

    return data;
  } catch (error) {
    console.error("Error fetching voting history:", error);
    throw error;
  }
};

export default {
  getPendingCandidates,
  getAllCandidates,
  approveCandidate,
  rejectCandidate,
  getCandidateDocumentUrl,
  getDashboardStats,
  getRecentActivity,
  getAllFeedbacks,
  getAllNotifications,
  sendNotification,
  getAllStudents,
  getStudentById,
  getStudentStats,
  getStudentVotingHistory,
};
