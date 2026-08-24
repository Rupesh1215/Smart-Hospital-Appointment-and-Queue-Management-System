import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { MdLocalHospital, MdSecurity, MdPeople, MdSmartToy, MdCheckCircle } from 'react-icons/md';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex pt-16 lg:pt-0 relative">
        {/* Left Panel — Branding (desktop only) */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] gradient-mesh relative overflow-hidden items-center justify-center p-12">
          {/* Aurora blobs */}
          <div className="aurora-blob aurora-blob-1 absolute top-[10%] left-[5%] opacity-20" />
          <div className="absolute inset-0 bg-dot-grid-dark opacity-30" />

          <div className="relative z-10 max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/25">
                <MdLocalHospital className="text-white text-2xl" />
              </div>
              <div>
                <span className="text-xl font-bold text-white font-display">Smart</span>
                <span className="text-xl font-bold text-primary-400 font-display">Hospital</span>
              </div>
            </div>

            <h2 className="heading-lg text-3xl xl:text-4xl text-white mb-4">
              Welcome back to smarter healthcare
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-10">
              Access your appointments, track queues, and manage your health journey — all in one place.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4">
              {highlights.map((item, i) => (
                <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                  <item.icon className="text-primary-400 text-lg flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="mt-12 glass-dark rounded-2xl p-5 border border-white/[0.06]">
              <p className="text-slate-300 text-sm leading-relaxed italic mb-3">
                "SmartHospital made booking appointments incredibly easy. The queue tracking feature saved me hours of waiting."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                  RS
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Rahul Sharma</p>
                  <p className="text-slate-500 text-[0.65rem]">Patient since 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-16 lg:py-12 relative overflow-hidden">
          <div className="w-full max-w-md relative z-10 animate-fade-in">
            {/* Mobile logo */}
            <div className="text-center mb-8 lg:hidden">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mb-4 shadow-lg shadow-primary-500/20">
                <MdLocalHospital className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="heading-lg text-2xl lg:text-3xl text-slate-900 mb-2">Sign in to your account</h1>
              <p className="text-slate-500 text-sm">Enter your credentials to access your dashboard</p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-7 animate-slide-up delay-100">
              <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <HiOutlineMail className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-modern ${errors.email ? 'border-danger-500 bg-danger-50/50 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-danger-500 flex items-center gap-1 animate-fade-in" style={{ animationDuration: '0.2s' }}>
                      <span className="inline-block w-1 h-1 rounded-full bg-danger-500" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <button type="button" className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <HiOutlineLockClosed className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-modern !pr-12 ${errors.password ? 'border-danger-500 bg-danger-50/50 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-danger-500 flex items-center gap-1 animate-fade-in" style={{ animationDuration: '0.2s' }}>
                      <span className="inline-block w-1 h-1 rounded-full bg-danger-500" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  id="login-submit-btn"
                  className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm
                    gradient-primary shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30
                    transition-all duration-200 btn-press
                    disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-400 font-medium">New to Smart Hospital?</span>
                </div>
              </div>

              {/* Register link */}
              <Link
                to="/register"
                id="login-register-link"
                className="w-full py-3 px-4 rounded-xl text-primary-600 font-semibold text-sm
                  border-2 border-primary-200/60 bg-primary-50/30
                  hover:bg-primary-50 hover:border-primary-300
                  transition-all duration-200 btn-press
                  flex items-center justify-center"
              >
                Create an Account
              </Link>
            </div>

            {/* Footer note */}
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-slate-400">
              <MdSecurity className="text-sm text-slate-300" />
              <span>Protected by enterprise-grade security</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
