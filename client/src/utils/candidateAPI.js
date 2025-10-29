import { apiFetch } from './apiClient';

// Keep API_BASE_URL for document URL generation
const API_BASE_URL = "http://localhost:5000/api";

/**
 * Get all approved candidates grouped by election
 * @returns {Promise} Response with elections array containing candidates
 */
export const getApprovedCandidates = async () => {
  try {
    const { data } = await apiFetch('/candidate/candidates/approved', { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching approved candidates:", error);
    throw error;
  }
};

/**
 * Get candidates for a specific election
 * @param {number} electionId - The ID of the election
 * @returns {Promise} Response with candidates array
 */
export const getCandidatesByElection = async (electionId) => {
  try {
    const { data } = await apiFetch(`/candidate/candidates/approved?electionId=${electionId}`, { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching candidates by election:", error);
    throw error;
  }
};

/**
 * Get candidate status (for candidates to check their own application)
 * @param {number} candidateId - The ID of the candidate
 * @returns {Promise} Response with candidate status
 */
export const getCandidateStatus = async (candidateId) => {
  try {
    const { data } = await apiFetch(`/candidate/candidates/${candidateId}/status`, { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching candidate status:", error);
    throw error;
  }
};

/**
 * Get total vote count for the election a candidate is registered in
 * @param {number} candidateId - The ID of the candidate
 * @returns {Promise} Response with election vote count
 */
export const getElectionVoteCount = async (candidateId) => {
  try {
    const { data } = await apiFetch(`/candidate/candidates/${candidateId}/election-votes`, { method: 'GET' });
    return data;
  } catch (error) {
    console.error("Error fetching election vote count:", error);
    throw error;
  }
};
