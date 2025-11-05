import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import AuthAPI from "../utils/authAPI";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userType, logout, isStudent, isCandidate, isAdmin } = useAuth();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isCandidateRoute = location.pathname.startsWith("/candidate");
  const isOnNotificationPage = location.pathname.includes("/notifications");

  // Fetch notification count for students and candidates
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (isStudent() || isCandidate()) {
        try {
          const response = await AuthAPI.getUserNotifications(50);
          if (response.success) {
            const notifications = response.data.notifications;
            setNotificationCount(notifications.length);
            
            // Check if there are NEW notifications (arrived after last view)
            const lastViewedTime = localStorage.getItem('lastNotificationView');
            
            if (notifications.length === 0) {
              setHasUnreadNotifications(false);
              setNewNotificationCount(0);
            } else if (!lastViewedTime) {
              // Never viewed before, all notifications are new
              setHasUnreadNotifications(true);
              setNewNotificationCount(notifications.length);
            } else {
              // Count notifications newer than last viewed time
              const lastViewed = new Date(lastViewedTime);
              const newNotifications = notifications.filter(notif => {
                const notifTime = new Date(notif.time);
                return notifTime > lastViewed;
              });
              
              const newCount = newNotifications.length;
              setNewNotificationCount(newCount);
              setHasUnreadNotifications(newCount > 0);
            }
          }
        } catch (error) {
          console.error("Error fetching notification count:", error);
        }
      }
    };

    fetchNotificationCount();

    // Refresh notification count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [isStudent, isCandidate, userType, location.pathname, isOnNotificationPage]); // Re-fetch when location changes

  // Mark notifications as read when user is on notification page
  useEffect(() => {
    if (isOnNotificationPage && (isStudent() || isCandidate())) {
      localStorage.setItem('lastNotificationView', new Date().toISOString());
      setHasUnreadNotifications(false);
      setNewNotificationCount(0);
    }
  }, [isOnNotificationPage, isStudent, isCandidate]);

  // Handle notification icon click
  const handleNotificationClick = () => {
    setMenuOpen(false);
    localStorage.setItem('lastNotificationView', new Date().toISOString());
    setHasUnreadNotifications(false);
    setNewNotificationCount(0);
  };

  const handleLogout = () => {
    // Save the user type before logout clears it
    const currentUserType = userType;
    
    logout();
    
    // Use window.location to force full page navigation and avoid race condition with ProtectedRoute
    if (currentUserType === 'Student') {
      window.location.href = "/student/login";
    } else if (currentUserType === 'Candidate') {
      window.location.href = "/candidate/login";
    } else {
      window.location.href = "/admin";
    }
  };
  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between px-6 py-3 md:py-4 shadow max-w-6xl mx-auto bg-white/70 backdrop-blur-lg rounded-full mt-4">
        {/* Left: Project Name */}
        <Link
          to={
            isStudent() ? "/student" : isCandidate() ? "/candidate" : "/admin"
          }
        >
          <small className="text-2xl font-extrabold text-indigo-600">
            {" "}
            e-Voting
          </small>
        </Link>

        {/* Menu for mobile + desktop */}
        <nav
          className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:overflow-hidden flex items-center justify-center max-md:h-full ${
            menuOpen ? "max-md:w-full" : "max-md:w-0"
          } transition-[width] bg-white/90 backdrop-blur flex-col md:flex-row gap-8 text-gray-900 text-sm font-medium`}
        >
          {/* Notifications - Show based on user role */}
          {(isStudent() || isCandidate()) && (
            <Link
              to={
                isStudent()
                  ? "/student/notifications"
                  : "/candidate/notifications"
              }
              className="relative"
              onClick={handleNotificationClick}
            >
              <BellIcon 
                className={`h-6 w-6 transition ${
                  hasUnreadNotifications 
                    ? "text-red-500 hover:text-red-600" 
                    : "text-gray-700 hover:text-indigo-600"
                }`} 
              />
              {hasUnreadNotifications && newNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                  {newNotificationCount}
                </span>
              )}
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

              {/* Profile Link - only show for students/candidates */}
              {(isStudent() || isCandidate()) && (
                <Link
                  to={
                    isStudent()
                      ? "/student/profile"
                      : "/candidate/profile"
                  }
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Edit Profile
                </Link>
              )}

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
