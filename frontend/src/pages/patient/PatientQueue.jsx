import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import queueService from '../../services/queueService';
import useWebSocket from '../../hooks/useWebSocket';
import { formatTime, formatWaitingTime, isToday } from '../../utils/dateUtils';
import {
  MdAccessTime,
  MdPeople,
  MdCheckCircle,
  MdHourglassTop,
  MdLocalHospital,
  MdRefresh,
  MdWifi,
  MdWifiOff,
} from 'react-icons/md';
import './PatientQueue.css';

export default function PatientQueue() {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // First get the patient's appointments to find which doctor queue to watch
      const aptRes = await appointmentService.getAll();
      const allApts = aptRes.data.data || [];
      setAppointments(allApts);

      // Look for checked-in or in-queue appointments, or completed ones from today
      const activeApt = allApts.find((apt) =>
        ['CHECKED_IN', 'IN_QUEUE', 'IN_CONSULTATION'].includes(apt.status) ||
        (apt.status === 'COMPLETED' && apt.appointmentDate && isToday(apt.appointmentDate))
      );

      if (activeApt) {
        // Try to get queue status
        try {
          const queueRes = await queueService.getByDoctor(activeApt.doctorId);
          const queueEntries = queueRes.data.data || [];
          const myEntry = queueEntries.find((q) => q.patientId === activeApt.patientId);

          if (myEntry) {
            const position = queueEntries
              .filter((q) => q.status === 'WAITING' && q.queueNumber < myEntry.queueNumber)
              .length + 1;

            setQueueData({
              ...myEntry,
              position,
              totalInQueue: queueEntries.filter((q) => q.status === 'WAITING').length,
              doctorName: activeApt.doctorName,
              departmentName: activeApt.departmentName,
              appointmentTime: activeApt.startTime,
            });
          }
        } catch {
          // Queue not found — patient might not be checked in yet
        }
      }
    } catch (err) {
      setError('Failed to load queue status');
    } finally {
      setLoading(false);
    }
  };

  // WebSocket for live updates
  const doctorId = queueData?.doctorId;
  const { data: wsData, connected } = useWebSocket(
    doctorId ? `/topic/queue/${doctorId}` : null,
    !!doctorId
  );

  // Update queue data when WebSocket message arrives
  useEffect(() => {
    if (wsData && Array.isArray(wsData) && queueData) {
      const myEntry = wsData.find((q) => q.patientId === queueData.patientId);
      if (myEntry) {
        const position = wsData
          .filter((q) => q.status === 'WAITING' && q.queueNumber < myEntry.queueNumber)
          .length + 1;

        setQueueData((prev) => ({
          ...prev,
          ...myEntry,
          position,
          totalInQueue: wsData.filter((q) => q.status === 'WAITING').length,
        }));
      }
    }
  }, [wsData]);

  if (loading) {
    return (
      <div className="pat-queue-loader-wrap">
        <div className="pat-queue-loader" />
      </div>
    );
  }

  // No active queue entry
  if (!queueData) {
    const checkedInApt = appointments.find((apt) =>
      ['CHECKED_IN', 'IN_QUEUE'].includes(apt.status)
    );

    return (
      <div className="pat-queue-page">
        <h1 className="pat-queue-title">Queue Status</h1>

        <div className="pat-queue-empty-state">
          <div className="pat-queue-empty-icon">
            <MdPeople />
          </div>
          <h3 className="pat-queue-empty-title">
            Not in Queue
          </h3>
          <p className="pat-queue-empty-desc">
            You're not currently in any queue. Check in at the reception desk or through your appointment to join a queue.
          </p>
        </div>

        {/* Pending appointments that can be checked in */}
        {appointments.filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status)).length > 0 && (
          <div className="pat-queue-pending-card">
            <div className="pat-queue-pending-header">
              <h3 className="pat-queue-pending-title">Pending Appointments</h3>
              <p className="pat-queue-pending-subtitle">
                Visit the reception to check in for your appointment
              </p>
            </div>
            <div className="pat-queue-pending-list">
              {appointments
                .filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status))
                .slice(0, 3)
                .map((apt) => (
                  <div key={apt.id} className="pat-queue-pending-item">
                    <div className="pat-queue-pending-icon">
                      <MdHourglassTop />
                    </div>
                    <div className="pat-queue-pending-info">
                      <p className="pat-queue-pending-name">
                        Dr. {apt.doctorName}
                      </p>
                      <p className="pat-queue-pending-time">
                        {apt.startTime && formatTime(apt.startTime)}
                      </p>
                    </div>
                    <span className="pat-queue-pending-badge">
                      {apt.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active queue — show position
  const statusConfig = {
    WAITING: { icon: MdHourglassTop, class: 'WAITING' },
    CALLED: { icon: MdAccessTime, class: 'CALLED' },
    IN_CONSULTATION: { icon: MdLocalHospital, class: 'IN_CONSULTATION' },
    COMPLETED: { icon: MdCheckCircle, class: 'COMPLETED' },
  };

  const currentStatus = statusConfig[queueData.status] || statusConfig.WAITING;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="pat-queue-page">
      <div className="pat-queue-header">
        <h1 className="pat-queue-title">Queue Status</h1>
        <div className="pat-queue-actions">
          {connected ? (
            <span className="pat-queue-status-badge live">
              <MdWifi />
              Live
            </span>
          ) : (
            <span className="pat-queue-status-badge offline">
              <MdWifiOff />
              Offline
            </span>
          )}
          <button
            onClick={fetchData}
            className="pat-queue-refresh-btn"
          >
            <MdRefresh />
          </button>
        </div>
      </div>

      {/* Queue Position Card */}
      <div className={`pat-queue-active-card ${currentStatus.class}`}>
        <StatusIcon className="pat-queue-active-icon" />

        {queueData.status === 'WAITING' ? (
          <>
            <p className="pat-queue-active-label">Your position in queue</p>
            <p className="pat-queue-active-main">{queueData.position}</p>
            <p className="pat-queue-active-desc">
              {queueData.position === 1
                ? "You're next!"
                : `${queueData.position - 1} patient${queueData.position - 1 > 1 ? 's' : ''} ahead of you`}
            </p>
          </>
        ) : queueData.status === 'CALLED' ? (
          <>
            <p className="pat-queue-active-title">You've Been Called!</p>
            <p className="pat-queue-active-desc">Please proceed to the doctor's room</p>
          </>
        ) : queueData.status === 'IN_CONSULTATION' ? (
          <>
            <p className="pat-queue-active-title">In Consultation</p>
            <p className="pat-queue-active-desc">With Dr. {queueData.doctorName}</p>
          </>
        ) : (
          <>
            <p className="pat-queue-active-title">Consultation Complete</p>
            <p className="pat-queue-active-desc">Thank you for your visit</p>
          </>
        )}
      </div>

      {/* Details Card */}
      <div className="pat-queue-details-card">
        <h3 className="pat-queue-details-title">Appointment Details</h3>
        <div className="pat-queue-details-list">
          <div className="pat-queue-details-row">
            <span className="pat-queue-details-label">Doctor</span>
            <span className="pat-queue-details-val">
              Dr. {queueData.doctorName}
            </span>
          </div>
          <div className="pat-queue-details-row">
            <span className="pat-queue-details-label">Department</span>
            <span className="pat-queue-details-val">
              {queueData.departmentName || '—'}
            </span>
          </div>
          <div className="pat-queue-details-row">
            <span className="pat-queue-details-label">Queue Number</span>
            <span className="pat-queue-details-val highlight-teal">#{queueData.queueNumber}</span>
          </div>
          {queueData.status === 'WAITING' && queueData.estimatedWaitingTime > 0 && (
            <div className="pat-queue-details-row">
              <span className="pat-queue-details-label">Estimated Wait</span>
              <span className="pat-queue-details-val highlight-amber">
                {formatWaitingTime(queueData.estimatedWaitingTime)}
              </span>
            </div>
          )}
          {queueData.appointmentTime && (
            <div className="pat-queue-details-row">
              <span className="pat-queue-details-label">Scheduled Time</span>
              <span className="pat-queue-details-val">
                {formatTime(queueData.appointmentTime)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
