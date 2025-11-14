import React, { useState, useEffect } from "react";
import { FileText, User, BarChart3, MessageSquare } from "lucide-react";
import { Navigate } from "react-router-dom";
import AuthAPI from "../../utils/authAPI";
import { getElectionVoteCount } from "../../utils/candidateAPI";
import toast from "react-hot-toast";
import Testimonials from "../../components/Testimonials";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const getCandidateIdFromToken = () => {
    try {
      const token = AuthAPI.getCurrentToken();
      if (!token) return null;
      
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.userId; 
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

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
            id: candidateId,
            name: profile.Can_name,
            branch: profile.Branch,
            year: profile.Year ? `${profile.Year}${profile.Year === 1 ? 'st' : profile.Year === 2 ? 'nd' : profile.Year === 3 ? 'rd' : 'th'} Year` : 'N/A',
            photo: profile.Profile || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.Can_name) + "&background=6366f1&color=fff&size=128", // Use profile photo or fallback to avatar
            manifesto: profile.Manifesto,
            position: profile.Position,
            cgpa: profile.Cgpa,
            votes: 0, 
            totalVotes: 0,
            electionTitle: '',
            electionStatus: '',
            studentsVoted: 0,
            totalStudents: 0,
          });

          
          try {
            const voteCountData = await getElectionVoteCount(candidateId);
            console.log('Vote count data received:', voteCountData);
            
            if (voteCountData.success) {
              setCandidate(prev => ({
                ...prev,
                totalVotes: voteCountData.data.totalVotesInElection,
                electionTitle: voteCountData.data.election.title,
                electionStatus: voteCountData.data.election.status,
                studentsVoted: voteCountData.data.studentsVoted || 0,
                totalStudents: voteCountData.data.totalStudents || 0,
              }));
            } else {
              console.error('Vote count API returned error:', voteCountData.message);
              toast.error('Could not load election statistics');
            }
          } catch (voteError) {
            console.error('Error loading vote count:', voteError);
            toast.error(`Failed to load election data: ${voteError.message}`);
          }
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

    const loadNotifications = async () => {
      try {
        const data = await AuthAPI.getUserNotifications(3);
        if (data.success) {
          setNotifications(data.data.notifications || []);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadProfile();
    loadNotifications();
  }, []);  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto pt-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Welcome Back, {candidate.name}!
      </h1>

      {/* Profile Section */}
      <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
        <img
          src={candidate.photo}
          alt={candidate.name}
          className="w-32 h-32 object-cover rounded-full border-4 border-indigo-300 shadow-lg"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=6366f1&color=fff&size=128`;
          }}
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-2">
            {candidate.name}
          </h2>
          <p className="text-gray-600 text-base mb-2">
            {candidate.branch} • {candidate.year}
          </p>
          {candidate.electionTitle && (
            <div className="mb-4 inline-block">
              <p className="text-sm text-gray-500">Contesting in</p><p className="text-lg font-semibold text-indigo-700">{candidate.electionTitle}</p>
              <p className="text-sm text-gray-600">
                Position: <span className="font-semibold text-indigo-600">{candidate.position}</span>
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-4">
            <a
              href="/candidate/profile"
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-300 px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition"
            >
              <FileText size={16} /> View Profile
            </a>
            <a
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-300 px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition"
              href="/candidate/results"
            >
              View Results
            </a>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Election Votes */}
        <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-200 shadow-sm flex flex-col items-center">
          <BarChart3 size={32} className="text-indigo-600 mb-4" />
          <h3 className="text-lg font-semibold mb-3">Total Votes Cast</h3>
          <p className="text-4xl font-bold text-indigo-700 mb-3">
            {candidate.totalVotes}
          </p>
          
          <p className="text-sm text-gray-500">
            {candidate.electionStatus === 'Ongoing' ? '🟢 Voting in progress' : 
             candidate.electionStatus === 'Completed' ? '✅ Voting completed' : 
             '⏳ Waiting to start'}
          </p>
        </div>

        {/* Election Info */}
        <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-indigo-700 text-center">
            Election Progress
          </h3>
          <div className="w-full mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">Students Voted</span>
              <span className="text-sm font-semibold text-indigo-900">
                {candidate.studentsVoted} / {candidate.totalStudents}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-4 transition-all duration-500 ease-out flex items-center justify-end pr-2"
                style={{ 
                  width: `${candidate.totalStudents > 0 ? (candidate.studentsVoted / candidate.totalStudents) * 100 : 0}%`,
                  minWidth: candidate.studentsVoted > 0 ? '20px' : '0'
                }}
              >
                {candidate.totalStudents > 0 && candidate.studentsVoted > 0 && (
                  <span className="text-xs font-bold text-white">
                    {((candidate.studentsVoted / candidate.totalStudents) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center mb-2">
            {candidate.totalStudents > 0 
              ? `${((candidate.studentsVoted / candidate.totalStudents) * 100).toFixed(1)}% turnout` 
              : 'No students registered'}
          </p>
          <p className="text-xs text-gray-500 text-center mt-auto">
            Position: <span className="font-semibold text-indigo-700">{candidate.position || 'N/A'}</span>
          </p>
        </div>

        {/* Notifications Preview */}
        <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-indigo-700 mb-4">
            Recent Notifications
          </h3>
          <ul className="space-y-3 text-sm text-gray-700 flex-1">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span>📢</span>
                  <span className="line-clamp-1">{notification.Message || notification.message || 'New notification'}</span>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 py-4">
                No notifications yet
              </li>
            )}
          </ul>
          <a 
            href="/candidate/notifications"
            className="mt-4 text-indigo-600 text-sm font-medium hover:underline self-start"
          >
            View All Notifications →
          </a>
        </div>
      </div>

      {/* Testimonials with Feedback */}
      <Testimonials userType="Candidate" />
      </div>
    </div>
  );
};

export default Home;
