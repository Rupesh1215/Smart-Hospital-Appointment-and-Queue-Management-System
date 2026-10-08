import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import { formatDate, formatTime, isToday } from '../../utils/dateUtils';
import {
  MdCalendarMonth,
  MdAccessTime,
  MdArrowForward,
  MdCheckCircle,
  MdHourglassTop,
  MdAdd,
  MdLocalHospital,
  MdPeople,
  MdPerson,
  MdSmartToy,
} from 'react-icons/md';
import feedbackService from '../../services/feedbackService';
import FeedbackModal from '../../components/patient/FeedbackModal';
import RebookModal from '../../components/patient/RebookModal';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [selectedFeedbackApt, setSelectedFeedbackApt] = useState(null);
  const [selectedRebookApt, setSelectedRebookApt] = useState(null);

  const fetchAppointments = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await appointmentService.getAll();
      setAppointments(res.data.data || []);

      // Check pending feedback appointments
      try {
        const fbRes = await feedbackService.getPending();
        setPendingFeedback(fbRes.data?.data || []);
      } catch (e) {
        // Silently ignore
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(false);
    const interval = setInterval(() => {
      fetchAppointments(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const todayApts = appointments.filter((a) => a.appointmentDate && isToday(a.appointmentDate));
  const upcomingApts = appointments.filter((a) =>
    ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_QUEUE', 'IN_CONSULTATION', 'IN_PROGRESS'].includes(a.status)
  );
  const completedApts = appointments.filter((a) => a.status === 'COMPLETED');

  const stats = [
    { label: 'Total Appointments', value: appointments.length, icon: MdCalendarMonth, colorClass: 'stat-blue' },
    { label: 'Today\'s Visits', value: todayApts.length, icon: MdAccessTime, colorClass: 'stat-amber' },
    { label: 'Upcoming', value: upcomingApts.length, icon: MdHourglassTop, colorClass: 'stat-indigo' },
    { label: 'Completed', value: completedApts.length, icon: MdCheckCircle, colorClass: 'stat-emerald' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-32" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
        <div className="skeleton h-64" />
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      {/* Welcome Hero Card */}
      <div className="pat-welcome-card">
        <div className="pat-welcome-content">
          <p className="pat-greeting-tag">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},
          </p>
          <h1 className="pat-welcome-name">
            {user?.name || 'Patient'}
          </h1>
          <p className="pat-welcome-text">
            {todayApts.length > 0
              ? `You have ${todayApts.length} appointment${todayApts.length > 1 ? 's' : ''} scheduled for today.`
              : 'You have no consultations scheduled for today.'}
          </p>
        </div>
        <Link to="/patient/doctors" className="btn btn-emerald btn-md">
          <MdAdd /> Book New Visit
        </Link>
      </div>

      {/* Pending Doctor Feedback Banner */}
      {pendingFeedback.length > 0 && (
        <div className="pat-feedback-banner">
          <div className="pat-feedback-banner-content">
            <span className="pat-fb-star-badge">⭐ Rate Your Doctor</span>
            <h3>How was your consultation with <strong>Dr. {pendingFeedback[0].doctorName || 'your doctor'}</strong>?</h3>
            <p>Your feedback helps improve hospital care and rate our doctors!</p>
          </div>
          <button
            className="btn btn-emerald btn-md shadow-lg"
            onClick={() => setSelectedFeedbackApt(pendingFeedback[0])}
          >
            Leave Feedback ⭐
          </button>
        </div>
      )}

      {selectedFeedbackApt && (
        <FeedbackModal
          appointment={selectedFeedbackApt}
          onClose={() => setSelectedFeedbackApt(null)}
          onSuccess={() => fetchAppointments(true)}
        />
      )}

      {/* Stats Grid */}
      <div className="pat-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="pat-stat-card">
            <div className={`pat-stat-icon ${stat.colorClass}`}>
              <stat.icon />
            </div>
            <div>
              <p className="pat-stat-val">{stat.value}</p>
              <p className="pat-stat-lbl">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Section */}
      <div className="pat-main-grid">
        {/* Appointments Column */}
        <div className="card pat-main-col">
          <div className="pat-card-header">
            <div>
              <h2 className="text-card-title">Upcoming Appointments</h2>
              <p className="text-subtext">Active consultations and reservations</p>
            </div>
            <Link to="/patient/appointments" className="pat-header-link">
              View all <MdArrowForward />
            </Link>
          </div>

          <div className="pat-appointments-list">
            {upcomingApts.length === 0 ? (
              <div className="pat-empty-box">
                <MdCalendarMonth className="pat-empty-icon" />
                <p className="font-semibold text-main">No upcoming appointments</p>
                <p className="text-xs text-sub mb-4">Book a consultation with our expert specialists.</p>
                <Link to="/patient/doctors" className="btn btn-primary btn-sm">
                  Find a Doctor &rarr;
                </Link>
              </div>
            ) : (
              upcomingApts.slice(0, 5).map((apt) => (
                <div key={apt.id} className="pat-apt-row">
                  <div className="pat-doc-avatar">
                    <MdLocalHospital />
                  </div>
                  <div className="pat-apt-info">
                    <p className="pat-doc-title">Dr. {apt.doctorName || 'Consultant Doctor'}</p>
                    <p className="text-xs text-sub">{apt.departmentName || 'General Medicine'}</p>
                  </div>
                  <div className="pat-apt-date-col">
                    <p className="pat-date-txt">{apt.appointmentDate ? formatDate(apt.appointmentDate) : '—'}</p>
                    <p className="text-xs text-muted">{apt.startTime ? formatTime(apt.startTime) : '—'}</p>
                  </div>
                  <span className={`badge ${
                    apt.status === 'CONFIRMED' ? 'badge-primary' :
                    apt.status === 'IN_PROGRESS' ? 'badge-teal' : 'badge-warning'
                  }`}>
                    {apt.status}
                  </span>
                  {(() => {
                    const isMissed = ['NO_SHOW', 'MISSED', 'CANCELLED'].includes(apt.status) || (() => {
                      if (['COMPLETED', 'IN_CONSULTATION'].includes(apt.status)) return false;
                      const todayStr = new Date().toISOString().split('T')[0];
                      if (apt.appointmentDate && apt.appointmentDate < todayStr) return true;
                      if (apt.appointmentDate && apt.appointmentDate === todayStr && apt.startTime) {
                        const now = new Date();
                        const currentMinutes = now.getHours() * 60 + now.getMinutes();
                        const [h, m] = apt.startTime.split(':').map(Number);
                        return currentMinutes > (h * 60 + m + 15);
                      }
                      return false;
                    })();

                    if (!isMissed) return null;

                    return (
                      <button
                        onClick={() => setSelectedRebookApt(apt)}
                        style={{
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          borderRadius: '8px',
                          padding: '0.25rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          marginLeft: '0.5rem',
                        }}
                        title="Missed appointment? Rebook slot for free"
                      >
                        Rebook (Free) 🔄
                      </button>
                    );
                  })()}
                </div>
              ))
            )}
          </div>
        </div>

      {selectedRebookApt && (
        <RebookModal
          appointment={selectedRebookApt}
          onClose={() => setSelectedRebookApt(null)}
          onSuccess={() => fetchAppointments()}
        />
      )}

        {/* Quick Actions Column */}
        <div className="pat-side-col">
          <div className="card">
            <h3 className="text-card-title mb-4">Quick Actions</h3>
            <div className="pat-actions-grid">
              {[
                { icon: MdLocalHospital, label: 'Book Doctor', path: '/patient/doctors', badge: 'Fast' },
                { icon: MdPeople, label: 'Live Queue', path: '/patient/queue', badge: 'Realtime' },
                { icon: MdCalendarMonth, label: 'My Appointments', path: '/patient/appointments' },
                { icon: MdPerson, label: 'My Profile', path: '/patient/profile' },
              ].map((action, idx) => (
                <Link key={idx} to={action.path} className="pat-action-tile">
                  <div className="pat-action-icon-wrap">
                    <action.icon />
                  </div>
                  <div className="flex-1">
                    <p className="pat-action-name">{action.label}</p>
                  </div>
                  <MdArrowForward className="text-muted text-sm" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
