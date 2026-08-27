import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import { MdCalendarMonth, MdSearch, MdCheckCircle, MdCancel } from 'react-icons/md';
import './ReceptionistAppointments.css';

export default function ReceptionistAppointments() {
  const navigate = useNavigate();
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

  const handleConfirm = async (id) => {
    try {
      await appointmentService.update(id, { status: 'CONFIRMED' });
      toast.success('Appointment confirmed');
      fetchAppointments();
    } catch (err) { toast.error('Failed to confirm'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) { toast.error('Failed to cancel'); }
  };

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_QUEUE', 'COMPLETED', 'CANCELLED'];

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
    <div className="rec-apt-page">
      <div className="rec-apt-header">
        <div>
          <h1 className="rec-apt-title">All Appointments</h1>
          <p className="rec-apt-subtitle">View and manage all hospital appointments</p>
        </div>
      </div>

      <div className="rec-apt-panel">
        <div className="rec-apt-filters">
          <div className="rec-apt-search">
            <MdSearch />
            <input placeholder="Search patient, doctor, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <p className="rec-apt-name">{apt.patientName || 'Patient'}</p>
                      <p className="rec-apt-sub">{apt.appointmentNumber}</p>
                    </td>
                    <td>
                      <p className="rec-apt-name">Dr. {apt.doctorName || 'Unknown'}</p>
                      <p className="rec-apt-sub">{apt.departmentName || '—'}</p>
                    </td>
                    <td>{apt.appointmentDate ? formatDate(apt.appointmentDate) : '—'}</td>
                    <td>{apt.startTime ? formatTime(apt.startTime) : '—'}</td>
                    <td><span className={`rec-apt-badge ${apt.status}`}>{apt.status?.replace(/_/g, ' ')}</span></td>
                    <td style={{ display: 'flex', gap: '0.375rem' }}>
                      {apt.status === 'PENDING' && (
                        <button onClick={() => handleConfirm(apt.id)} className="rec-apt-btn primary"><MdCheckCircle /> Confirm</button>
                      )}
                      {['PENDING', 'CONFIRMED'].includes(apt.status) && (
                        <button onClick={() => handleCancel(apt.id)} className="rec-apt-btn danger"><MdCancel /> Cancel</button>
                      )}
                    </td>
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
