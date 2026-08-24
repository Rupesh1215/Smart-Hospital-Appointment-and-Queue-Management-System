import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { MdLocalHospital, MdSecurity, MdCheckCircle, MdSmartToy, MdCalendarMonth, MdPeople } from 'react-icons/md';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

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
    gender: 'MALE',
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
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
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputField = (id, name, type, label, placeholder, Icon, extraProps = {}) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="w-5 h-5 text-slate-400" />
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
              className={`input-modern !pr-12 ${errors[name] ? 'border-danger-500 bg-danger-50/50 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
              {...extraProps}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
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
            className={`input-modern ${errors[name] ? 'border-danger-500 bg-danger-50/50 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
            {...extraProps}
          />
        )}
      </div>
      {errors[name] && (
        <p className="mt-1.5 text-xs text-danger-500 flex items-center gap-1 animate-fade-in" style={{ animationDuration: '0.2s' }}>
          <span className="inline-block w-1 h-1 rounded-full bg-danger-500" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex pt-16 lg:pt-0 relative">
        {/* Left Panel — Branding */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] gradient-mesh relative overflow-hidden items-center justify-center p-12">
          <div className="aurora-blob aurora-blob-1 absolute top-[10%] right-[5%] opacity-20" />
          <div className="absolute inset-0 bg-dot-grid-dark opacity-30" />

          <div className="relative z-10 max-w-md">
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
              Join the future of healthcare
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-10">
              Create your account and start booking appointments with top doctors in minutes — 
              no more waiting in long queues.
            </p>

            <div className="space-y-4 mb-12">
              {highlights.map((item, i) => (
                <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <item.icon className="text-primary-400 text-base" />
                  </div>
                  <span className="text-slate-300 text-sm">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="glass-dark rounded-2xl p-5 border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {['from-primary-400 to-primary-600', 'from-violet-400 to-violet-600', 'from-amber-400 to-amber-600'].map((color, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${color} border-2 border-slate-900 flex items-center justify-center text-white text-[0.5rem] font-bold`}>
                      {['A', 'S', 'P'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-slate-400 text-xs">
                  <span className="text-white font-semibold">500+</span> patients joined this month
                </p>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Join a growing community of patients who trust SmartHospital for their healthcare needs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-16 lg:py-12 relative overflow-hidden">
          <div className="w-full max-w-md relative z-10 animate-fade-in">
            <div className="text-center mb-8 lg:hidden">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mb-4 shadow-lg shadow-primary-500/20">
                <MdLocalHospital className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="mb-8">
              <h1 className="heading-lg text-2xl lg:text-3xl text-slate-900 mb-2">Create your account</h1>
              <p className="text-slate-500 text-sm">Fill in your details to get started for free</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-7 animate-slide-up delay-100">
              <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
                {inputField('register-name', 'name', 'text', 'Full Name', 'John Doe', HiOutlineUser)}
                {inputField('register-email', 'email', 'email', 'Email Address', 'you@example.com', HiOutlineMail)}
                {inputField('register-phone', 'phone', 'tel', 'Phone (Optional)', '1234567890', HiOutlinePhone)}
                {inputField('register-password', 'password', 'password', 'Password', 'Minimum 6 characters', HiOutlineLockClosed)}

                {/* Gender */}
                <div>
                  <label htmlFor="register-gender" className="block text-sm font-semibold text-slate-700 mb-2">
                    Gender
                  </label>
                  <div className="flex gap-2">
                    {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border cursor-pointer ${
                          formData.gender === g
                            ? 'bg-primary-50 border-primary-300 text-primary-700 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
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
                  className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm
                    gradient-primary shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30
                    transition-all duration-200 btn-press
                    disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-400 font-medium">Already have an account?</span>
                </div>
              </div>

              <Link
                to="/login"
                id="register-login-link"
                className="w-full py-3 px-4 rounded-xl text-primary-600 font-semibold text-sm
                  border-2 border-primary-200/60 bg-primary-50/30
                  hover:bg-primary-50 hover:border-primary-300
                  transition-all duration-200 btn-press
                  flex items-center justify-center"
              >
                Sign In Instead
              </Link>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-slate-400">
              <MdSecurity className="text-sm text-slate-300" />
              <span>Your data is encrypted and secure</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
