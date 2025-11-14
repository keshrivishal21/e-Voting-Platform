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
  const [userType, setUserType] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        localStorage.removeItem('token'); 
        localStorage.removeItem('authToken'); 
        localStorage.removeItem('userType');   
        localStorage.removeItem('userData'); 

        const currentUserType = localStorage.getItem('currentUserType');

        if (currentUserType) {
          const tokenKey = `${currentUserType.toLowerCase()}Token`;
          const token = localStorage.getItem(tokenKey);

          if (!token) {
            localStorage.removeItem('currentUserType');
            setIsAuthenticated(false);
            setUserType(null);
            setLoading(false);
            return;
          }

          try {
            const { response, data } = await AuthAPI.verifyToken();
            if (response && response.ok && data && data.success) {
              setIsAuthenticated(true);
              setUserType(currentUserType);
            } else {
              localStorage.removeItem(tokenKey);
              localStorage.removeItem('currentUserType');
              setIsAuthenticated(false);
              setUserType(null);
            }
          } catch (err) {
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

  useEffect(() => {
    const handleGlobalUnauthorized = (event) => {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }

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
    localStorage.removeItem('currentUserType');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('candidateToken');
    
    setIsAuthenticated(false);
    setUserType(null);
  };

  const getCurrentToken = () => {
    if (!userType) return null;
    const token = localStorage.getItem(`${userType.toLowerCase()}Token`);
    if (!token) return null;
    if (isTokenExpired(token)) {
      localStorage.removeItem(`${userType.toLowerCase()}Token`);
      localStorage.removeItem('currentUserType');
      setIsAuthenticated(false);
      setUserType(null);
      return null;
    }
    return token;
  };


  const isTokenExpired = (token) => {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return true;
      const pad = payloadBase64.length % 4;
      const b64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const padded = pad ? b64 + '='.repeat(4 - pad) : b64;
      const decoded = atob(padded);
      const payload = JSON.parse(decoded);
      if (!payload.exp) return false; 
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

  const isStudent = () => userType === 'Student';
  const isCandidate = () => userType === 'Candidate';
  const isAdmin = () => userType === 'Admin';

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
    getStorageInfo, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;