import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import queueService from '../../services/queueService';
import doctorService from '../../services/doctorService';
import { formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdPeople, MdPlayArrow, MdCheckCircle, MdSkipNext,
  MdMedicalServices, MdSchedule, MdArrowForward,
} from 'react-icons/md';
import './DoctorQueue.css';

export default function DoctorQueue() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [queueEntries, setQueueEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const docsRes = await doctorService.getAll();
      const allDocs = docsRes.data?.data || [];
      const currentDoc = allDocs.find((d) => d.email === user?.email || d.userId === user?.id) || allDocs[0];
      setDoctorProfile(currentDoc);
      if (currentDoc?.id) {
        const qRes = await queueService.getByDoctor(currentDoc.id);
        setQueueEntries(qRes.data?.data || []);
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    if (!doctorProfile?.id) return;
    try {
      await queueService.callNext({ doctorId: doctorProfile.id });
      toast.success('Next patient called!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No patients waiting');
    }
  };

  const handleStart = async (queueId) => {
    try {
      await queueService.startConsultation({ queueId });
      toast.success('Consultation started');
      fetchData();
    } catch (err) {
      toast.error('Failed to start consultation');
    }
  };

  const handleComplete = async (queueId) => {
    try {
      await queueService.completeConsultation({ queueId });
      toast.success('Consultation completed');
      fetchData();
    } catch (err) {
      toast.error('Failed to complete consultation');
    }
  };

  const handleSkip = async (queueId) => {
    try {
      await queueService.skip({ queueId });
      toast.success('Patient skipped');
      fetchData();
    } catch (err) {
      toast.error('Failed to skip patient');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const waiting = queueEntries.filter((e) => e.status === 'WAITING');
  const called = queueEntries.filter((e) => e.status === 'CALLED');
  const inConsult = queueEntries.filter((e) => e.status === 'IN_CONSULTATION');
  const completed = queueEntries.filter((e) => e.status === 'COMPLETED');
  const currentEntry = called[0] || inConsult[0];

  const stats = [
    { label: 'Waiting', value: waiting.length, icon: MdPeople, bg: '#fffbeb', color: '#d97706' },
    { label: 'Called', value: called.length, icon: MdArrowForward, bg: '#eff6ff', color: '#2563eb' },
    { label: 'In Consultation', value: inConsult.length, icon: MdMedicalServices, bg: '#f0fdf4', color: '#16a34a' },
    { label: 'Completed', value: completed.length, icon: MdCheckCircle, bg: '#f5f3ff', color: '#7c3aed' },
  ];

  const getTokenClass = (status) => {
    if (status === 'CALLED') return 'called';
    if (status === 'IN_CONSULTATION') return 'in-consult';
    if (status === 'COMPLETED') return 'completed';
    if (status === 'SKIPPED') return 'skipped';
    return '';
  };

  return (
    <div className="doc-queue-page">
      <div>
        <h1 className="doc-queue-title">Patient Queue</h1>
        <p className="doc-queue-subtitle">Manage your patient queue for today</p>
      </div>

      {/* Stats */}
      <div className="dq-stats-row">
        {stats.map((stat, i) => (
          <div key={i} className="dq-stat">
            <div className="dq-stat-icon" style={{ backgroundColor: stat.bg }}>
              <stat.icon style={{ color: stat.color }} />
            </div>
            <div>
              <p className="dq-stat-value">{stat.value}</p>
              <p className="dq-stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="dq-actions-bar">
        <button onClick={handleCallNext} className="dq-action-btn call" disabled={waiting.length === 0}>
          <MdPlayArrow /> Call Next Patient
        </button>
        {currentEntry && currentEntry.status === 'CALLED' && (
          <button onClick={() => handleStart(currentEntry.id)} className="dq-action-btn start">
            <MdMedicalServices /> Start Consultation
          </button>
        )}
        {currentEntry && currentEntry.status === 'IN_CONSULTATION' && (
          <button onClick={() => handleComplete(currentEntry.id)} className="dq-action-btn complete">
            <MdCheckCircle /> Complete
          </button>
        )}
      </div>

      {/* Queue List */}
      <div className="dq-card">
        <div className="dq-card-header">
          <h2 className="dq-card-title">Today's Queue</h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{queueEntries.length} entries</span>
        </div>

        {queueEntries.length === 0 ? (
          <div className="dq-empty">
            <MdPeople />
            <p>No patients in queue today</p>
          </div>
        ) : (
          <div className="dq-queue-list">
            {queueEntries.map((entry) => (
              <div
                key={entry.id}
                className={`dq-queue-entry ${entry.status === 'CALLED' || entry.status === 'IN_CONSULTATION' ? 'active-entry' : ''}`}
              >
                <div className="dq-entry-left">
                  <div className={`dq-token ${getTokenClass(entry.status)}`}>
                    {entry.tokenNumber || '#'}
                  </div>
                  <div>
                    <p className="dq-entry-name">{entry.patientName || 'Patient'}</p>
                    <p className="dq-entry-sub">
                      {entry.startTime ? formatTime(entry.startTime) : ''} {entry.reason ? `• ${entry.reason}` : ''}
                    </p>
                  </div>
                </div>
                <div className="dq-entry-right">
                  <span className={`dq-entry-status ${entry.status}`}>
                    {entry.status?.replace(/_/g, ' ')}
                  </span>
                  {entry.status === 'WAITING' && (
                    <button onClick={() => handleSkip(entry.id)} className="dq-action-btn skip" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      <MdSkipNext /> Skip
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
