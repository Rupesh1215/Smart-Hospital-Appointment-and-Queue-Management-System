import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdCalendarMonth, MdSearch, MdCheckCircle, MdCancel,
  MdHowToReg, MdAdd, MdRefresh,
} from 'react-icons/md';
import './ReceptionistAppointments.css';

export default function ReceptionistAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAll();
      setAppointments(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id) => {
    setProcessingId(id);
    try {
      await appointmentService.checkIn(id);
      toast.success('Patient checked in and added to queue');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already checked in or cannot check in now');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setProcessingId(id);
    try {
      await appointmentService.cancel(id, 'Cancelled by receptionist');
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel');
    } finally {
      setProcessingId(null);
    }
  };

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_QUEUE', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'];

  const statusPriority = (s) => {
    switch (s) {
      case 'IN_CONSULTATION': return 0;
      case 'CHECKED_IN': case 'IN_QUEUE': return 1;
      case 'CONFIRMED': case 'PENDING': return 2;
      case 'COMPLETED': return 3;
      case 'CANCELLED': return 4;
      default: return 5;
    }
  };

  const filtered = appointments
    .filter((a) => filter === 'ALL' || a.status === filter)
    .filter((a) =>
      !search ||
      a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      a.appointmentNumber?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Active statuses first
      const pa = statusPriority(a.status);
      const pb = statusPriority(b.status);
      if (pa !== pb) return pa - pb;
      // Then ascending by date+time (nearest appointment first)
      const da = new Date(`${a.appointmentDate}T${a.startTime || '00:00'}`);
      const db = new Date(`${b.appointmentDate}T${b.startTime || '00:00'}`);
      return da - db;
    });

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'rec-apt-badge confirmed';
      case 'CHECKED_IN': return 'rec-apt-badge checked-in';
      case 'IN_QUEUE': return 'rec-apt-badge in-queue';
      case 'IN_CONSULTATION': return 'rec-apt-badge in-consultation';
      case 'COMPLETED': return 'rec-apt-badge completed';
      case 'CANCELLED': return 'rec-apt-badge cancelled';
      default: return 'rec-apt-badge';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="rec-apt-page">
      <div className="rec-apt-header">
        <div>
          <h1 className="rec-apt-title">All Appointments</h1>
          <p className="rec-apt-subtitle">View, manage, and check in patients for their appointments</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchAppointments} className="rec-apt-btn secondary" title="Refresh">
            <MdRefresh /> Refresh
          </button>
          <button onClick={() => navigate('/receptionist/book')} className="rec-apt-btn primary">
            <MdAdd /> Book for Patient
          </button>
        </div>
      </div>

      <div className="rec-apt-panel">
        <div className="rec-apt-filters">
          <div className="rec-apt-search">
            <MdSearch />
            <input
              placeholder="Search patient, doctor, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="rec-apt-filter-pills">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rec-apt-pill ${filter === f ? 'active' : 'inactive'}`}>
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rec-apt-card">
          <div className="rec-apt-empty">
            <MdCalendarMonth />
            <h3>No appointments found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        </div>
      ) : (
        <div className="rec-apt-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="rec-apt-table">
              <thead>
                <tr>
                  <th>Appointment #</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt) => {
                  const canCheckIn = ['PENDING', 'CONFIRMED'].includes(apt.status);
                  const canCancel = ['PENDING', 'CONFIRMED'].includes(apt.status);
                  const isProcessing = processingId === apt.id;

                  return (
                    <tr key={apt.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>
                          {apt.appointmentNumber || '—'}
                        </span>
                      </td>
                      <td>
                        <p className="rec-apt-name">{apt.patientName || 'Unknown Patient'}</p>
                      </td>
                      <td>
                        <p className="rec-apt-name">Dr. {apt.doctorName || 'Unknown'}</p>
                        <p className="rec-apt-sub">{apt.departmentName || '—'}</p>
                      </td>
                      <td>{apt.appointmentDate ? formatDate(apt.appointmentDate) : '—'}</td>
                      <td>{apt.startTime ? formatTime(apt.startTime) : '—'}</td>
                      <td>
                        <span className={statusBadgeClass(apt.status)}>
                          {apt.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {canCheckIn && (
                          <button
                            onClick={() => handleCheckIn(apt.id)}
                            disabled={isProcessing}
                            className="rec-apt-btn checkin"
                          >
                            <MdHowToReg /> Check In
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(apt.id)}
                            disabled={isProcessing}
                            className="rec-apt-btn danger"
                          >
                            <MdCancel /> Cancel
                          </button>
                        )}
                        {apt.status === 'CHECKED_IN' && (
                          <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: 600, alignSelf: 'center' }}>In Queue</span>
                        )}
                        {apt.status === 'COMPLETED' && (
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, alignSelf: 'center' }}>Done</span>
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
