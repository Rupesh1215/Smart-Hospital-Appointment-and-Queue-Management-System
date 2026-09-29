import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { MdLocalHospital, MdSecurity, MdCheckCircle, MdSmartToy, MdCalendarMonth, MdPeople } from 'react-icons/md';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Register.css';

const highlights = [
  { icon: MdCalendarMonth, text: 'Instant appointment booking' },
  { icon: MdPeople, text: 'Real-time queue management' },
  { icon: MdSmartToy, text: 'AI-powered health assistant' },
  { icon: MdSecurity, text: 'Secure & private platform' },
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'PATIENT',
    gender: 'MALE',
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
      const response = await authService.register(formData);
      const { token, user } = response.data.data;

      login(user, token);
      toast.success(`Welcome, ${user.name}! Your account is ready.`);
      navigate('/patient/dashboard', { replace: true });
    } catch (error) {
      const apiData = error.response?.data;
      if (apiData?.data && typeof apiData.data === 'object') {
        // Map backend field-level validation errors
        setErrors(apiData.data);
        toast.error(apiData.message || 'Please fix the errors in the form.');
      } else {
        const message = apiData?.message || 'Registration failed. Please try again.';
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputField = (id, name, type, label, placeholder, Icon, extraProps = {}) => (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
      </label>
      <div className="input-wrapper">
        <div className="input-icon-left">
          <Icon />
        </div>
        {type === 'password' ? (
          <>
            <input
              id={id}
              name={name}
              type={showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              value={formData[name]}
              onChange={handleChange}
              className={errors[name] ? 'input-error' : ''}
              {...extraProps}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="input-icon-right"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </>
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            className={errors[name] ? 'input-error' : ''}
            {...extraProps}
          />
        )}
      </div>
      {errors[name] && (
        <p className="error-message">
          <span className="error-dot" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="register-page">
      <Navbar />

      <main className="register-main">
        {/* Left Panel — Branding */}
        <div className="register-left-panel">
          <div className="register-aurora blob-1" />
          <div className="register-dot-grid" />

          <div className="register-brand-content">
            <div className="register-logo-container">
              <div className="register-logo-icon">
                <MdLocalHospital className="icon-hospital text-white text-2xl" />
              </div>
              <div className="register-logo-text">
                <span className="text-white">Smart</span>
                <span className="text-primary">Hospital</span>
              </div>
            </div>

            <h2 className="register-welcome-title">
              Join the future of healthcare
            </h2>
            <p className="register-welcome-desc">
              Create your account and start booking appointments with top doctors in minutes — 
              no more waiting in long queues.
            </p>

            <div className="register-highlights">
              {highlights.map((item, i) => (
                <div key={i} className={`register-highlight-item delay-${i}`}>
                  <div className="register-highlight-icon">
                    <item.icon className="icon-check" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="register-social-proof">
              <div className="register-avatars-group">
                <div className="register-avatars">
                  {['from-primary-400 to-primary-600', 'from-violet-400 to-violet-600', 'from-amber-400 to-amber-600'].map((color, i) => (
                    <div key={i} className="register-avatar" style={{ background: color }}>
                      {['A', 'S', 'P'][i]}
                    </div>
                  ))}
                </div>
                <p className="register-social-text">
                  <strong>500+</strong> patients joined this month
                </p>
              </div>
              <p className="register-social-desc">
                Join a growing community of patients who trust SmartHospital for their healthcare needs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="register-right-panel">
          <div className="register-form-wrapper">
            <div className="register-mobile-logo">
              <div className="register-mobile-icon">
                <MdLocalHospital />
              </div>
            </div>

            <div className="register-form-header">
              <h1>Create your account</h1>
              <p>Fill in your details to get started for free</p>
            </div>

            <div className="register-form-card">
              <form onSubmit={handleSubmit} className="register-form" id="register-form">
                {inputField('register-name', 'name', 'text', 'Full Name', 'John Doe', HiOutlineUser)}
                {inputField('register-email', 'email', 'email', 'Email Address', 'you@example.com', HiOutlineMail)}
                {inputField('register-phone', 'phone', 'tel', 'Phone Number', '9876543210', HiOutlinePhone)}
                {inputField('register-password', 'password', 'password', 'Password', 'Minimum 8 characters', HiOutlineLockClosed)}

                {/* Role */}
                <div className="form-group">
                  <label htmlFor="register-role">
                    I am a...
                  </label>
                  <div className="register-gender-options">
                    {['PATIENT', 'DOCTOR'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                        className={`gender-btn ${formData.role === r ? 'active' : ''}`}
                      >
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div className="form-group">
                  <label htmlFor="register-gender">
                    Gender
                  </label>
                  <div className="register-gender-options">
                    {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                        className={`gender-btn ${formData.gender === g ? 'active' : ''}`}
                      >
                        {g.charAt(0) + g.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  id="register-submit-btn"
                  className="register-submit-btn"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="register-divider">
                <div className="divider-line" />
                <span className="divider-text">Already have an account?</span>
              </div>

              <Link
                to="/login"
                id="register-login-link"
                className="register-login-btn"
              >
                Sign In Instead
              </Link>
            </div>

            <div className="register-security-note">
              <MdSecurity className="icon-security" />
              <span>Your data is encrypted and secure</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
