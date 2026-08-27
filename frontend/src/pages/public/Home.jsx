import { Link } from 'react-router-dom';
import {
  MdCalendarMonth,
  MdSearch,
  MdSmartToy,
  MdPeople,
  MdSecurity,
  MdSpeed,
  MdNotifications,
  MdArrowForward,
  MdStar,
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
import './Home.css';

const features = [
  {
    icon: MdCalendarMonth,
    title: 'Smart Scheduling',
    description: 'AI-powered appointment booking that finds the perfect slot based on doctor availability and your preferences.',
    iconClass: 'icon-primary-emerald',
  },
  {
    icon: MdPeople,
    title: 'Live Queue Tracking',
    description: 'Real-time queue position updates with accurate waiting time estimates. No more guessing.',
    iconClass: 'icon-blue-indigo',
  },
  {
    icon: MdSmartToy,
    title: 'AI Assistant',
    description: 'Chat with our intelligent assistant to find doctors, book appointments, and get instant answers.',
    iconClass: 'icon-violet-purple',
  },
  {
    icon: MdSpeed,
    title: 'Zero Wait Time',
    description: 'Dynamic queue management minimizes patient waiting through intelligent scheduling algorithms.',
    iconClass: 'icon-orange-red',
  },
  {
    icon: MdSecurity,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with encrypted data, role-based access, and complete audit trails.',
    iconClass: 'icon-cyan-blue',
  },
  {
    icon: MdNotifications,
    title: 'Smart Reminders',
    description: 'Automated appointment reminders and queue notifications keep you informed at every step.',
    iconClass: 'icon-amber-orange',
  },
];

const steps = [
  { number: '01', title: 'Search Doctor', description: 'Find specialists by department, name, or availability.' },
  { number: '02', title: 'Choose a Slot', description: 'Pick from AI-recommended available time slots.' },
  { number: '03', title: 'Confirm Booking', description: 'Review details and confirm your appointment instantly.' },
  { number: '04', title: 'Track Queue', description: 'Monitor your real-time position and estimated wait time.' },
  { number: '05', title: 'Meet Doctor', description: 'Get notified when it\'s your turn. No more endless waiting.' },
];

const departments = [
  { name: 'Cardiology', icon: MdFavorite, colorClass: 'dept-rose', doctors: 3 },
  { name: 'Neurology', icon: MdPsychology, colorClass: 'dept-violet', doctors: 2 },
  { name: 'Orthopedics', icon: MdHealthAndSafety, colorClass: 'dept-blue', doctors: 2 },
  { name: 'Dermatology', icon: MdScience, colorClass: 'dept-emerald', doctors: 1 },
  { name: 'General Medicine', icon: MdMedicalServices, colorClass: 'dept-primary', doctors: 4 },
  { name: 'Pediatrics', icon: MdChildCare, colorClass: 'dept-amber', doctors: 2 },
  { name: 'ENT', icon: MdHearing, colorClass: 'dept-indigo', doctors: 1 },
  { name: 'Ophthalmology', icon: MdVisibility, colorClass: 'dept-cyan', doctors: 1 },
];

const stats = [
  { value: '10,000+', label: 'Patients Served', icon: MdPeople },
  { value: '50+', label: 'Expert Doctors', icon: MdLocalHospital },
  { value: '98%', label: 'Satisfaction Rate', icon: MdStar },
  { value: '<15 min', label: 'Avg Wait Time', icon: MdSpeed },
];

const faqs = [
  {
    q: 'How do I book an appointment?',
    a: 'Register or log in, search for a doctor or department, select an available slot, and confirm your booking. You can also use our AI assistant for guided booking.',
  },
  {
    q: 'Can I cancel or reschedule my appointment?',
    a: 'Yes. You can cancel or reschedule from your dashboard anytime before your appointment. Cancelled slots become available for other patients.',
  },
  {
    q: 'How does the queue tracking work?',
    a: 'After checking in, you get a real-time queue position with estimated waiting time. The system updates dynamically as consultations progress.',
  },
  {
    q: 'Is the AI chatbot available 24/7?',
    a: 'Yes, the AI assistant is available around the clock to help you find doctors, check availability, and manage appointments.',
  },
  {
    q: 'How are emergency cases handled?',
    a: 'Emergency and urgent cases are prioritized by authorized hospital staff. The system supports priority-based queue management.',
  },
];

export default function Home() {
  return (
    <div className="home-container">
      <Navbar />

      {/* ==================== HERO ==================== */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <div className="home-aurora blob-1" />
          <div className="home-aurora blob-2" />
          <div className="home-dot-grid" />
        </div>

        <div className="home-hero-content">
          <div className="home-hero-grid">
            <div className="home-hero-left">
              <div className="home-hero-badge">
                <div className="home-hero-badge-dot-container">
                  <div className="home-hero-badge-dot" />
                  <div className="home-hero-badge-dot-pulse" />
                </div>
                <span>AI-Powered Healthcare Platform</span>
              </div>

              <h1 className="home-hero-title">
                Smart Healthcare. <span className="home-hero-title-highlight">Smarter Appointments.</span>
              </h1>

              <p className="home-hero-desc">
                Book appointments, track queues in real time, and connect with doctors through
                an intelligent hospital management platform powered by AI.
              </p>

              <div className="home-hero-actions">
                <Link to="/register" className="home-btn-primary">
                  Book Appointment
                  <MdArrowForward className="icon-arrow" />
                </Link>
                <Link to="/doctors" className="home-btn-secondary">
                  <MdSearch className="icon-search" />
                  Find a Doctor
                </Link>
              </div>

              <div className="home-trust-indicators">
                <div className="home-trust-avatars">
                  <div className="home-avatar avatar-1">Dr</div>
                  <div className="home-avatar avatar-2">Pt</div>
                  <div className="home-avatar avatar-3">Rx</div>
                  <div className="home-avatar avatar-4">AI</div>
                </div>
                <div className="home-trust-rating">
                  <div className="home-stars">
                    {[...Array(5)].map((_, i) => (
                      <MdStar key={i} className="icon-star" />
                    ))}
                    <span className="home-rating-score">4.9/5</span>
                  </div>
                  <p className="home-rating-desc">Trusted by 10,000+ patients</p>
                </div>
              </div>
            </div>

            <div className="home-hero-right">
              <div className="home-dashboard-preview">
                <div className="home-floating-card top-card">
                  <div className="home-floating-icon emerald">
                    <MdCheckCircle />
                  </div>
                  <div>
                    <p className="home-floating-label">Appointment</p>
                    <p className="home-floating-value">Confirmed ✓</p>
                  </div>
                </div>

                <div className="home-floating-card bottom-card">
                  <div className="home-floating-icon blue">
                    <MdPeople />
                  </div>
                  <div>
                    <p className="home-floating-label">Queue Position</p>
                    <p className="home-floating-value">#3 — ~12 min</p>
                  </div>
                </div>

                <div className="home-main-card">
                  <div className="home-card-header">
                    <h3>Today's Schedule</h3>
                    <span className="home-live-badge">● Live</span>
                  </div>

                  <div className="home-schedule-list">
                    {[
                      { time: '09:00 AM', name: 'Dr. Ravi Kumar', dept: 'Cardiology', status: 'Completed', colorClass: 'status-emerald' },
                      { time: '09:20 AM', name: 'Dr. Priya Sharma', dept: 'Neurology', status: 'In Progress', colorClass: 'status-blue', active: true },
                      { time: '10:00 AM', name: 'Dr. Amit Patel', dept: 'Orthopedics', status: 'Upcoming', colorClass: 'status-amber' },
                      { time: '10:40 AM', name: 'Dr. Ananya Das', dept: 'Pediatrics', status: 'Upcoming', colorClass: 'status-slate' },
                    ].map((item, i) => (
                      <div key={i} className={`home-schedule-item ${item.active ? 'active' : ''}`}>
                        <div className={`home-schedule-dot ${item.colorClass}`} />
                        <div className="home-schedule-info">
                          <p className="home-schedule-name">{item.name}</p>
                          <p className="home-schedule-dept">{item.dept}</p>
                        </div>
                        <div className="home-schedule-time">
                          <p className="time">{item.time}</p>
                          <p className={`status ${item.colorClass}`}>{item.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="home-scroll-indicator">
          <div className="home-mouse">
            <div className="home-mouse-wheel" />
          </div>
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section className="home-stats-section">
        <div className="home-stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className={`home-stat-card delay-${i}`}>
              <stat.icon className="home-stat-icon" />
              <p className="home-stat-value">{stat.value}</p>
              <p className="home-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="home-features-section">
        <div className="home-section-header">
          <span className="home-section-badge">
            <MdStar /> Features
          </span>
          <h2>
            Everything You Need for <span>Smart Healthcare</span>
          </h2>
          <p>
            A comprehensive platform designed to streamline every aspect of hospital
            appointment management — from booking to consultation.
          </p>
        </div>

        <div className="home-features-grid">
          {features.map((feature, i) => (
            <div key={i} className={`home-feature-card delay-${i}`}>
              <div className={`home-feature-icon-wrapper ${feature.iconClass}`}>
                <feature.icon className="home-feature-icon" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="home-how-it-works-section">
        <div className="home-section-header">
          <span className="home-section-badge accent">How It Works</span>
          <h2>
            Your Appointment in <span>5 Simple Steps</span>
          </h2>
        </div>

        <div className="home-steps-container">
          <div className="home-steps-grid">
            {steps.map((step, i) => (
              <div key={i} className={`home-step-item delay-${i}`}>
                {i < 4 && <div className="home-step-connector" />}
                <div className="home-step-number-container">
                  <div className="home-step-number">{step.number}</div>
                </div>
                <div className="home-step-info">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== DEPARTMENTS ==================== */}
      <section className="home-departments-section">
        <div className="home-section-header">
          <span className="home-section-badge">Departments</span>
          <h2>
            Specialized <span>Medical Departments</span>
          </h2>
          <p>
            Access expert care across multiple specialties. Each department is staffed with experienced professionals.
          </p>
        </div>

        <div className="home-departments-grid">
          {departments.map((dept, i) => (
            <Link key={i} to="/departments" className={`home-dept-card delay-${i}`}>
              <div className={`home-dept-icon-wrapper ${dept.colorClass}`}>
                <dept.icon className="home-dept-icon" />
              </div>
              <h3>{dept.name}</h3>
              <p>{dept.doctors} Doctors</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== AI ASSISTANT ==================== */}
      <section className="home-ai-section">
        <div className="home-ai-container">
          <div className="home-ai-card">
            <div className="home-aurora blob-ai" />

            <div className="home-ai-grid">
              <div className="home-ai-content">
                <div className="home-ai-badge">
                  <MdSmartToy /> AI-Powered Assistant
                </div>
                <h2>
                  Meet Your Personal <span>Healthcare Assistant</span>
                </h2>
                <p>
                  Our AI chatbot, powered by Google Gemini, helps you find doctors,
                  discover available slots, book appointments, and track your queue —
                  all through natural conversation.
                </p>
                <Link to="/register" className="home-btn-ai">
                  <MdSmartToy /> Chat with AI
                  <MdArrowForward className="icon-arrow" />
                </Link>
              </div>

              <div className="home-ai-preview">
                <div className="home-ai-chat-box">
                  <div className="home-ai-chat-header">
                    <div className="home-ai-avatar">
                      <MdSmartToy />
                    </div>
                    <div>
                      <p className="home-ai-name">AI Assistant</p>
                      <p className="home-ai-status">
                        <span className="home-ai-status-dot" /> Online
                      </p>
                    </div>
                  </div>

                  <div className="home-ai-chat-messages">
                    <div className="home-chat-msg user">
                      <p>Hi! I need to see a cardiologist tomorrow.</p>
                    </div>
                    <div className="home-chat-msg bot">
                      <p>
                        I found 3 cardiologists available tomorrow. The earliest slot is with
                        <strong> Dr. Ravi Kumar at 9:20 AM</strong>. Shall I book it?
                      </p>
                    </div>
                    <div className="home-chat-msg user">
                      <p>Yes, please!</p>
                    </div>
                    <div className="home-chat-msg bot">
                      <p>
                        ✅ Booked! APT-20260812-0023 with Dr. Ravi Kumar, tomorrow 9:20 AM, Cardiology.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="home-faq-section">
        <div className="home-faq-container">
          <div className="home-section-header">
            <span className="home-section-badge warning">FAQ</span>
            <h2>
              Frequently Asked <span>Questions</span>
            </h2>
          </div>

          <div className="home-faq-list">
            {faqs.map((faq, i) => (
              <details key={i} className="home-faq-item">
                <summary className="home-faq-summary">
                  <h3>{faq.q}</h3>
                  <div className="home-faq-icon">
                    <MdArrowForward />
                  </div>
                </summary>
                <div className="home-faq-answer">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="home-cta-section">
        <div className="home-cta-container">
          <h2>
            Ready to Experience <span>Smart Healthcare?</span>
          </h2>
          <p>
            Join thousands of patients who have already transformed their healthcare
            experience. Register today and book your first appointment in minutes.
          </p>
          <div className="home-cta-actions">
            <Link to="/register" className="home-btn-primary cta-btn">
              Get Started Free
              <MdArrowForward className="icon-arrow" />
            </Link>
            <Link to="/doctors" className="home-btn-white cta-btn">
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
