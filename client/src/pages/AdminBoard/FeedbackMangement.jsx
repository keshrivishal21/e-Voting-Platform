import React, { useState } from "react";

const FeedbackManagement = () => {
  // Dummy feedback data
  const [feedbacks] = useState([
    {
      id: 1,
      sender: "John Doe",
      role: "Student",
      message: "Voting portal is user-friendly.",
      date: "2025-09-20",
    },
    {
      id: 2,
      sender: "Priya Sharma",
      role: "Candidate",
      message: "Please add more instructions for candidates.",
      date: "2025-09-19",
    },
    {
      id: 3,
      sender: "Raj Patel",
      role: "Student",
      message: "Some elections are not showing live results.",
      date: "2025-09-18",
    },
    {
      id: 4,
      sender: "Anita Singh",
      role: "Candidate",
      message: "Feedback section is great, keep it updated.",
      date: "2025-09-17",
    },
    // Add more feedbacks here
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 ">
      <div className="mt-20 max-w-6xl mx-auto">

      
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        Feedbacks Recieved
      </h1>

      <div className="bg-white shadow rounded-2xl p-4 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-indigo-100 text-left">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Sender</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Message</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback, index) => (
              <tr key={feedback.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{feedback.sender}</td>
                <td className="px-4 py-2">{feedback.role}</td>
                <td className="px-4 py-2">{feedback.message}</td>
                <td className="px-4 py-2">{feedback.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
