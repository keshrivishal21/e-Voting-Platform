import React, { useState, useEffect } from "react";
import ElectionAPI from "../utils/electionAPI";
import toast from "react-hot-toast";

const Results = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);

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

  const openTransparencyModal = (election) => {
    setSelectedElection(election);
    setShowTransparencyModal(true);
  };

  const closeTransparencyModal = () => {
    setShowTransparencyModal(false);
    setSelectedElection(null);
  };

  const downloadTransparencyReport = (election, format = 'csv') => {
    if (!election || !election.voteRecords) return;

    if (format === 'csv') {
      // Generate CSV content
      const headers = ['Vote #', 'Timestamp', 'Receipt Hash (for verification)'];
      const rows = election.voteRecords.map(vote => [
        vote.voteNumber,
        new Date(vote.timestamp).toLocaleString('en-IN'),
        vote.receiptHash || 'N/A'
      ]);

      // Add summary section
      const summary = [
        [],
        ['ELECTION SUMMARY'],
        ['Election Title', election.title],
        ['Total Votes Cast', election.totalVotesCast],
        ['Election Period', `${new Date(election.startDate).toLocaleDateString()} to ${new Date(election.endDate).toLocaleDateString()}`],
        ['Status', election.status],
        [],
        ['VOTE COUNT BY CANDIDATE']
      ];

      // Add individual candidate vote counts
      Object.entries(election.results).forEach(([position, candidates]) => {
        summary.push([`Position: ${position}`]);
        candidates.forEach(candidate => {
          summary.push([candidate.candidateName, candidate.voteCount + ' votes']);
        });
        summary.push([]);
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ...summary.map(row => row.join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `election_transparency_report_${election.electionId}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Transparency report downloaded!');
    } else if (format === 'json') {
      // Generate JSON content
      const reportData = {
        electionInfo: {
          electionId: election.electionId,
          title: election.title,
          startDate: election.startDate,
          endDate: election.endDate,
          status: election.status,
          totalVotesCast: election.totalVotesCast
        },
        voteRecords: election.voteRecords,
        voteCounts: election.results,
        generatedAt: new Date().toISOString(),
        note: 'All votes are anonymous. Use receipt hash to verify your vote was counted.'
      };

      const jsonContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `election_transparency_report_${election.electionId}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      toast.success('Transparency report downloaded!');
    }
  };

  const electionsWithResults = elections.filter(election => election.hasResults);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="mt-20 sm:mt-24 max-w-6xl mx-auto mb-18">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 text-center">
          Election Results
        </h1>
        <p className="text-center text-sm sm:text-base text-gray-600 mt-2 px-2 sm:px-5">
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{election.title}</h2>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm opacity-90">
                        <span>📅 {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}</span>
                        <span>✅ Status: {election.status}</span>
                        {election.totalVotesCast > 0 && (
                          <span>🗳️ {election.totalVotesCast} votes cast</span>
                        )}
                      </div>
                    </div>
                    {election.totalVotesCast > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => openTransparencyModal(election)}
                          className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 transition text-sm font-medium shadow-md"
                        >
                          📊 View Report
                        </button>
                        <button
                          onClick={() => downloadTransparencyReport(election, 'csv')}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium shadow-md"
                        >
                          ⬇️ Download CSV
                        </button>
                      </div>
                    )}
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

      {/* Transparency Report Modal */}
      {showTransparencyModal && selectedElection && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={closeTransparencyModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                🔒 Election Transparency Report
              </h3>
              <p className="text-sm opacity-90 mt-2">{selectedElection.title}</p>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium uppercase">Total Votes Cast</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{selectedElection.totalVotesCast}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-green-600 font-medium uppercase">Positions</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{Object.keys(selectedElection.results).length}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-xs text-purple-600 font-medium uppercase">Status</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{selectedElection.status}</p>
                </div>
              </div>

              {/* Vote Counts by Candidate */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">📊 Vote Counts by Candidate</h4>
                <div className="space-y-4">
                  {Object.entries(selectedElection.results).map(([position, candidates]) => (
                    <div key={position} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="font-semibold text-gray-700 mb-2">{position}</p>
                      <div className="space-y-2">
                        {candidates.map((candidate, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{candidate.candidateName}</span>
                            <span className="font-bold text-indigo-600">{candidate.voteCount} votes</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vote Records Table */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">📋 Anonymous Vote Records</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-800">
                    <strong>⚠️ Important:</strong> All votes are anonymous. Use your receipt hash to verify your vote was counted correctly.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Receipt Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {selectedElection.voteRecords && selectedElection.voteRecords.map((vote) => (
                          <tr key={vote.voteNumber} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-gray-700 font-medium">{vote.voteNumber}</td>
                            <td className="px-4 py-3 text-gray-600 text-xs">
                              {new Date(vote.timestamp).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-3">
                              {vote.receiptHash ? (
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-indigo-600 font-mono break-all">
                                  {vote.receiptHash.substring(0, 20)}...
                                </code>
                              ) : (
                                <span className="text-gray-400 text-xs">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-indigo-50 px-8 py-5 border-t border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <p className="text-sm text-gray-700">
                💡 <span className="font-medium">Download the full report</span> to get complete receipt hashes for verification.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => downloadTransparencyReport(selectedElection, 'json')}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  Download JSON
                </button>
                <button
                  onClick={() => downloadTransparencyReport(selectedElection, 'csv')}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
