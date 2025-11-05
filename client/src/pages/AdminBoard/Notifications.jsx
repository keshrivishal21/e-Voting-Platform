import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AdminAPI from "../../utils/adminAPI";

const Notifications = () => {
  const [recipient, setRecipient] = useState("Students");
  const [message, setMessage] = useState("");
  const [sentNotifications, setSentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setFetchLoading(true);
        const response = await AdminAPI.getAllNotifications();
        if (response.success) {
          setSentNotifications(response.data.notifications);
        } else {
          toast.error("Failed to load notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Send notification
  const sendNotification = async () => {
    if (message.trim() === "") {
      toast.error("Please enter a message.");
      return;
    }

    try {
      setLoading(true);
      const response = await AdminAPI.sendNotification(recipient, message);

      if (response.success) {
        toast.success(`Notification sent successfully to ${response.data.recipientCount} recipient(s)!`);
        // Refresh the notifications list
        const updatedNotifications = await AdminAPI.getAllNotifications();
        if (updatedNotifications.success) {
          setSentNotifications(updatedNotifications.data.notifications);
        }
        setMessage("");
      } else {
        toast.error(response.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(error.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="mt-20 max-w-6xl mx-auto mb-18">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">Send Notification</h1>

        <div className="bg-white shadow rounded-2xl p-6 mb-10">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Recipient</label>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              <option value="Students">Students</option>
              <option value="Candidates">Candidates</option>
              <option value="All">All</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Message</label>
            <textarea
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              rows={4}
              placeholder="Enter your notification..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button
            onClick={sendNotification}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-2xl shadow hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Notification"}
          </button>
        </div>

        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Recently Sent Notifications</h2>
          <ul className="space-y-2 max-h-[300px] overflow-y-auto">
            {fetchLoading ? (
              <li className="text-center py-4">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading notifications...
                </div>
              </li>
            ) : sentNotifications.length === 0 ? (
              <li className="text-gray-500 text-center">No notifications sent yet</li>
            ) : (
              sentNotifications.map((note, index) => {
                if (!note) return null;
                return (
                  <li key={note.id || index} className="border-b pb-2 last:border-none text-gray-700">
                    <span className="font-semibold">{note.recipient || "Unknown"}:</span>{" "}
                    {note.message || "No message"}
                    <div className="text-xs text-gray-500 mt-1">
                      Sent by {note.sentBy || "Admin"} •{" "}
                      {note.sentAt ? new Date(note.sentAt).toLocaleString() : "Unknown time"}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
