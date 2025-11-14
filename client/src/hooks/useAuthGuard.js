import { useAuth } from '../contexts/AuthContext';

export const useAuthGuard = () => {
  const { isAuthenticated, userType, userData, logout } = useAuth();

  const requireAuth = () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
  };

  const requireRole = (requiredRole) => {
    requireAuth();
    if (userType !== requiredRole) {
      throw new Error(`Access denied. Required role: ${requiredRole}`);
    }
  };

  const requireStudent = () => requireRole('Student');
  const requireCandidate = () => requireRole('Candidate');
  const requireAdmin = () => requireRole('Admin');

  const getAuthHeader = () => {
    const { getCurrentToken } = useAuth();
    const token = getCurrentToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const isCurrentUser = (userId) => {
    return userData && (userData.id === userId || userData.Scholar_no === userId);
  };

  return {
    isAuthenticated,
    userType,
    userData,
    logout,
    requireAuth,
    requireRole,
    requireStudent,
    requireCandidate,
    requireAdmin,
    getAuthHeader,
    isCurrentUser,
  };
};

export default useAuthGuard;