// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/evoting.png"
import { useNavigate } from 'react-router-dom';

function Home() {
    const Navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-20 mt-16">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="bg-white/70 backdrop-blur-lg p-1.5 rounded-full shadow-lg border border-white/20">
              <img src={logo} alt="e-Voting theme" className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full object-cover object-center" />
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
              <span className="text-indigo-600">e-Voting Platform</span>
              <br />
              <span className="text-gray-600">for College Elections</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Secure, transparent, and efficient digital voting platform for student elections. 
              Your voice matters, make it count.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/login">
              <button 
                onClick={() => Navigate("/login")} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 ease-out min-w-[200px]"
              >
                Start Voting
              </button>
            </Link>
            <button className="bg-white/70 backdrop-blur-lg text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg border border-indigo-200 shadow-lg hover:shadow-xl hover:bg-white/80 transform hover:scale-105 transition-all duration-300 ease-out min-w-[200px]">
              Learn More
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Voting</h3>
              <p className="text-gray-600">Advanced encryption and security measures ensure your vote remains private and secure.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Transparent Process</h3>
              <p className="text-gray-600">Real-time results and transparent counting process for complete trust and accountability.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy & Fast</h3>
              <p className="text-gray-600">User-friendly interface makes voting quick and simple for all students.</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600">500+</div>
              <div className="text-gray-600 text-sm md:text-base">Students Registered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600">25+</div>
              <div className="text-gray-600 text-sm md:text-base">Active Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600">98%</div>
              <div className="text-gray-600 text-sm md:text-base">Voting Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600">24/7</div>
              <div className="text-gray-600 text-sm md:text-base">Platform Availability</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
