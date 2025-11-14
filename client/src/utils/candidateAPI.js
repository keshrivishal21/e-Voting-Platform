import { apiFetch } from './apiClient';

const API_BASE_URL = "http://localhost:5000/api";

/**
 * @returns {Promise} 
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
 * @param {number} electionId 
 * @returns {Promise} 
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
 * @param {number} candidateId 
 * @returns {Promise} 
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
 * @param {number} candidateId 
 * @returns {Promise} 
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
