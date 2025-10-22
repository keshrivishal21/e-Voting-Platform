import React, { useState, useEffect } from "react";
import { FileText, User, BarChart3 } from "lucide-react";
import { Navigate } from "react-router-dom";
import AuthAPI from "../../utils/authAPI";
import toast from "react-hot-toast";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);

  // Get candidate ID from JWT token
  const getCandidateIdFromToken = () => {
    try {
      const token = AuthAPI.getCurrentToken();
      if (!token) return null;
      
      // Decode JWT token (format: header.payload.signature)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.userId; // This will be a string after our BigInt fix
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Load candidate profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      const candidateId = getCandidateIdFromToken();
      
      if (!candidateId) {
        toast.error('No candidate ID found. Please login again.');
        setLoading(false);
        return;
      }

      try {
        const { response, data } = await AuthAPI.getCandidateProfile(candidateId);
        
        if (response.ok && data.success) {
          const profile = data.data.profile;
          setCandidate({
            name: profile.Can_name,
            branch: profile.Branch,
            year: profile.Year ? `${profile.Year}${profile.Year === 1 ? 'st' : profile.Year === 2 ? 'nd' : profile.Year === 3 ? 'rd' : 'th'} Year` : 'N/A',
            photo: "https://randomuser.me/api/portraits/men/32.jpg", // TODO: Store and fetch actual candidate photo from database
            manifesto: profile.Manifesto,
            position: profile.Position,
            cgpa: profile.Cgpa,
            votes: 0, // TODO: Get from voting results API - GET /api/vote/candidate/:id/count
            totalVotes: 0, // TODO: Get from voting results API - GET /api/vote/election/:id/total
          });
        } else {
          toast.error(data.message || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidate information...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Failed to load candidate information</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              href="/candidate/profile"
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-300 px-4 py-2 rounded-xl hover:bg-indigo-100 transition"
            >
              <FileText size={16} /> View Profile
            </a>
            <a
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-300 px-4 py-2 rounded-xl hover:bg-indigo-100 transition"
              href="/candidate/results"
            >
              View Results
            </a>
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
            {candidate.totalVotes > 0 ? `Out of ${candidate.totalVotes} total votes cast` : 'Voting has not started yet'}
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
              style={{ width: `${candidate.totalVotes > 0 ? (candidate.votes / candidate.totalVotes) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {candidate.totalVotes > 0 ? `${(candidate.votes / candidate.totalVotes * 100).toFixed(1)}% support` : 'No votes yet'}
          </p>
        </div>

        {/* Notifications Preview */}
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-indigo-700 mb-3">
            Recent Notifications
          </h3>
          {/* TODO: Replace with API call to GET /api/notifications/recent?limit=3 */}
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
