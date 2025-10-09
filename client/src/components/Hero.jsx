import React from "react";
import { Link } from "react-router-dom";
import hero_image from "../assets/hero_image.png";

export default function Hero({ electionLive }) {
  return (
    <section
      id="section"
      className="bg-gradient-to-b from-[#F5F7FF] via-[#fffbee] to-[#E6EFFF] min-h-screen relative flex items-center"
    >
      <main className="flex flex-col md:flex-row items-center max-md:text-center px-6 sm:px-10 md:px-16 max-w-7xl mx-auto w-full">
        
        {/* Left Content */}
        <div className="flex flex-col items-center md:items-start md:flex-1">
          {/* Banner */}
          <span className="mt-6 mb-6 flex items-center space-x-2 border border-indigo-300 text-gray-600 text-xs rounded-full px-4 py-1 hover:bg-gray-50 transition">
            🗳️ College Election Portal – Participate Now
          </span>

          <h1 className="text-gray-900 font-semibold text-4xl sm:text-4xl md:text-6xl leading-tight">
            Secure. Simple.<br />
            <span className="whitespace-nowrap">Transparent Elections.</span>
          </h1>

          <p className="mt-4 text-gray-600 max-w-md  sm:text-base leading-relaxed">
            Cast your vote securely and transparently from anywhere.<br />
            Track accurate results in real-time and stay informed.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-center mt-4 gap-3">
            <button
              className="bg-indigo-600 text-white px-6 pr-2.5 py-2.5 rounded-full text-sm font-medium flex items-center space-x-2 hover:bg-indigo-700 transition"
              type="button"
              onClick={() => window.location.href = "/student/elections"}
            >
              <span>Elections</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.821 11.999h13.43m0 0-6.714-6.715m6.715 6.715-6.715 6.715"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <a
              className="text-indigo-600 bg-indigo-100 px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-200 transition"
              href="/student/results"
            >
              View Results
            </a>
          </div>
        </div>

        {/* Right Image */}
        <div className="mt-8 md:mt-0 flex justify-center md:justify-end w-full">
          <img
            src={hero_image}
            alt="Voting Illustration"
            className="w-[240px] md:w-[360px] lg:w-[420px] rounded-2xl object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </main>
    </section>
  );
}
