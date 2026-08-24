import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import queueService from '../../services/queueService';
import useWebSocket from '../../hooks/useWebSocket';
import { formatTime, formatWaitingTime } from '../../utils/dateUtils';
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

      // Look for checked-in or in-queue appointments
      const activeApt = allApts.find((apt) =>
        ['CHECKED_IN', 'IN_QUEUE', 'IN_CONSULTATION'].includes(apt.status)
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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No active queue entry
  if (!queueData) {
    const checkedInApt = appointments.find((apt) =>
      ['CHECKED_IN', 'IN_QUEUE'].includes(apt.status)
    );

    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900">Queue Status</h1>

        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-50 flex items-center justify-center">
            <MdPeople className="text-4xl text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Not in Queue
          </h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            You're not currently in any queue. Check in at the reception desk or through your appointment to join a queue.
          </p>
        </div>

        {/* Pending appointments that can be checked in */}
        {appointments.filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status)).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Pending Appointments</h3>
              <p className="text-xs text-slate-500 mt-1">
                Visit the reception to check in for your appointment
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {appointments
                .filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status))
                .slice(0, 3)
                .map((apt) => (
                  <div key={apt.id} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <MdHourglassTop className="text-lg text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        Dr. {apt.doctorName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {apt.startTime && formatTime(apt.startTime)}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
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
    WAITING: { icon: MdHourglassTop, label: 'Waiting', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600' },
    CALLED: { icon: MdAccessTime, label: 'Called - Please proceed', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    IN_CONSULTATION: { icon: MdLocalHospital, label: 'In Consultation', color: 'from-teal-500 to-teal-600', bg: 'bg-teal-50', text: 'text-teal-600' },
    COMPLETED: { icon: MdCheckCircle, label: 'Completed', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  };

  const currentStatus = statusConfig[queueData.status] || statusConfig.WAITING;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Queue Status</h1>
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <MdWifi className="text-sm" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              <MdWifiOff className="text-sm" />
              Offline
            </span>
          )}
          <button
            onClick={fetchData}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MdRefresh className="text-lg" />
          </button>
        </div>
      </div>

      {/* Queue Position Card */}
      <div className={`bg-gradient-to-br ${currentStatus.color} rounded-2xl p-8 text-white text-center shadow-lg`}>
        <StatusIcon className="text-5xl mx-auto mb-4 opacity-90" />

        {queueData.status === 'WAITING' ? (
          <>
            <p className="text-white/80 text-sm mb-2">Your position in queue</p>
            <p className="text-6xl font-bold mb-2">{queueData.position}</p>
            <p className="text-white/80 text-sm">
              {queueData.position === 1
                ? "You're next!"
                : `${queueData.position - 1} patient${queueData.position - 1 > 1 ? 's' : ''} ahead of you`}
            </p>
          </>
        ) : queueData.status === 'CALLED' ? (
          <>
            <p className="text-2xl font-bold mb-2">You've Been Called!</p>
            <p className="text-white/80 text-sm">Please proceed to the doctor's room</p>
          </>
        ) : queueData.status === 'IN_CONSULTATION' ? (
          <>
            <p className="text-2xl font-bold mb-2">In Consultation</p>
            <p className="text-white/80 text-sm">With Dr. {queueData.doctorName}</p>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold mb-2">Consultation Complete</p>
            <p className="text-white/80 text-sm">Thank you for your visit</p>
          </>
        )}
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Appointment Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500">Doctor</span>
            <span className="text-sm font-medium text-slate-900">
              Dr. {queueData.doctorName}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500">Department</span>
            <span className="text-sm font-medium text-slate-900">
              {queueData.departmentName || '—'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500">Queue Number</span>
            <span className="text-sm font-semibold text-teal-600">#{queueData.queueNumber}</span>
          </div>
          {queueData.status === 'WAITING' && queueData.estimatedWaitingTime > 0 && (
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Estimated Wait</span>
              <span className="text-sm font-medium text-amber-600">
                {formatWaitingTime(queueData.estimatedWaitingTime)}
              </span>
            </div>
          )}
          {queueData.appointmentTime && (
            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-500">Scheduled Time</span>
              <span className="text-sm font-medium text-slate-900">
                {formatTime(queueData.appointmentTime)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
