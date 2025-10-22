import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AdminAPI from "../../utils/adminAPI";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch feedbacks from server
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await AdminAPI.getAllFeedbacks();
        if (response.success) {
          setFeedbacks(response.data.feedbacks);
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        toast.error("Failed to load feedbacks");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

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
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading feedbacks...
                  </div>
                </td>
              </tr>
            ) : feedbacks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No feedbacks available
                </td>
              </tr>
            ) : (
              feedbacks.map((feedback, index) => (
                <tr key={feedback.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{feedback.sender}</td>
                  <td className="px-4 py-2">{feedback.role}</td>
                  <td className="px-4 py-2">{feedback.message}</td>
                  <td className="px-4 py-2">{feedback.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
