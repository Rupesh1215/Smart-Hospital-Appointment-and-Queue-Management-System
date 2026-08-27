import { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import { MdSearch, MdCalendarMonth } from 'react-icons/md';
import './AdminAppointments.css';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

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

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_QUEUE', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'];

  const filtered = appointments
    .filter((a) => filter === 'ALL' || a.status === filter)
    .filter((a) =>
      !search ||
      a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      a.appointmentNumber?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(`${b.appointmentDate}T${b.startTime || '00:00'}`) - new Date(`${a.appointmentDate}T${a.startTime || '00:00'}`));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="admin-apt-page">
      <div className="admin-apt-header">
        <div>
          <h1 className="admin-apt-title">All Appointments</h1>
          <p className="admin-apt-subtitle">System-wide overview of all appointments</p>
        </div>
      </div>

      <div className="admin-apt-panel">
        <div className="admin-apt-filters">
          <div className="admin-apt-search">
            <MdSearch />
            <input placeholder="Search patient, doctor, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="admin-apt-filter-group">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`admin-apt-filter-btn ${filter === f ? 'active' : 'inactive'}`}>
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-apt-card">
          <div className="admin-apt-empty">
            <MdCalendarMonth />
            <h3>No appointments found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        </div>
      ) : (
        <div className="admin-apt-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-apt-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <p className="admin-apt-name">{apt.patientName || 'Patient'}</p>
                      <p className="admin-apt-sub">{apt.appointmentNumber}</p>
                    </td>
                    <td>
                      <p className="admin-apt-name">Dr. {apt.doctorName || 'Unknown'}</p>
                      <p className="admin-apt-sub">{apt.departmentName || '—'}</p>
                    </td>
                    <td>{apt.appointmentDate ? formatDate(apt.appointmentDate) : '—'}</td>
                    <td>{apt.startTime ? formatTime(apt.startTime) : '—'}</td>
                    <td><span className={`admin-apt-badge ${apt.status}`}>{apt.status?.replace(/_/g, ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
