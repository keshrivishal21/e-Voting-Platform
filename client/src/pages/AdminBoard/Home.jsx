// pages/AdminBoard/Home.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AdminAPI from "../../utils/adminAPI";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  UsersIcon,
  ChartBarIcon,
  UserGroupIcon,
  ChatBubbleBottomCenterTextIcon,
  PlusCircleIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  // State for modal and form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeElections: 0,
    pendingCandidates: 0,
    feedbackCount: 0,
  });
  const [electionData, setElectionData] = useState([]);
  const [votingTrends, setVotingTrends] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const COLORS = ["#6366F1", "#E5E7EB"]; // Indigo + Gray

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        const [statsResponse, activityResponse] = await Promise.all([
          AdminAPI.getDashboardStats(),
          AdminAPI.getRecentActivity(8),
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data.stats);
          setElectionData(statsResponse.data.electionData);
          setVotingTrends(statsResponse.data.votingTrends);
        }

        if (activityResponse.success) {
          setRecentActivity(activityResponse.data.activity);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Handle form submission
  const handleCreateElection = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.title || !formData.startDate || !formData.endDate) {
      const errorMsg = "All fields are required";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      const errorMsg = "End date must be after start date";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        "http://localhost:5000/api/election/admin/elections",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Election created successfully!");
        toast.success("🎉 Election created successfully!");
        setFormData({ title: "", startDate: "", endDate: "" });
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess("");
        }, 2000);
      } else {
        const errorMsg = data.message || "Failed to create election";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Network error. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Create election error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="p-6 mt-20 max-w-7xl mx-auto mb-18">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-indigo-100">
                Welcome back! Manage your e-voting platform
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 md:mt-0 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <PlusCircleIcon className="w-6 h-6" />
              Create Election
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Total Students
                </p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {stats.totalStudents}
                </h2>
                <p className="text-green-600 text-xs mt-1">
                  ↑ 12% from last month
                </p>
              </div>
              <div className="bg-indigo-100 p-4 rounded-full">
                <UsersIcon className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Active Elections
                </p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {stats.activeElections}
                </h2>
                <p className="text-blue-600 text-xs mt-1">🔴 Live now</p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <ChartBarIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Pending Candidates
                </p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {stats.pendingCandidates}
                </h2>
                <p className="text-orange-600 text-xs mt-1">
                  ⏳ Awaiting approval
                </p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-full">
                <UserGroupIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Feedbacks
                </p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {stats.feedbackCount}
                </h2>
                <p className="text-purple-600 text-xs mt-1">💬 New responses</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BellIcon className="w-6 h-6 text-indigo-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              onClick={() => (window.location.href = "/admin/candidates")}
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-semibold py-4 px-4 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              👥 Manage Candidates
            </button>

            <button
              onClick={() => (window.location.href = "/admin/election")}
              className="bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold py-4 px-4 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              📊 Election Stats
            </button>

            <button
              onClick={() => (window.location.href = "/admin/feedback")}
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold py-4 px-4 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              💬 Feedbacks
            </button>

            <button
              onClick={() => (window.location.href = "/admin/notifications")}
              className="bg-gradient-to-br from-pink-500 to-pink-600 text-white font-semibold py-4 px-4 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              🔔 Notifications
            </button>

            <button
              onClick={() => (window.location.href = "/admin/students")}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold py-4 px-4 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              🎓 Manage Students
            </button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Election Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={electionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {electionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Voting Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={votingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="votes" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-indigo-600" />
            Recent Activity
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border-b last:border-none"
              >
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-gray-700 font-medium">
                    {activity.message}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Election Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setError("");
                setSuccess("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircleIcon className="w-8 h-8" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PlusCircleIcon className="w-8 h-8 text-indigo-600" />
              Create New Election
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                {success}
              </div>
            )}

            <form onSubmit={handleCreateElection} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Election Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Student Council Election 2025"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Election"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
