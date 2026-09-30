import { useState, useEffect } from 'react';
import doctorService from '../../services/doctorService';
import departmentService from '../../services/departmentService';
import queueService from '../../services/queueService';
import useWebSocket from '../../hooks/useWebSocket';
import { formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdPeople, MdCheckCircle, MdMedicalServices,
  MdSearch, MdWifi, MdWifiOff, MdRefresh,
  MdAccessTime, MdCalendarMonth, MdBusiness,
} from 'react-icons/md';
import './ReceptionistQueue.css';

export default function ReceptionistQueue() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [search, setSearch] = useState('');
  const [queueEntries, setQueueEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  // Load doctors and departments
  useEffect(() => {
    (async () => {
      try {
        const [docRes, deptRes] = await Promise.all([
          doctorService.getAll(),
          departmentService.getAll(),
        ]);
        const docs = docRes.data?.data || [];
        const depts = deptRes.data?.data || [];
        setDoctors(docs);
        setDepartments(depts);
        if (docs.length > 0) setSelectedDoctor(docs[0].id);
      } catch {
        toast.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch queue when doctor changes with periodic background polling
  useEffect(() => {
    if (!selectedDoctor) return;
    const fetchQueue = () => {
      queueService.getByDoctor(selectedDoctor).then((res) => {
        setQueueEntries(res.data?.data || []);
      }).catch(() => setQueueEntries([]));
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, [selectedDoctor]);

  // WebSocket — live updates for selected doctor
  const { data: wsData, connected } = useWebSocket(
    selectedDoctor ? `/topic/queue/${selectedDoctor}` : null,
    !!selectedDoctor
  );
  useEffect(() => {
    if (wsData && Array.isArray(wsData)) {
      setQueueEntries(wsData);
    }
  }, [wsData]);

  // Filter by department when doctor selection changes
  const handleDeptChange = (deptId) => {
    setSelectedDept(deptId);
    const docInDept = doctors.find((d) => d.departmentId === deptId || deptId === '');
    if (deptId === '') return;
    if (docInDept) setSelectedDoctor(docInDept.id);
  };

  // No-show
  const handleNoShow = async (queueId, patientName) => {
    setActionLoading(queueId);
    try {
      await queueService.noShow({ queueId });
      toast(`${patientName || 'Patient'} marked as no-show`, { icon: '❌' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark no-show');
    } finally {
      setActionLoading('');
    }
  };

  // Derived
  const filteredDoctors = selectedDept
    ? doctors.filter((d) => d.departmentId === selectedDept)
    : doctors;

  const filtered = queueEntries.filter((e) => {
    if (!search) return true;
    return (
      e.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      String(e.queueNumber).includes(search)
    );
  });

  const waiting = queueEntries.filter((e) => e.status === 'WAITING').length;
  const inConsult = queueEntries.filter((e) => e.status === 'IN_CONSULTATION').length;
  const completed = queueEntries.filter((e) => e.status === 'COMPLETED').length;
  const noShows = queueEntries.filter((e) => e.status === 'NO_SHOW' || e.status === 'SKIPPED').length;

  const selectedDocName = doctors.find((d) => d.id === selectedDoctor)?.doctorName || '';
  const selectedDocDept = doctors.find((d) => d.id === selectedDoctor)?.departmentName || '';

  const statusClass = (status) => {
    const map = {
      WAITING: 'WAITING', CALLED: 'CALLED',
      IN_CONSULTATION: 'IN_CONSULTATION', COMPLETED: 'COMPLETED',
      SKIPPED: 'SKIPPED', NO_SHOW: 'NO_SHOW',
    };
    return map[status] || '';
  };

  if (loading) {
    return (
      <div className="rec-q-loading">
        <div className="rec-q-spinner" />
      </div>
    );
  }

  return (
    <div className="rec-q-page">
      {/* Header */}
      <div className="rec-q-header-row">
        <div>
          <h1 className="rec-q-title">Queue Management</h1>
          <p className="rec-q-subtitle">Monitor patient queues in real time</p>
        </div>
        <div className="rec-q-header-right">
          {selectedDoctor && (
            connected
              ? <span className="rec-q-live-badge"><MdWifi /> Live</span>
              : <span className="rec-q-offline-badge"><MdWifiOff /> Reconnecting</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rec-q-filters">
        {/* Department filter */}
        <div className="rec-q-filter-group">
          <MdBusiness className="rec-q-filter-icon" />
          <select
            value={selectedDept}
            onChange={(e) => handleDeptChange(e.target.value)}
            className="rec-q-select"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Doctor selector */}
        <div className="rec-q-filter-group">
          <MdPeople className="rec-q-filter-icon" />
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="rec-q-select"
          >
            {filteredDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.doctorName} — {doc.departmentName || 'General'}
              </option>
            ))}
          </select>
        </div>

        {/* Patient search */}
        <div className="rec-q-search-wrap">
          <MdSearch className="rec-q-search-icon" />
          <input
            className="rec-q-search-input"
            placeholder="Search patient or token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="rec-q-stats">
        {[
          { label: 'Waiting', value: waiting, color: '#D97706', bg: '#FFFBEB' },
          { label: 'In Consultation', value: inConsult, color: '#0D9488', bg: '#F0FDFA' },
          { label: 'Completed', value: completed, color: '#16A34A', bg: '#F0FDF4' },
          { label: 'No-Show', value: noShows, color: '#DC2626', bg: '#FEF2F2' },
        ].map((s, i) => (
          <div key={i} className="rec-q-stat" style={{ borderTop: `3px solid ${s.color}` }}>
            <p className="rec-q-stat-val" style={{ color: s.color }}>{s.value}</p>
            <p className="rec-q-stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Queue card */}
      <div className="rec-q-card">
        <div className="rec-q-card-head">
          <div>
            <h2>Dr. {selectedDocName}</h2>
            <p className="rec-q-card-dept">{selectedDocDept}</p>
          </div>
          <span className="rec-q-card-count">{filtered.length} entries</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rec-q-empty">
            <MdPeople />
            <p>{search ? 'No matching patients found' : 'No patients in queue for this doctor'}</p>
          </div>
        ) : (
          <div className="rec-q-list">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className={`rec-q-entry ${['CALLED', 'IN_CONSULTATION'].includes(entry.status) ? 'highlight' : ''}`}
              >
                <div className="rec-q-entry-left">
                  <div className={`rec-q-token ${entry.status}`}>#{entry.queueNumber}</div>
                  <div>
                    <p className="rec-q-entry-name">{entry.patientName || 'Patient'}</p>
                    <p className="rec-q-entry-sub">
                      {entry.appointmentTime && (
                        <><MdCalendarMonth /> {formatTime(entry.appointmentTime)}&nbsp;</>
                      )}
                      {entry.checkInTime && (
                        <><MdAccessTime /> In: {entry.checkInTime.substring(11, 16)}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="rec-q-entry-right">
                  <span className={`rec-q-status ${statusClass(entry.status)}`}>
                    {entry.status.replace(/_/g, ' ')}
                  </span>
                  {/* Receptionist can mark WAITING patients as no-show (front-desk authority) */}
                  {entry.status === 'WAITING' && (
                    <button
                      onClick={() => handleNoShow(entry.id, entry.patientName)}
                      className="rec-q-noshow-btn"
                      disabled={actionLoading === entry.id}
                      title="Mark as no-show"
                    >
                      {actionLoading === entry.id ? '...' : 'No-Show'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
