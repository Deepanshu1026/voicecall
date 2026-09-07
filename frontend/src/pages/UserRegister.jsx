import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/userAuth.css';

const UserRegister = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    countryCode: '+91',
    phone: '',
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
    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    } else if (!/^\d{6,15}$/.test(form.phone.trim())) {
      nextErrors.phone = 'Please enter a valid phone number';
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
      await register(form.username, form.email, form.password, form.fullName, 'user', form.phone.trim(), form.countryCode);
      toast.success('Account created successfully!');
    } catch (error) {
      const data = error.response?.data;
      const message = data?.errors?.join('. ') || data?.message || data?.error || error.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img className="auth-logo" src="/images/user/tmlogo 1.webp" alt="Avisa Experts" />
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join us and get instant access to our visa experts.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-input-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className={`auth-input ${errors.fullName ? 'error' : ''}`}
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="name"
              required
            />
            {errors.fullName && <span className="auth-error">{errors.fullName}</span>}
          </div>

          <div className="auth-input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className={`auth-input ${errors.username ? 'error' : ''}`}
              placeholder="johndoe"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
            {errors.username && <span className="auth-error">{errors.username}</span>}
          </div>

          <div className="auth-input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`auth-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div className="auth-input-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="auth-phone-row">
              <select
                id="countryCode"
                name="countryCode"
                className="auth-country-select"
                value={form.countryCode}
                onChange={handleChange}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+974">🇶🇦 +974</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+965">🇰🇼 +965</option>
                <option value="+968">🇴🇲 +968</option>
                <option value="+973">🇧🇭 +973</option>
                <option value="+92">🇵🇰 +92</option>
                <option value="+880">🇧🇩 +880</option>
                <option value="+94">🇱🇰 +94</option>
                <option value="+977">🇳🇵 +977</option>
                <option value="+86">🇨🇳 +86</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+82">🇰🇷 +82</option>
                <option value="+65">🇸🇬 +65</option>
                <option value="+60">🇲🇾 +60</option>
              </select>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`auth-input ${errors.phone ? 'error' : ''}`}
                placeholder="Mobile number"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                required
              />
            </div>
            {errors.phone && <span className="auth-error">{errors.phone}</span>}
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`auth-input ${errors.password ? 'error' : ''}`}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              minLength={6}
            />
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>

          <div className="auth-input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading && <span className="auth-spinner" />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
          <br />
          <span style={{ fontSize: '13px' }}>
            Are you an agent?{' '}
            <Link to="/agent/login" className="auth-link">
              Sign in as agent
            </Link>
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/home" className="auth-back-link">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
