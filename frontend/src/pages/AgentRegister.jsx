import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/agentAuth.css';

const AgentRegister = () => {
  const { employeeRegister } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Full name is required';
    }
    if (!form.username.trim()) {
      nextErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username)) {
      nextErrors.username = 'Username must be 3-30 characters, letters, numbers, or underscores';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Please enter a valid email';
    }
    if (!form.password) {
      nextErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
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
      await employeeRegister({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.fullName,
        role: 'case_manager',
      });
      toast.success('Agent account created successfully!');
      navigate('/agent/dashboard', { replace: true });
    } catch (error) {
      const data = error.response?.data;
      const message = data?.errors?.join('. ') || data?.message || data?.error || error.message || 'Registration failed. Please try again.';
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
        <h1 className="agent-auth-title">Become an Agent</h1>
        <p className="agent-auth-subtitle">Create your agent account and start helping clients with visa consultations.</p>

        <form className="agent-auth-form" onSubmit={handleSubmit} noValidate>
          <div className="agent-auth-input-group">
            <label htmlFor="agent-fullName">Full Name</label>
            <input
              id="agent-fullName"
              name="fullName"
              type="text"
              className={`agent-auth-input ${errors.fullName ? 'error' : ''}`}
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="name"
              required
            />
            {errors.fullName && <span className="agent-auth-error">{errors.fullName}</span>}
          </div>

          <div className="agent-auth-input-group">
            <label htmlFor="agent-username">Username</label>
            <input
              id="agent-username"
              name="username"
              type="text"
              className={`agent-auth-input ${errors.username ? 'error' : ''}`}
              placeholder="johndoe"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
            {errors.username && <span className="agent-auth-error">{errors.username}</span>}
          </div>

          <div className="agent-auth-input-group">
            <label htmlFor="agent-email">Email</label>
            <input
              id="agent-email"
              name="email"
              type="email"
              className={`agent-auth-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
            {errors.email && <span className="agent-auth-error">{errors.email}</span>}
          </div>

          <div className="agent-auth-input-group">
            <label htmlFor="agent-password">Password</label>
            <input
              id="agent-password"
              name="password"
              type="password"
              className={`agent-auth-input ${errors.password ? 'error' : ''}`}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              minLength={6}
            />
            {errors.password && <span className="agent-auth-error">{errors.password}</span>}
          </div>

          <div className="agent-auth-input-group">
            <label htmlFor="agent-confirmPassword">Confirm Password</label>
            <input
              id="agent-confirmPassword"
              name="confirmPassword"
              type="password"
              className={`agent-auth-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && <span className="agent-auth-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="agent-auth-button" disabled={loading}>
            {loading && <span className="agent-auth-spinner" />}
            {loading ? 'Creating account...' : 'Create Agent Account'}
          </button>
        </form>

        <div className="agent-auth-footer">
          Already have an agent account?{' '}
          <Link to="/agent/login" className="agent-auth-link">
            Sign in
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

export default AgentRegister;
