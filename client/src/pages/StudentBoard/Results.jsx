import React from "react";

const Results = () => {
  // Sample data for current elections results
  const electionResults = [
    {
      id: 1,
      title: "Presidential Election",
      winner: {
        name: "Aarav Mehta",
        scholarId: "20210123",
        branch: "CSE",
        year: "3rd Year",
        photo: "https://randomuser.me/api/portraits/men/32.jpg",
        votes: 120,
      },
    },
    {
      id: 2,
      title: "Vice Presidential Election",
      winner: {
        name: "Simran Kaur",
        scholarId: "20210567",
        branch: "CSE",
        year: "2nd Year",
        photo: "https://randomuser.me/api/portraits/women/32.jpg",
        votes: 95,
      },
    },
    {
      id: 3,
      title: "Cultural Secretary Election",
      winner: {
        name: "Kabir Singh",
        scholarId: "20210321",
        branch: "ECE",
        year: "3rd Year",
        photo: "https://randomuser.me/api/portraits/men/55.jpg",
        votes: 78,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="mt-20 max-w-6xl mx-auto mb-18">
      <h1 className="text-4xl font-bold text-indigo-600 text-center">
        Election Results
      </h1>
      <p className="text-center text-gray-600 mt-2 px-5">
        Congratulations to the winners of the recent elections! Here are the results for each post.
      </p>

      <div className="space-y-8 mt-10">
        {electionResults.map((election) => (
          <div key={election.id} className="bg-white rounded-2xl shadow-md border border-gray-300 p-6 flex flex-col md:flex-row items-center gap-6">
            {/* Winner Photo */}
            <img
              className="w-32 h-32 object-cover rounded-full border-2 border-indigo-600"
              src={election.winner.photo}
              alt={election.winner.name}
            />

            {/* Winner Details */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold text-indigo-800">
                {election.title}
              </h2>
              <p className="text-gray-700 font-medium mt-2">{election.winner.name}</p>
              <p className="text-gray-500 text-sm">
                Scholar ID: {election.winner.scholarId} | {election.winner.branch} • {election.winner.year}
              </p>
            </div>

            {/* Votes */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">Votes Received</p>
              <p className="text-indigo-600 font-bold text-2xl">{election.winner.votes}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default Results;
