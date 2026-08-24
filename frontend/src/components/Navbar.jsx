import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdLocalHospital, MdMenu, MdClose } from 'react-icons/md';

const publicLinks = [
  { label: 'Home', path: '/' },
  { label: 'Departments', path: '/departments' },
  { label: 'Doctors', path: '/doctors' },
  { label: 'About', path: '/about' },
];

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const dashboardPath = {
    ADMIN: '/admin/dashboard',
    DOCTOR: '/doctor/dashboard',
    RECEPTIONIST: '/receptionist/dashboard',
    PATIENT: '/patient/dashboard',
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm' : 'bg-white border-b border-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
              <MdLocalHospital className="text-white text-lg" />
            </div>
            <span className="text-base font-bold text-slate-900">SmartHospital</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#2563eb] bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                to={dashboardPath[user?.role] || '/'}
                className="btn btn-primary btn-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            {mobileOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${
                  location.pathname === link.path
                    ? 'text-[#2563eb] bg-blue-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {isAuthenticated ? (
                <Link to={dashboardPath[user?.role] || '/'} className="btn btn-primary w-full">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-secondary w-full">Sign In</Link>
                  <Link to="/register" className="btn btn-primary w-full">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
