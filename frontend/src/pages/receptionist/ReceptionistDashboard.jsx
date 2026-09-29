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
      <div className="space-y-6">
        <div className="skeleton h-28" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Today's Appointments", value: todayApts.length, icon: MdCalendarMonth, colorClass: 'stat-blue' },
    { label: 'Awaiting Check-In', value: pendingCount, icon: MdSchedule, colorClass: 'stat-amber' },
    { label: 'Checked In', value: checkedInCount, icon: MdHowToReg, colorClass: 'stat-indigo' },
    { label: 'Completed', value: completedCount, icon: MdCheckCircle, colorClass: 'stat-emerald' },
  ];

  return (
    <div className="rec-dash-page">
      {/* Welcome Hero */}
      <div className="rec-welcome-card">
        <div>
          <p className="rec-welcome-label">Reception Management</p>
          <h1 className="rec-welcome-title">Welcome, {user?.name?.split(' ')[0] || 'Receptionist'}</h1>
          <p className="rec-welcome-desc">Manage patient check-ins, appointments, and daily queue flow.</p>
        </div>
        <div className="rec-welcome-actions">
          <Link to="/receptionist/check-in" className="btn btn-emerald btn-md">
            <MdHowToReg /> Fast Check-In
          </Link>
          <Link to="/receptionist/appointments" className="btn btn-secondary btn-md">
            <MdPersonAdd /> Walk-In Booking
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="rec-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="rec-stat-card">
            <div className={`rec-stat-icon ${stat.colorClass}`}>
              <stat.icon />
            </div>
            <div>
              <p className="rec-stat-value">{stat.value}</p>
              <p className="rec-stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="card">
        <div className="rec-card-header">
          <h2 className="text-card-title">Today's Patient Schedule</h2>
          <Link to="/receptionist/appointments" className="rec-card-link">
            View All <MdArrowForward />
          </Link>
        </div>

        {todayApts.length === 0 ? (
          <div className="text-center py-12">
            <MdCalendarMonth className="text-4xl text-muted mx-auto mb-2" />
            <p className="text-subtext">No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
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
                  const canCheckIn = apt.status === 'PENDING' || apt.status === 'CONFIRMED';
                  return (
                    <tr key={apt.id}>
                      <td>
                        <p className="font-semibold text-main text-sm">{apt.patientName || 'Unknown'}</p>
                        <p className="text-xs text-sub">{apt.appointmentNumber}</p>
                      </td>
                      <td>
                        <p className="font-semibold text-main text-sm">Dr. {apt.doctorName || 'Unknown'}</p>
                        <p className="text-xs text-sub">{apt.departmentName || '—'}</p>
                      </td>
                      <td className="text-xs font-semibold">
                        {apt.startTime ? formatTime(apt.startTime) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${
                          apt.status === 'CONFIRMED' ? 'badge-primary' :
                          apt.status === 'CHECKED_IN' ? 'badge-teal' :
                          apt.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {apt.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {canCheckIn && (
                          <Link to="/receptionist/check-in" className="btn btn-primary btn-sm">
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
        <div className="card">
          <h2 className="text-card-title mb-4">On-Duty Doctors</h2>
          <div className="rec-docs-grid">
            {doctors.filter((d) => d.available !== false).slice(0, 6).map((doc) => (
              <div key={doc.id} className="rec-doc-item">
                <div className="rec-doc-avatar">
                  {(doc.doctorName || doc.name || 'D').charAt(0).toUpperCase()}
                </div>
                <div className="rec-doc-info">
                  <p className="rec-doc-name">Dr. {doc.doctorName || doc.name}</p>
                  <p className="rec-doc-dept">{doc.departmentName || 'Consultant'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
