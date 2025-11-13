import { apiFetch } from './apiClient';

const API_BASE_URL = "http://localhost:5000/api";

/**
 * @returns {Promise} 
 */
export const getPendingCandidates = async () => {
  try {
    const { data } = await apiFetch('/candidate/admin/candidates/pending', { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching pending candidates:", error);
    throw error;
  }
};

/**
 * @param {string} status 
 * @returns {Promise} 
 */
export const getAllCandidates = async (status = null) => {
  try {
    const path = status ? `/candidate/admin/candidates?status=${status}` : `/candidate/admin/candidates`;
    const { data } = await apiFetch(path, { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

/**
 * @param {number} candidateId 
 * @returns {Promise} 
 */
export const approveCandidate = async (candidateId) => {
  try {
    const { data } = await apiFetch(`/candidate/admin/candidates/${candidateId}/approve`, { method: 'POST' });
    return data;
  } catch (error) {
    console.error("Error approving candidate:", error);
    throw error;
  }
};

/**
 * @param {number} candidateId 
 * @param {string} reason 
 * @returns {Promise} 
 */
export const rejectCandidate = async (candidateId, reason = null) => {
  try {
    const { data } = await apiFetch(`/candidate/admin/candidates/${candidateId}/reject`, { method: 'POST', body: { reason } });
    return data;
  } catch (error) {
    console.error("Error rejecting candidate:", error);
    throw error;
  }
};

/**
 * @param {number} candidateId 
 * @returns {string} 
 */
export const getCandidateDocumentUrl = (candidateId) => {
  const token = localStorage.getItem('adminToken');
  return `${API_BASE_URL}/candidate/admin/candidates/${candidateId}/document?token=${token}`;
};

/**
 * @returns {Promise} 
 */
export const getDashboardStats = async () => {
  try {
    const { data } = await apiFetch('/dashboard/admin/stats', { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

/**
 * @param {number} limit 
 * @returns {Promise} 
 */
export const getRecentActivity = async (limit = 20) => {
  try {
    const { data } = await apiFetch(`/dashboard/admin/activity?limit=${limit}`, { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw error;
  }
};

/**
 * @returns {Promise} 
 */
export const getAllFeedbacks = async () => {
  try {
    const { data } = await apiFetch('/feedback/admin/feedbacks', { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    throw error;
  }
};

/**
 * @param {number} feedbackId
 */
export const approveFeedback = async (feedbackId) => {
  try {
    const { data } = await apiFetch(`/feedback/admin/feedbacks/${feedbackId}/approve`, { method: 'POST' });
    return data;
  } catch (error) {
    console.error('Error approving feedback:', error);
    throw error;
  }
};

/**
 * @param {number} feedbackId
 */
export const deleteFeedback = async (feedbackId) => {
  try {
    const { data } = await apiFetch(`/feedback/admin/feedbacks/${feedbackId}`, { method: 'DELETE' });
    return data;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

/**
 * @returns {Promise} 
 */
export const getAllNotifications = async () => {
  try {
    const { data } = await apiFetch('/notification/admin/notifications', { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Send notification
 * @param {string} recipientType 
 * @param {string} message 
 * @returns {Promise} 
 */
export const sendNotification = async (recipientType, message) => {
  try {
    const { data } = await apiFetch('/notification/admin/notifications', { method: 'POST', body: { recipientType, message } });
    return data;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

/**
 * @returns {Promise}
 */
export const getAllStudents = async () => {
  try {
    const { data } = await apiFetch('/student/admin/students', { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

/**
 * @param {string} studentId 
 * @returns {Promise} 
 */
export const getStudentById = async (studentId) => {
  try {
    const { data } = await apiFetch(`/student/admin/students/${studentId}`, { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
};

/**
 * @returns {Promise} 
 */
export const getStudentStats = async () => {
  try {
    const { data } = await apiFetch('/student/admin/students/stats', { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching student stats:", error);
    throw error;
  }
};

/**
 * @param {string} studentId 
 * @returns {Promise} 
 */
export const getStudentVotingHistory = async (studentId) => {
  try {
    const { data } = await apiFetch(`/student/admin/students/${studentId}/voting-history`, { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching voting history:", error);
    throw error;
  }
};

/**
 * @param {string} status 
 * @returns {Promise} 
 */
export const getAllElections = async (status = null) => {
  try {
    const path = status ? `/election/elections?status=${status}` : `/election/elections`;
    const { data } = await apiFetch(path, { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching elections:", error);
    throw error;
  }
};

/**
 * @param {number} electionId 
 * @returns {Promise} 
 */
export const getElectionStats = async (electionId) => {
  try {
    const { data } = await apiFetch(`/election/admin/elections/${electionId}/stats`, { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching election stats:", error);
    throw error;
  }
};

/**
 * @param {number} electionId 
 * @param {object} options 
 * @returns {Promise} 
 */
export const declareElectionResults = async (electionId, options = {}) => {
  try {
    const { data } = await apiFetch(`/election/admin/elections/${electionId}/declare-results`, { 
      method: 'POST',
      body: options
    });
    return data;
  } catch (error) {
    console.error("Error declaring results:", error);
    throw error;
  }
};

/**
 * @param {number} electionId 
 * @param {boolean} force 
 * @returns {Promise} 
 */
export const startElection = async (electionId, force = false) => {
  try {
    const { data } = await apiFetch(`/election/admin/elections/${electionId}/start`, { 
      method: 'POST',
      body: { force }
    });
    return data;
  } catch (error) {
    console.error("Error starting election:", error);
    throw error;
  }
};

/**
 * @param {number} electionId 
 * @param {boolean} force 
 * @returns {Promise} 
 */
export const endElection = async (electionId, force = false) => {
  try {
    const { data } = await apiFetch(`/election/admin/elections/${electionId}/end`, { 
      method: 'POST',
      body: { force }
    });
    return data;
  } catch (error) {
    console.error("Error ending election:", error);
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
  approveFeedback,
  deleteFeedback,
  getAllNotifications,
  sendNotification,
  getAllStudents,
  getStudentById,
  getStudentStats,
  getStudentVotingHistory,
  getAllElections,
  getElectionStats,
  declareElectionResults,
  startElection,
  endElection,
};
