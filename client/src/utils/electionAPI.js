const API_BASE_URL = 'http://localhost:5000/api';

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

  // Get all elections (optional: filter by status)
  static async getElections(status = null) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const url = status 
        ? `${API_BASE_URL}/election/elections?status=${status}`
        : `${API_BASE_URL}/election/elections`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return { response, data };
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

  // Get a single election by ID
  static async getElectionById(electionId) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/election/elections/${electionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Admin: Create a new election
  static async createElection(electionData) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/election/admin/elections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(electionData)
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Admin: Start an election
  static async startElection(electionId, force = false) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/election/admin/elections/${electionId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ force })
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Admin: End an election
  static async endElection(electionId, force = false) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/election/admin/elections/${electionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ force })
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

export default ElectionAPI;
