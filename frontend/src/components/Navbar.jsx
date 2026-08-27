import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdLocalHospital, MdMenu, MdClose } from 'react-icons/md';
import './Navbar.css';

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
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <MdLocalHospital />
            </div>
            <span className="navbar-logo-text">SmartHospital</span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-desktop-nav">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="navbar-auth-desktop">
            {isAuthenticated ? (
              <Link
                to={dashboardPath[user?.role] || '/'}
                className="home-btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="home-btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderColor: '#cbd5e1', color: '#334155' }}>
                  Sign In
                </Link>
                <Link to="/register" className="home-btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="navbar-mobile-toggle"
          >
            {mobileOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-content">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="navbar-mobile-auth">
              {isAuthenticated ? (
                <Link to={dashboardPath[user?.role] || '/'} className="home-btn-primary">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="home-btn-secondary" style={{ borderColor: '#cbd5e1', color: '#334155' }}>
                    Sign In
                  </Link>
                  <Link to="/register" className="home-btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
