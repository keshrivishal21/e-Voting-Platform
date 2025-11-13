import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AdminAPI from "../../utils/adminAPI";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Message</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Actions</th>
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
                  <td className="px-4 py-2">{feedback.status || 'Pending'}</td>
                  <td className="px-4 py-2">{feedback.message}</td>
                  <td className="px-4 py-2">{feedback.date}</td>
                  <td className="px-4 py-2">
                    {feedback.status !== 'Approved' ? (
                      <button
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
                        onClick={async () => {
                          try {
                            const res = await AdminAPI.approveFeedback(feedback.id);
                            if (res && res.success) {
                              toast.success('Feedback approved');
                              setFeedbacks((prev) => prev.map((f) => (f.id === feedback.id ? { ...f, status: 'Approved' } : f)));
                            } else {
                              toast.error(res?.message || 'Failed to approve');
                            }
                          } catch (err) {
                            console.error('Approve error', err);
                            toast.error('Failed to approve feedback');
                          }
                        }}
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-sm text-green-700 font-medium">Approved</span>
                    )}
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 ml-2"
                      onClick={async () => {
                        try {
                          const res = await AdminAPI.deleteFeedback(feedback.id);
                          if (res && res.success) {
                            toast.success('Feedback deleted');
                            setFeedbacks((prev) => prev.filter((f) => f.id !== feedback.id));
                          } else {
                            toast.error(res?.message || 'Failed to delete');
                          }
                        } catch (err) {
                          console.error('Delete error', err);
                          toast.error('Failed to delete feedback');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
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
