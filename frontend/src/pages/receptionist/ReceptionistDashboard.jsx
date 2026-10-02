import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import doctorService from '../../services/doctorService';
import capacityService from '../../services/capacityService';
import { formatDate, formatTime, isToday } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdCalendarMonth, MdCheckCircle, MdPeople, MdArrowForward,
  MdSchedule, MdHowToReg, MdPersonAdd, MdAddAlert, MdTune,
  MdCheck, MdClose,
} from 'react-icons/md';
import './ReceptionistDashboard.css';

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [capacityRequests, setCapacityRequests] = useState([]);
  const [doctorCapacities, setDoctorCapacities] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDocConfig, setSelectedDocConfig] = useState(null);
  const [editOnline, setEditOnline] = useState(20);
  const [editOffline, setEditOffline] = useState(10);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [aptRes, docRes, reqRes] = await Promise.all([
        appointmentService.getAll(),
        doctorService.getAll(),
        capacityService.getRequests().catch(() => ({ data: { data: [] } })),
      ]);

      const allApts = aptRes.data?.data || [];
      const allDocs = docRes.data?.data || [];
      setAppointments(allApts);
      setDoctors(allDocs);
      setCapacityRequests(reqRes.data?.data || []);

      // Fetch capacity metrics for on-duty doctors
      const capMap = {};
      await Promise.all(
        allDocs.map(async (doc) => {
          try {
            const capRes = await capacityService.getCapacity(doc.id, todayStr);
            capMap[doc.id] = capRes.data?.data;
          } catch (e) {
            // ignore
          }
        })
      );
      setDoctorCapacities(capMap);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (reqId) => {
    try {
      await capacityService.approveRequest(reqId);
      toast.success('Doctor extra capacity request approved! Slots increased.');
      fetchData();
    } catch (err) {
      toast.error('Failed to approve request.');
    }
  };

  const handleRejectRequest = async (reqId) => {
    try {
      await capacityService.rejectRequest(reqId);
      toast.success('Request rejected.');
      fetchData();
    } catch (err) {
      toast.error('Failed to reject request.');
    }
  };

  const handleOpenSlotModal = (doc) => {
    const metrics = doctorCapacities[doc.id] || {};
    setSelectedDocConfig(doc);
    setEditOnline(metrics.onlineLimit || 20);
    setEditOffline(metrics.offlineLimit || 10);
  };

  const handleSaveSlotAllocation = async (e) => {
    e.preventDefault();
    if (!selectedDocConfig) return;
    setSavingConfig(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await capacityService.updateSlotAllocation(
        selectedDocConfig.id,
        todayStr,
        editOnline,
        editOffline
      );
      toast.success(`Slot allocation updated for Dr. ${selectedDocConfig.doctorName || selectedDocConfig.name}!`);
      setSelectedDocConfig(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to update slot allocation.');
    } finally {
      setSavingConfig(false);
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

  const pendingDoctorRequests = capacityRequests.filter((r) => r.status === 'PENDING');

  return (
    <div className="rec-dash-page">
      {/* Welcome Hero */}
      <div className="rec-welcome-card">
        <div>
          <p className="rec-welcome-label">Reception Management</p>
          <h1 className="rec-welcome-title">Welcome, {user?.name?.split(' ')[0] || 'Receptionist'}</h1>
          <p className="rec-welcome-desc">Manage patient check-ins, online vs offline slot allocations, and doctor requests.</p>
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

      {/* Doctor Extra Capacity Requests Panel */}
      {pendingDoctorRequests.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #6366F1', background: '#F5F3FF' }}>
          <div className="flex items-center gap-2 mb-3">
            <MdAddAlert style={{ fontSize: '1.4rem', color: '#4F46E5' }} />
            <h2 className="text-card-title" style={{ color: '#312E81' }}>
              Doctor Notifications: Extra Capacity Requests ({pendingDoctorRequests.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingDoctorRequests.map((req) => (
              <div key={req.id} style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E0E7FF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#1E1B4B' }}>Dr. {req.doctorName}</strong>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#4338CA', fontWeight: '600' }}>
                      Requested +{req.extraSlots} Additional Slots
                    </span>
                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0.3rem 0' }}>"{req.message}"</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => handleApproveRequest(req.id)}
                      style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '600' }}
                    >
                      <MdCheck /> Accept (+{req.extraSlots})
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '600' }}
                    >
                      <MdClose /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online vs Offline Slot Allocation Manager */}
      <div className="card">
        <div className="rec-card-header">
          <div>
            <h2 className="text-card-title flex items-center gap-2">
              <MdTune /> Doctor Capacity & Slot Allocation (Online vs Offline)
            </h2>
            <p className="text-xs text-sub">Adjust online vs offline walk-in slot distribution per doctor without altering total capacity.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {doctors.filter((d) => d.available !== false).map((doc) => {
            const cap = doctorCapacities[doc.id] || {
              totalCapacity: doc.maxPatientsPerDay || 30,
              onlineLimit: 20,
              offlineLimit: 10,
              onlineBooked: 0,
              offlineBooked: 0,
              isFullyBooked: false,
              isOnlineFull: false,
              isOfflineFull: false,
            };

            return (
              <div key={doc.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Dr. {doc.doctorName || doc.name}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>{doc.departmentName || doc.specialization || 'Consultant'}</span>
                  </div>
                  <button
                    onClick={() => handleOpenSlotModal(doc)}
                    style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Modify Slots ⚙️
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.85rem' }}>
                  <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: '700', textTransform: 'uppercase' }}>🌐 Online Slots</span>
                    <p style={{ fontSize: '0.88rem', fontWeight: '800', color: cap.isOnlineFull ? '#DC2626' : '#0F172A', margin: 0 }}>
                      {cap.onlineBooked} / {cap.onlineLimit} {cap.isOnlineFull ? '(FULL)' : ''}
                    </p>
                  </div>
                  <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '700', textTransform: 'uppercase' }}>🏥 Offline Walk-In</span>
                    <p style={{ fontSize: '0.88rem', fontWeight: '800', color: cap.isOfflineFull ? '#DC2626' : '#0F172A', margin: 0 }}>
                      {cap.offlineBooked} / {cap.offlineLimit} {cap.isOfflineFull ? '(FULL)' : ''}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', color: cap.isFullyBooked ? '#DC2626' : '#475569', fontWeight: '600' }}>
                  <span>Total Doctor Capacity: {cap.totalCapacity}</span>
                  <span>{cap.isFullyBooked ? '🔴 CAPACITY REACHED' : '🟢 Slots Open'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modify Slot Allocation Modal */}
      {selectedDocConfig && (
        <div className="rb-modal-overlay">
          <div className="rb-modal-card">
            <button className="rb-close-btn" onClick={() => setSelectedDocConfig(null)}>×</button>
            <div className="rb-header">
              <div className="rb-badge-icon">⚙️</div>
              <h3>Adjust Slot Limits for Dr. {selectedDocConfig.doctorName || selectedDocConfig.name}</h3>
              <p>Reallocate online vs offline walk-in slots according to patient demand for today.</p>
            </div>
            <form onSubmit={handleSaveSlotAllocation} className="rb-body">
              <div className="rb-input-group">
                <label>Online Slot Capacity Limit:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editOnline}
                  onChange={(e) => setEditOnline(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="rb-input-group">
                <label>Offline Walk-In Capacity Limit:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editOffline}
                  onChange={(e) => setEditOffline(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div style={{ background: '#F1F5F9', borderRadius: '10px', padding: '0.75rem', fontSize: '0.8rem', color: '#334155' }}>
                <strong>New Total Doctor Capacity:</strong> {editOnline + editOffline} slots/day
              </div>
              <div className="rb-actions">
                <button type="button" className="rb-btn-cancel" onClick={() => setSelectedDocConfig(null)}>Cancel</button>
                <button type="submit" className="rb-btn-submit" disabled={savingConfig}>
                  {savingConfig ? 'Saving...' : 'Save Slot Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <th>Channel</th>
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
                      <td>
                        <span className={`badge ${apt.bookingType === 'ONLINE' ? 'badge-primary' : 'badge-teal'}`}>
                          {apt.bookingType || 'ONLINE'}
                        </span>
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
    </div>
  );
}
