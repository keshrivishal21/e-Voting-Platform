import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const initializeAuth = () => {
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
          
          if (token) {
            setIsAuthenticated(true);
            setUserType(currentUserType);
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
    return localStorage.getItem(`${userType.toLowerCase()}Token`);
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