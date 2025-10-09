import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Elections = () => {
  const [activeTab, setActiveTab] = useState('current');

  // Sample data
  const currentElections = [
    { id: 1, name: 'Student Council Election', path: '/vote/1' },
    { id: 2, name: 'Club President Election', path: '/vote/2' },
    { id: 1, name: 'Student Council Election', path: '/vote/1' },
    { id: 2, name: 'Club President Election', path: '/vote/2' },
  ];

  const upcomingElections = [
    { id: 1, name: 'Sports Committee Election', path: '/apply/1' },
    { id: 2, name: 'Cultural Committee Election', path: '/apply/2' },
    { id: 1, name: 'Sports Committee Election', path: '/apply/1' },
    { id: 2, name: 'Cultural Committee Election', path: '/apply/2' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 ">
        <div className="mt-20 max-w-6xl mx-auto mb-18">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">Elections</h1>

      {/* Toggle Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 rounded-full font-medium transition ${
            activeTab === 'current'
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-100 text-indigo-600'
          }`}
        >
          Ongoing Elections
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-full font-medium transition ${
            activeTab === 'upcoming'
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-100 text-indigo-600'
          }`}
        >
          Upcoming Elections
        </button>
      </div>

      {/* Elections List */}
      <div className="space-y-4">
        {activeTab === 'current' &&
          currentElections.map((election) => (
            <div
              key={election.id}
              className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg"
            >
              <span className="text-indigo-800 font-medium">{election.name}</span>
              <Link
                to="/student/cast-vote"
                className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition"
              >
                Cast Vote
              </Link>
            </div>
          ))}

        {activeTab === 'upcoming' &&
          upcomingElections.map((election) => (
            <div
              key={election.id}
              className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg"
            >
              <span className="text-indigo-800 font-medium">{election.name}</span>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition"
              >
                Apply as Candidate
              </Link>
            </div>
          ))}
      </div>
      </div>
    </div>
  );
};

export default Elections;
