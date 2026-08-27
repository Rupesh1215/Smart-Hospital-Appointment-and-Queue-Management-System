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
} from 'react-icons/md';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getAll();
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayApts = appointments.filter((a) => a.appointmentDate && isToday(a.appointmentDate));
  const upcomingApts = appointments.filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status));
  const completedApts = appointments.filter((a) => a.status === 'COMPLETED');

  const stats = [
    { label: 'Total', value: appointments.length, icon: MdCalendarMonth, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Today', value: todayApts.length, icon: MdAccessTime, color: '#d97706', bg: '#fffbeb' },
    { label: 'Upcoming', value: upcomingApts.length, icon: MdHourglassTop, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Completed', value: completedApts.length, icon: MdCheckCircle, color: '#16a34a', bg: '#f0fdf4' },
  ];

  if (loading) {
    return (
      <div className="pat-skeleton-container">
        <div className="skeleton-box h-24" />
        <div className="pat-stats-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-box h-24" />)}
        </div>
        <div className="skeleton-box h-64" />
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      {/* Welcome */}
      <div className="pat-header">
        <div>
          <p className="pat-greeting">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
          </p>
          <h1 className="pat-welcome-title">
            Welcome back, {user?.name?.split(' ')[0] || 'Patient'}
          </h1>
          <p className="pat-welcome-subtitle">
            {todayApts.length > 0
              ? `You have ${todayApts.length} appointment${todayApts.length > 1 ? 's' : ''} today`
              : 'No appointments scheduled for today'}
          </p>
        </div>
        <Link to="/patient/doctors" className="pat-book-btn">
          <MdAdd /> Book Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="pat-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="pat-stat-card">
            <div className="pat-stat-icon-wrap" style={{ backgroundColor: stat.bg }}>
              <stat.icon style={{ color: stat.color }} />
            </div>
            <div>
              <p className="pat-stat-val">{stat.value}</p>
              <p className="pat-stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="pat-main-grid">
        {/* Upcoming */}
        <div className="pat-card main-col">
          <div className="pat-card-header">
            <div>
              <h2 className="pat-card-title">Upcoming Appointments</h2>
              <p className="pat-card-subtitle">Your next scheduled visits</p>
            </div>
            <Link to="/patient/appointments" className="pat-view-all">
              View all <MdArrowForward />
            </Link>
          </div>

          <div className="pat-list">
            {upcomingApts.length === 0 ? (
              <div className="pat-empty-state">
                <MdCalendarMonth />
                <p>No upcoming appointments</p>
                <Link to="/patient/doctors" className="pat-empty-link">
                  Book your first appointment &rarr;
                </Link>
              </div>
            ) : (
              upcomingApts.slice(0, 5).map((apt) => (
                <div key={apt.id} className="pat-list-item">
                  <div className={`pat-status-bar ${apt.status.toLowerCase()}`} />
                  <div className="pat-doc-avatar">
                    <MdLocalHospital />
                  </div>
                  <div className="pat-apt-details">
                    <p className="pat-doc-name">Dr. {apt.doctorName || 'Unknown'}</p>
                    <p className="pat-doc-dept">{apt.departmentName || 'General'}</p>
                  </div>
                  <div className="pat-apt-time">
                    <p className="pat-apt-date">{apt.appointmentDate ? formatDate(apt.appointmentDate) : '—'}</p>
                    <p className="pat-apt-hour">{apt.startTime ? formatTime(apt.startTime) : '—'}</p>
                  </div>
                  <span className={`pat-status-badge ${apt.status.toLowerCase()}`}>
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="pat-side-col">
          <div className="pat-side-card">
            <h2 className="pat-side-title">Quick Actions</h2>
            <div className="pat-actions-list">
              {[
                { icon: MdLocalHospital, label: 'Find Doctors', path: '/patient/doctors', color: '#2563eb', bg: '#eff6ff' },
                { icon: MdCalendarMonth, label: 'My Appointments', path: '/patient/appointments', color: '#7c3aed', bg: '#f5f3ff' },
                { icon: MdPeople, label: 'Queue Status', path: '/patient/queue', color: '#d97706', bg: '#fffbeb' },
                { icon: MdPerson, label: 'My Profile', path: '/patient/profile', color: '#475569', bg: '#f8fafc' },
              ].map((action, i) => (
                <Link key={i} to={action.path} className="pat-action-btn">
                  <div className="pat-action-icon" style={{ backgroundColor: action.bg }}>
                    <action.icon style={{ color: action.color }} />
                  </div>
                  <span className="pat-action-label">{action.label}</span>
                  <MdArrowForward className="pat-action-arrow" />
                </Link>
              ))}
            </div>
          </div>

          <div className="pat-side-card">
            <h2 className="pat-side-title">Recent Activity</h2>
            <div className="pat-activity-list">
              {appointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="pat-activity-item">
                  <div className={`pat-activity-dot ${apt.status.toLowerCase()}`} />
                  <div className="pat-activity-content">
                    <p className="pat-activity-title">
                      <span>Dr. {apt.doctorName}</span> &mdash; {apt.status?.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="pat-activity-date">
                      {apt.appointmentDate ? formatDate(apt.appointmentDate) : 'Date pending'}
                    </p>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="pat-empty-state" style={{ padding: '0.5rem', margin: 0, fontSize: '0.75rem' }}>No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
