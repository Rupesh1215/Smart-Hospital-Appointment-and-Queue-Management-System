import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import doctorService from '../../services/doctorService';
import { formatDate, formatTime, isToday } from '../../utils/dateUtils';
import { STATUS_COLORS } from '../../utils/constants';
import {
  MdCalendarMonth, MdCheckCircle, MdPeople, MdArrowForward,
  MdSchedule, MdHowToReg, MdQueue, MdPersonAdd,
} from 'react-icons/md';
import './ReceptionistDashboard.css';

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [aptRes, docRes] = await Promise.all([
        appointmentService.getAll(),
        doctorService.getAll(),
      ]);
      setAppointments(aptRes.data.data || []);
      setDoctors(docRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayApts = appointments.filter((apt) => apt.appointmentDate && isToday(apt.appointmentDate));
  const pendingCount = todayApts.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
  const checkedInCount = todayApts.filter((a) => a.status === 'CHECKED_IN' || a.status === 'IN_QUEUE').length;
  const completedCount = todayApts.filter((a) => a.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="rec-dash-page">
        <div className="rec-skeleton rec-skeleton-hero" />
        <div className="rec-stats-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="rec-skeleton rec-skeleton-card" />)}
        </div>
        <div className="rec-skeleton rec-skeleton-table" />
      </div>
    );
  }

  const stats = [
    { label: "Today's Appointments", value: todayApts.length, icon: MdCalendarMonth, class: 'bg-blue-50 text-blue-600' },
    { label: 'Awaiting Check-In', value: pendingCount, icon: MdSchedule, class: 'bg-amber-50 text-amber-600' },
    { label: 'Checked In', value: checkedInCount, icon: MdHowToReg, class: 'bg-violet-50 text-violet-600' },
    { label: 'Completed', value: completedCount, icon: MdCheckCircle, class: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="rec-dash-page">
      {/* Welcome + Quick Actions */}
      <div className="rec-welcome-card">
        <div>
          <p className="rec-welcome-label">Reception</p>
          <h1 className="rec-welcome-title">Welcome, {user?.name?.split(' ')[0] || 'Receptionist'}</h1>
          <p className="rec-welcome-desc">Manage check-ins, appointments, and patient queues.</p>
        </div>
        <div className="rec-welcome-actions">
          <Link to="/receptionist/check-in" className="rec-action-btn primary">
            <MdHowToReg /> Check In
          </Link>
          <Link to="/receptionist/appointments" className="rec-action-btn secondary">
            <MdPersonAdd /> Walk-In
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="rec-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="rec-stat-card">
            <div className={`rec-stat-icon-wrap ${stat.class.split(' ')[0]}`}>
              <stat.icon className={stat.class.split(' ')[1]} />
            </div>
            <div>
              <p className="rec-stat-value">{stat.value}</p>
              <p className="rec-stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="rec-card">
        <div className="rec-card-header">
          <h2 className="rec-card-title">Today's Appointments</h2>
          <Link to="/receptionist/appointments" className="rec-card-link">
            View All <MdArrowForward />
          </Link>
        </div>

        {todayApts.length === 0 ? (
          <div className="rec-empty-state">
            <MdCalendarMonth />
            <p>No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="rec-table-wrap">
            <table className="rec-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {todayApts.slice(0, 10).map((apt) => {
                  const statusColor = STATUS_COLORS[apt.status] || STATUS_COLORS.PENDING;
                  const canCheckIn = apt.status === 'PENDING' || apt.status === 'CONFIRMED';
                  return (
                    <tr key={apt.id}>
                      <td>
                        <p className="rec-cell-title">{apt.patientName || 'Unknown'}</p>
                        <p className="rec-cell-subtitle">{apt.appointmentNumber}</p>
                      </td>
                      <td>
                        <p className="rec-cell-title">Dr. {apt.doctorName || 'Unknown'}</p>
                        <p className="rec-cell-subtitle">{apt.departmentName || '—'}</p>
                      </td>
                      <td className="rec-cell-title">
                        {apt.startTime ? formatTime(apt.startTime) : '—'}
                      </td>
                      <td>
                        <span className={`rec-badge ${statusColor.bg} ${statusColor.text}`}>
                          {apt.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {canCheckIn && (
                          <Link to="/receptionist/check-in" className="rec-btn-sm">
                            <MdHowToReg /> Check In
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Available Doctors */}
      {doctors.length > 0 && (
        <div className="rec-card">
          <div className="rec-card-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <h2 className="rec-card-title">Available Doctors</h2>
          </div>
          <div className="rec-docs-grid">
            {doctors.filter((d) => d.available).slice(0, 6).map((doc) => (
              <div key={doc.id} className="rec-doc-item">
                <div className="rec-doc-avatar">
                  {doc.doctorName?.charAt(0)?.toUpperCase() || 'D'}
                </div>
                <div className="rec-doc-info">
                  <p className="rec-doc-name">Dr. {doc.doctorName || 'Unknown'}</p>
                  <p className="rec-doc-dept">{doc.departmentName || 'General'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
