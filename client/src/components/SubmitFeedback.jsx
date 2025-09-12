import React, { useState } from "react";

export default function SubmitFeedback({ onSubmit }) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return alert("Please write something before submitting.");
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(feedback);
      } else {
        console.log("Feedback submitted:", feedback);
      }
      setFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-b from-[#E6EFFF] via-[#fffbee] to-[#F5F7FF]">
      <div className=" shadow-lg rounded-2xl p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Submit Your Feedback</h2>
        <textarea
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 backdrop-blur-sm"
          rows={5}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
