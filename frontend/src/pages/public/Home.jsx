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

const features = [
  {
    icon: MdCalendarMonth,
    title: 'Smart Scheduling',
    description: 'AI-powered appointment booking that finds the perfect slot based on doctor availability and your preferences.',
    gradient: 'from-primary-500 to-emerald-500',
    iconBg: 'bg-primary-500/10',
    size: 'large',
  },
  {
    icon: MdPeople,
    title: 'Live Queue Tracking',
    description: 'Real-time queue position updates with accurate waiting time estimates. No more guessing.',
    gradient: 'from-blue-500 to-indigo-500',
    iconBg: 'bg-blue-500/10',
    size: 'small',
  },
  {
    icon: MdSmartToy,
    title: 'AI Assistant',
    description: 'Chat with our intelligent assistant to find doctors, book appointments, and get instant answers.',
    gradient: 'from-violet-500 to-purple-500',
    iconBg: 'bg-violet-500/10',
    size: 'small',
  },
  {
    icon: MdSpeed,
    title: 'Zero Wait Time',
    description: 'Dynamic queue management minimizes patient waiting through intelligent scheduling algorithms.',
    gradient: 'from-orange-500 to-red-500',
    iconBg: 'bg-orange-500/10',
    size: 'small',
  },
  {
    icon: MdSecurity,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with encrypted data, role-based access, and complete audit trails.',
    gradient: 'from-cyan-500 to-blue-500',
    iconBg: 'bg-cyan-500/10',
    size: 'small',
  },
  {
    icon: MdNotifications,
    title: 'Smart Reminders',
    description: 'Automated appointment reminders and queue notifications keep you informed at every step.',
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500/10',
    size: 'large',
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
  { name: 'Cardiology', icon: MdFavorite, color: 'text-rose-500', bg: 'bg-rose-50', doctors: 3 },
  { name: 'Neurology', icon: MdPsychology, color: 'text-violet-500', bg: 'bg-violet-50', doctors: 2 },
  { name: 'Orthopedics', icon: MdHealthAndSafety, color: 'text-blue-500', bg: 'bg-blue-50', doctors: 2 },
  { name: 'Dermatology', icon: MdScience, color: 'text-emerald-500', bg: 'bg-emerald-50', doctors: 1 },
  { name: 'General Medicine', icon: MdMedicalServices, color: 'text-primary-500', bg: 'bg-primary-50', doctors: 4 },
  { name: 'Pediatrics', icon: MdChildCare, color: 'text-amber-500', bg: 'bg-amber-50', doctors: 2 },
  { name: 'ENT', icon: MdHearing, color: 'text-indigo-500', bg: 'bg-indigo-50', doctors: 1 },
  { name: 'Ophthalmology', icon: MdVisibility, color: 'text-cyan-500', bg: 'bg-cyan-50', doctors: 1 },
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
    <div className="min-h-screen">
      <Navbar />

      {/* ==================== HERO ==================== */}
      <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero-premium pt-20">
        {/* Aurora background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="aurora-blob aurora-blob-1 absolute top-10 left-[5%]" />
          <div className="aurora-blob aurora-blob-2 absolute bottom-10 right-[10%]" />

          {/* Dot grid pattern */}
          <div className="absolute inset-0 bg-dot-grid-dark opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — Copy */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-md mb-8">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-primary-400" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary-400 animate-ripple" />
                </div>
                <span className="text-primary-300 text-sm font-medium">AI-Powered Healthcare Platform</span>
              </div>

              <h1 className="heading-xl text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] text-white mb-6">
                Smart Healthcare.{' '}
                <span className="gradient-text-vivid">Smarter Appointments.</span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-400 leading-relaxed mb-10 max-w-xl">
                Book appointments, track queues in real time, and connect with doctors through
                an intelligent hospital management platform powered by AI.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-white gradient-primary hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-300 btn-press"
                >
                  Book Appointment
                  <MdArrowForward className="text-lg group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/doctors"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-white border border-white/15 hover:bg-white/[0.08] hover:border-white/25 transition-all duration-300 backdrop-blur-sm btn-press"
                >
                  <MdSearch className="text-lg" />
                  Find a Doctor
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-14 pt-8 border-t border-white/[0.06]">
                <div className="flex -space-x-3">
                  {['from-primary-400 to-primary-600', 'from-accent-400 to-accent-600', 'from-violet-400 to-violet-600', 'from-amber-400 to-amber-600'].map((color, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} border-2 border-slate-900 flex items-center justify-center text-white text-[0.6rem] font-bold shadow-lg`}
                    >
                      {['Dr', 'Pt', 'Rx', 'AI'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <MdStar key={i} className="text-yellow-400 text-sm" />
                    ))}
                    <span className="text-white/50 text-xs ml-1.5 font-medium">4.9/5</span>
                  </div>
                  <p className="text-slate-500 text-sm">Trusted by 10,000+ patients</p>
                </div>
              </div>
            </div>

            {/* Right — Dashboard Preview Card */}
            <div className="hidden lg:block animate-slide-right">
              <div className="relative">
                {/* Floating elements */}
                <div className="absolute -top-6 -left-6 glass-dark rounded-2xl px-4 py-3 shadow-xl animate-float z-10 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                      <MdCheckCircle className="text-emerald-400 text-xl" />
                    </div>
                    <div>
                      <p className="text-[0.65rem] text-slate-500 font-medium">Appointment</p>
                      <p className="text-sm font-semibold text-white">Confirmed ✓</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 glass-dark rounded-2xl px-4 py-3 shadow-xl animate-float delay-500 z-10 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                      <MdPeople className="text-blue-400 text-xl" />
                    </div>
                    <div>
                      <p className="text-[0.65rem] text-slate-500 font-medium">Queue Position</p>
                      <p className="text-sm font-semibold text-white">#3 — ~12 min</p>
                    </div>
                  </div>
                </div>

                {/* Main card */}
                <div className="glass-dark rounded-3xl p-6 shadow-2xl border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-semibold font-display">Today&apos;s Schedule</h3>
                    <span className="text-[0.65rem] text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full font-semibold border border-primary-500/20">● Live</span>
                  </div>

                  {[
                    { time: '09:00 AM', name: 'Dr. Ravi Kumar', dept: 'Cardiology', status: 'Completed', color: 'bg-emerald-500' },
                    { time: '09:20 AM', name: 'Dr. Priya Sharma', dept: 'Neurology', status: 'In Progress', color: 'bg-blue-500' },
                    { time: '10:00 AM', name: 'Dr. Amit Patel', dept: 'Orthopedics', status: 'Upcoming', color: 'bg-amber-500' },
                    { time: '10:40 AM', name: 'Dr. Ananya Das', dept: 'Pediatrics', status: 'Upcoming', color: 'bg-slate-600' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 p-3.5 rounded-xl mb-2 transition-all duration-200 hover:bg-white/[0.04] ${
                        i === 1 ? 'bg-white/[0.04] border border-white/[0.06]' : ''
                      }`}
                    >
                      <div className={`w-1 h-10 rounded-full ${item.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <p className="text-slate-600 text-xs">{item.dept}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 text-xs">{item.time}</p>
                        <p className={`text-[0.65rem] font-semibold ${
                          item.status === 'Completed' ? 'text-emerald-400' :
                          item.status === 'In Progress' ? 'text-blue-400' :
                          'text-slate-600'
                        }`}>
                          {item.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-1.5">
            <div className="w-1 h-2.5 bg-slate-500 rounded-full animate-pulse-soft" />
          </div>
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 shadow-lg text-center card-hover animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <stat.icon className="text-xl text-primary-500 mx-auto mb-2 opacity-60" />
              <p className="text-2xl lg:text-3xl font-bold gradient-text mb-1 font-display">{stat.value}</p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== FEATURES (Bento Grid) ==================== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-semibold mb-4">
              <MdStar className="text-primary-500" />
              Features
            </span>
            <h2 className="heading-lg text-3xl lg:text-4xl text-slate-900 mb-4">
              Everything You Need for
              <span className="gradient-text"> Smart Healthcare</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              A comprehensive platform designed to streamline every aspect of hospital
              appointment management — from booking to consultation.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group bg-slate-50/80 rounded-2xl p-7 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-slate-100 animate-fade-in`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 font-display">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-50 border border-accent-100 text-accent-600 text-sm font-semibold mb-4">
              How It Works
            </span>
            <h2 className="heading-lg text-3xl lg:text-4xl text-slate-900 mb-4">
              Your Appointment in
              <span className="gradient-text"> 5 Simple Steps</span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-4">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="relative flex lg:flex-col items-start lg:items-center gap-5 lg:gap-4 group animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Connector line */}
                  {i < 4 && (
                    <div className="hidden lg:block absolute top-6 left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] h-[2px] bg-slate-200" />
                  )}

                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-base shadow-md group-hover:scale-105 transition-transform duration-300 font-display">
                      {step.number}
                    </div>
                  </div>

                  <div className="lg:text-center flex-1">
                    <h3 className="text-base font-semibold text-slate-900 mb-1 font-display">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DEPARTMENTS ==================== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-semibold mb-4">
              Departments
            </span>
            <h2 className="heading-lg text-3xl lg:text-4xl text-slate-900 mb-4">
              Specialized
              <span className="gradient-text"> Medical Departments</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Access expert care across multiple specialties. Each department is staffed with experienced professionals.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {departments.map((dept, i) => (
              <Link
                key={i}
                to="/departments"
                className="group bg-white rounded-2xl p-6 text-center hover:shadow-md transition-all duration-200 border border-slate-100 hover:border-primary-100 animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl ${dept.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200`}>
                  <dept.icon className={`text-2xl ${dept.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1 font-display">{dept.name}</h3>
                <p className="text-slate-400 text-xs">{dept.doctors} Doctors</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== AI ASSISTANT CTA ==================== */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl gradient-mesh p-10 lg:p-14">
            <div className="aurora-blob aurora-blob-1 absolute top-0 right-[20%] opacity-20" />

            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 backdrop-blur-md mb-6">
                  <MdSmartToy className="text-violet-400" />
                  <span className="text-violet-300 text-sm font-medium">AI-Powered Assistant</span>
                </div>
                <h2 className="heading-lg text-3xl lg:text-4xl text-white mb-4">
                  Meet Your Personal
                  <span className="block gradient-text-vivid">Healthcare Assistant</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
                  Our AI chatbot, powered by Google Gemini, helps you find doctors,
                  discover available slots, book appointments, and track your queue —
                  all through natural conversation.
                </p>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-accent-600 hover:shadow-xl hover:shadow-violet-600/25 transition-all duration-300 btn-press"
                >
                  <MdSmartToy />
                  Chat with AI
                  <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Chat preview */}
              <div className="hidden lg:block">
                <div className="glass-dark rounded-2xl p-5 max-w-sm ml-auto border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-accent-500 flex items-center justify-center">
                      <MdSmartToy className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">AI Assistant</p>
                      <p className="text-emerald-400 text-[0.6rem] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Online
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white/[0.04] rounded-xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                      <p className="text-slate-300 text-sm">Hi! I need to see a cardiologist tomorrow.</p>
                    </div>
                    <div className="bg-violet-500/15 rounded-xl rounded-tr-sm px-4 py-2.5 ml-auto max-w-[85%] border border-violet-500/10">
                      <p className="text-violet-100 text-sm">
                        I found 3 cardiologists available tomorrow. The earliest slot is with
                        <span className="font-semibold"> Dr. Ravi Kumar at 9:20 AM</span>.
                        Shall I book it?
                      </p>
                    </div>
                    <div className="bg-white/[0.04] rounded-xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                      <p className="text-slate-300 text-sm">Yes, please!</p>
                    </div>
                    <div className="bg-violet-500/15 rounded-xl rounded-tr-sm px-4 py-2.5 ml-auto max-w-[85%] border border-violet-500/10">
                      <p className="text-violet-100 text-sm">
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
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="heading-lg text-3xl lg:text-4xl text-slate-900 mb-4">
              Frequently Asked
              <span className="gradient-text"> Questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-slate-50/80 rounded-2xl border border-slate-100 overflow-hidden hover:border-primary-200/50 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none hover:bg-slate-100/50 transition-colors">
                  <h3 className="font-semibold text-slate-900 text-[0.95rem] font-display">{faq.q}</h3>
                  <div className="w-7 h-7 rounded-lg bg-slate-200/60 group-open:bg-primary-100 flex items-center justify-center flex-shrink-0 transition-colors">
                    <MdArrowForward className="text-slate-400 group-open:text-primary-600 group-open:rotate-90 transition-all duration-300 text-sm" />
                  </div>
                </summary>
                <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed -mt-1">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-20 lg:py-28 bg-slate-50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="heading-lg text-3xl lg:text-4xl text-slate-900 mb-4">
            Ready to Experience
            <span className="gradient-text"> Smart Healthcare?</span>
          </h2>
          <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of patients who have already transformed their healthcare
            experience. Register today and book your first appointment in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white gradient-primary hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-300 btn-press"
            >
              Get Started Free
              <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-md border border-slate-200 btn-press"
            >
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
