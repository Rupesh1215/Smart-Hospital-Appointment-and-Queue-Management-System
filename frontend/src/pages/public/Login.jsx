import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import {
  HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff,
} from 'react-icons/hi';
import {
  MdLocalHospital, MdSecurity, MdCheckCircle, MdAdminPanelSettings,
  MdPeople, MdPerson, MdMedicalServices, MdSupportAgent, MdKey,
} from 'react-icons/md';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Login.css';

const ROLE_DASHBOARDS = {
  PATIENT: '/patient/dashboard',
  DOCTOR: '/doctor/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  ADMIN: '/admin/dashboard',
};

const USER_ROLES = [
  {
    id: 'PATIENT',
    label: 'Patient',
    icon: MdPerson,
    desc: 'Book appointments & track queue',
    color: '#0B7A5F',
  },
  {
    id: 'DOCTOR',
    label: 'Doctor',
    icon: MdMedicalServices,
    desc: 'Manage consultations & queue',
    color: '#2563EB',
  },
  {
    id: 'RECEPTIONIST',
    label: 'Receptionist',
    icon: MdSupportAgent,
    desc: 'Manage check-ins & schedules',
    color: '#7C3AED',
  },
];

const DEFAULT_CREDENTIALS = {
  ADMIN: { email: 'admin@gmail.com', password: '12345678' },
  RECEPTIONIST: { email: 'receptionist@gmail.com', password: '12345678' },
  PATIENT: { email: 'patient@gmail.com', password: '12345678' },
  DOCTOR: { email: 'doctor@gmail.com', password: '12345678' },
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

  // Step: 'choose' → 'admin' | 'user-select' → 'form'
  const [step, setStep] = useState('choose');
  const [selectedRole, setSelectedRole] = useState(null); // 'ADMIN' | 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST'
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await authService.login(formData);
      const { token, user } = response.data.data;

      // 🚨 STRICT ROLE VALIDATION
      if (selectedRole && user.role !== selectedRole) {
        toast.error(
          `Access Denied: You entered ${user.role} credentials, but selected ${selectedRole}. Please switch to the ${user.role} login option.`
        );
        setIsLoading(false);
        return; // DO NOT LOG IN
      }

      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      const redirectTo = from || ROLE_DASHBOARDS[user.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid email or password. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    const cred = DEFAULT_CREDENTIALS[selectedRole];
    if (cred) {
      setFormData({ email: cred.email, password: cred.password });
      setErrors({});
      toast.success(`Filled default credentials for ${selectedRole}`);
    }
  };

  /* helpers */
  const goAdminForm = () => { setSelectedRole('ADMIN'); setStep('form'); setFormData({ email: '', password: '' }); };
  const goUserSelect = () => setStep('user-select');
  const goUserForm = (role) => { setSelectedRole(role); setStep('form'); setFormData({ email: '', password: '' }); };
  const goBack = () => {
    setErrors({});
    setFormData({ email: '', password: '' });
    if (step === 'user-select') setStep('choose');
    else if (step === 'form') {
      if (selectedRole === 'ADMIN') setStep('choose');
      else setStep('user-select');
    }
  };

  /* label for the form header */
  const roleLabel = selectedRole === 'ADMIN'
    ? 'Administrator'
    : USER_ROLES.find(r => r.id === selectedRole)?.label || '';

  return (
    <div className="login-page">
      <Navbar />

      <main className="login-main">
        {/* ── Left branding panel ── */}
        <div className="login-left-panel">
          <div className="login-aurora blob-1" />
          <div className="login-dot-grid" />

          <div className="login-brand-content">
            <div className="login-logo-container">
              <div className="login-logo-icon">
                <MdLocalHospital className="icon-hospital" />
              </div>
              <div className="login-logo-text">
                <span className="text-white">Smart</span>
                <span className="text-primary">Hospital</span>
              </div>
            </div>

            <h2 className="login-welcome-title">Welcome back to smarter healthcare</h2>
            <p className="login-welcome-desc">
              Access your appointments, track queues, and manage your health journey — all in one place.
            </p>

            <div className="login-highlights">
              {highlights.map((item, i) => (
                <div key={i} className={`login-highlight-item delay-${i}`}>
                  <item.icon className="icon-check" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

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

        {/* ── Right panel ── */}
        <div className="login-right-panel">
          <div className="login-form-wrapper">

            {/* Mobile logo */}
            <div className="login-mobile-logo">
              <div className="login-mobile-icon"><MdLocalHospital /></div>
            </div>

            {/* ── STEP: choose Admin or User ── */}
            {step === 'choose' && (
              <>
                <div className="login-form-header">
                  <h1>Sign in to your account</h1>
                  <p>Select how you would like to access the platform</p>
                </div>

                <div className="login-form-card login-role-choice-card">
                  {/* Admin tile */}
                  <button
                    id="choose-admin-btn"
                    className="login-role-tile admin"
                    onClick={goAdminForm}
                  >
                    <div className="lrt-icon-wrap admin">
                      <MdAdminPanelSettings />
                    </div>
                    <div className="lrt-body">
                      <span className="lrt-title">Administrator</span>
                      <span className="lrt-desc">Full system control & analytics</span>
                    </div>
                    <span className="lrt-arrow">→</span>
                  </button>

                  <div className="login-divider" style={{ margin: '0.75rem 0' }}>
                    <div className="divider-line" />
                    <span className="divider-text">or</span>
                  </div>

                  {/* User tile */}
                  <button
                    id="choose-user-btn"
                    className="login-role-tile user"
                    onClick={goUserSelect}
                  >
                    <div className="lrt-icon-wrap user">
                      <MdPeople />
                    </div>
                    <div className="lrt-body">
                      <span className="lrt-title">User</span>
                      <span className="lrt-desc">Patient, Doctor or Receptionist</span>
                    </div>
                    <span className="lrt-arrow">→</span>
                  </button>
                </div>

                <div className="login-security-note">
                  <MdSecurity className="icon-security" />
                  <span>Protected by enterprise-grade security</span>
                </div>
              </>
            )}

            {/* ── STEP: select user sub-role ── */}
            {step === 'user-select' && (
              <>
                <div className="login-form-header">
                  <h1>I am a…</h1>
                  <p>Choose your role to continue</p>
                </div>

                <div className="login-form-card login-role-choice-card">
                  {USER_ROLES.map((role) => (
                    <button
                      key={role.id}
                      id={`choose-${role.id.toLowerCase()}-btn`}
                      className="login-role-tile user-sub"
                      onClick={() => goUserForm(role.id)}
                    >
                      <div className="lrt-icon-wrap user-sub" style={{ '--lrt-color': role.color }}>
                        <role.icon />
                      </div>
                      <div className="lrt-body">
                        <span className="lrt-title">{role.label}</span>
                        <span className="lrt-desc">{role.desc}</span>
                      </div>
                      <span className="lrt-arrow">→</span>
                    </button>
                  ))}

                  <button className="login-back-link" onClick={goBack}>
                    ← Back
                  </button>
                </div>

                <div className="login-security-note">
                  <MdSecurity className="icon-security" />
                  <span>Protected by enterprise-grade security</span>
                </div>
              </>
            )}

            {/* ── STEP: credential form ── */}
            {step === 'form' && (
              <>
                <div className="login-form-header">
                  <h1>Sign in as {roleLabel}</h1>
                  <p>Enter your credentials to access your dashboard</p>
                </div>

                <div className="login-form-card">
                  {/* Default Credentials Quick-Fill Chip */}
                  {DEFAULT_CREDENTIALS[selectedRole] && (
                    <div
                      style={{
                        marginBottom: '1.25rem',
                        padding: '0.75rem 1rem',
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                      }}
                    >
                      <div style={{ fontSize: '0.8125rem', color: '#166534' }}>
                        <strong>Default {roleLabel} Credentials:</strong>
                        <br />
                        Email: <code>{DEFAULT_CREDENTIALS[selectedRole].email}</code> | Pass: <code>{DEFAULT_CREDENTIALS[selectedRole].password}</code>
                      </div>
                      <button
                        type="button"
                        onClick={fillDefaultCredentials}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.35rem 0.65rem',
                          background: '#16A34A',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        <MdKey /> Auto Fill
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="login-form" id="login-form">
                    {/* Email */}
                    <div className="form-group">
                      <label htmlFor="login-email">Email Address</label>
                      <div className="input-wrapper">
                        <div className="input-icon-left"><HiOutlineMail /></div>
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
                          <span className="error-dot" />{errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                      <div className="password-header">
                        <label htmlFor="login-password">Password</label>
                      </div>
                      <div className="input-wrapper">
                        <div className="input-icon-left"><HiOutlineLockClosed /></div>
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
                          <span className="error-dot" />{errors.password}
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
                        <><div className="loading-spinner" />Signing in...</>
                      ) : (
                        `Sign in as ${roleLabel}`
                      )}
                    </button>
                  </form>

                  <button className="login-back-link" onClick={goBack}>
                    ← Choose a different role
                  </button>

                  {/* Only show register link for non-admin */}
                  {selectedRole !== 'ADMIN' && (
                    <>
                      <div className="login-divider">
                        <div className="divider-line" />
                        <span className="divider-text">New to Smart Hospital?</span>
                      </div>
                      <Link to="/register" id="login-register-link" className="login-register-btn">
                        Create an Account
                      </Link>
                    </>
                  )}
                </div>

                <div className="login-security-note">
                  <MdSecurity className="icon-security" />
                  <span>Protected by enterprise-grade security</span>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
