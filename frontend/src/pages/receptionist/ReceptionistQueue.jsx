import { useState, useEffect } from 'react';
import doctorService from '../../services/doctorService';
import queueService from '../../services/queueService';
import { formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import { MdPeople, MdPlayArrow, MdCheckCircle, MdMedicalServices, MdArrowForward } from 'react-icons/md';
import './ReceptionistQueue.css';

export default function ReceptionistQueue() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [queueEntries, setQueueEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDoctors(); }, []);
  useEffect(() => { if (selectedDoctor) fetchQueue(); }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const res = await doctorService.getAll();
      const docs = res.data?.data || [];
      setDoctors(docs);
      if (docs.length > 0) setSelectedDoctor(docs[0].id);
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await queueService.getByDoctor(selectedDoctor);
      setQueueEntries(res.data?.data || []);
    } catch (err) {
      setQueueEntries([]);
    }
  };

  const handleCallNext = async () => {
    try {
      await queueService.callNext({ doctorId: selectedDoctor });
      toast.success('Next patient called!');
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No patients waiting');
    }
  };

  const waiting = queueEntries.filter((e) => e.status === 'WAITING');
  const called = queueEntries.filter((e) => e.status === 'CALLED');
  const inConsult = queueEntries.filter((e) => e.status === 'IN_CONSULTATION');
  const completed = queueEntries.filter((e) => e.status === 'COMPLETED');

  const stats = [
    { label: 'Waiting', value: waiting.length, bg: '#fffbeb', color: '#d97706' },
    { label: 'Called', value: called.length, bg: '#eff6ff', color: '#2563eb' },
    { label: 'In Consultation', value: inConsult.length, bg: '#f0fdf4', color: '#16a34a' },
    { label: 'Completed', value: completed.length, bg: '#f5f3ff', color: '#7c3aed' },
  ];

  const selectedDocName = doctors.find((d) => d.id === selectedDoctor)?.doctorName || '';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="rec-q-page">
      <div>
        <h1 className="rec-q-title">Queue Management</h1>
        <p className="rec-q-subtitle">Monitor and manage patient queues across doctors</p>
      </div>

      {/* Doctor Selector */}
      <div className="rec-q-select-wrap">
        <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="rec-q-select">
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>Dr. {doc.doctorName} — {doc.departmentName || 'General'}</option>
          ))}
        </select>
        <button onClick={handleCallNext} className="rec-q-btn call" disabled={waiting.length === 0}>
          <MdPlayArrow /> Call Next
        </button>
      </div>

      {/* Stats */}
      <div className="rec-q-stats">
        {stats.map((s, i) => (
          <div key={i} className="rec-q-stat">
            <div className="rec-q-stat-icon" style={{ backgroundColor: s.bg }}>
              <MdPeople style={{ color: s.color }} />
            </div>
            <div>
              <p className="rec-q-stat-val">{s.value}</p>
              <p className="rec-q-stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Queue List */}
      <div className="rec-q-card">
        <div className="rec-q-card-head">
          <h2>Dr. {selectedDocName}'s Queue</h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{queueEntries.length} entries</span>
        </div>
        {queueEntries.length === 0 ? (
          <div className="rec-q-empty">
            <MdPeople />
            <p>No patients in queue for this doctor</p>
          </div>
        ) : (
          <div className="rec-q-list">
            {queueEntries.map((entry) => (
              <div key={entry.id} className={`rec-q-entry ${['CALLED', 'IN_CONSULTATION'].includes(entry.status) ? 'highlight' : ''}`}>
                <div className="rec-q-entry-left">
                  <div className="rec-q-token">{entry.queueNumber ? `#${entry.queueNumber}` : '#'}</div>
                  <div>
                    <p className="rec-q-entry-name">{entry.patientName || 'Patient'}</p>
                    <p className="rec-q-entry-sub">{entry.startTime ? formatTime(entry.startTime) : ''}</p>
                  </div>
                </div>
                <div className="rec-q-entry-right">
                  <span className={`rec-q-status ${entry.status}`}>{entry.status?.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
