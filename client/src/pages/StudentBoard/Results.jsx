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

  // Get profile picture URL
  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) return null;
    if (profilePic.startsWith('http')) return profilePic;
    return `http://localhost:5000${profilePic}`;
  };

  // Flatten results to show all winners by position
  const getAllWinners = () => {
    const winners = [];
    elections.forEach(election => {
      if (election.hasResults) {
        Object.entries(election.results).forEach(([position, candidates]) => {
          if (candidates.length > 0) {
            const winner = candidates[0]; // First candidate has highest votes
            winners.push({
              electionId: election.electionId,
              electionTitle: election.title,
              position: position,
              ...winner
            });
          }
        });
      }
    });
    return winners;
  };

  const winners = getAllWinners();

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
        ) : winners.length === 0 ? (
          <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <p className="text-blue-700 text-lg">📊 No results declared yet</p>
            <p className="text-gray-600 mt-2">Results will be displayed here once elections are completed and results are declared.</p>
          </div>
        ) : (
          <div className="space-y-8 mt-10">
            {winners.map((winner, index) => (
              <div key={`${winner.electionId}-${winner.position}-${index}`} className="bg-white rounded-2xl shadow-md border border-gray-300 p-6 flex flex-col md:flex-row items-center gap-6">
                {/* Winner Photo */}
                {winner.profilePic ? (
                  <img
                    className="w-32 h-32 object-cover rounded-full border-2 border-indigo-600"
                    src={getProfilePicUrl(winner.profilePic)}
                    alt={winner.candidateName}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(winner.candidateName)}&size=128&background=6366f1&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-2 border-indigo-600 bg-indigo-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-indigo-600">
                      {winner.candidateName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Winner Details */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-semibold text-indigo-800">
                    {winner.position}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{winner.electionTitle}</p>
                  <p className="text-gray-700 font-medium mt-2">{winner.candidateName}</p>
                  <p className="text-gray-500 text-sm">
                    {winner.candidateEmail}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {winner.branch} • Year {winner.year}
                  </p>
                </div>

                {/* Votes */}
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Votes Received</p>
                  <p className="text-indigo-600 font-bold text-2xl">{winner.voteCount}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    🏆 Winner
                  </span>
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
