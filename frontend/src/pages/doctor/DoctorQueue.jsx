import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import queueService from '../../services/queueService';
import doctorService from '../../services/doctorService';
import useWebSocket from '../../hooks/useWebSocket';
import { formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdPeople, MdPlayArrow, MdCheckCircle, MdSkipNext,
  MdMedicalServices, MdWifi, MdWifiOff,
  MdPerson, MdAccessTime, MdCalendarMonth, MdRefresh,
  MdNoMeetingRoom,
} from 'react-icons/md';
import './DoctorQueue.css';

export default function DoctorQueue() {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState(null);
  const [queueEntries, setQueueEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  // Resolve doctor profile from JWT-based endpoint first, else fall back to list lookup
  const resolveDoctorAndFetch = useCallback(async () => {
    setLoading(true);
    try {
      let docId = null;
      try {
        // Preferred: JWT-resolved doctor queue
        const res = await queueService.getMyDoctorQueue();
        const entries = res.data?.data || [];
        // Extract doctorId from the first entry or re-fetch profile
        if (entries.length > 0) {
          docId = entries[0].doctorId;
          setDoctorId(docId);
          setQueueEntries(entries);
          return;
        }
        // No entries yet — still need doctorId for WS subscription
        const docRes = await doctorService.getAll();
        const allDocs = docRes.data?.data || [];
        const me = allDocs.find((d) => d.userId === user?.id || d.email === user?.email);
        docId = me?.id || allDocs[0]?.id || null;
        setDoctorId(docId);
        setQueueEntries([]);
      } catch {
        // Fallback to list
        const docRes = await doctorService.getAll();
        const allDocs = docRes.data?.data || [];
        const me = allDocs.find((d) => d.userId === user?.id || d.email === user?.email) || allDocs[0];
        docId = me?.id;
        setDoctorId(docId);
        if (docId) {
          const qRes = await queueService.getByDoctor(docId);
          setQueueEntries(qRes.data?.data || []);
        }
      }
    } catch (err) {
      console.error('Doctor queue fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { resolveDoctorAndFetch(); }, [resolveDoctorAndFetch]);

  // WebSocket — live updates
  const { data: wsData, connected } = useWebSocket(
    doctorId ? `/topic/queue/${doctorId}` : null,
    !!doctorId
  );
  useEffect(() => {
    if (wsData && Array.isArray(wsData)) {
      setQueueEntries(wsData);
    }
  }, [wsData]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleCallNext = async () => {
    if (!doctorId) return;
    setActionLoading('callNext');
    try {
      await queueService.callNext({ doctorId });
      toast.success('Next patient called!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No waiting patients');
    } finally {
      setActionLoading('');
    }
  };

  const handleStart = async (queueId) => {
    setActionLoading(queueId + '-start');
    try {
      await queueService.startConsultation({ queueId });
      toast.success('Consultation started');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot start consultation');
    } finally {
      setActionLoading('');
    }
  };

  const handleComplete = async (queueId) => {
    setActionLoading(queueId + '-complete');
    try {
      await queueService.completeConsultation({ queueId });
      toast.success('Consultation completed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot complete consultation');
    } finally {
      setActionLoading('');
    }
  };

  const handleSkip = async (queueId) => {
    setActionLoading(queueId + '-skip');
    try {
      await queueService.skip({ queueId });
      toast('Patient skipped', { icon: '⏭️' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot skip patient');
    } finally {
      setActionLoading('');
    }
  };

  const handleNoShow = async (queueId) => {
    setActionLoading(queueId + '-noshow');
    try {
      await queueService.noShow({ queueId });
      toast('Patient marked as no-show', { icon: '❌' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot mark as no-show');
    } finally {
      setActionLoading('');
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const waiting = queueEntries.filter((e) => e.status === 'WAITING');
  const called = queueEntries.filter((e) => e.status === 'CALLED');
  const inConsult = queueEntries.filter((e) => e.status === 'IN_CONSULTATION');
  const completed = queueEntries.filter((e) => e.status === 'COMPLETED');
  const noShow = queueEntries.filter((e) => e.status === 'NO_SHOW' || e.status === 'SKIPPED');

  const currentEntry = called[0] || inConsult[0] || null;
  const hasActiveConsultation = inConsult.length > 0;
  const hasCalled = called.length > 0;

  const getStatusClass = (status) => {
    const map = {
      WAITING: '',
      CALLED: 'called',
      IN_CONSULTATION: 'in-consult',
      COMPLETED: 'completed',
      SKIPPED: 'skipped',
      NO_SHOW: 'skipped',
    };
    return map[status] || '';
  };

  if (loading) {
    return (
      <div className="doc-spinner-wrap">
        <div className="doc-spinner" />
      </div>
    );
  }

  return (
    <div className="doc-queue-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="dq-header">
        <div>
          <h1 className="doc-queue-title">Patient Queue</h1>
          <p className="doc-queue-subtitle">Manage your patient queue for today</p>
        </div>
        <div className="dq-header-right">
          {doctorId ? (
            connected ? (
              <span className="dq-live-badge"><MdWifi /> Live</span>
            ) : (
              <span className="dq-offline-badge"><MdWifiOff /> Reconnecting</span>
            )
          ) : null}
          <button onClick={resolveDoctorAndFetch} className="dq-refresh-btn" title="Refresh">
            <MdRefresh />
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="dq-stats-row">
        {[
          { label: 'Waiting', value: waiting.length, tone: 'waiting' },
          { label: 'Called', value: called.length, tone: 'called' },
          { label: 'In Consultation', value: inConsult.length, tone: 'consult' },
          { label: 'Completed', value: completed.length, tone: 'done' },
          { label: 'No-Show', value: noShow.length, tone: 'noshow' },
        ].map((s, i) => (
          <div key={i} className="dq-stat">
            <p className={`dq-stat-value ${s.tone}`}>{s.value}</p>
            <p className="dq-stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Current Patient Panel ───────────────────────────────────────── */}
      {currentEntry && (
        <div className={`dq-current-panel ${currentEntry.status === 'IN_CONSULTATION' ? 'in-consult' : 'called'}`}>
          <div className="dq-current-left">
            <div className="dq-current-avatar">
              {(currentEntry.patientName || 'P')[0].toUpperCase()}
            </div>
            <div>
              <p className="dq-current-label">
                {currentEntry.status === 'IN_CONSULTATION' ? '🩺 In Consultation' : '📞 Called'}
              </p>
              <p className="dq-current-name">{currentEntry.patientName || 'Patient'}</p>
              <p className="dq-current-sub">
                Queue #{currentEntry.queueNumber}
                {currentEntry.appointmentTime && ` · Appt: ${formatTime(currentEntry.appointmentTime)}`}
              </p>
            </div>
          </div>
          <div className="dq-current-actions">
            {hasCalled && (
              <button
                onClick={() => handleStart(currentEntry.id)}
                className="dq-action-btn start"
                disabled={actionLoading === currentEntry.id + '-start'}
              >
                <MdMedicalServices />
                {actionLoading === currentEntry.id + '-start' ? '...' : 'Start Consultation'}
              </button>
            )}
            {hasActiveConsultation && (
              <button
                onClick={() => handleComplete(currentEntry.id)}
                className="dq-action-btn complete"
                disabled={actionLoading === currentEntry.id + '-complete'}
              >
                <MdCheckCircle />
                {actionLoading === currentEntry.id + '-complete' ? '...' : 'Complete'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Primary Action Bar ──────────────────────────────────────────── */}
      <div className="dq-actions-bar">
        <button
          onClick={handleCallNext}
          className="dq-action-btn call"
          disabled={waiting.length === 0 || actionLoading === 'callNext' || hasCalled || hasActiveConsultation}
        >
          <MdPlayArrow />
          {actionLoading === 'callNext' ? 'Calling...' : `Call Next Patient${waiting.length > 0 ? ` (${waiting.length} waiting)` : ''}`}
        </button>
        {(hasCalled || hasActiveConsultation) && (
          <p className="dq-action-hint">
            Complete or skip the current patient before calling the next one.
          </p>
        )}
      </div>

      {/* ── Queue List ─────────────────────────────────────────────────── */}
      <div className="dq-card">
        <div className="dq-card-header">
          <h2 className="dq-card-title">Today's Queue</h2>
          <span className="dq-card-count">{queueEntries.length} entries</span>
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
                className={`dq-queue-entry ${['CALLED', 'IN_CONSULTATION'].includes(entry.status) ? 'active-entry' : ''}`}
              >
                <div className="dq-entry-left">
                  <div className={`dq-token ${getStatusClass(entry.status)}`}>
                    #{entry.queueNumber}
                  </div>
                  <div>
                    <p className="dq-entry-name">{entry.patientName || 'Patient'}</p>
                    <p className="dq-entry-sub">
                      {entry.appointmentTime && (
                        <><MdCalendarMonth /> {formatTime(entry.appointmentTime)} &nbsp;</>
                      )}
                      {entry.checkInTime && (
                        <><MdAccessTime /> Checked in {entry.checkInTime.substring(11, 16)}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="dq-entry-right">
                  <span className={`dq-entry-status ${entry.status}`}>
                    {entry.status.replace(/_/g, ' ')}
                  </span>
                  {/* Per-row actions for WAITING */}
                  {entry.status === 'WAITING' && (
                    <button
                      onClick={() => handleSkip(entry.id)}
                      className="dq-row-btn skip"
                      disabled={!!actionLoading}
                      title="Skip patient"
                    >
                      <MdSkipNext /> Skip
                    </button>
                  )}
                  {/* Per-row no-show for CALLED */}
                  {entry.status === 'CALLED' && (
                    <button
                      onClick={() => handleNoShow(entry.id)}
                      className="dq-row-btn noshow"
                      disabled={!!actionLoading}
                      title="Mark as no-show"
                    >
                      <MdNoMeetingRoom /> No-Show
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