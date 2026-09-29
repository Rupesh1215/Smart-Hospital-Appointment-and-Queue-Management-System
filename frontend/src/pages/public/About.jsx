import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  MdLocalHospital,
  MdSecurity,
  MdSpeed,
  MdSmartToy,
  MdCheckCircle,
  MdArrowForward,
} from 'react-icons/md';
import './About.css';

export default function About() {
  return (
    <div className="about-page-container">
      <Navbar />

      <main className="about-main">
        {/* Header */}
        <section className="about-header-section">
          <div className="about-header-content">
            <span className="home-section-tag">About SmartHospital</span>
            <h1 className="text-hero-headline">Reinventing Hospital Workflow & Patient Experience</h1>
            <p className="about-lead">
              SmartHospital is an end-to-end appointment and queue management system designed to eliminate waiting room friction, streamline doctor scheduling, and provide real-time updates.
            </p>
          </div>
        </section>

        {/* Pillars */}
        <section className="about-pillars-section">
          <div className="about-section-inner">
            <h2 className="text-section-title text-center mb-12">Core Architecture Principles</h2>
            <div className="about-pillars-grid">
              <div className="card">
                <div className="stat-icon-wrap bg-blue-50 text-blue-600 mb-4">
                  <MdSpeed />
                </div>
                <h3 className="text-card-title mb-2">Real-Time Queue Management</h3>
                <p className="text-subtext">
                  Powered by Spring Boot STOMP WebSockets, queue tokens update instantly across patient devices, doctor portals, and receptionist desks.
                </p>
              </div>

              <div className="card">
                <div className="stat-icon-wrap bg-teal-50 text-teal-600 mb-4">
                  <MdSecurity />
                </div>
                <h3 className="text-card-title mb-2">Role-Based Security</h3>
                <p className="text-subtext">
                  Strict JWT authorization enforces clear boundaries between Patient, Doctor, Receptionist, and Admin roles.
                </p>
              </div>

              <div className="card">
                <div className="stat-icon-wrap bg-indigo-50 text-indigo-600 mb-4">
                  <MdSmartToy />
                </div>
                <h3 className="text-card-title mb-2">AI Assistance</h3>
                <p className="text-subtext">
                  Integrated conversational AI helps patients find available specialists and understand hospital departments seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* System Capabilities */}
        <section className="about-tech-section">
          <div className="about-section-inner">
            <h2 className="text-section-title text-center mb-4">Technology Stack</h2>
            <p className="text-subtext text-center mb-12 max-w-xl mx-auto">
              Built using modern web technologies to ensure speed, stability, and responsive performance.
            </p>

            <div className="about-tech-grid">
              {[
                { name: 'React 19 & Vite 8', desc: 'Fast, responsive frontend client' },
                { name: 'Spring Boot 3', desc: 'Robust REST APIs & STOMP WebSockets' },
                { name: 'MongoDB Database', desc: 'Scalable data persistence' },
                { name: 'Tailwind CSS 4', desc: 'Custom healthcare design system' },
                { name: 'Recharts & STOMP.js', desc: 'Real-time metrics & queue sync' },
                { name: 'Google Gemini AI', desc: 'Conversational assistant integration' },
              ].map((item, idx) => (
                <div key={idx} className="card flex items-start gap-3">
                  <MdCheckCircle className="text-teal-600 text-xl flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-main text-sm">{item.name}</h4>
                    <p className="text-xs text-sub">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="about-cta-section">
          <div className="about-cta-card">
            <h2>Ready to experience effortless hospital scheduling?</h2>
            <p>Book an appointment or sign in to access your dashboard.</p>
            <div className="flex gap-4 justify-center flex-wrap mt-6">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
                <MdArrowForward />
              </Link>
              <Link to="/doctors" className="btn btn-secondary btn-lg">
                View Doctors
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
