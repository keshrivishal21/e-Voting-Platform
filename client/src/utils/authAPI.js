import { apiFetch } from './apiClient';

class AuthAPI {
  // Admin login
  static async adminLogin(userId, password) {
    try {
      return await apiFetch('/auth/admin/login', {
        method: 'POST',
        body: { userId, password },
        auth: false,
      });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Student login
  static async studentLogin(email, password) {
    try {
      return await apiFetch('/auth/student/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Student registration
  static async studentRegister(formData) {
    try {
      return await apiFetch('/auth/student/register', {
        method: 'POST',
        body: formData,
        auth: false,
        isFormData: true,
      });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Candidate login
  static async candidateLogin(email, password) {
    try {
      return await apiFetch('/auth/candidate/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Candidate registration
  static async candidateRegister(formData) {
    try {
      return await apiFetch('/auth/candidate/register', {
        method: 'POST',
        body: formData,
        auth: false,
        isFormData: true,
      });
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
      return await apiFetch('/auth/validate', { method: 'GET' });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Check candidate status for student
  static async checkCandidateStatus() {
    try {
      return await apiFetch('/auth/student/candidate-status', { method: 'GET' });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Get student profile
  static async getStudentProfile(studentId) {
    try {
      return await apiFetch(`/auth/student/${studentId}/profile`, { method: 'GET' });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Update student profile
  static async updateStudentProfile(studentId, profileData) {
    try {
      const isFormData = profileData instanceof FormData;
      return await apiFetch(`/auth/student/${studentId}/profile`, {
        method: 'PUT',
        body: isFormData ? profileData : profileData,
        isFormData,
      });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Change student password
  static async changeStudentPassword(studentId, passwordData) {
    try {
      return await apiFetch(`/auth/student/${studentId}/change-password`, {
        method: 'PUT',
        body: passwordData,
      });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Get candidate profile
  static async getCandidateProfile(candidateId) {
    try {
      return await apiFetch(`/auth/candidate/${candidateId}/profile`, { method: 'GET' });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Update candidate profile
  static async updateCandidateProfile(candidateId, profileData) {
    try {
      return await apiFetch(`/auth/candidate/${candidateId}/profile`, {
        method: 'PUT',
        body: profileData,
      });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Change candidate password
  static async changeCandidatePassword(candidateId, passwordData) {
    try {
      return await apiFetch(`/auth/candidate/${candidateId}/change-password`, {
        method: 'PUT',
        body: passwordData,
      });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // ==================== FORGOT PASSWORD METHODS ====================

  // Request password reset
  static async requestPasswordReset(email, userType = 'student') {
    try {
      const path = userType === 'student' 
        ? '/auth/student/forgot-password'
        : '/auth/candidate/forgot-password';
      return await apiFetch(path, { method: 'POST', body: { email }, auth: false });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Reset password with token
  static async resetPassword(token, newPassword, userType = 'student') {
    try {
      const path = userType === 'student'
        ? '/auth/student/reset-password'
        : '/auth/candidate/reset-password';
      return await apiFetch(path, { method: 'POST', body: { token, newPassword }, auth: false });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Get public elections (no auth required)
  static async getPublicElections() {
    try {
      const { data } = await apiFetch('/election/public/elections?status=Upcoming', { method: 'GET', auth: false });
      return data;
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Submit feedback (Candidate)
  static async submitCandidateFeedback(feedbackText) {
    try {
      return await apiFetch('/feedback/candidate/feedbacks', {
        method: 'POST',
        body: { feedbackText },
      });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Get user notifications (Student/Candidate)
  static async getUserNotifications(limit = 10) {
    try {
      const { data } = await apiFetch(`/notification/notifications?limit=${limit}`, {
        method: 'GET',
      });
      return data;
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

export default AuthAPI;