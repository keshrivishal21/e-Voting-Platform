import React from "react";
import { Link } from "react-router-dom";

export default function HomeCandidate() {
  return (
    <section className="bg-gradient-to-b from-[#E6EFFF] via-[#fffbee] to-[#F5F7FF] flex flex-col items-center justify-center px-6">
      <div className="bg-indigo-100 rounded-4xl px-8 py-10 max-w-5xl w-full text-center shadow-md mb-20">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800">
          Your Leader, Your Choice
        </h2>

        {/* Subheading */}
        <p className="mt-3 text-gray-700 text-base md:text-lg leading-relaxed">
          Discover all candidates participating in this election, explore their ideas and manifestos, and make an informed choice.
Ready to lead? Submit your application and become part of campus leadership.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          {/* View Candidates Button */}
          <Link
            to="/view-candidates"
            className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-indigo-700 transition text-center"
          >
            View Candidates
          </Link>

          {/* Apply Button */}
          <Link
            to="/apply-candidate"
            className="bg-white text-indigo-700 px-8 py-3 rounded-full text-lg border border-indigo-500 font-medium hover:bg-indigo-200 transition text-center"
          >
            Apply for Candidate
          </Link>
        </div>
      </div>
    </section>
  );
}
