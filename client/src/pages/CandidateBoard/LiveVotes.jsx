import React from "react";

const LiveVotes = () => {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white p-8 min-h-screen">
      <div className="max-w-6xl mx-auto mt-20">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Live Voting</h1>
      <p className="text-gray-600 mb-6">
        Track your live votes and election trends in real-time.
      </p>
      <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          Current Vote Stats
        </h2>
        <p className="text-gray-600">
          (Connect this page to your backend API or WebSocket for live updates.)
        </p>
      </div>
      </div>
    </div>
  );
};

export default LiveVotes;
