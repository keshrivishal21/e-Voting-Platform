import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";

const Testimonials = ({ userType = "Student" }) => {
  const [showModal, setShowModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Get user ID from JWT token based on userType
  const getUserIdFromToken = () => {
    try {
      const tokenKey = userType === "Student" ? "studentToken" : "candidateToken";
      const token = localStorage.getItem(tokenKey);
      if (!token) return null;
      
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Submit feedback to API
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      toast.error("Please login to submit feedback");
      return;
    }

    setSubmitting(true);
    try {
      const tokenKey = userType === "Student" ? "studentToken" : "candidateToken";
      const token = localStorage.getItem(tokenKey);
      const endpoint = userType === "Student" 
        ? "http://localhost:5000/api/feedback/feedbacks"
        : "http://localhost:5000/api/feedback/candidate/feedbacks";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          studentId: userId,
          feedbackText 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Feedback submitted successfully!");
        setFeedbackText("");
        setShowModal(false);
      } else {
        toast.error(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Static testimonial data for demonstration
  // TODO: Replace with API call to fetch real testimonials from database
  const cardsData = [
    {
      image:
        "https://randomuser.me/api/portraits/women/65.jpg",
      name: "Ananya Verma",
      handle: "@ananya_v",
      date: "March 12, 2025",
      review:
        "This e-voting platform made our college elections so smooth! The interface is clean and easy to use.",
    },
    {
      image:
        "https://randomuser.me/api/portraits/men/52.jpg",
      name: "Rohan Mehta",
      handle: "@rohan_mehta",
      date: "April 5, 2025",
      review:
        "Loved the transparency and real-time result tracking. It really made me trust the process.",
    },
    {
      image:
        "https://randomuser.me/api/portraits/women/44.jpg",
      name: "Priya Sharma",
      handle: "@priya_s",
      date: "April 20, 2025",
      review:
        "Very smooth experience! I could view all candidates’ manifestos and cast my vote in under a minute.",
    },
    {
      image:
        "https://randomuser.me/api/portraits/men/36.jpg",
      name: "Arjun Nair",
      handle: "@arjun.nair",
      date: "May 1, 2025",
      review:
        "Finally a modern way to run elections! Secure, reliable and convenient for students.",
    },
  ];

  const CreateCard = ({ card }) => (
    <div className="p-4 rounded-xl mx-4 shadow-md hover:shadow-lg transition-all duration-200 w-72 shrink-0 bg-white">
      {/* Top section with profile */}
      <div className="flex gap-2">
        <img
          className="size-11 rounded-full"
          src={card.image}
          alt={card.name}
        />
        <div className="flex flex-col">
          <p className="font-medium text-gray-800">{card.name}</p>
          <span className="text-xs text-indigo-500">{card.handle}</span>
        </div>
      </div>

      {/* Review text */}
      <p className="text-sm py-4 text-gray-700">{card.review}</p>

      {/* Bottom date */}
      <div className="flex items-center justify-between text-slate-500 text-xs">
        <span>Posted on</span>
        <p>{card.date}</p>
      </div>
    </div>
  );

  return (
    <section className="bg-gradient-to-b from-[#E6EFFF] via-[#fffbee] to-[#F5F7FF] py-36">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
          What {userType === "Student" ? "Students" : "Candidates"} Say
        </h2>
        <p className="text-gray-600 text-center mt-3 max-w-2xl mx-auto">
          Hear from {userType === "Student" ? "students" : "candidates"} who used our platform to {userType === "Student" ? "vote" : "contest"} and stay engaged with
          their campus elections.
        </p>

        {/* Marquee animation */}
        <style>{`
          @keyframes marqueeScroll {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .marquee-inner {
            animation: marqueeScroll 25s linear infinite;
          }
          .marquee-reverse {
            animation-direction: reverse;
          }
        `}</style>

        <div className="marquee-row w-full mx-auto max-w-5xl overflow-hidden relative mt-10">
          <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-[#F5F7FF] to-transparent"></div>
          <div className="marquee-inner flex transform-gpu min-w-[200%] pt-4 pb-4">
            {[...cardsData, ...cardsData].map((card, index) => (
              <CreateCard key={index} card={card} />
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-[#F5F7FF] to-transparent"></div>
        </div>

        <div className="marquee-row w-full mx-auto max-w-5xl overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-[#F5F7FF] to-transparent"></div>
          <div className="marquee-inner marquee-reverse flex transform-gpu min-w-[200%] pt-4 pb-4">
            {[...cardsData, ...cardsData].map((card, index) => (
              <CreateCard key={index} card={card} />
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-[#F5F7FF] to-transparent"></div>
        </div>
      </div>
      <button
  className="mt-12 mx-auto block bg-indigo-500 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:bg-indigo-600 transition-colors duration-200" onClick={()=>setShowModal(true)}
>
  Submit Your Feedback
</button>

{showModal && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => {
          setShowModal(false);
          setFeedbackText("");
        }}>
          <div className="bg-white rounded-2xl w-96 p-6 relative" onClick={(e)=>e.stopPropagation()}>
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl"
              onClick={() => {
                setShowModal(false);
                setFeedbackText("");
              }}
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4">Submit Your Feedback</h3>
            <textarea
              className="w-full h-32 border border-gray-300 rounded-md p-2 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Share your thoughts, suggestions, or concerns about the e-voting platform..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              disabled={submitting}
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                onClick={() => {
                  setShowModal(false);
                  setFeedbackText("");
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleSubmitFeedback}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default Testimonials;
