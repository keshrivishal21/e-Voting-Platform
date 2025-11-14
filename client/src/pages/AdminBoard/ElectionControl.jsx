import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminAPI from "../../utils/adminAPI";
import {
  ChartBarIcon,
  PlayIcon,
  StopIcon,
  TrophyIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const ElectionControl = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedPositions, setExpandedPositions] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [showTieBreakModal, setShowTieBreakModal] = useState(false);
  const [tieBreakData, setTieBreakData] = useState(null);
  const [selectedWinners, setSelectedWinners] = useState({});

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    filterElections();
  }, [elections, statusFilter]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAllElections();
      if (response.success) {
        setElections(response.data.elections || []);
        if (response.data.elections?.length > 0 && !selectedElection) {
          handleSelectElection(response.data.elections[0].Election_id);
        }
      }
    } catch (error) {
      console.error("Error fetching elections:", error);
      toast.error("Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  const filterElections = () => {
    if (statusFilter === "All") {
      setFilteredElections(elections);
    } else {
      setFilteredElections(elections.filter(e => e.Status === statusFilter));
    }
  };

  const handleSelectElection = async (electionId) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getElectionStats(electionId);
      if (response.success) {
        setStats(response.data);
        setSelectedElection(electionId);
      }
    } catch (error) {
      console.error("Error fetching election stats:", error);
      toast.error("Failed to load election statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleStartElection = async (electionId, force = false) => {
    try {
      setActionLoading(true);
      const response = await AdminAPI.startElection(electionId, force);
      if (response.success) {
        toast.success("Election started successfully!");
        await fetchElections();
        await handleSelectElection(electionId);
      } else {
        if (response.message?.includes("force: true")) {
          const confirm = window.confirm(
            `${response.message}\n\nDo you want to start this election now?`
          );
          if (confirm) {
            await handleStartElection(electionId, true);
          }
        } else {
          toast.error(response.message || "Failed to start election");
        }
      }
    } catch (error) {
      console.error("Error starting election:", error);
      toast.error(error.message || "Failed to start election");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndElection = async (electionId, force = false) => {
    try {
      setActionLoading(true);
      const response = await AdminAPI.endElection(electionId, force);
      if (response.success) {
        toast.success("Election ended successfully!");
        await fetchElections();
        await handleSelectElection(electionId);
      } else {
        if (response.message?.includes("force: true")) {
          const confirm = window.confirm(
            `${response.message}\n\nDo you want to end this election now?`
          );
          if (confirm) {
            await handleEndElection(electionId, true);
          }
        } else {
          toast.error(response.message || "Failed to end election");
        }
      }
    } catch (error) {
      console.error("Error ending election:", error);
      toast.error(error.message || "Failed to end election");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclareResults = async (electionId) => {
    if (!stats || !stats.election) {
      toast.error("Election data not loaded");
      return;
    }

    if (stats.election.status !== "Completed") {
      toast.error("Results can only be declared for completed elections");
      return;
    }

    if (stats.votes.total === 0) {
      toast.error("Cannot declare results: No votes cast in this election");
      return;
    }

    const ties = detectTies();
    
    if (ties.length > 0) {
      setTieBreakData({
        electionId,
        ties,
        allCandidates: stats.candidates.byPosition
      });
      setSelectedWinners({});
      setShowTieBreakModal(true);
      return;
    } else {
      const confirm = window.confirm(
        `Are you sure you want to declare results for "${stats.election.title}"?\n\n` +
        `Total Votes: ${stats.votes.total}\n` +
        `Total Voters: ${stats.votes.uniqueVoters}\n\n` +
        `This action will:\n` +
        `- Calculate and publish results\n` +
        `- Notify all users\n` +
        `- Make results publicly visible\n\n` +
        `This cannot be undone.`
      );
      
      if (!confirm) return;
    }

    try {
      setActionLoading(true);
      console.log("Declaring results for election:", electionId);
      
      const response = await AdminAPI.declareElectionResults(electionId);
      console.log("Declare results response:", response);
      
      if (response.success) {
        const hasActiveTies = ties.length > 0;
        toast.success(
          `Results declared successfully!\n` +
          `Total votes counted: ${response.data?.totalVotes || stats.votes.total}\n` +
          `Candidates: ${response.data?.candidatesCount || stats.candidates.total}` +
          (hasActiveTies ? `\nNote: ${ties.length} position(s) have ties` : ''),
          { duration: hasActiveTies ? 8000 : 5000 }
        );
        await handleSelectElection(electionId);
      } else {
        toast.error(response.message || "Failed to declare results");
      }
    } catch (error) {
      console.error("Error declaring results:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to declare results";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const detectTies = () => {
    if (!stats || !stats.candidates.byPosition) return [];
    
    const ties = [];
    
    Object.entries(stats.candidates.byPosition).forEach(([position, candidates]) => {
      if (candidates.length < 2) return;
      
      const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
      
      if (sorted[0].voteCount === sorted[1].voteCount && sorted[0].voteCount > 0) {
        const tiedCandidates = sorted.filter(c => c.voteCount === sorted[0].voteCount);
        ties.push({
          position,
          votes: sorted[0].voteCount,
          candidates: tiedCandidates.map(c => c.Can_name),
          candidateIds: tiedCandidates.map(c => c.Can_id)
        });
      }
    });
    
    return ties;
  };

  const handleSelectWinner = (position, candidateId) => {
    setSelectedWinners(prev => ({
      ...prev,
      [position]: candidateId
    }));
  };

  const handleDeclareWithTieBreaking = async () => {
    if (!tieBreakData) return;

    const allSelected = tieBreakData.ties.every(tie => selectedWinners[tie.position]);
    
    if (!allSelected) {
      toast.error("Please select a winner for each tied position");
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to declare results with the following tie-breaking decisions?\n\n` +
      tieBreakData.ties.map(tie => {
        const winnerId = selectedWinners[tie.position];
        const winnerName = tieBreakData.allCandidates[tie.position]
          .find(c => c.Can_id === winnerId)?.Can_name || 'Unknown';
        return `${tie.position}: ${winnerName} (selected from ${tie.candidates.length} tied candidates)`;
      }).join('\n') +
      `\n\nThis action cannot be undone.`
    );

    if (!confirm) return;

    try {
      setActionLoading(true);
      console.log("Declaring results with tie-breaking for election:", tieBreakData.electionId);
      console.log("Selected winners:", selectedWinners);
      
      const response = await AdminAPI.declareElectionResults(
        tieBreakData.electionId,
        { tieBreaking: selectedWinners }
      );
      
      if (response.success) {
        toast.success(
          `✅ Results declared successfully with tie-breaking!\n` +
          `Total votes counted: ${response.data?.totalVotes || stats.votes.total}\n` +
          `Ties resolved: ${tieBreakData.ties.length} position(s)`,
          { duration: 6000 }
        );
        setShowTieBreakModal(false);
        setTieBreakData(null);
        setSelectedWinners({});
        await handleSelectElection(tieBreakData.electionId);
      } else {
        toast.error(response.message || "Failed to declare results");
      }
    } catch (error) {
      console.error("Error declaring results with tie-breaking:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to declare results";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const togglePosition = (position) => {
    setExpandedPositions((prev) => ({
      ...prev,
      [position]: !prev[position],
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Ongoing":
        return "bg-green-100 text-green-800 border-green-200";
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getElectionCountByStatus = (status) => {
    if (status === "All") return elections.length;
    return elections.filter(e => e.Status === status).length;
  };

  const getCandidateStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-600";
      case "Pending":
        return "text-yellow-600";
      case "Rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading elections...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="p-6 mt-20 max-w-7xl mx-auto mb-18">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Election Control Center</h1>
          <p className="text-indigo-100">
            Monitor elections, manage status, and declare results
          </p>
        </div>

        {/* Election Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-indigo-600" />
              Select Election
            </h2>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Filter:</span>
              <div className="flex gap-2">
                {["All", "Upcoming", "Ongoing", "Completed"].map((status) => {
                  const count = getElectionCountByStatus(status);
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        statusFilter === status
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status}
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        statusFilter === status
                          ? "bg-white text-indigo-600"
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {filteredElections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No {statusFilter !== "All" ? statusFilter.toLowerCase() : ""} elections found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredElections.map((election) => (
                <button
                  key={election.Election_id}
                  onClick={() => handleSelectElection(election.Election_id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedElection === election.Election_id
                      ? "border-indigo-500 bg-indigo-50 shadow-md"
                      : "border-gray-200 hover:border-indigo-300 hover:shadow"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 flex-1">
                      {election.Title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        election.Status
                      )}`}
                    >
                      {election.Status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(election.Start_date).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {stats && (
          <>
            {/* Tie Warning Banner */}
            {detectTies().length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-400 rounded-full p-3">
                    <XCircleIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-900 mb-2">
                      ⚠️ Tie Detected - Manual Review Required
                    </h3>
                    <p className="text-yellow-800 mb-3">
                      One or more positions have candidates with equal votes. 
                      {stats.election.autoDeclareResults ? ' Auto-declaration was prevented.' : ''} 
                      Please review and manually declare results.
                    </p>
                    <div className="space-y-2">
                      {detectTies().map((tie, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-yellow-300">
                          <p className="font-semibold text-gray-900">{tie.position}</p>
                          <p className="text-sm text-gray-700">
                            Tied candidates: <span className="font-medium">{tie.candidates.join(', ')}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Each has {tie.votes} vote{tie.votes !== 1 ? 's' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-yellow-700 mt-3">
                      💡 The system will record all candidates with their vote counts. Follow your organization's 
                      tie-breaking rules (coin toss, re-vote, etc.) to determine the final winner.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white shadow-lg rounded-2xl p-6 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Total Candidates
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {stats.candidates.total}
                    </h2>
                    <p className="text-xs text-green-600 mt-1">
                      {stats.candidates.approved} Approved
                    </p>
                  </div>
                  <div className="bg-indigo-100 p-4 rounded-full">
                    <UsersIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-2xl p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Total Votes
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {stats.votes.total}
                    </h2>
                    <p className="text-xs text-green-600 mt-1">
                      {stats.votes.uniqueVoters} Voters
                    </p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-full">
                    <ChartBarIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-2xl p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Pending Approvals
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {stats.candidates.pending}
                    </h2>
                    <p className="text-xs text-yellow-600 mt-1">
                      Candidates waiting
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-full">
                    <ClockIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-2xl p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Results Status
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {stats.results.declared ? "Declared" : "Pending"}
                    </h2>
                    <p className="text-xs text-purple-600 mt-1">
                      {stats.election.autoDeclareResults ? "Auto" : "Manual"}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-full">
                    <TrophyIcon className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Winners Summary - Only show for completed elections with declared results */}
            {stats.election.status === "Completed" && stats.results.declared && (
              <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl shadow-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-500 rounded-full p-3">
                    <TrophyIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-900">
                      🎉 Election Winners
                    </h2>
                    <p className="text-green-700 text-sm">
                      Results declared for {stats.election.title}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.candidates.byPosition).map(([position, candidates]) => {
                    // Get the winner (first candidate with highest votes)
                    const winner = candidates[0];
                    if (winner && winner.voteCount > 0) {
                      return (
                        <div key={position} className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-md hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div className="bg-green-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                              {position}
                            </div>
                            <span className="text-2xl">🏆</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {winner.Can_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {winner.Branch} • Year {winner.Year}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-green-600">
                              {winner.voteCount}
                            </span>
                            <span className="text-sm text-gray-500">
                              votes
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Election Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Election Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                {stats.election.status === "Upcoming" && (
                  <button
                    onClick={() => handleStartElection(selectedElection)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlayIcon className="w-5 h-5" />
                    Start Election
                  </button>
                )}

                {stats.election.status === "Ongoing" && (
                  <button
                    onClick={() => handleEndElection(selectedElection)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <StopIcon className="w-5 h-5" />
                    End Election
                  </button>
                )}

                {stats.election.status === "Completed" &&
                  !stats.results.declared && (
                    <button
                      onClick={() => handleDeclareResults(selectedElection)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrophyIcon className="w-5 h-5" />
                      Declare Results Manually
                    </button>
                  )}

                {stats.results.declared && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-xl font-semibold border-2 border-green-200">
                    <CheckCircleIcon className="w-5 h-5" />
                    Results Already Declared
                  </div>
                )}

                <button
                  onClick={() => handleSelectElection(selectedElection)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Candidates by Position */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UsersIcon className="w-6 h-6 text-indigo-600" />
                Candidates & Voting Statistics
              </h2>

              <div className="space-y-4">
                {Object.entries(stats.candidates.byPosition).map(
                  ([position, candidates]) => (
                    <div
                      key={position}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => togglePosition(position)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">
                            {position}
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-gray-600">
                              {candidates.length} candidates •{" "}
                              {stats.votes.byPosition[position] || 0} votes
                            </p>
                          </div>
                        </div>
                        {expandedPositions[position] ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                        )}
                      </button>

                      {expandedPositions[position] && (
                        <div className="p-6 bg-white">
                          <div className="space-y-3">
                            {candidates.map((candidate, index) => {
                              const totalVotes =
                                stats.votes.byPosition[position] || 1;
                              const percentage =
                                ((candidate.voteCount / totalVotes) * 100) || 0;

                              return (
                                <div
                                  key={candidate.Can_id}
                                  className={`p-4 rounded-lg border-2 ${
                                    index === 0 && candidate.voteCount > 0
                                      ? stats.election.status === "Completed" && stats.results.declared
                                        ? "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg"
                                        : "border-yellow-300 bg-yellow-50"
                                      : "border-gray-200 bg-gray-50"
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3">
                                        {index === 0 &&
                                          candidate.voteCount > 0 && (
                                            <span className="text-2xl">
                                              🏆
                                            </span>
                                          )}
                                        <div>
                                          <h4 className="font-semibold text-gray-800">
                                            {candidate.Can_name}
                                          </h4>
                                          <p className="text-sm text-gray-500">
                                            {candidate.Branch} • Year{" "}
                                            {candidate.Year}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p
                                        className={`text-lg font-bold ${getCandidateStatusColor(
                                          candidate.Status
                                        )}`}
                                      >
                                        {candidate.voteCount} votes
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {percentage.toFixed(1)}%
                                      </p>
                                    </div>
                                  </div>
                                  {/* Vote Progress Bar */}
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        index === 0 && candidate.voteCount > 0
                                          ? stats.election.status === "Completed" && stats.results.declared
                                            ? "bg-gradient-to-r from-green-400 to-emerald-600"
                                            : "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                          : "bg-gradient-to-r from-indigo-400 to-purple-600"
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <div className="mt-2 flex justify-between items-center">
                                    <span
                                      className={`text-xs font-medium ${getCandidateStatusColor(
                                        candidate.Status
                                      )}`}
                                    >
                                      {candidate.Status}
                                    </span>
                                    {index === 0 && candidate.voteCount > 0 && (
                                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                        stats.election.status === "Completed" && stats.results.declared
                                          ? "text-green-700 bg-green-100 border-2 border-green-300"
                                          : "text-yellow-700 bg-yellow-100"
                                      }`}>
                                        {stats.election.status === "Completed" && stats.results.declared ? "🏆 WINNER" : "Leading"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}

        {/* Tie-Breaking Modal */}
        {showTieBreakModal && tieBreakData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-t-3xl p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <TrophyIcon className="w-8 h-8" />
                  Tie-Breaking Decision Required
                </h2>
                <p className="text-yellow-100 mt-2">
                  Select the winner for each tied position based on your organization's tie-breaking rules
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
                  <p className="text-yellow-900 text-sm">
                    <strong>⚠️ Important:</strong> The following positions have tied candidates with equal votes.
                    Please select ONE winner for each position according to your organization's tie-breaking policy
                    (e.g., coin toss, re-vote results, committee decision, etc.)
                  </p>
                </div>

                {/* Tied Positions */}
                <div className="space-y-6">
                  {tieBreakData.ties.map((tie, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm">
                          {tie.position}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {tie.candidates.length} candidates tied with {tie.votes} vote{tie.votes !== 1 ? 's' : ''} each
                      </p>

                      {/* Candidate Selection */}
                      <div className="space-y-3">
                        {tieBreakData.allCandidates[tie.position]
                          .filter(c => tie.candidateIds.includes(c.Can_id))
                          .map((candidate) => (
                            <button
                              key={candidate.Can_id}
                              onClick={() => handleSelectWinner(tie.position, candidate.Can_id)}
                              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                selectedWinners[tie.position] === candidate.Can_id
                                  ? "border-green-500 bg-green-50 shadow-md"
                                  : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                      selectedWinners[tie.position] === candidate.Can_id
                                        ? "border-green-500 bg-green-500"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {selectedWinners[tie.position] === candidate.Can_id && (
                                      <CheckCircleIcon className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {candidate.Can_name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {candidate.Branch} • Year {candidate.Year}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900">
                                    {candidate.voteCount} votes
                                  </p>
                                  {selectedWinners[tie.position] === candidate.Can_id && (
                                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                      Selected Winner
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Warning if not all selected */}
                {tieBreakData.ties.length !== Object.keys(selectedWinners).length && (
                  <div className="mt-4 bg-orange-50 border border-orange-300 rounded-lg p-3">
                    <p className="text-sm text-orange-800">
                      ⚠️ Please select a winner for all {tieBreakData.ties.length} tied position(s) before proceeding.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-3xl flex gap-3">
                <button
                  onClick={() => {
                    setShowTieBreakModal(false);
                    setTieBreakData(null);
                    setSelectedWinners({});
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeclareWithTieBreaking}
                  disabled={actionLoading || tieBreakData.ties.length !== Object.keys(selectedWinners).length}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {actionLoading ? "Declaring..." : "Declare Results with Selected Winners"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectionControl;