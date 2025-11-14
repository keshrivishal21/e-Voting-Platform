import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/evoting.png';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-full shadow-2xl border-2 border-white/30">
            <div className="bg-white rounded-full p-0.5">
              <img src={logo} alt="e-Voting Logo" className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover object-center" />
            </div>
          </div>
        </div>

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text mb-4">
            404
          </div>
          <div className="w-full max-w-md mx-auto">
            <svg className="w-full h-64 text-indigo-200" fill="currentColor" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
              {/* Ballot Box Illustration */}
              <rect x="150" y="120" width="100" height="80" rx="8" className="text-indigo-300" fill="currentColor"/>
              <rect x="160" y="130" width="80" height="4" rx="2" className="text-indigo-400" fill="currentColor"/>
              <rect x="160" y="140" width="60" height="4" rx="2" className="text-indigo-400" fill="currentColor"/>
              <rect x="160" y="150" width="70" height="4" rx="2" className="text-indigo-400" fill="currentColor"/>
              
              {/* Voting Papers */}
              <rect x="120" y="100" width="40" height="30" rx="4" className="text-purple-300" fill="currentColor" transform="rotate(-15 140 115)"/>
              <rect x="240" y="110" width="40" height="30" rx="4" className="text-purple-300" fill="currentColor" transform="rotate(20 260 125)"/>
              
              {/* Question Mark */}
              <circle cx="200" cy="60" r="25" className="text-indigo-200" fill="currentColor"/>
              <text x="200" y="75" textAnchor="middle" className="text-2xl font-bold text-indigo-600" fill="currentColor">?</text>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
            <span className="text-indigo-600">Page Not Found</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto">
            Oops! The page you're looking for seems to have wandered off from the voting booth. 
            Let's get you back to the right place.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link to="/">
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 ease-out min-w-[200px]">
                Go to Homepage
              </button>
            </Link>
            <button 
              onClick={() => navigate(-1)}
              className="bg-white/70 backdrop-blur-lg text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg border border-indigo-200 shadow-lg hover:shadow-xl hover:bg-white/80 transform hover:scale-105 transition-all duration-300 ease-out min-w-[200px]"
            >
              Go Back
            </button>
          </div>

          
        </div>

        {/* Error Code */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Error 404 • Page Not Found • e-Voting Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
