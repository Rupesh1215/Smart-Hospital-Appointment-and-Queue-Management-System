import { Link } from 'react-router-dom';
import {
  MdCalendarMonth,
  MdSmartToy,
  MdPeople,
  MdSecurity,
  MdSpeed,
  MdNotifications,
  MdArrowForward,
  MdCheckCircle,
  MdLocalHospital,
  MdFavorite,
  MdScience,
  MdPsychology,
  MdVisibility,
  MdHealthAndSafety,
  MdChildCare,
  MdHearing,
  MdMedicalServices,
} from 'react-icons/md';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import WalkthroughHero from '../../components/WalkthroughHero';
import './Home.css';

const features = [
  {
    icon: MdCalendarMonth,
    title: 'Smart Slot Booking',
    description: 'Instantly view available doctor time slots and schedule appointments with intelligent slot conflict detection.',
    iconClass: 'icon-blue',
  },
  {
    icon: MdPeople,
    title: 'Live Queue Status',
    description: 'Track your exact position in the live queue in real-time with estimated consultation wait times.',
    iconClass: 'icon-teal',
  },
  {
    icon: MdSmartToy,
    title: 'AI Health Assistant',
    description: 'Interactive AI assistant to find doctors, explore departments, and answer booking queries instantly.',
    iconClass: 'icon-violet',
  },
  {
    icon: MdSpeed,
    title: 'Instant Reception Check-In',
    description: 'Smooth digital check-in workflow for receptionists and patients to eliminate long waiting lines.',
    iconClass: 'icon-amber',
  },
  {
    icon: MdSecurity,
    title: 'Role-Based Access Control',
    description: 'Tailored interfaces and strict security for Patients, Doctors, Receptionists, and Administrators.',
    iconClass: 'icon-indigo',
  },
  {
    icon: MdNotifications,
    title: 'Real-Time Notifications',
    description: 'Receive instant status updates when your turn is called or when appointment status changes.',
    iconClass: 'icon-emerald',
  },
];

const steps = [
  { number: '01', title: 'Find Doctor', description: 'Browse by specialty, department, or doctor availability.' },
  { number: '02', title: 'Select Time Slot', description: 'Choose your preferred date and time from active schedules.' },
  { number: '03', title: 'Confirm Booking', description: 'Receive your unique appointment number and digital token.' },
  { number: '04', title: 'Check In & Track', description: 'Check in upon arrival and monitor your live queue position.' },
  { number: '05', title: 'Consultation', description: 'Get called directly by your doctor when your turn arrives.' },
];

const departments = [
  { name: 'Cardiology', icon: MdFavorite, colorClass: 'dept-rose' },
  { name: 'Neurology', icon: MdPsychology, colorClass: 'dept-violet' },
  { name: 'Orthopedics', icon: MdHealthAndSafety, colorClass: 'dept-blue' },
  { name: 'Dermatology', icon: MdScience, colorClass: 'dept-emerald' },
  { name: 'General Medicine', icon: MdMedicalServices, colorClass: 'dept-teal' },
  { name: 'Pediatrics', icon: MdChildCare, colorClass: 'dept-amber' },
  { name: 'ENT', icon: MdHearing, colorClass: 'dept-indigo' },
  { name: 'Ophthalmology', icon: MdVisibility, colorClass: 'dept-cyan' },
];

const stats = [
  { value: '8+', label: 'Specialized Departments', icon: MdLocalHospital },
  { value: 'Real-Time', label: 'Live Queue Tracking', icon: MdSpeed },
  { value: '24/7', label: 'AI Assistant Support', icon: MdSmartToy },
  { value: '100%', label: 'Digital Check-In', icon: MdCheckCircle },
];

