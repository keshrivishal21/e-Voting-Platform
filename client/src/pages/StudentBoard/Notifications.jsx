import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getCurrentToken } = useAuth();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
  // Get token from AuthContext (tokens are stored per-role, e.g. studentToken)
  const token = getCurrentToken();

      if (!token) {
        toast.error("Not authenticated. Please log in.");
        setNotifications([]);
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5000/api/notification/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        // Mark notifications as viewed
        localStorage.setItem('lastNotificationView', new Date().toISOString());
      } else {
        toast.error("Failed to load notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
  <div className="mt-20 max-w-7xl mx-auto mb-18">
    <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
    Notifications
  </h1>

  {loading ? (
    <p className="text-center text-gray-500">Loading notifications...</p>
  ) : notifications.length === 0 ? (
    <p className="text-center text-gray-500">No notifications yet.</p>
  ) : (
    <div className="flex flex-col items-center space-y-4">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="w-full max-w-xl bg-indigo-50 border-l-4 border-indigo-500 rounded-md p-4 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-indigo-700">Message</h3>
            <span className="text-sm text-gray-500">
              {new Date(notif.time).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-700 mt-2">{notif.message}</p>
        </div>
      ))}
    </div>
  )}
  </div>
</div>

  );
};

export default StudentNotifications;
