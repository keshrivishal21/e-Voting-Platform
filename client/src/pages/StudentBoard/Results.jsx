import React, { useState, useEffect } from "react";
import ElectionAPI from "../../utils/electionAPI";
import toast from "react-hot-toast";

const Results = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");
      const { response, data } = await ElectionAPI.getElectionResults();
      
      if (response.ok && data.success) {
        setElections(data.data.elections || []);
      } else {
        const errorMsg = data.message || "Failed to fetch results";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      const errorMsg = "Failed to load election results";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) return null;
    if (profilePic.startsWith('data:')) return profilePic;
    if (profilePic.startsWith('http')) return profilePic;
    return `http://localhost:5000${profilePic}`;
  };

  const electionsWithResults = elections.filter(election => election.hasResults);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="mt-20 max-w-6xl mx-auto mb-18">
        <h1 className="text-4xl font-bold text-indigo-600 text-center">
          Election Results
        </h1>
        <p className="text-center text-gray-600 mt-2 px-5">
          Congratulations to the winners of the recent elections! Here are the results for each post.
        </p>

        {loading ? (
          <div className="flex items-center justify-center mt-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading results...</p>
            </div>
          </div>
        ) : error ? (
          <div className="mt-10 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchResults}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        ) : electionsWithResults.length === 0 ? (
          <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <p className="text-blue-700 text-lg">📊 No results declared yet</p>
            <p className="text-gray-600 mt-2">Results will be displayed here once elections are completed and results are declared.</p>
          </div>
        ) : (
          <div className="space-y-12 mt-10">
            {electionsWithResults.map((election) => (
              <div key={election.electionId} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Election Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                  <h2 className="text-2xl font-bold">{election.title}</h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm opacity-90">
                    <span>📅 {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}</span>
                    <span>✅ Status: {election.status}</span>
                  </div>
                </div>

                {/* Results by Position */}
                <div className="p-6 space-y-8">
                  {Object.entries(election.results).map(([position, candidates]) => (
                    <div key={position} className="border-b border-gray-200 last:border-b-0 pb-8 last:pb-0">
                      {/* Position Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-800">{position}</h3>
                        {/* <span className="text-sm text-gray-500">({candidates.length} candidate{candidates.length !== 1 ? 's' : ''})</span> */}
                      </div>

                      {/* Candidates List */}
                      <div className="space-y-3">
                        {candidates.map((candidate, index) => {
                          const isWinner = index === 0;
                          const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
                          const votePercentage = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0;

                          return (
                            <div
                              key={candidate.candidateId}
                              className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                isWinner
                                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md'
                                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {/* Rank Badge */}
                              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                isWinner ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-300 text-gray-700'
                              }`}>
                                {isWinner ? '🏆' : `#${index + 1}`}
                              </div>

                              {/* Profile Picture */}
                              {candidate.profilePic ? (
                                <img
                                  className="w-16 h-16 object-cover rounded-full border-2 border-white shadow-sm"
                                  src={getProfilePicUrl(candidate.profilePic)}
                                  alt={candidate.candidateName}
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.candidateName)}&size=64&background=6366f1&color=fff`;
                                  }}
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full border-2 border-white shadow-sm bg-indigo-100 flex items-center justify-center">
                                  <span className="text-xl font-bold text-indigo-600">
                                    {candidate.candidateName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}

                              {/* Candidate Info */}
                              <div className="flex-1 text-center md:text-left min-w-0">
                                <p className="font-semibold text-gray-800 text-lg truncate">
                                  {candidate.candidateName}
                                  {isWinner && <span className="ml-2 text-green-600">✓ Winner</span>}
                                </p>
                                <p className="text-sm text-gray-600 truncate">{candidate.candidateEmail}</p>
                                <p className="text-sm text-gray-500">
                                  {candidate.branch} • Year {candidate.year}
                                </p>
                              </div>

                              {/* Vote Stats */}
                              <div className="flex-shrink-0 text-center">
                                <p className="text-2xl font-bold text-indigo-600">{candidate.voteCount}</p>
                                <p className="text-xs text-gray-500">votes</p>
                                <div className="mt-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                  {votePercentage}%
                                </div>
                              </div>

                              {/* Vote Bar
                              <div className="w-full md:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    isWinner ? 'bg-green-500' : 'bg-indigo-400'
                                  }`}
                                  style={{ width: `${votePercentage}%` }}
                                ></div>
                              </div> */}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
