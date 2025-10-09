import React, { useState } from "react";

const CastVote = () => {
  // Sample data for a single election
  const election = {
    id: 1,
    title: "Student Council Election",
    candidates: [
      {
        id: 1,
        name: "Aarav Mehta",
        scholarId: "20210123",
        branch: "CSE",
        year: "3rd Year",
        photo: "https://randomuser.me/api/portraits/men/32.jpg",
        manifesto: "/sample-manifesto.pdf",
      },
      {
        id: 2,
        name: "Priya Sharma",
        scholarId: "20210456",
        branch: "ECE",
        year: "2nd Year",
        photo: "https://randomuser.me/api/portraits/women/45.jpg",
        manifesto: "/sample-manifesto.pdf",
      },
      {
        id: 3,
        name: "Anshika Reddy",
        scholarId: "20210912",
        branch: "CSE",
        year: "2nd Year",
        photo: "https://randomuser.me/api/portraits/women/30.jpg",
        manifesto: "/sample-manifesto.pdf",
      },
    ],
  };

  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleVoteClick = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const confirmVote = () => {
    setHasVoted(true);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 ">
        <div className="mt-20 max-w-6xl mx-auto mb-18">
      <h1 className="text-4xl font-bold text-indigo-600 text-center">
        {election.title}
      </h1>
      <p className="text-center text-gray-600 mt-2 px-5">
        Cast your vote for the candidate you think will best lead and represent your college community.
      </p>

      {hasVoted && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg font-medium text-center">
          You have voted for <strong>{selectedCandidate.name}</strong>. You cannot vote again.
        </div>
      )}

      {/* Candidate Cards */}
      <div className="flex flex-wrap justify-start gap-6 mt-8">
        {election.candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white rounded-2xl pb-5 overflow-hidden border border-gray-300 shadow-sm hover:shadow-md transition-shadow w-64"
          >
            <img
              className="w-64 h-52 object-cover object-top"
              src={candidate.photo}
              alt={candidate.name}
            />

            <div className="flex flex-col items-center px-3">
              <p className="font-semibold mt-3 text-gray-800">{candidate.name}</p>
              <p className="text-gray-500 text-sm">
                Scholar ID: {candidate.scholarId}
              </p>
              <p className="text-gray-500 text-sm">
                {candidate.branch} • {candidate.year}
              </p>

              <a
                href={candidate.manifesto}
                download
                className="border text-sm text-gray-600 border-gray-400 w-28 h-8 rounded-full mt-4 flex items-center justify-center hover:bg-gray-100 transition"
              >
                Manifesto
              </a>

              <button
                onClick={() => handleVoteClick(candidate)}
                className={`mt-3 bg-indigo-600 text-white w-28 h-10 rounded-full hover:bg-indigo-700 transition ${
                  hasVoted ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={hasVoted}
              >
                Vote
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">
              Confirm Your Vote
            </h2>
            <p className="mb-4">
              Are you sure you want to vote for{" "}
              <strong>{selectedCandidate.name}</strong>? You cannot change your choice later.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmVote}
                className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CastVote;
