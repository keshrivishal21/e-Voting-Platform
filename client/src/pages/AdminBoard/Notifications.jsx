import React, { useState } from "react";

const Notifications = () => {
  const [recipient, setRecipient] = useState("Students");
  const [message, setMessage] = useState("");
  const [sentNotifications, setSentNotifications] = useState([
    { id: 1, recipient: "Students", message: "New elections start tomorrow!" },
    { id: 2, recipient: "Candidates", message: "Submit your campaign materials." },
  ]);

  const sendNotification = () => {
    if (message.trim() === "") {
      alert("Please enter a message.");
      return;
    }
    const newNotification = {
      id: sentNotifications.length + 1,
      recipient,
      message,
    };
    setSentNotifications([newNotification, ...sentNotifications]);
    setMessage("");
    alert("Notification sent!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 ">
      <div className="mt-20 max-w-6xl mx-auto mb-18">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        Send Notification
      </h1>

      {/* Notification Form */}
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
          className="bg-indigo-600 text-white px-6 py-2 rounded-2xl shadow hover:bg-indigo-500 transition"
        >
          Send Notification
        </button>
      </div>

      {/* Sent Notifications */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Recently Sent Notifications</h2>
        <ul className="space-y-2 max-h-[300px] overflow-y-auto">
          {sentNotifications.map((note) => (
            <li key={note.id} className="border-b pb-2 last:border-none text-gray-700">
              <span className="font-semibold">{note.recipient}:</span> {note.message}
            </li>
          ))}
          {sentNotifications.length === 0 && (
            <li className="text-gray-500 text-center">No notifications sent yet</li>
          )}
        </ul>
      </div>
      </div>
    </div>
  );
};

export default Notifications;
