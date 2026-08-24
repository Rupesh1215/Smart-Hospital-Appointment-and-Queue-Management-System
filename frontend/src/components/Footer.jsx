import { Link } from 'react-router-dom';
import { MdLocalHospital, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

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
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#2563eb] flex items-center justify-center">
                <MdLocalHospital className="text-white text-lg" />
              </div>
              <span className="text-lg font-bold">SmartHospital</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Revolutionizing hospital appointment management with AI-powered scheduling,
              real-time queue tracking, and seamless patient-doctor coordination.
            </p>
            <div className="space-y-2">
              {[
                { icon: MdLocationOn, text: '123 Healthcare Avenue, Medical District' },
                { icon: MdPhone, text: '+1 (555) 123-4567' },
                { icon: MdEmail, text: 'contact@smarthospital.com' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Icon className="text-slate-500 text-sm flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">{title}</h3>
              <ul className="space-y-2.5">
                {items.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-sm text-slate-500 text-center">
            &copy; {new Date().getFullYear()} SmartHospital. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
