// Candidate API utility functions
const API_BASE_URL = "http://localhost:5000/api";

// Get current authentication token from localStorage
const getCurrentToken = () => {
  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("studentToken") ||
    localStorage.getItem("candidateToken")
  );
};

/**
 * Get all approved candidates grouped by election
 * @returns {Promise} Response with elections array containing candidates
 */
export const getApprovedCandidates = async () => {
  try {
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/candidate/candidates/approved`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch approved candidates");
    }

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
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/candidate/candidates/approved?electionId=${electionId}`,
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
      throw new Error(data.message || "Failed to fetch candidates");
    }

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
    const token = getCurrentToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/candidate/candidates/${candidateId}/status`,
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
      throw new Error(data.message || "Failed to fetch candidate status");
    }

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
    const token = localStorage.getItem("candidateToken");
    
    if (!token) {
      throw new Error("No candidate authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/candidate/candidates/${candidateId}/election-votes`,
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
      throw new Error(data.message || "Failed to fetch election vote count");
    }

    return data;
  } catch (error) {
    console.error("Error fetching election vote count:", error);
    throw error;
  }
};
