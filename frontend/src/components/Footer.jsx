import { Link } from 'react-router-dom';
import { MdLocalHospital, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import './Footer.css';

export default function Footer() {
  const links = {
    'Quick Links': [
      { label: 'Home', path: '/' },
      { label: 'About Us', path: '/about' },
      { label: 'Departments', path: '/departments' },
      { label: 'Find a Doctor', path: '/doctors' },
    ],
    'For Patients': [
      { label: 'Book Appointment', path: '/login' },
      { label: 'My Appointments', path: '/login' },
      { label: 'Queue Status', path: '/login' },
      { label: 'AI Assistant', path: '/login' },
    ],
    'Support': [
      { label: 'FAQs', path: '/about' },
      { label: 'Contact Us', path: '/about' },
      { label: 'Privacy Policy', path: '/about' },
      { label: 'Terms of Service', path: '/about' },
    ],
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <MdLocalHospital />
              </div>
              <span className="footer-logo-text">SmartHospital</span>
            </Link>
            <p className="footer-desc">
              Revolutionizing hospital appointment management with AI-powered scheduling,
              real-time queue tracking, and seamless patient-doctor coordination.
            </p>
            <div className="footer-contact">
              {[
                { icon: MdLocationOn, text: '123 Healthcare Avenue, Medical District' },
                { icon: MdPhone, text: '+1 (555) 123-4567' },
                { icon: MdEmail, text: 'contact@smarthospital.com' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="footer-contact-item">
                  <Icon className="footer-contact-icon" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="footer-links-title">{title}</h3>
              <ul className="footer-links-list">
                {items.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} SmartHospital. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
