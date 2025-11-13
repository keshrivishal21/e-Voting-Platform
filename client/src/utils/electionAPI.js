import { apiFetch } from './apiClient';

class ElectionAPI {
  // Get current token
  static getCurrentToken() {
    try {
      const currentUserType = localStorage.getItem('currentUserType');
      if (currentUserType) {
        const tokenKey = `${currentUserType.toLowerCase()}Token`;
        return localStorage.getItem(tokenKey);
      }
      return null;
    } catch (error) {
      console.error('Error getting current token:', error);
      return null;
    }
  }

  static async getElections(status = null) {
    try {
      const path = status ? `/election/elections?status=${status}` : `/election/elections`;
      return await apiFetch(path, { method: 'GET' });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Get ongoing elections
  static async getOngoingElections() {
    return this.getElections('Ongoing');
  }

  // Get upcoming elections
  static async getUpcomingElections() {
    return this.getElections('Upcoming');
  }

  // Get completed elections
  static async getCompletedElections() {
    return this.getElections('Completed');
  }

  static async getElectionById(electionId) {
    try {
      return await apiFetch(`/election/elections/${electionId}`, { method: 'GET' });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Admin: Create a new election
  static async createElection(electionData) {
    try {
      return await apiFetch('/election/admin/elections', { method: 'POST', body: electionData });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async startElection(electionId, force = false) {
    try {
      return await apiFetch(`/election/admin/elections/${electionId}/start`, { method: 'POST', body: { force } });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async endElection(electionId, force = false) {
    try {
      return await apiFetch(`/election/admin/elections/${electionId}/end`, { method: 'POST', body: { force } });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async declareResults(electionId) {
    try {
      return await apiFetch(`/election/admin/elections/${electionId}/declare-results`, { method: 'POST' });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async getElectionResults() {
    try {
      const response = await fetch('http://localhost:5000/api/election/results', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

export default ElectionAPI;
