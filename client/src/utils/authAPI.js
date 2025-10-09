const API_BASE_URL = 'http://localhost:5000/api';

class AuthAPI {
  // Student login
  static async studentLogin(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Student registration
  static async studentRegister(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/student/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Candidate login
  static async candidateLogin(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/candidate/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Candidate registration
  static async candidateRegister(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/candidate/register`, {
        method: 'POST',
        // Don't set Content-Type header - browser will set it automatically for FormData
        body: formData
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Verify token
  static async verifyToken() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
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

  // Check candidate status for student
  static async checkCandidateStatus() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/student/candidate-status`, {
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
}

export default AuthAPI;