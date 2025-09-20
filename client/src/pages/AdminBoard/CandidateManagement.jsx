import React, { useState } from "react";

const CandidateManagement = () => {
  // Expanded pending requests
  const [pendingCandidates, setPendingCandidates] = useState([
    { id: 1, name: "John Doe", position: "Cultural Committee" },
    { id: 2, name: "Priya Sharma", position: "Tech Club" },
    { id: 3, name: "Raj Patel", position: "Student Council" },
    { id: 4, name: "Sneha Gupta", position: "Sports Committee" },
    { id: 5, name: "Amit Verma", position: "Tech Club" },
    { id: 6, name: "Neha Singh", position: "Cultural Committee" },
    { id: 7, name: "Rohit Kumar", position: "Student Council" },
    { id: 8, name: "Tanya Joshi", position: "Sports Committee" },
  ]);

  // Expanded current candidates
  const [candidates, setCandidates] = useState([
    { id: 101, name: "Anita Singh", position: "Cultural Committee" },
    { id: 102, name: "Rahul Singh", position: "Tech Club" },
    { id: 103, name: "Meera Das", position: "Student Council" },
    { id: 104, name: "Vikram Patil", position: "Sports Committee" },
    { id: 105, name: "Kavya Nair", position: "Cultural Committee" },
    { id: 106, name: "Aditya Rao", position: "Tech Club" },
  ]);

  // State to toggle between Pending and Approved
  const [viewPending, setViewPending] = useState(true);

  // Approve a pending candidate
  const approveCandidate = (candidate) => {
    setCandidates([...candidates, candidate]);
    setPendingCandidates(
      pendingCandidates.filter((c) => c.id !== candidate.id)
    );
  };

  // Remove a current candidate
  const removeCandidate = (candidate) => {
    setCandidates(candidates.filter((c) => c.id !== candidate.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 ">
      <div className="mt-20 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        Candidate Management
      </h1>

      {/* Toggle Buttons */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setViewPending(true)}
          className={`px-6 py-2 rounded-2xl font-semibold shadow transition ${
            viewPending
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 border border-indigo-300"
          }`}
        >
          Pending Requests
        </button>
        <button
          onClick={() => setViewPending(false)}
          className={`px-6 py-2 rounded-2xl font-semibold shadow transition ${
            !viewPending
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 border border-indigo-300"
          }`}
        >
          Current Candidates
        </button>
      </div>

      {/* Conditional Rendering based on toggle */}
      {viewPending ? (
        // Pending Requests Table
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
            Pending Candidate Requests
          </h2>
          <div className="bg-white shadow rounded-2xl p-4 overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-indigo-100 text-left">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Position</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingCandidates.map((candidate, index) => (
                  <tr key={candidate.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{candidate.name}</td>
                    <td className="px-4 py-2">{candidate.position}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => approveCandidate(candidate)}
                        className="bg-green-600 text-white px-4 py-2 rounded-2xl shadow hover:bg-green-500 transition"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingCandidates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                      No pending requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Current Candidates Table
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
            Current Candidates
          </h2>
          <div className="bg-white shadow rounded-2xl p-4 overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-indigo-100 text-left">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Position</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <tr key={candidate.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{candidate.name}</td>
                    <td className="px-4 py-2">{candidate.position}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeCandidate(candidate)}
                        className="bg-red-400 text-white px-4 py-2 rounded-2xl shadow hover:bg-red-500 transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {candidates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                      No candidates available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CandidateManagement;
