import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useKeepAlive } from './hooks/useKeepAlive';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import AgentLogin from './pages/AgentLogin';
import AgentRegister from './pages/AgentRegister';
import AgentLayout from './pages/AgentLayout';
import AgentDashboardHome from './pages/AgentDashboardHome';
import AgentNewApplication from './pages/AgentNewApplication';
import AgentDailyLogins from './pages/AgentDailyLogins';
import AgentPendingRemarks from './pages/AgentPendingRemarks';
import AdminDashboard from './pages/AdminDashboard';
import AdminChatDashboard from './pages/AdminChatDashboard';
import AdminPushNotifications from './pages/AdminPushNotifications';
import Chat from './pages/Chat';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import UserHome from './pages/user/UserHome';
import About from './pages/About';
import Services from './pages/Services';
import TouristVisa from './pages/TouristVisa';
import WorkVisa from './pages/WorkVisa';
import TransitVisa from './pages/TransitVisa';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Consultants from './pages/Consultants';
import Appointment from './pages/Appointment';
import AppointmentPayment from './pages/AppointmentPayment';
import UserProfile from './pages/UserProfile';

const EMPLOYEE_ROLES = ['case_manager', 'manager', 'senior_manager', 'admin'];

function App() {
  const { isAuthenticated, loading, user } = useAuth();
  useKeepAlive();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* User auth */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            EMPLOYEE_ROLES.includes(user?.role) ? (
              <Navigate to="/agent/dashboard" replace />
            ) : (
              <Navigate to="/consultants" replace />
            )
          ) : (
            <UserLogin />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            EMPLOYEE_ROLES.includes(user?.role) ? (
              <Navigate to="/agent/dashboard" replace />
            ) : (
              <Navigate to="/consultants" replace />
            )
          ) : (
            <UserRegister />
          )
        }
      />

      {/* Agent auth */}
      <Route
        path="/agent/login"
        element={isAuthenticated && EMPLOYEE_ROLES.includes(user?.role) ? <Navigate to="/agent/dashboard" replace /> : <AgentLogin />}
      />
      <Route
        path="/agent/register"
        element={isAuthenticated && EMPLOYEE_ROLES.includes(user?.role) ? <Navigate to="/agent/dashboard" replace /> : <AgentRegister />}
      />

      {/* Public landing pages */}
      <Route path="/home" element={<UserHome />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/tourist-visa" element={<TouristVisa />} />
      <Route path="/work-visa" element={<WorkVisa />} />
      <Route path="/transit-visa" element={<TransitVisa />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blog/:id/:slug?" element={<BlogDetail />} />
      <Route path="/consultants" element={<Consultants />} />
      <Route path="/appointment" element={<Appointment />} />
      <Route path="/appointment-payment" element={<AppointmentPayment />} />
      <Route path="/user/:id" element={<UserProfile />} />

      {/* Protected app routes */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Agent dashboard */}
      <Route
        path="/agent/dashboard"
        element={
          <ProtectedRoute allowedRoles={EMPLOYEE_ROLES} redirectTo="/agent/login">
            <AgentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AgentDashboardHome />} />
        <Route path="new-application" element={<AgentNewApplication />} />
        <Route path="daily-logins" element={<AgentDailyLogins />} />
        <Route path="pending-remarks" element={<AgentPendingRemarks />} />
        <Route
          path="chat"
          element={<Chat className="chat-agent-wrapper" />}
        />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/chats" element={<AdminChatDashboard />} />
        <Route path="admin/push" element={<AdminPushNotifications />} />
      </Route>

      {/* Default landing */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
