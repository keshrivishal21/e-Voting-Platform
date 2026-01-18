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
            
            const lastViewedTime = localStorage.getItem('lastNotificationView');
            
            if (notifications.length === 0) {
              setHasUnreadNotifications(false);
              setNewNotificationCount(0);
            } else if (!lastViewedTime) {
              setHasUnreadNotifications(true);
              setNewNotificationCount(notifications.length);
            } else {
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

    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [isStudent, isCandidate, userType, location.pathname, isOnNotificationPage]); 

  useEffect(() => {
    if (isOnNotificationPage && (isStudent() || isCandidate())) {
      localStorage.setItem('lastNotificationView', new Date().toISOString());
      setHasUnreadNotifications(false);
      setNewNotificationCount(0);
    }
  }, [isOnNotificationPage, isStudent, isCandidate]);

  const handleNotificationClick = () => {
    setMenuOpen(false);
    localStorage.setItem('lastNotificationView', new Date().toISOString());
    setHasUnreadNotifications(false);
    setNewNotificationCount(0);
  };

  const handleLogout = () => {
    const currentUserType = userType;
    
    logout();
    
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
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 md:py-4 shadow max-w-6xl mx-auto bg-white/70 backdrop-blur-lg rounded-full mt-2 sm:mt-4">
        {/* Left: Project Name */}
        <Link
          to={
            isStudent() ? "/student" : isCandidate() ? "/candidate" : "/admin"
          }
        >
          <small className="text-xl sm:text-2xl font-extrabold text-indigo-600">
            e-Voting
          </small>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
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
              className="absolute right-0 top-full mt-2 w-44 bg-white border rounded-2xl shadow-lg
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
                >
                  Edit Profile
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 rounded-b-2xl"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-600 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 mt-20"
          onClick={() => setMenuOpen(false)}
        >
          <div 
            className="absolute right-4 top-4 bg-white rounded-2xl shadow-xl w-56 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Notifications - Mobile */}
            {(isStudent() || isCandidate()) && (
              <Link
                to={
                  isStudent()
                    ? "/student/notifications"
                    : "/candidate/notifications"
                }
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  handleNotificationClick();
                  setMenuOpen(false);
                }}
              >
                <BellIcon 
                  className={`h-5 w-5 ${
                    hasUnreadNotifications 
                      ? "text-red-500" 
                      : "text-gray-700"
                  }`} 
                />
                <span>Notifications</span>
                {hasUnreadNotifications && newNotificationCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {newNotificationCount}
                  </span>
                )}
              </Link>
            )}

            {/* Role switching - Mobile */}
            {(isStudent() || isCandidate()) && (
              <Link
                to={isStudent() ? "/candidate/login" : "/"}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Login as {isStudent() ? "Candidate" : "Student"}</span>
              </Link>
            )}

            {/* Profile Link - Mobile */}
            {(isStudent() || isCandidate()) && (
              <Link
                to={
                  isStudent()
                    ? "/student/profile"
                    : "/candidate/profile"
                }
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Edit Profile</span>
              </Link>
            )}

            {/* Logout - Mobile */}
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50 rounded-b-2xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
