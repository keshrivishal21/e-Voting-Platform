import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import StudentHome from './pages/StudentBoard/Home';
import CandidateList from './pages/StudentBoard/CandidateList';
import StudentNotifications from './pages/StudentBoard/Notifications';
import StudentApplicationForm from './pages/StudentBoard/ApplicationForm';
import CandidateHome from './pages/CandidateBoard/Home';
import CandidateLiveVotes from './pages/CandidateBoard/LiveVotes';
import CandidateCampaignOverview from './pages/CandidateBoard/CampaignOverview';
import AdminHome from './pages/AdminBoard/Home';
import AdminCandidateManagement from './pages/AdminBoard/CandidateManagement';
import AdminElectionControl from './pages/AdminBoard/ElectionControl';
import AdminFeedbackManagement from './pages/AdminBoard/FeedbackMangement';
import AdminNotifications from './pages/AdminBoard/Notifications';
import AdminResultManagement from './pages/AdminBoard/ResultMangement';
import AdminStudentManagement from './pages/AdminBoard/StudentMangement';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/CandidateRegister';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Signup from './pages/Auth/Signup';
import Elections from './pages/StudentBoard/Elections';
import Results from './pages/StudentBoard/Results';
import CastVote from './pages/StudentBoard/CastVote';


function App() {
  // TODO: Replace with real auth logic
  const isAuthenticated = true;
  const userRole = 'student'; // 'admin', 'candidate', 'student'
  
  // Get current location
  const location = useLocation();
  
  // Simple approach - just list the routes where you want to hide navbar
  const noNavbarRoutes = ['/', '/register', '/signup', '/404', '/not-found'];
  
  const shouldHideNavbar = noNavbarRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Conditionally render navbar */}
      {!shouldHideNavbar && <Navbar isCandidate={true} notificationCount={3} />}
      <Routes>
        <Route path="/home" element={<Home />} />
        {/* Auth routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/signup' element={<Signup />} />
  

        {/* Student Board */}
        <Route path="/student" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StudentHome /></ProtectedRoute>} />
        <Route path="/view-candidates" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CandidateList /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StudentNotifications /></ProtectedRoute>} />
        <Route path="/student/application" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StudentApplicationForm /></ProtectedRoute>} />
        <Route path="/student/elections" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Elections /></ProtectedRoute>} />
        <Route path="/student/results" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Results /></ProtectedRoute>} />
        <Route path="/apply-candidate" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StudentApplicationForm /></ProtectedRoute>} />
        <Route path="/student/cast-vote" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CastVote /></ProtectedRoute>} />

        {/* Candidate Board */}
        <Route path="/candidate" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CandidateHome /></ProtectedRoute>} />
        <Route path="/candidate/live-votes" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CandidateLiveVotes /></ProtectedRoute>} />
        <Route path="/candidate/campaign" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CandidateCampaignOverview /></ProtectedRoute>} />

        {/* Admin Board */}
        <Route path="/admin" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminHome /></ProtectedRoute>} />
        <Route path="/admin/candidates" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminCandidateManagement /></ProtectedRoute>} />
        <Route path="/admin/election" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminElectionControl /></ProtectedRoute>} />
        <Route path="/admin/feedback" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminFeedbackManagement /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminNotifications /></ProtectedRoute>} />
        <Route path="/admin/results" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminResultManagement /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminStudentManagement /></ProtectedRoute>} />

        {/* 404 Not Found */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      
      { <Footer />}
    </div>
  );
}

export default App;
