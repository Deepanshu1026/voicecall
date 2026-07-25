import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useKeepAlive } from './hooks/useKeepAlive';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import AgentLogin from './pages/AgentLogin';
import AgentRegister from './pages/AgentRegister';
import AgentDashboard from './pages/AgentDashboard';
import Chat from './pages/Chat';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import UserHome from './pages/user/UserHome';
import Services from './pages/Services';
import About from './pages/About';
import Consultants from './pages/Consultants';
import Appointment from './pages/Appointment';
import TouristVisa from './pages/TouristVisa';
import WorkVisa from './pages/WorkVisa';
import TransitVisa from './pages/TransitVisa';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';

function App() {
  const { isAuthenticated, loading, user } = useAuth();
  useKeepAlive();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* User auth */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/consultants" replace /> : <UserLogin />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/consultants" replace /> : <UserRegister />} />

      {/* Agent auth */}
      <Route
        path="/agent/login"
        element={isAuthenticated && user?.role === 'agent' ? <Navigate to="/agent/dashboard" replace /> : <AgentLogin />}
      />
      <Route
        path="/agent/register"
        element={isAuthenticated && user?.role === 'agent' ? <Navigate to="/agent/dashboard" replace /> : <AgentRegister />}
      />

      {/* Public landing pages */}
      <Route path="/home" element={<UserHome />} />
      <Route path="/services" element={<Services />} />
      <Route path="/tourist-visa" element={<TouristVisa />} />
      <Route path="/work-visa" element={<WorkVisa />} />
      <Route path="/transit-visa" element={<TransitVisa />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blog/:id/:slug?" element={<BlogDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/consultants" element={<Consultants />} />
      <Route path="/appointment" element={<Appointment />} />

      {/* Protected app routes */}
      <Route
        path="/"
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
          <ProtectedRoute allowedRoles={['agent']} redirectTo="/agent/login">
            <AgentDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
