import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/agentAuth.css';

const EMPLOYEE_ROLES = ['case_manager', 'manager', 'senior_manager', 'admin'];

const AgentLogin = () => {
  const { employeeLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Please enter a valid email';
    }
    if (!password) nextErrors.password = 'Password is required';
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    try {
      setLoading(true);
      const employeeData = await employeeLogin(email, password);
      if (!EMPLOYEE_ROLES.includes(employeeData?.role)) {
        await logout();
        toast.error('This account is not registered as an employee.');
        return;
      }
      toast.success('Welcome back, agent!');
      navigate('/agent/dashboard', { replace: true });
    } catch (error) {
      const data = error.response?.data;
      const message = data?.errors?.join('. ') || data?.message || data?.error || error.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-auth-page">
      <div className="agent-auth-card">
        <img className="agent-auth-logo" src="/images/user/tmlogo 1.webp" alt="Avisa Experts" />
        <span className="agent-portal-badge">Agent Portal</span>
        <h1 className="agent-auth-title">Agent Sign In</h1>
        <p className="agent-auth-subtitle">Log in to your agent dashboard and manage client calls.</p>

        <form className="agent-auth-form" onSubmit={handleSubmit} noValidate>
          <div className="agent-auth-input-group">
            <label htmlFor="agent-email">Email</label>
            <input
              id="agent-email"
              type="email"
              className={`agent-auth-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              autoComplete="email"
              required
            />
            {errors.email && <span className="agent-auth-error">{errors.email}</span>}
          </div>

          <div className="agent-auth-input-group">
            <label htmlFor="agent-password">Password</label>
            <input
              id="agent-password"
              type="password"
              className={`agent-auth-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              autoComplete="current-password"
              required
            />
            {errors.password && <span className="agent-auth-error">{errors.password}</span>}
          </div>

          <button type="submit" className="agent-auth-button" disabled={loading}>
            {loading && <span className="agent-auth-spinner" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="agent-auth-footer">
          Don&apos;t have an agent account?{' '}
          <Link to="/agent/register" className="agent-auth-link">
            Register as agent
          </Link>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/home" className="agent-auth-back-link">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;
