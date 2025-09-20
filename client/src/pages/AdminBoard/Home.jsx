// pages/AdminBoard/Home.jsx
import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
//import AdminNavbar from "../../components/AdminNavbar";

const Home = () => {
  // Dummy data for demonstration
  const [stats] = useState({
    totalStudents: 120,
    activeElections: 3,
    pendingCandidates: 4,
    feedbackCount: 6,
  });

  const electionData = [
    { name: "Active", value: stats.activeElections },
    { name: "Completed", value: 7 },
  ];

  const COLORS = ["#6366F1", "#E5E7EB"]; // Indigo + Gray

  const recentActivity = [
    { id: 1, message: " Candidate request submitted: John Doe" },
    { id: 2, message: " Candidate approved: Priya Sharma" },
    { id: 3, message: " Candidate request rejected: Raj Patel" },
    { id: 4, message: "New election created: Student Council 2025" },
    { id: 5, message: " Live voting started for Cultural Committee" },
    { id: 6, message: " Feedback received: 'Improve UI/UX'" },
    { id: 7, message: " Feedback received: 'Voting portal was slow'" },
    { id: 8, message: " Results published for Tech Club Head Election" },
    { id: 9, message: " Notification sent: 'Elections start tomorrow!'" },
    { id: 10, message: " 120 students voted in last 24 hours" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="p-6 mt-20 max-w-6xl mx-auto mb-18">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">
          Admin Dashboard
        </h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white shadow rounded-2xl p-4 text-center">
            <p className="text-gray-600">Total Students</p>
            <h2 className="text-2xl font-bold">{stats.totalStudents}</h2>
          </div>
          <div className="bg-white shadow rounded-2xl p-4 text-center">
            <p className="text-gray-600">Active Elections</p>
            <h2 className="text-2xl font-bold">{stats.activeElections}</h2>
          </div>
          <div className="bg-white shadow rounded-2xl p-4 text-center">
            <p className="text-gray-600">Pending Candidates</p>
            <h2 className="text-2xl font-bold">{stats.pendingCandidates}</h2>
          </div>
          <div className="bg-white shadow rounded-2xl p-4 text-center">
            <p className="text-gray-600">Feedback</p>
            <h2 className="text-2xl font-bold">{stats.feedbackCount}</h2>
          </div>
        </div>

        {/* Quick Actions / Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => window.location.href = "/admin/candidates"}
            className="bg-indigo-700 text-white font-semibold py-4 rounded-2xl shadow hover:bg-indigo-500 transition"
          >
            Manage Candidates
          </button>

          <button
            onClick={() => window.location.href = "/admin/election"}
            className="bg-indigo-700 text-white font-semibold py-4 rounded-2xl shadow hover:bg-indigo-500 transition"
          >
            View Election Stats
          </button>

          <button
            onClick={() => window.location.href = "/admin/feedback"}
            className="bg-indigo-700 text-white font-semibold py-4 rounded-2xl shadow hover:bg-indigo-500 transition"
          >
            View Feedbacks
          </button>

          <button
            onClick={() => window.location.href = "/admin/notifications"}
            className="bg-indigo-700 text-white font-semibold py-4 rounded-2xl shadow hover:bg-indigo-500 transition"
          >
            Send Notifications
          </button>

          <button
            onClick={() => window.location.href = "/admin/students"}
            className="bg-indigo-700 text-white font-semibold py-4 rounded-2xl shadow hover:bg-indigo-500 transition"
          >
            Manage Students
          </button>
        </div>

        {/* Charts + Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-3">Election Overview</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={electionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {electionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
            <ul className="space-y-2 max-h-[280px] overflow-y-auto">
              {recentActivity.map((activity) => (
                <li
                  key={activity.id}
                  className="border-b pb-2 last:border-none text-gray-700"
                >
                  {activity.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
