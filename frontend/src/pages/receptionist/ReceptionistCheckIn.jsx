import { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import queueService from '../../services/queueService';
import { formatDate, formatTime, isToday } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import { MdSearch, MdHowToReg, MdCheckCircle, MdCalendarMonth, MdQueue } from 'react-icons/md';
import './ReceptionistCheckIn.css';

export default function ReceptionistCheckIn() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [checkedIn, setCheckedIn] = useState(new Set());
  const [processing, setProcessing] = useState('');

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAll();
      const all = res.data?.data || [];
      // Show today's appointments that are active/ready for check-in
      let eligible = all.filter(
        (a) => a.appointmentDate && isToday(a.appointmentDate) && ['CONFIRMED', 'PENDING', 'CHECKED_IN', 'IN_QUEUE'].includes(a.status)
      );
      // Fallback: if no appointments specifically today, show all active appointments sorted by date
      if (eligible.length === 0) {
        eligible = all.filter((a) => ['CONFIRMED', 'PENDING', 'CHECKED_IN', 'IN_QUEUE'].includes(a.status));
      }
      setAppointments(eligible);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (apt) => {
    setProcessing(apt.id);
    try {
      const res = await queueService.checkIn({ appointmentId: apt.id });
      const queueEntry = res.data?.data;
      const qNum = queueEntry?.queueNumber;
      toast.success(
        `${apt.patientName || 'Patient'} checked in${qNum ? ` — Queue #${qNum}` : ''}!`,
        { icon: '🏥', duration: 4000 }
      );
      setCheckedIn((prev) => new Set([...prev, apt.id]));
      // Refresh to remove checked-in appointments
      setTimeout(fetchAppointments, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check in');
    } finally {
      setProcessing('');
    }
  };

  const filtered = appointments.filter(
    (a) =>
      !search ||
      a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      a.appointmentNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '4px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="rec-ci-page">
      <div>
        <h1 className="rec-ci-title">Patient Check-In</h1>
        <p className="rec-ci-subtitle">Check in patients arriving for their appointments today</p>
      </div>

      {/* Search */}
      <div className="rec-ci-search-card">
        <div className="rec-ci-search-wrap">
          <MdSearch />
          <input
            placeholder="Search by patient name, doctor, or appointment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Appointments Table */}
      {filtered.length === 0 ? (
        <div className="rec-ci-card">
          <div className="rec-ci-empty">
            <MdCalendarMonth />
            <p>No appointments awaiting check-in today</p>
          </div>
        </div>
      ) : (
        <div className="rec-ci-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="rec-ci-table">
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
                {filtered.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <p className="rec-ci-name">{apt.patientName || 'Patient'}</p>
                      <p className="rec-ci-sub">{apt.appointmentNumber}</p>
                    </td>
                    <td>
                      <p className="rec-ci-name">Dr. {apt.doctorName || 'Unknown'}</p>
                      <p className="rec-ci-sub">{apt.departmentName || '—'}</p>
                    </td>
                    <td>{apt.startTime ? formatTime(apt.startTime) : '—'}</td>
                    <td>
                      <span className={`rec-ci-badge ${apt.status}`}>{apt.status}</span>
                    </td>
                    <td>
                      {checkedIn.has(apt.id) ? (
                        <span className="rec-ci-success"><MdCheckCircle /> Checked In</span>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(apt)}
                          disabled={processing === apt.id}
                          className="rec-ci-checkin-btn"
                        >
                          <MdHowToReg />
                          {processing === apt.id ? 'Processing...' : 'Check In'}
                        </button>
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
