import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdCalendarMonth,
  MdAdd,
  MdCancel,
  MdRefresh,
  MdFilterList,
  MdLocalHospital,
  MdAccessTime,
  MdSearch,
} from 'react-icons/md';
import './PatientAppointments.css';

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getMine();
      setAppointments(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  const filteredAppointments = appointments
    .filter((apt) => filter === 'ALL' || apt.status === filter)
    .filter(
      (apt) =>
        !searchTerm ||
        apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '4px solid #14b8a6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="pat-apt-page">
      {/* Header */}
      <div className="pat-apt-header">
        <div>
          <h1 className="pat-apt-title">My Appointments</h1>
          <p className="pat-apt-subtitle">
            Manage and track your appointments
          </p>
        </div>
        <button
          onClick={() => navigate('/patient/doctors')}
          className="pat-apt-book-btn"
        >
          <MdAdd />
          Book Appointment
        </button>
      </div>

      {/* Filters & Search */}
      <div className="pat-apt-panel">
        <div className="pat-apt-filters-row">
          {/* Search */}
          <div className="pat-apt-search-wrap">
            <MdSearch />
            <input
              type="text"
              placeholder="Search by doctor, department, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pat-apt-search-input"
            />
          </div>

          {/* Filter Pills */}
          <div className="pat-apt-filter-group">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`pat-apt-filter-btn ${filter === f ? 'active' : 'inactive'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="pat-apt-empty-state">
          <div className="pat-apt-empty-icon">
            <MdCalendarMonth />
          </div>
          <h3 className="pat-apt-empty-title">
            {filter === 'ALL' ? 'No appointments yet' : `No ${filter.toLowerCase()} appointments`}
          </h3>
          <p className="pat-apt-empty-desc">
            Book your first appointment to get started.
          </p>
          <button
            onClick={() => navigate('/patient/doctors')}
            className="pat-apt-book-btn"
          >
            <MdLocalHospital />
            Find a Doctor
          </button>
        </div>
      ) : (
        <div className="pat-apt-list">
          {filteredAppointments.map((apt) => {
            const canCancel = ['PENDING', 'CONFIRMED'].includes(apt.status);

            return (
              <div key={apt.id} className="pat-apt-card">
                <div className="pat-apt-card-content">
                  {/* Doctor Info */}
                  <div className="pat-apt-doc-info">
                    <div className="pat-apt-avatar">
                      <MdLocalHospital />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p className="pat-apt-doc-name">
                        Dr. {apt.doctorName || 'Unknown'}
                      </p>
                      <p className="pat-apt-doc-dept">
                        {apt.departmentName || 'General'}
                        {apt.appointmentNumber && (
                          <span>• {apt.appointmentNumber}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="pat-apt-time-info">
                    <div className="pat-apt-time-item">
                      <MdCalendarMonth />
                      <span>
                        {apt.appointmentDate ? formatDate(apt.appointmentDate) : '—'}
                      </span>
                    </div>
                    <div className="pat-apt-time-item">
                      <MdAccessTime />
                      <span>
                        {apt.startTime ? formatTime(apt.startTime) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="pat-apt-actions">
                    <span className={`pat-apt-status ${apt.status}`}>
                      {apt.status}
                    </span>
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="pat-apt-cancel-btn"
                        title="Cancel Appointment"
                      >
                        <MdCancel />
                      </button>
                    )}
                  </div>
                </div>

                {/* Reason */}
                {apt.reason && (
                  <p className="pat-apt-reason">
                    <span>Reason:</span> {apt.reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
