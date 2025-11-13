import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TokenManager = () => {
  const { 
    userType, 
    userData, 
    getCurrentToken, 
    hasSessionFor, 
    switchRole,
    logout 
  } = useAuth();

  const clearSpecificSession = (role) => {
    const tokenKey = `${role.toLowerCase()}Token`;
    
    localStorage.removeItem(tokenKey);
    
    const activeSession = JSON.parse(localStorage.getItem('activeSession') || '{}');
    if (activeSession.userType === role) {
      logout();
    } else {
      window.location.reload();
    }
  };

  const getAllStoredSessions = () => {
    const roles = ['Student', 'Candidate', 'Admin'];
    return roles.map(role => ({
      role,
      hasToken: hasSessionFor(role),
      tokenKey: `${role.toLowerCase()}Token`,
      token: localStorage.getItem(`${role.toLowerCase()}Token`)?.substring(0, 20) + '...' || 'None',
    }));
  };

  const sessions = getAllStoredSessions();

  return (
    <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Token Manager</h3>
      
      {/* Current Session */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">Current Active Session</h4>
        <div className="bg-blue-50 p-3 rounded border">
          <p><strong>Role:</strong> {userType || 'None'}</p>
          <p><strong>User:</strong> {userData?.name || userData?.email || 'None'}</p>
          <p><strong>Token:</strong> {getCurrentToken()?.substring(0, 20) + '...' || 'None'}</p>
        </div>
      </div>

      {/* All Sessions */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">All Stored Sessions</h4>
        <div className="space-y-2">
          {sessions.map(session => (
            <div 
              key={session.role}
              className={`p-3 rounded border ${session.hasToken ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{session.role}</p>
                  <p className="text-sm text-gray-600">
                    Token: {session.hasToken ? '✓ Present' : '✗ None'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {session.hasToken && session.role !== userType && (
                    <button
                      onClick={() => switchRole(session.role)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Switch
                    </button>
                  )}
                  {session.hasToken && (
                    <button
                      onClick={() => clearSpecificSession(session.role)}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => logout()}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear All Sessions (Logout)
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => switchRole('Student')}
            disabled={!hasSessionFor('Student')}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Student Session
          </button>
          <button
            onClick={() => switchRole('Candidate')}
            disabled={!hasSessionFor('Candidate')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Candidate Session
          </button>
        </div>
      </div>

      {/* Storage Info */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <p><strong>Active Session:</strong> {localStorage.getItem('activeSession')}</p>
        <p><strong>Legacy Token:</strong> {localStorage.getItem('authToken') ? 'Present' : 'None'}</p>
      </div>
    </div>
  );
};

export default TokenManager;