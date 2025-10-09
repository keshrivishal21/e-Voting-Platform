import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthStatus = () => {
  const { 
    isAuthenticated, 
    userType, 
    userData, 
    loading,
    isStudent,
    isCandidate,
    isAdmin 
  } = useAuth();

  if (loading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Loading authentication status...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Authentication Status</h3>
      
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Authenticated:</span>{' '}
          <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {isAuthenticated ? 'Yes' : 'No'}
          </span>
        </p>
        
        <p>
          <span className="font-medium">User Type:</span>{' '}
          <span className="text-blue-600">{userType || 'None'}</span>
        </p>
        
        <p>
          <span className="font-medium">Role Checks:</span>{' '}
          <span className="text-gray-600">
            Student: {isStudent() ? '✓' : '✗'} |{' '}
            Candidate: {isCandidate() ? '✓' : '✗'} |{' '}
            Admin: {isAdmin() ? '✓' : '✗'}
          </span>
        </p>
        
        {userData && (
          <div>
            <p className="font-medium">User Data:</p>
            <pre className="mt-1 p-2 bg-white border rounded text-xs overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        )}
        
        <div>
          <p className="font-medium">LocalStorage:</p>
          <div className="mt-1 text-xs space-y-1">
            <p>Token: {localStorage.getItem('authToken') ? '✓ Present' : '✗ Missing'}</p>
            <p>UserType: {localStorage.getItem('userType') || 'None'}</p>
            <p>UserData: {localStorage.getItem('userData') ? '✓ Present' : '✗ Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthStatus;