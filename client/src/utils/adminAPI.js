import { apiFetch } from './apiClient';

// Keep API_BASE_URL for document URL construction
const API_BASE_URL = "http://localhost:5000/api";

/**
 * Get all pending candidate applications
 * @returns {Promise} Response with pending candidates array
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
 * Get all candidates with optional status filter
 * @param {string} status - Optional: "Pending", "Approved", "Rejected"
 * @returns {Promise} Response with candidates array
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
 * Approve a candidate application
 * @param {number} candidateId - The ID of the candidate to approve
 * @returns {Promise} Response with updated candidate data
 */
export const approveCandidate = async (candidateId) => {
  try {
    return await apiFetch(`/candidate/admin/candidates/${candidateId}/approve`, { method: 'POST' });
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
    return await apiFetch(`/candidate/admin/candidates/${candidateId}/reject`, { method: 'POST', body: { reason } });
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
  const token = localStorage.getItem('adminToken');
  return `${API_BASE_URL}/candidate/admin/candidates/${candidateId}/document?token=${token}`;
};

/**
 * Get dashboard statistics
 * @returns {Promise} Response with dashboard stats
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
 * Get recent activity logs
 * @param {number} limit - Number of records to fetch
 * @returns {Promise} Response with recent activity
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
 * Get all feedbacks
 * @returns {Promise} Response with feedbacks array
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
 * Approve a feedback by id
 * @param {number} feedbackId
 */
export const approveFeedback = async (feedbackId) => {
  try {
    return await apiFetch(`/feedback/admin/feedbacks/${feedbackId}/approve`, { method: 'POST' });
  } catch (error) {
    console.error('Error approving feedback:', error);
    throw error;
  }
};

/**
 * Delete a feedback (admin)
 * @param {number} feedbackId
 */
export const deleteFeedback = async (feedbackId) => {
  try {
    return await apiFetch(`/feedback/admin/feedbacks/${feedbackId}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

/**
 * Get all notifications
 * @returns {Promise} Response with notifications array
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
 * @param {string} recipientType - "Students", "Candidates", or "All"
 * @param {string} message - Notification message
 * @returns {Promise} Response with sent notification data
 */
export const sendNotification = async (recipientType, message) => {
  try {
    return await apiFetch('/notification/admin/notifications', { method: 'POST', body: { recipientType, message } });
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
    const { data } = await apiFetch('/student/admin/students', { method: 'GET' });
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
    const { data } = await apiFetch(`/student/admin/students/${studentId}`, { method: 'GET' });
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
    const { data } = await apiFetch('/student/admin/students/stats', { method: 'GET' });
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
    const { data } = await apiFetch(`/student/admin/students/${studentId}/voting-history`, { method: 'GET' });
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
  approveFeedback,
  deleteFeedback,
  getAllNotifications,
  sendNotification,
  getAllStudents,
  getStudentById,
  getStudentStats,
  getStudentVotingHistory,
};
