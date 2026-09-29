import { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdCalendarMonth, MdCheckCircle, MdPerson,
} from 'react-icons/md';
import './DoctorAppointments.css';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!dateFilter) {
      fetchData();
    }
  }, [dateFilter]);

  const fetchData = async (selectedDate) => {
    setLoading(true);
    try {
      const aptRes = await appointmentService.getMine(selectedDate || null);
      setAppointments(aptRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await appointmentService.checkIn(id);
      toast.success('Patient checked in and added to queue');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check in patient');
    }
  };

  const filters = ['ALL', 'CONFIRMED', 'CHECKED_IN', 'IN_QUEUE', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'];

  const filteredAppointments = appointments
    .filter((apt) => filter === 'ALL' || apt.status === filter)
    .sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate}T${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.appointmentDate}T${b.startTime || '00:00'}`);
      return dateB - dateA;
    });

  if (loading) {
    return (
      <div className="doc-spinner-wrap">
        <div className="doc-spinner" />
      </div>
    );
  }

  return (
    <div className="doc-apt-page">
      {/* Header */}
      <div className="doc-apt-header">
        <div>
          <h1 className="doc-apt-title">My Appointments</h1>
          <p className="doc-apt-subtitle">View and manage your patient appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="doc-apt-panel">
        <div className="doc-apt-filters-row">
          <div className="doc-apt-date-wrap">
            <MdCalendarMonth />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="doc-apt-date-input"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="doc-apt-filter-btn inactive" style={{ marginLeft: '0.25rem' }}>
                Clear
              </button>
            )}
          </div>
          <div className="doc-apt-filter-group">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`doc-apt-filter-btn ${filter === f ? 'active' : 'inactive'}`}
              >
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments */}
      {filteredAppointments.length === 0 ? (
        <div className="doc-apt-card">
          <div className="doc-apt-empty">
            <MdCalendarMonth />
            <h3>{filter === 'ALL' ? 'No appointments found' : `No ${filter.replace(/_/g, ' ').toLowerCase()} appointments`}</h3>
            <p>{dateFilter ? `No appointments on ${formatDate(dateFilter)}` : 'You have no appointments to display.'}</p>
          </div>
        </div>
      ) : (
        <div className="doc-apt-card">
          <div className="doc-apt-table-wrap">
            <table className="doc-apt-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => {
                  const canCheckIn = ['PENDING', 'CONFIRMED'].includes(apt.status);
                  const isActive = ['CHECKED_IN','IN_QUEUE','IN_CONSULTATION'].includes(apt.status);
                  return (
                    <tr key={apt.id}>
                      <td>
                        <p className="doc-apt-cell-name">{apt.patientName || 'Patient'}</p>
                        <p className="doc-apt-cell-sub">{apt.appointmentNumber || ''}</p>
                      </td>
                      <td>{apt.appointmentDate ? formatDate(apt.appointmentDate) : '—'}</td>
                      <td>{apt.startTime ? formatTime(apt.startTime) : '—'}</td>
                      <td>
                        <p className="doc-apt-cell-sub">{apt.reason || '—'}</p>
                      </td>
                      <td>
                        <span className={`doc-apt-status-badge ${apt.status}`}>
                          {apt.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {canCheckIn && (
                          <button onClick={() => handleCheckIn(apt.id)} className="doc-apt-action-btn checkin">
                            <MdPerson /> Check In
                          </button>
                        )}
                        {isActive && (
                          <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: 600 }}>In Progress</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}