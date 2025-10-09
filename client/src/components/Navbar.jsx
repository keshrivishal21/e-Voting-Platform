import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userType, logout, isStudent, isCandidate, isAdmin } = useAuth();
  
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isCandidateRoute = location.pathname.startsWith("/candidate");

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between px-6 py-3 md:py-4 shadow max-w-6xl mx-auto bg-white/70 backdrop-blur-lg rounded-full mt-4">
        {/* Left: Project Name */}
        
        <small className="text-2xl font-extrabold text-indigo-600">  e-Voting</small>
        

        {/* Menu for mobile + desktop */}
        <nav
          className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:overflow-hidden flex items-center justify-center max-md:h-full ${
            menuOpen ? "max-md:w-full" : "max-md:w-0"
          } transition-[width] bg-white/90 backdrop-blur flex-col md:flex-row gap-8 text-gray-900 text-sm font-medium`}
        >
          {/* Notifications - Show based on user role */}
          {(isStudent() || isCandidate()) && (
            <Link
              to={isStudent() ? "/student/notifications" : "/candidate/notifications"}
              className="relative"
              onClick={() => setMenuOpen(false)}
            >
              <BellIcon className="h-6 w-6 text-gray-700 hover:text-indigo-600 transition" />
              {/* {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                  {notificationCount}
                </span>
              )} */}
            </Link>
          )}

          {/* Profile Dropdown */}
          <div className="relative group">
            <UserCircleIcon className="h-8 w-8 text-gray-700 hover:text-indigo-600 cursor-pointer transition" />
            <div
              className="absolute right-0 top-full mt-0 w-44 bg-white border rounded-2xl shadow-lg
                         opacity-0 group-hover:opacity-100 hover:opacity-100
                         scale-95 group-hover:scale-100 hover:scale-100
                         transform transition-all pointer-events-none
                         group-hover:pointer-events-auto hover:pointer-events-auto"
            >
              {/* Role switching - only show for students/candidates */}
              {(isStudent() || isCandidate()) && (
                <Link
                  to={isStudent() ? "/candidate/login" : "/"}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-2xl"
                  onClick={() => setMenuOpen(false)}
                >
                  Login as {isStudent() ? "Candidate" : "Student"}
                </Link>
              )}
              
              {/* Profile Link */}
              <Link
                to={
                  isStudent() ? "/student/profile" : 
                  isCandidate() ? "/candidate/profile" : 
                  "/admin/profile"
                }
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Edit Profile
              </Link>
              
              {/* Logout */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 rounded-b-2xl"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Close menu button (mobile) */}
          <button
            className="md:hidden text-gray-600 mt-4"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </nav>

        {/* Right: Open Menu button (mobile only) */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen(true)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
