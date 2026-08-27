import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { MdLocalHospital, MdSecurity, MdCheckCircle } from 'react-icons/md';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Login.css';

const ROLE_DASHBOARDS = {
  PATIENT: '/patient/dashboard',
  DOCTOR: '/doctor/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  ADMIN: '/admin/dashboard',
};

const highlights = [
  { icon: MdCheckCircle, text: 'AI-powered appointment booking' },
  { icon: MdCheckCircle, text: 'Real-time queue tracking' },
  { icon: MdCheckCircle, text: 'Secure & HIPAA-compliant' },
  { icon: MdCheckCircle, text: '50+ expert doctors available' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || null;

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(formData);
      const { token, user } = response.data.data;

      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);

      const redirectTo = from || ROLE_DASHBOARDS[user.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Navbar />

      <main className="login-main">
        {/* Left Panel — Branding (desktop only) */}
        <div className="login-left-panel">
          <div className="login-aurora blob-1" />
          <div className="login-dot-grid" />

          <div className="login-brand-content">
            {/* Logo */}
            <div className="login-logo-container">
              <div className="login-logo-icon">
                <MdLocalHospital className="icon-hospital" />
              </div>
              <div className="login-logo-text">
                <span className="text-white">Smart</span>
                <span className="text-primary">Hospital</span>
              </div>
            </div>

            <h2 className="login-welcome-title">
              Welcome back to smarter healthcare
            </h2>
            <p className="login-welcome-desc">
              Access your appointments, track queues, and manage your health journey — all in one place.
            </p>

            {/* Feature highlights */}
            <div className="login-highlights">
              {highlights.map((item, i) => (
                <div key={i} className={`login-highlight-item delay-${i}`}>
                  <item.icon className="icon-check" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="login-testimonial">
              <p className="login-testimonial-quote">
                "SmartHospital made booking appointments incredibly easy. The queue tracking feature saved me hours of waiting."
              </p>
              <div className="login-testimonial-author">
                <div className="login-avatar">RS</div>
                <div>
                  <p className="login-author-name">Rahul Sharma</p>
                  <p className="login-author-role">Patient since 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="login-right-panel">
          <div className="login-form-wrapper">
            {/* Mobile logo */}
            <div className="login-mobile-logo">
              <div className="login-mobile-icon">
                <MdLocalHospital />
              </div>
            </div>

            {/* Header */}
            <div className="login-form-header">
              <h1>Sign in to your account</h1>
              <p>Enter your credentials to access your dashboard</p>
            </div>

            {/* Card */}
            <div className="login-form-card">
              <form onSubmit={handleSubmit} className="login-form" id="login-form">
                {/* Email */}
                <div className="form-group">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="input-wrapper">
                    <div className="input-icon-left">
                      <HiOutlineMail />
                    </div>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'input-error' : ''}
                    />
                  </div>
                  {errors.email && (
                    <p className="error-message">
                      <span className="error-dot" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="form-group">
                  <div className="password-header">
                    <label htmlFor="login-password">Password</label>
                    <button type="button" className="forgot-password">
                      Forgot password?
                    </button>
                  </div>
                  <div className="input-wrapper">
                    <div className="input-icon-left">
                      <HiOutlineLockClosed />
                    </div>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'input-error' : ''}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="input-icon-right"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="error-message">
                      <span className="error-dot" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  id="login-submit-btn"
                  className="login-submit-btn"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="login-divider">
                <div className="divider-line" />
                <span className="divider-text">New to Smart Hospital?</span>
              </div>

              {/* Register link */}
              <Link to="/register" id="login-register-link" className="login-register-btn">
                Create an Account
              </Link>
            </div>

            {/* Footer note */}
            <div className="login-security-note">
              <MdSecurity className="icon-security" />
              <span>Protected by enterprise-grade security</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
