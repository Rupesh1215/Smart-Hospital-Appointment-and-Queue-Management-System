import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import queueService from '../../services/queueService';
import consultationService from '../../services/consultationService';
import doctorService from '../../services/doctorService';
import { formatTime, isToday } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdPeople, MdCheckCircle, MdPlayArrow, MdMedicalServices,
  MdSchedule, MdPerson, MdSend,
} from 'react-icons/md';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [savingConsultation, setSavingConsultation] = useState(false);

  const fetchDoctorData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const docsRes = await doctorService.getAll();
      const allDocs = docsRes.data?.data || [];
      const currentDoc = allDocs.find((d) => d.email === user?.email || d.userId === user?.id) || allDocs[0];
      setDoctorProfile(currentDoc);
      if (currentDoc?.id) {
        const [aptRes, qRes] = await Promise.all([
          appointmentService.getByDoctor(currentDoc.id),
          queueService.getByDoctor(currentDoc.id),
        ]);
        setAppointments(aptRes.data?.data || []);
        setQueue(qRes.data?.data || null);
      }
    } catch (err) {
      console.error('Error fetching doctor dashboard data:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData(false);
    const interval = setInterval(() => {
      fetchDoctorData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const handleCallNext = async () => {
    if (!doctorProfile?.id) return;
    try {
      const res = await queueService.callNext(doctorProfile.id);
      setQueue(res.data?.data);
      toast.success('Next patient called!');
    } catch (err) {
      toast.error('No patients waiting in queue.');
    }
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setSavingConsultation(true);
    try {
      await consultationService.save({
        appointmentId: selectedAppointment.id,
        doctorId: doctorProfile?.id,
        patientId: selectedAppointment.patientId,
        diagnosis, prescription, notes,
      });
      toast.success('Consultation saved & appointment completed!');
      setSelectedAppointment(null);
      setDiagnosis(''); setPrescription(''); setNotes('');
      fetchDoctorData();
    } catch (err) {
      toast.error('Failed to save consultation.');
    } finally {
      setSavingConsultation(false);
    }
  };

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

  const todayApts = appointments.filter((a) => a.appointmentDate && isToday(a.appointmentDate));
  const completedCount = todayApts.filter((a) => a.status === 'COMPLETED').length;
  const waitingCount = Array.isArray(queue) ? queue.filter((e) => e.status === 'WAITING').length : 0;
  const currentEntry = Array.isArray(queue) ? queue.find((e) => e.status === 'CALLED' || e.status === 'IN_CONSULTATION') : null;
  const currentToken = currentEntry ? currentEntry.queueNumber : 0;

  const stats = [
    { label: "Today's Appts", value: todayApts.length, icon: MdSchedule, colorClass: 'stat-blue' },
    { label: 'Patients Waiting', value: waitingCount, icon: MdPeople, colorClass: 'stat-amber' },
    { label: 'Current Token', value: currentToken ? `#${currentToken}` : 'None', icon: MdMedicalServices, colorClass: 'stat-indigo' },
    { label: 'Completed', value: completedCount, icon: MdCheckCircle, colorClass: 'stat-emerald' },
  ];

  return (
    <div className="doctor-dashboard">
      {/* Header */}
      <div className="doc-header">
        <div>
          <p className="doc-header-subtitle">Doctor Portal</p>
          <h1 className="doc-header-title">Welcome back, Dr. {user?.name || 'Doctor'}</h1>
          <p className="doc-header-info">
            {doctorProfile?.departmentName || 'General Medicine'} • {doctorProfile?.specialization || 'Consultant'}
          </p>
        </div>
        <button onClick={handleCallNext} className="btn btn-teal btn-md shadow-sm">
          <MdPlayArrow /> Call Next Patient
        </button>
      </div>

      {/* Stats */}
      <div className="doc-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="doc-stat-card">
            <div className={`doc-stat-icon ${stat.colorClass}`}>
              <stat.icon />
            </div>
            <div>
              <p className="doc-stat-val">{stat.value}</p>
              <p className="doc-stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Queue + Consultation */}
      <div className="doc-main-grid">
        {/* Queue */}
        <div className="card doc-queue-card">
          <div className="doc-card-header">
            <h3 className="text-card-title">Today's Queue</h3>
            <span className="badge badge-neutral">{todayApts.length} total</span>
          </div>
          <div className="doc-queue-list">
            {todayApts.length === 0 ? (
              <p className="doc-queue-empty">No appointments scheduled today.</p>
            ) : (
              todayApts.map((apt) => {
                const qEntry = Array.isArray(queue) ? queue.find(q => q.appointmentId === apt.id) : null;
                const tokenNum = qEntry ? qEntry.queueNumber : '-';
                return (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className={`doc-queue-item ${selectedAppointment?.id === apt.id ? 'active' : ''}`}
                >
                  <div className="doc-queue-item-row">
                    <span className="doc-queue-item-name">{apt.patientName || 'Patient'}</span>
                    <span className="badge badge-primary text-xs font-bold">
                      #{tokenNum}
                    </span>
                  </div>
                  <div className="doc-queue-item-info">
                    <span>{apt.startTime ? formatTime(apt.startTime) : '09:00 AM'}</span>
                    <span className="doc-queue-status">{apt.status}</span>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

        {/* Consultation Form */}
        <div className="card doc-consult-card">
          <h3 className="text-card-title flex items-center gap-2 mb-4">
            <MdMedicalServices className="text-primary-600" />
            Patient Consultation & Prescription
          </h3>

          {selectedAppointment ? (
            <form onSubmit={handleSaveConsultation} className="doc-consult-form">
              <div className="doc-patient-info">
                <div className="doc-info-block">
                  <p>Patient Name</p>
                  <p>{selectedAppointment.patientName || 'Patient'}</p>
                </div>
                <div className="doc-info-block normal">
                  <p>Chief Complaint</p>
                  <p>{selectedAppointment.reason || 'General Checkup'}</p>
                </div>
                <div className="doc-info-block token">
                  <p>Token</p>
                  <p>#{Array.isArray(queue) && queue.find(q => q.appointmentId === selectedAppointment.id)?.queueNumber || '-'}</p>
                </div>
              </div>

              <div className="form-group">
                <label className="label font-semibold text-xs text-main">Diagnosis</label>
                <textarea rows={2} required value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Clinical diagnosis, symptoms, or observations..." className="textarea input-wrapper" />
              </div>
              <div className="form-group">
                <label className="label font-semibold text-xs text-main">Prescription Medications</label>
                <textarea rows={3} required value={prescription} onChange={(e) => setPrescription(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg - 1 tab after food (TID x 5 days)" className="textarea input-wrapper" />
              </div>
              <div className="form-group">
                <label className="label font-semibold text-xs text-main">Follow-up Notes & Advice</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional lifestyle advice or follow-up date..." className="textarea input-wrapper" />
              </div>

              <div className="doc-form-actions">
                <button type="button" onClick={() => setSelectedAppointment(null)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={savingConsultation} className="btn btn-primary btn-sm">
                  <MdSend />
                  {savingConsultation ? 'Saving...' : 'Complete Consultation'}
                </button>
              </div>
            </form>
          ) : (
            <div className="doc-no-patient">
              <MdPerson />
              <p className="font-semibold text-main">No Patient Selected</p>
              <p className="text-xs text-sub">Select an appointment from the queue to start a consultation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
