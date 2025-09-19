<<<<<<< HEAD
import React from 'react'

const Home = () => {
  return (
    <div>Home</div>
  )
}

export default Home
=======
import React from "react";
import { FileText, User, BarChart3 } from "lucide-react";

const Home = () => {
  const candidate = {
    name: "Aarav Mehta",
    branch: "CSE",
    year: "3rd Year",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    manifesto: "/sample-manifesto.pdf",
    votes: 128,
    totalVotes: 250,
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white p-8">
      <div className="max-w-6xl mx-auto mt-20 min-h-screen">
      <h1 className="text-3xl font-bold text-black-700 mb-6">
        Welcome Back, {candidate.name}!
      </h1>

      {/* Profile Section */}
      <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={candidate.photo}
          alt={candidate.name}
          className="w-28 h-28 object-cover rounded-full border-4 border-indigo-300 shadow-md"
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-semibold text-indigo-900">
            {candidate.name}
          </h2>
          <p className="text-gray-600 text-sm">
            {candidate.branch} • {candidate.year}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
            <a
              href={candidate.manifesto}
              download
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-300 px-4 py-2 rounded-xl hover:bg-indigo-100 transition"
            >
              <FileText size={16} /> View Manifesto
            </a>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition">
              <User size={16} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vote Count */}
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 shadow-sm flex flex-col items-center">
          <BarChart3 size={28} className="text-indigo-600 mb-3" />
          <h3 className="text-lg font-semibold">Your Votes</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">
            {candidate.votes}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Out of {candidate.totalVotes} total votes cast
          </p>
        </div>

        {/* Progress */}
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-indigo-700">
            Election Progress
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-3"
              style={{ width: `${(candidate.votes / candidate.totalVotes) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {(candidate.votes / candidate.totalVotes * 100).toFixed(1)}% support
          </p>
        </div>

        {/* Notifications Preview */}
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-indigo-700 mb-3">
            Recent Notifications
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>📢 Election results will be announced at 5 PM</li>
            <li>📝 Manifesto update deadline ends tomorrow</li>
            <li>📊 Live voting stats are now available</li>
          </ul>
          <button className="mt-4 text-indigo-600 text-sm font-medium hover:underline">
            View All
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Home;
>>>>>>> anjali/main
