import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import queueService from '../../services/queueService';
import useWebSocket from '../../hooks/useWebSocket';
import { formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdLocalHospital,
  MdPeople,
  MdHourglassTop,
  MdCheckCircle,
  MdPhoneCallback,
  MdMedicalServices,
  MdRefresh,
  MdWifi,
  MdWifiOff,
  MdAccessTime,
  MdBusiness,
  MdCalendarMonth,
} from 'react-icons/md';
import './PatientQueue.css';

const STATUS_CONFIG = {
  WAITING: {
    label: 'Waiting',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FCD34D',
    icon: MdHourglassTop,
    message: null,
  },
  CALLED: {
    label: 'Called — Please Proceed',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#93C5FD',
    icon: MdPhoneCallback,
    message: '🔔 Doctor has called you. Please proceed to the consultation room now.',
  },
  IN_CONSULTATION: {
    label: 'In Consultation',
    color: '#0D9488',
    bg: '#F0FDFA',
    border: '#5EEAD4',
    icon: MdMedicalServices,
    message: '🩺 Your consultation is in progress. Please wait for the doctor.',
  },
  COMPLETED: {
    label: 'Consultation Completed',
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#86EFAC',
    icon: MdCheckCircle,
    message: '✅ Your consultation is complete. Thank you for visiting us!',
  },
  SKIPPED: {
    label: 'Skipped',
    color: '#6B7280',
    bg: '#F9FAFB',
    border: '#D1D5DB',
    icon: MdPeople,
    message: '⚠️ You were skipped. Please contact the reception desk.',
  },
  NO_SHOW: {
    label: 'Marked No-Show',
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FCA5A5',
    icon: MdPeople,
    message: '❌ You were marked as a no-show. Please contact reception to reschedule.',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#6B7280',
    bg: '#F9FAFB',
    border: '#D1D5DB',
    icon: MdPeople,
    message: '⚠️ Queue entry was cancelled.',
  },
};

