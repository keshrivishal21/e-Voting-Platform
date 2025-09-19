import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Routes, Route } from 'react-router-dom';
import StudentHome from './pages/StudentBoard/Home';
import CandidateList from './pages/StudentBoard/CandidateList';
import StudentNotifications from './pages/StudentBoard/Notifications';
import StudentApplicationForm from './pages/StudentBoard/ApplicationForm';
import StudentVote from './pages/StudentBoard/Vote';
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
import Register from './pages/Auth/Register';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // TODO: Replace with real auth logic
  const isAuthenticated = true;
  const userRole = 'student'; // 'admin', 'candidate', 'student'

  return (
    <>
      <Navbar isCandidate={true} notificationCount={3} />
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Board */}
        <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StudentHome /></ProtectedRoute>} />
        <Route path="/view-candidates" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CandidateList /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StudentNotifications /></ProtectedRoute>} />
        <Route path="/student/application" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StudentApplicationForm /></ProtectedRoute>} />
        <Route path="/student/vote" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StudentVote /></ProtectedRoute>} />

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
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
