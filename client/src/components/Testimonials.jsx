import React from "react";
import { useState } from "react";

const Testimonials = () => {
  const [showModal,setShowModal]=useState(false);
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
          What Students Say
        </h2>
        <p className="text-gray-600 text-center mt-3 max-w-2xl mx-auto">
          Hear from students who used our platform to vote and stay engaged with
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
<<<<<<< HEAD
  className="mt-12 mx-auto block bg-indigo-500 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:bg-indigo-600 transition-colors duration-200"
=======
  className="mt-12 mx-auto block bg-indigo-500 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:bg-indigo-600 transition-colors duration-200" onClick={()=>setShowModal(true)}
>>>>>>> anjali/main
>
  Submit Your Feedback
</button>

<<<<<<< HEAD
=======
{showModal && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-96 p-6 relative" onClick={(e)=>e.stopPropagation()}>
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4">Submit Your Feedback</h3>
            <textarea
              className="w-full h-32 border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Write your feedback here..."
            ></textarea>
            <button
              className="bg-indigo-500 text-white font-medium py-2 px-4 rounded-xl hover:bg-indigo-600 transition-colors"
              onClick={() => {
                alert("Feedback submitted!");
                setShowModal(false);
              }}
            >
              Submit
            </button>
          </div>
        </div>
      )}

>>>>>>> anjali/main
    </section>
  );
};

export default Testimonials;
