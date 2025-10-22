const API_BASE_URL = 'http://localhost:5000/api';

class AuthAPI {
  // Admin login
  static async adminLogin(userId, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password })
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

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

  // Get current active token
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

  // Verify token
  static async verifyToken() {
    try {
      const token = this.getCurrentToken();
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
      const token = this.getCurrentToken();
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

  // Get student profile
  static async getStudentProfile(studentId) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/student/${studentId}/profile`, {
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

  // Update student profile
  static async updateStudentProfile(studentId, profileData) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/student/${studentId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Change student password
  static async changeStudentPassword(studentId, passwordData) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/student/${studentId}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Get candidate profile
  static async getCandidateProfile(candidateId) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/candidate/${candidateId}/profile`, {
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

  // Update candidate profile
  static async updateCandidateProfile(candidateId, profileData) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/candidate/${candidateId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Change candidate password
  static async changeCandidatePassword(candidateId, passwordData) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/candidate/${candidateId}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // ==================== FORGOT PASSWORD METHODS ====================

  // Request password reset
  static async requestPasswordReset(email, userType = 'student') {
    try {
      const endpoint = userType === 'student' 
        ? `${API_BASE_URL}/auth/student/forgot-password`
        : `${API_BASE_URL}/auth/candidate/forgot-password`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Reset password with token
  static async resetPassword(token, newPassword, userType = 'student') {
    try {
      const endpoint = userType === 'student'
        ? `${API_BASE_URL}/auth/student/reset-password`
        : `${API_BASE_URL}/auth/candidate/reset-password`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Get public elections (no auth required)
  static async getPublicElections() {
    try {
      const response = await fetch(`${API_BASE_URL}/election/public/elections?status=Upcoming`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

export default AuthAPI;