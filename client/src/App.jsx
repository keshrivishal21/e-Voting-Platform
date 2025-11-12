import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import StudentHome from './pages/StudentBoard/Home';
import CandidateList from './pages/StudentBoard/CandidateList';
import StudentNotifications from './pages/StudentBoard/Notifications';
import StudentProfile from './pages/StudentBoard/Profile';
import CandidateHome from './pages/CandidateBoard/Home';
import CandidateLiveVotes from './pages/CandidateBoard/LiveVotes';
import CandidateCampaignOverview from './pages/CandidateBoard/CampaignOverview';
import CandidateProfile from './pages/CandidateBoard/Profile';
import AdminHome from './pages/AdminBoard/Home';
import AdminCandidateManagement from './pages/AdminBoard/CandidateManagement';
import AdminElectionControl from './pages/AdminBoard/ElectionControl';
import AdminFeedbackManagement from './pages/AdminBoard/FeedbackMangement';
import AdminNotifications from './pages/AdminBoard/Notifications';
//import AdminResultManagement from './pages/AdminBoard/ResultMangement';
import AdminStudentManagement from './pages/AdminBoard/StudentMangement';
import Login from './pages/Auth/StudentLogin';
import AdminLogin from './pages/Auth/AdminLogin';
import CanRegister from './pages/Auth/CandidateRegister';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Signup from './pages/Auth/StudentSignup';
import Elections from './pages/StudentBoard/Elections';
import Results from './pages/StudentBoard/Results';
import CastVote from './pages/StudentBoard/CastVote';
import CandidateLogin from './pages/Auth/CandidateLogin';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardRedirect from './components/DashboardRedirect';



// Component to handle authentication-based routing logic
function AppContent() {
  const { isAuthenticated, userType } = useAuth();
  const location = useLocation();
  
  // Routes where navbar should be hidden
  const noNavbarRoutes = ['/', '/candidate/register', '/candidate/login', '/student/login', '/admin/login', '/student/signup', '/forgot-password', '/reset-password', '/404', '/not-found'];
  const shouldHideNavbar = noNavbarRoutes.includes(location.pathname);
  const noFooterRoutes = ['/'];
  const shouldHideFooter = noFooterRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Conditionally render navbar */}
      {!shouldHideNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
        
        {/* Dashboard redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        
        {/* Auth routes */}
        <Route path="/student/login" element={
          isAuthenticated && userType === 'Student' ? (
            <Navigate to={getUserDashboard(userType)} replace />
          ) : (
            <Login />
          )
        } />
        
        {/* Admin login page */}
        <Route path="/admin/login" element={
          isAuthenticated && userType === 'Admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <AdminLogin />
          )
        } />
        
        {/* Candidate auth pages - accessible even when logged in as student */}
        <Route path="/candidate/register" element={<CanRegister />} />
        <Route path="/candidate/login" element={<CandidateLogin />} />
        
        {/* Student signup - redirect if already authenticated */}
        <Route path="/student/signup" element={
          isAuthenticated ? (
            <Navigate to={getUserDashboard(userType)} replace />
          ) : (
            <Signup />
          )
        } />

        {/* Forgot Password Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Student Board - Only accessible by students */}
        <Route path="/student" element={
          <ProtectedRoute requiredRole="Student">
            <StudentHome />
          </ProtectedRoute>
        } />
        <Route path="/view-candidates" element={
          <ProtectedRoute requiredRole="Student">
            <CandidateList />
          </ProtectedRoute>
        } />
        <Route path="/student/notifications" element={
          <ProtectedRoute requiredRole="Student">
            <StudentNotifications />
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute requiredRole="Student">
            <StudentProfile />
          </ProtectedRoute>
        } />
        <Route path="/student/elections" element={
          <ProtectedRoute requiredRole="Student">
            <Elections />
          </ProtectedRoute>
        } />
        <Route path="/student/results" element={
          <ProtectedRoute requiredRole="Student">
            <Results />
          </ProtectedRoute>
        } />
        <Route path="/student/cast-vote" element={
          <ProtectedRoute requiredRole="Student">
            <CastVote />
          </ProtectedRoute>
        } />

        {/* Candidate Board - Only accessible by candidates */}
        <Route path="/candidate" element={
          <ProtectedRoute requiredRole="Candidate">
            <CandidateHome />
          </ProtectedRoute>
        } />
        <Route path="/candidate/live-votes" element={
          <ProtectedRoute requiredRole="Candidate">
            <CandidateLiveVotes />
          </ProtectedRoute>
        } />
        <Route path="/candidate/campaign" element={
          <ProtectedRoute requiredRole="Candidate">
            <CandidateCampaignOverview />
          </ProtectedRoute>
        } />
        <Route path="/candidate/profile" element={
          <ProtectedRoute requiredRole="Candidate">
            <CandidateProfile />
          </ProtectedRoute>
        } />
        <Route path="/candidate/results" element={
          <ProtectedRoute requiredRole="Candidate">
            <Results />
          </ProtectedRoute>
        } />
        <Route path="/candidate/notifications" element={
          <ProtectedRoute requiredRole="Candidate">
            <StudentNotifications />
          </ProtectedRoute>
        } />

        {/* Admin Board - Only accessible by admins */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="Admin">
            <AdminHome />
          </ProtectedRoute>
        } />
        <Route path="/admin/candidates" element={
          <ProtectedRoute requiredRole="Admin">
            <AdminCandidateManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/election" element={
          <ProtectedRoute requiredRole="Admin">
            <AdminElectionControl />
          </ProtectedRoute>
        } />
        <Route path="/admin/feedback" element={
          <ProtectedRoute requiredRole="Admin">
            <AdminFeedbackManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/notifications" element={
          <ProtectedRoute requiredRole="Admin">
            <AdminNotifications />
          </ProtectedRoute>
        } />
        {/* <Route path="/admin/results" element={
          <ProtectedRoute requiredRole="Admin">
            <AdminResultManagement />
          </ProtectedRoute>
        } /> */}
        <Route path="/admin/students" element={
          <ProtectedRoute requiredRole="Admin">
            <AdminStudentManagement />
          </ProtectedRoute>
        } />

        {/* 404 Not Found */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      </AnimatePresence>

      {!shouldHideFooter && <Footer />}
    </div>
  );
}

// Helper function to get dashboard route based on user type
function getUserDashboard(userType) {
  const dashboards = {
    Student: '/student',
    Candidate: '/candidate',
    Admin: '/admin'
  };
  return dashboards[userType] || '/student';
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