export default function PatientQueue() {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevStatusRef = useRef(null);

  const fetchQueue = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await queueService.getMyQueue();
      const entry = res.data?.data || null;

      setError(null);

      if (entry) {
        const prevStatus = prevStatusRef.current;
        const newStatus = entry.status;

        setQueueData(entry);
        prevStatusRef.current = newStatus;

        if (prevStatus && prevStatus !== newStatus) {
          if (newStatus === 'CALLED') {
            toast('🔔 Doctor has called you! Please proceed to the consultation room.', {
              duration: 6000,
              style: { background: '#1D4ED8', color: '#fff', fontWeight: '600' },
            });
          } else if (newStatus === 'IN_CONSULTATION') {
            toast('🩺 Your consultation has started.', {
              duration: 4000,
              style: { background: '#0F766E', color: '#fff' },
            });
          } else if (newStatus === 'COMPLETED') {
            toast.success('✅ Your consultation is complete!', { duration: 5000 });
          }
        }
      } else {
        setQueueData(null);
        prevStatusRef.current = null;
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError(null);
      } else if (!isBackground) {
        setError('Unable to load your queue status.');
      }
      setQueueData(null);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Initial fetch + periodic background polling (every 3 seconds)
  useEffect(() => {
    fetchQueue(false);
    const interval = setInterval(() => {
      fetchQueue(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket — subscribe to the doctor's queue topic once we know the doctorId
  const doctorId = queueData?.doctorId;
  const { data: wsData, connected } = useWebSocket(
    doctorId ? `/topic/queue/${doctorId}` : null,
    !!doctorId
  );

  // Handle live WS update — find our entry in the broadcast list
  useEffect(() => {
    if (!wsData || !Array.isArray(wsData)) return;

    const myEntry = wsData.find(
      (q) => (queueData?.id && q.id === queueData.id) ||
             (queueData?.patientId && q.patientId === queueData.patientId)
    );

    if (myEntry) {
      const prevStatus = prevStatusRef.current;
      const newStatus = myEntry.status;

      setQueueData((prev) => ({ ...prev, ...myEntry }));
      prevStatusRef.current = newStatus;

      // Toast notifications on significant status changes
      if (prevStatus && prevStatus !== newStatus) {
        if (newStatus === 'CALLED') {
          toast('🔔 Doctor has called you! Please proceed to the consultation room.', {
            duration: 6000,
            style: { background: '#1D4ED8', color: '#fff', fontWeight: '600' },
          });
        } else if (newStatus === 'IN_CONSULTATION') {
          toast('🩺 Your consultation has started.', {
            duration: 4000,
            style: { background: '#0F766E', color: '#fff' },
          });
        } else if (newStatus === 'COMPLETED') {
          toast.success('✅ Your consultation is complete!', { duration: 5000 });
        } else if (newStatus === 'WAITING' && prevStatus) {
          const pos = (myEntry.patientsAhead || 0) + 1;
          toast(`You are now #${pos} in the queue.`, {
            duration: 3000,
            icon: '📋',
          });
        }
      }
    } else {
      // Re-fetch in background if not found in list
      fetchQueue(true);
    }
  }, [wsData]);

  if (loading) {
    return (
      <div className="pat-queue-loader-wrap">
        <div className="pat-queue-loader" />
      </div>
    );
  }

  const config = queueData ? (STATUS_CONFIG[queueData.status] || STATUS_CONFIG.WAITING) : null;
  const StatusIcon = config?.icon || MdHourglassTop;

  return (
    <div className="pat-queue-page">
      {/* Header */}
      <div className="pat-queue-header">
        <div>
          <h1 className="pat-queue-title">Queue Status</h1>
          <p className="pat-queue-subtitle">Your real-time position in today's queue</p>
        </div>
        <div className="pat-queue-actions">
          {doctorId ? (
            connected ? (
              <span className="pat-queue-status-badge live"><MdWifi /> Live</span>
            ) : (
              <span className="pat-queue-status-badge offline"><MdWifiOff /> Reconnecting</span>
            )
          ) : null}
          <button onClick={fetchQueue} className="pat-queue-refresh-btn" title="Refresh"><MdRefresh /></button>
        </div>
      </div>

      {error && (
        <div className="pat-queue-error">{error}</div>
      )}

      {!queueData ? (
        /* Empty state — not currently in queue */
        <div className="pat-queue-empty-state">
          <div className="pat-queue-empty-icon"><MdPeople /></div>
          <h3 className="pat-queue-empty-title">Not In Queue Today</h3>
          <p className="pat-queue-empty-desc">
            You don't have an active queue entry for today. If you have an appointment, please
            check in at the reception desk to receive a queue number.
          </p>
        </div>
      ) : (
        <>
          {/* Status alert banner for actionable statuses */}
          {config?.message && (
            <div
              className="pat-queue-alert-banner"
              style={{ background: config.bg, border: `1.5px solid ${config.border}`, color: config.color }}
            >
              {config.message}
            </div>
          )}

          {/* Main position card */}
          <div
            className={`pat-queue-active-card ${queueData.status}`}
            style={{ borderColor: config.border }}
          >
            <StatusIcon className="pat-queue-active-icon" style={{ color: config.color }} />

            {queueData.status === 'WAITING' && (
              <>
                <p className="pat-queue-active-label">Your Queue Position</p>
                <p className="pat-queue-active-main" style={{ color: config.color }}>
                  #{queueData.queueNumber}
                </p>
                <p className="pat-queue-active-desc">
                  {queueData.patientsAhead === 0
                    ? "You're next! Please stand by."
                    : `${queueData.patientsAhead} patient${queueData.patientsAhead > 1 ? 's' : ''} ahead of you`}
                </p>
              </>
            )}

            {queueData.status === 'CALLED' && (
              <>
                <p className="pat-queue-active-label">It's Your Turn!</p>
                <p className="pat-queue-active-main" style={{ color: config.color }}>NOW</p>
                <p className="pat-queue-active-desc">Please proceed to the consultation room</p>
              </>
            )}

            {queueData.status === 'IN_CONSULTATION' && (
              <>
                <p className="pat-queue-active-label">Consultation in Progress</p>
                <p className="pat-queue-active-main" style={{ color: config.color }}>🩺</p>
                <p className="pat-queue-active-desc">You are currently with the doctor</p>
              </>
            )}

            {queueData.status === 'COMPLETED' && (
              <>
                <p className="pat-queue-active-label">Consultation Complete</p>
                <p className="pat-queue-active-main" style={{ color: config.color }}>✓</p>
                <p className="pat-queue-active-desc">Thank you for visiting SmartHospital</p>
              </>
            )}

            {['SKIPPED', 'NO_SHOW', 'CANCELLED'].includes(queueData.status) && (
              <>
                <p className="pat-queue-active-label">Queue Status</p>
                <p className="pat-queue-active-main" style={{ color: config.color, fontSize: '1.5rem' }}>
                  {config.label}
                </p>
                <p className="pat-queue-active-desc">Please contact the reception desk</p>
              </>
            )}
          </div>

          {/* Details card */}
          <div className="pat-queue-details-card">
            <h3 className="pat-queue-details-title">Appointment Details</h3>
            <div className="pat-queue-details-list">
              {queueData.doctorName && (
                <div className="pat-queue-details-row">
                  <span className="pat-queue-details-label"><MdLocalHospital /> Doctor</span>
                  <span className="pat-queue-details-val">Dr. {queueData.doctorName}</span>
                </div>
              )}
              {queueData.departmentName && (
                <div className="pat-queue-details-row">
                  <span className="pat-queue-details-label"><MdBusiness /> Department</span>
                  <span className="pat-queue-details-val">{queueData.departmentName}</span>
                </div>
              )}
              <div className="pat-queue-details-row">
                <span className="pat-queue-details-label"><MdCalendarMonth /> Scheduled</span>
                <span className="pat-queue-details-val">
                  {queueData.appointmentTime ? formatTime(queueData.appointmentTime) : '—'}
                </span>
              </div>
              {queueData.checkInTime && (
                <div className="pat-queue-details-row">
                  <span className="pat-queue-details-label"><MdAccessTime /> Checked In</span>
                  <span className="pat-queue-details-val">
                    {formatTime(queueData.checkInTime.substring(11, 16))}
                  </span>
                </div>
              )}
              <div className="pat-queue-details-row">
                <span className="pat-queue-details-label"><MdPeople /> Queue Token</span>
                <span className="pat-queue-details-val highlight-teal">#{queueData.queueNumber}</span>
              </div>
              {queueData.status === 'WAITING' && (
                <div className="pat-queue-details-row">
                  <span className="pat-queue-details-label"><MdPeople /> Patients Ahead</span>
                  <span className="pat-queue-details-val highlight-amber">
                    {queueData.patientsAhead}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