const faqs = [
  {
    q: 'How do I book an appointment?',
    a: 'Simply register or log in as a patient, select your desired doctor or department, choose an available time slot, and confirm your booking.',
  },
  {
    q: 'How does live queue tracking work?',
    a: 'Once checked in by the receptionist or self check-in, your token appears on the live queue monitor. WebSocket technology updates your position automatically as consultations progress.',
  },
  {
    q: 'Can doctors manage their consultations online?',
    a: 'Yes, doctors have a dedicated dashboard to call the next patient, review patient reasons, submit clinical diagnoses, write prescriptions, and complete consultations.',
  },
  {
    q: 'What role does the AI Assistant play?',
    a: 'Our AI assistant helps you navigate doctors, check schedule availability, and guide you through booking without needing complex navigation.',
  },
];

export default function Home() {
  return (
    <div className="home-container">
      <Navbar />

      {/* HERO — scroll-driven hospital walkthrough */}
      <WalkthroughHero />

      {/* STATS SECTION */}
      <section id="after-walkthrough" className="home-stats-section">
        <div className="home-stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="home-stat-card">
              <div className="home-stat-icon-wrap">
                <stat.icon />
              </div>
              <div>
                <p className="home-stat-val">{stat.value}</p>
                <p className="home-stat-lbl">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="home-features-section">
        <div className="home-section-header">
          <span className="home-section-tag">Key Capabilities</span>
          <h2>Designed for Exceptional Care</h2>
          <p>
            An end-to-end digital hospital ecosystem connecting patients, doctors, receptionists, and administrators.
          </p>
        </div>

        <div className="home-features-grid">
          {features.map((feature, i) => (
            <div key={i} className="home-feature-card">
              <div className={`home-feature-icon-wrap ${feature.iconClass}`}>
                <feature.icon />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-workflow-section">
        <div className="home-section-header">
          <span className="home-section-tag">Simple Process</span>
          <h2>How SmartHospital Works</h2>
        </div>

        <div className="home-steps-grid">
          {steps.map((step, i) => (
            <div key={i} className="home-step-card">
              <div className="step-num">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEPARTMENTS */}
      <section className="home-departments-section">
        <div className="home-section-header">
          <span className="home-section-tag">Specialties</span>
          <h2>Clinical Departments</h2>
          <p>Comprehensive care across multiple specialized medical fields.</p>
        </div>

        <div className="home-dept-grid">
          {departments.map((dept, i) => (
            <Link key={i} to="/departments" className="home-dept-card">
              <div className={`home-dept-icon ${dept.colorClass}`}>
                <dept.icon />
              </div>
              <h3>{dept.name}</h3>
              <span className="dept-link">Explore Department &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI ASSISTANT SECTION */}
      <section className="home-ai-section">
        <div className="home-ai-container">
          <div className="home-ai-grid">
            <div className="home-ai-info">
              <span className="ai-tag">
                <MdSmartToy /> AI Assistant
              </span>
              <h2>Instant Healthcare Support, Powered by AI</h2>
              <p>
                Need assistance finding the right doctor or checking appointment slots? Our built-in assistant guides you effortlessly.
              </p>
              <Link to="/register" className="btn btn-indigo btn-lg">
                <MdSmartToy /> Get Started with AI
              </Link>
            </div>

            <div className="home-ai-chat-preview">
              <div className="chat-bubble bot">
                👋 Hello! How can I assist with your appointment today?
              </div>
              <div className="chat-bubble user">
                I'd like to check Cardiology doctor availability tomorrow.
              </div>
              <div className="chat-bubble bot">
                We have Dr. Ravi Kumar available tomorrow at 10:00 AM and 02:30 PM. Would you like me to reserve a slot?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="home-faq-section">
        <div className="home-faq-container">
          <div className="home-section-header">
            <span className="home-section-tag">FAQs</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="home-faq-list">
            {faqs.map((faq, i) => (
              <details key={i} className="home-faq-item">
                <summary className="home-faq-summary">{faq.q}</summary>
                <p className="home-faq-answer">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="home-cta-section">
        <div className="home-cta-content">
          <h2>Transform Your Hospital Experience Today</h2>
          <p>Join patients and doctors benefiting from real-time queue management and smart scheduling.</p>
          <div className="home-cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Account
              <MdArrowForward />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
