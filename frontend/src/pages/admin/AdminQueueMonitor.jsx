import { useState, useEffect } from 'react';
import queueService from '../../services/queueService';
import doctorService from '../../services/doctorService';
import departmentService from '../../services/departmentService';
import useWebSocket from '../../hooks/useWebSocket';
import { formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdWifi, MdWifiOff, MdPeople, MdSearch, MdBusiness,
  MdLocalHospital, MdRefresh, MdBlock, MdWarning,
  MdMedicalServices, MdCheckCircle, MdHourglassTop,
} from 'react-icons/md';
import './AdminQueueMonitor.css';

const STATUSES = ['ALL', 'WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'SKIPPED', 'NO_SHOW'];

export default function AdminQueueMonitor() {
  const [allEntries, setAllEntries] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState(null); // { queueId, type, patientName }
  const [actionLoading, setActionLoading] = useState('');

  const fetchAll = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [qRes, docRes, deptRes] = await Promise.all([
        queueService.getAllToday(),
        doctorService.getAll(),
        departmentService.getAll(),
      ]);
      setAllEntries(qRes.data?.data || []);
      setDoctors(docRes.data?.data || []);
      setDepartments(deptRes.data?.data || []);
    } catch (err) {
      if (!isBackground) toast.error('Failed to load queue data');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(false);
    const interval = setInterval(() => {
      fetchAll(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Global WebSocket — get updates across all doctors
  const { data: wsData, connected } = useWebSocket('/topic/queue/all', true);
  useEffect(() => {
    if (wsData && Array.isArray(wsData)) {
      setAllEntries(wsData);
    }
  }, [wsData]);

  // Actions
  const executeAction = async () => {
    if (!confirmModal) return;
    const { queueId, type, patientName } = confirmModal;
    setConfirmModal(null);
    setActionLoading(queueId);
    try {
      if (type === 'noshow') {
        await queueService.noShow({ queueId });
        toast(`${patientName} marked as no-show`, { icon: '❌' });
      } else if (type === 'skip') {
        await queueService.skip({ queueId });
        toast(`${patientName} skipped`, { icon: '⏭️' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading('');
    }
  };

  // Filtered entries
  const filtered = allEntries.filter((e) => {
    if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
    if (filterDoctor && e.doctorId !== filterDoctor) return false;
    if (filterDept && e.departmentId !== filterDept) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.patientName?.toLowerCase().includes(q) ||
        e.doctorName?.toLowerCase().includes(q) ||
        String(e.queueNumber).includes(q)
      );
    }
    return true;
  });

  // Per-doctor summaries
  const doctorSummaries = doctors.map((doc) => {
    const entries = allEntries.filter((e) => e.doctorId === doc.id);
    return {
      doctorId: doc.id,
      doctorName: doc.doctorName,
      departmentName: doc.departmentName,
      waiting: entries.filter((e) => e.status === 'WAITING').length,
      inConsult: entries.filter((e) => e.status === 'IN_CONSULTATION' || e.status === 'CALLED').length,
      completed: entries.filter((e) => e.status === 'COMPLETED').length,
      total: entries.length,
    };
  }).filter((d) => d.total > 0);

  // Global stats
  const totalWaiting = allEntries.filter((e) => e.status === 'WAITING').length;
  const totalInConsult = allEntries.filter((e) => ['CALLED', 'IN_CONSULTATION'].includes(e.status)).length;
  const totalCompleted = allEntries.filter((e) => e.status === 'COMPLETED').length;
  const totalNoShow = allEntries.filter((e) => ['NO_SHOW', 'SKIPPED'].includes(e.status)).length;

  const filteredDoctors = filterDept
    ? doctors.filter((d) => d.departmentId === filterDept)
    : doctors;

  if (loading) {
    return (
      <div className="adq-loader-wrap">
        <div className="adq-spinner" />
      </div>
    );
  }

  return (
    <div className="adq-page">
      {/* Confirm Modal */}
      {confirmModal && (
        <div className="adq-modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="adq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adq-modal-icon"><MdWarning /></div>
            <h3>Confirm Action</h3>
            <p>
              Mark <strong>{confirmModal.patientName}</strong> as{' '}
              <strong>{confirmModal.type === 'noshow' ? 'No-Show' : 'Skipped'}</strong>?
            </p>
            <div className="adq-modal-actions">
              <button className="adq-modal-cancel" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button className="adq-modal-confirm" onClick={executeAction}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="adq-header">
        <div>
          <h1 className="adq-title">Queue Monitor</h1>
          <p className="adq-subtitle">Real-time hospital-wide queue oversight</p>
        </div>
        <div className="adq-header-right">
          {connected
            ? <span className="adq-live-badge"><MdWifi /> Live</span>
            : <span className="adq-offline-badge"><MdWifiOff /> Reconnecting</span>}
          <button onClick={fetchAll} className="adq-refresh-btn" title="Refresh"><MdRefresh /></button>
        </div>
      </div>

      {/* Global stats */}
      <div className="adq-global-stats">
        {[
          { label: 'Waiting', value: totalWaiting, color: '#D97706', icon: MdHourglassTop },
          { label: 'Active', value: totalInConsult, color: '#0D9488', icon: MdMedicalServices },
          { label: 'Completed', value: totalCompleted, color: '#16A34A', icon: MdCheckCircle },
          { label: 'No-Show', value: totalNoShow, color: '#DC2626', icon: MdBlock },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="adq-global-stat" style={{ borderTop: `3px solid ${s.color}` }}>
              <Icon className="adq-global-stat-icon" style={{ color: s.color }} />
              <p className="adq-global-stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="adq-global-stat-label">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Doctor summary cards */}
      {doctorSummaries.length > 0 && (
        <div className="adq-doc-summaries">
          {doctorSummaries.map((doc) => (
            <div
              key={doc.doctorId}
              className={`adq-doc-card ${filterDoctor === doc.doctorId ? 'active' : ''}`}
              onClick={() => setFilterDoctor(filterDoctor === doc.doctorId ? '' : doc.doctorId)}
              role="button"
              title={`Filter by Dr. ${doc.doctorName}`}
            >
              <div className="adq-doc-card-avatar">{(doc.doctorName || 'D')[0]}</div>
              <div className="adq-doc-card-info">
                <p className="adq-doc-card-name">Dr. {doc.doctorName}</p>
                <p className="adq-doc-card-dept">{doc.departmentName}</p>
              </div>
              <div className="adq-doc-card-stats">
                <span className="adq-ds waiting">{doc.waiting} W</span>
                <span className="adq-ds consult">{doc.inConsult} Active</span>
                <span className="adq-ds done">{doc.completed} Done</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="adq-filters">
        <div className="adq-filter-group">
          <MdBusiness className="adq-filter-icon" />
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setFilterDoctor(''); }}
            className="adq-select"
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="adq-filter-group">
          <MdLocalHospital className="adq-filter-icon" />
          <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)} className="adq-select">
            <option value="">All Doctors</option>
            {filteredDoctors.map((d) => (
              <option key={d.id} value={d.id}>Dr. {d.doctorName}</option>
            ))}
          </select>
        </div>
        <div className="adq-filter-group">
          <MdPeople className="adq-filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="adq-select">
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="adq-search-wrap">
          <MdSearch className="adq-filter-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, doctor..."
            className="adq-search-input"
          />
        </div>
      </div>

      {/* Queue Table */}
      <div className="adq-table-card">
        <div className="adq-table-head">
          <h2>All Queue Entries — Today</h2>
          <span className="adq-entry-count">{filtered.length} of {allEntries.length} entries</span>
        </div>
        {filtered.length === 0 ? (
          <div className="adq-empty">
            <MdPeople />
            <p>No queue entries match the current filters</p>
          </div>
        ) : (
          <div className="adq-table-wrap">
            <table className="adq-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Appt. Time</th>
                  <th>Check-In</th>
                  <th>Status</th>
                  <th>Override</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className={['CALLED', 'IN_CONSULTATION'].includes(entry.status) ? 'adq-tr-active' : ''}>
                    <td><span className="adq-token">#{entry.queueNumber}</span></td>
                    <td>
                      <p className="adq-td-main">{entry.patientName || '—'}</p>
                    </td>
                    <td>
                      <p className="adq-td-main">Dr. {entry.doctorName || '—'}</p>
                    </td>
                    <td className="adq-td-sub">{entry.departmentName || '—'}</td>
                    <td className="adq-td-sub">
                      {entry.appointmentTime ? formatTime(entry.appointmentTime) : '—'}
                    </td>
                    <td className="adq-td-sub">
                      {entry.checkInTime ? entry.checkInTime.substring(11, 16) : '—'}
                    </td>
                    <td>
                      <span className={`adq-status ${entry.status}`}>
                        {entry.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {['WAITING', 'CALLED'].includes(entry.status) && (
                        <div className="adq-override-btns">
                          <button
                            onClick={() => setConfirmModal({
                              queueId: entry.id, type: 'noshow', patientName: entry.patientName
                            })}
                            className="adq-override-btn noshow"
                            disabled={actionLoading === entry.id}
                            title="Mark no-show"
                          >
                            No-Show
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
