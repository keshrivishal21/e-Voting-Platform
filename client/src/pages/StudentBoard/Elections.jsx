import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ElectionAPI from '../../utils/electionAPI';

const Elections = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [currentElections, setCurrentElections] = useState([]);
  const [upcomingElections, setUpcomingElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);

  // Fetch elections on component mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchElections();
    }
  }, []);

  const fetchElections = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch ongoing elections
      const { response: ongoingResponse, data: ongoingData } = await ElectionAPI.getOngoingElections();
      
      // Fetch upcoming elections
      const { response: upcomingResponse, data: upcomingData } = await ElectionAPI.getUpcomingElections();

      let hasSuccess = false;
      let hasError = false;

      if (ongoingResponse.ok && ongoingData.success) {
        setCurrentElections(ongoingData.data.elections || []);
        hasSuccess = true;
      } else {
        const errorMsg = ongoingData.message || 'Failed to fetch ongoing elections';
        console.error('Failed to fetch ongoing elections:', errorMsg);
        hasError = true;
      }

      if (upcomingResponse.ok && upcomingData.success) {
        setUpcomingElections(upcomingData.data.elections || []);
        hasSuccess = true;
      } else {
        const errorMsg = upcomingData.message || 'Failed to fetch upcoming elections';
        console.error('Failed to fetch upcoming elections:', errorMsg);
        hasError = true;
      }

      // Show single success toast if at least one request succeeded
      if (hasSuccess) {
        toast.success('Elections loaded successfully');
      }
      
      // Show error toast only if both failed
      if (!hasSuccess && hasError) {
        toast.error('Failed to load elections');
      }
    } catch (err) {
      console.error('Error fetching elections:', err);
      const errorMsg = 'Failed to load elections. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 ">
        <div className="mt-20 max-w-6xl mx-auto mb-18">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">Elections</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

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

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Elections List */}
          <div className="space-y-4">
            {activeTab === 'current' && (
              <>
                {currentElections.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No ongoing elections at the moment</p>
                  </div>
                ) : (
                  currentElections.map((election) => (
                    <div
                      key={election.Election_id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-indigo-800 font-semibold text-lg mb-2">{election.Title}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Started: {formatDate(election.Start_date)}</p>
                          <p>Ends: {formatDate(election.End_date)}</p>
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            🔴 Live
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/student/cast-vote"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition font-medium shadow-md hover:shadow-lg"
                      >
                        Cast Vote
                      </Link>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'upcoming' && (
              <>
                {upcomingElections.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No upcoming elections scheduled</p>
                  </div>
                ) : (
                  upcomingElections.map((election) => (
                    <div
                      key={election.Election_id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-indigo-800 font-semibold text-lg mb-2">{election.Title}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Starts: {formatDate(election.Start_date)}</p>
                          <p>Ends: {formatDate(election.End_date)}</p>
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            ⏰ Upcoming
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/register"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition font-medium shadow-md hover:shadow-lg"
                      >
                        Apply as Candidate
                      </Link>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default Elections;
