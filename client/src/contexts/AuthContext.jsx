import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthAPI from '../utils/authAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null); // 'Student', 'Candidate', 'Admin'
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Clean up any unwanted keys first
        localStorage.removeItem('token'); // Remove this extra key if it exists
        localStorage.removeItem('authToken'); // Legacy cleanup
        localStorage.removeItem('userType'); // Legacy cleanup  
        localStorage.removeItem('userData'); // Legacy cleanup

        // Check for current user type
        const currentUserType = localStorage.getItem('currentUserType');

        if (currentUserType) {
          const tokenKey = `${currentUserType.toLowerCase()}Token`;
          const token = localStorage.getItem(tokenKey);

          if (!token) {
            // No token stored
            localStorage.removeItem('currentUserType');
            setIsAuthenticated(false);
            setUserType(null);
            setLoading(false);
            return;
          }

          // Prefer server-side validation of the token when possible
          try {
            const { response, data } = await AuthAPI.verifyToken();
            if (response && response.ok && data && data.success) {
              setIsAuthenticated(true);
              setUserType(currentUserType);
            } else {
              // Token invalid on server -> cleanup
              localStorage.removeItem(tokenKey);
              localStorage.removeItem('currentUserType');
              setIsAuthenticated(false);
              setUserType(null);
            }
          } catch (err) {
            // Network or server error while validating. Fall back to client-side expiry check.
            console.warn('Server token validation failed, falling back to local expiry check:', err.message || err);
            if (token && !isTokenExpired(token)) {
              setIsAuthenticated(true);
              setUserType(currentUserType);
            } else {
              localStorage.removeItem(tokenKey);
              localStorage.removeItem('currentUserType');
              setIsAuthenticated(false);
              setUserType(null);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for global unauthorized events dispatched by apiClient
  useEffect(() => {
    const handleGlobalUnauthorized = (event) => {
      // Prevent the apiClient from doing a fallback redirect
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }

      // Perform client-side logout and redirect to login
      try {
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      } catch (err) {
        console.error('Error handling global unauthorized event', err);
      }
    };

    window.addEventListener('auth:unauthorized', handleGlobalUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleGlobalUnauthorized);
  }, []);

  // Simple login function - just token and type
  const login = (token, type) => {
    try {
      // Store token with role-specific key
      const tokenKey = `${type.toLowerCase()}Token`;
      localStorage.setItem(tokenKey, token);
      localStorage.setItem('currentUserType', type);
      
      setIsAuthenticated(true);
      setUserType(type);
    } catch (error) {
      console.error('Error saving token:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  const logout = () => {
    // Clear ONLY the tokens we want to store
    localStorage.removeItem('currentUserType');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('candidateToken');
    
    // Clean up any legacy or unwanted keys
    localStorage.removeItem('token'); // Remove this extra key
    localStorage.removeItem('authToken'); // Legacy cleanup
    localStorage.removeItem('userType'); // Legacy cleanup
    localStorage.removeItem('userData'); // Legacy cleanup
    localStorage.removeItem('adminToken'); // Not needed for your use case
    
    setIsAuthenticated(false);
    setUserType(null);
  };

  const getCurrentToken = () => {
    if (!userType) return null;
    const token = localStorage.getItem(`${userType.toLowerCase()}Token`);
    if (!token) return null;
    // Return null and cleanup if token expired
    if (isTokenExpired(token)) {
      localStorage.removeItem(`${userType.toLowerCase()}Token`);
      localStorage.removeItem('currentUserType');
      setIsAuthenticated(false);
      setUserType(null);
      return null;
    }
    return token;
  };

  // Check JWT expiry (returns true if token is expired)
  const isTokenExpired = (token) => {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return true;
      // Add padding if necessary
      const pad = payloadBase64.length % 4;
      const b64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const padded = pad ? b64 + '='.repeat(4 - pad) : b64;
      const decoded = atob(padded);
      const payload = JSON.parse(decoded);
      if (!payload.exp) return false; // tokens without exp considered valid
      const nowSec = Math.floor(Date.now() / 1000);
      return payload.exp <= nowSec;
    } catch (err) {
      console.error('Error checking token expiry:', err);
      return true;
    }
  };

  const hasSessionFor = (role) => {
    const token = localStorage.getItem(`${role.toLowerCase()}Token`);
    return !!token;
  };

  // Helper functions for role checking
  const isStudent = () => userType === 'Student';
  const isCandidate = () => userType === 'Candidate';
  const isAdmin = () => userType === 'Admin';

  // Debug function to check what's stored
  const getStorageInfo = () => {
    return {
      currentUserType: localStorage.getItem('currentUserType'),
      studentToken: localStorage.getItem('studentToken') ? '✓ Present' : '✗ None',
      candidateToken: localStorage.getItem('candidateToken') ? '✓ Present' : '✗ None',
      extraToken: localStorage.getItem('token') ? '❌ Unwanted' : '✓ Clean',
    };
  };

  const value = {
    isAuthenticated,
    userType,
    loading,
    login,
    logout,
    getCurrentToken,
    hasSessionFor,
    isStudent,
    isCandidate,
    isAdmin,
    getStorageInfo, // Debug helper
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;