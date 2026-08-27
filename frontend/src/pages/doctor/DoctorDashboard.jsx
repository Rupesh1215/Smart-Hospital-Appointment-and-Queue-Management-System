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

  useEffect(() => { fetchDoctorData(); }, [user]);

  const fetchDoctorData = async () => {
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
      setLoading(false);
    }
  };

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
      <div className="doc-skeleton-container">
        <div className="skeleton-box h-24" />
        <div className="doc-stats-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-box h-24" />)}
        </div>
      </div>
    );
  }

  const todayApts = appointments.filter((a) => a.appointmentDate && isToday(a.appointmentDate));
  const completedCount = todayApts.filter((a) => a.status === 'COMPLETED').length;
  const waitingCount = queue?.entries?.filter((e) => e.status === 'WAITING').length || 0;
  const currentToken = queue?.currentTokenNumber || 0;

  const stats = [
    { label: "Today's Appts", value: todayApts.length, icon: MdSchedule, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Waiting', value: waitingCount, icon: MdPeople, color: '#d97706', bg: '#fffbeb' },
    { label: 'Current Token', value: `#${currentToken}`, icon: MdMedicalServices, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Completed', value: completedCount, icon: MdCheckCircle, color: '#16a34a', bg: '#f0fdf4' },
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
        <button onClick={handleCallNext} className="doc-call-next-btn">
          <MdPlayArrow /> Call Next Patient
        </button>
      </div>

      {/* Stats */}
      <div className="doc-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="doc-stat-card">
            <div className="doc-stat-icon-wrap" style={{ backgroundColor: stat.bg }}>
              <stat.icon style={{ color: stat.color }} />
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
        <div className="doc-queue-card">
          <div className="doc-card-header">
            <h3 className="doc-card-title">Today's Queue</h3>
            <span className="doc-badge">{todayApts.length} total</span>
          </div>
          <div className="doc-queue-list">
            {todayApts.length === 0 ? (
              <p className="doc-queue-empty">No appointments today.</p>
            ) : (
              todayApts.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className={`doc-queue-item ${selectedAppointment?.id === apt.id ? 'active' : ''}`}
                >
                  <div className="doc-queue-item-row">
                    <span className="doc-queue-item-name">{apt.patientName || 'Patient'}</span>
                    <span className="doc-token-badge">
                      #{apt.tokenNumber || 1}
                    </span>
                  </div>
                  <div className="doc-queue-item-info">
                    <span>{apt.timeSlot || '09:00 AM'}</span>
                    <span className="doc-queue-status">{apt.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Consultation Form */}
        <div className="doc-consult-card">
          <h3 className="doc-consult-header">
            <MdMedicalServices />
            Patient Consultation
          </h3>

          {selectedAppointment ? (
            <form onSubmit={handleSaveConsultation} className="doc-consult-form">
              {/* Patient Info */}
              <div className="doc-patient-info">
                <div className="doc-info-block">
                  <p>Patient</p>
                  <p>{selectedAppointment.patientName || 'Patient'}</p>
                </div>
                <div className="doc-info-block normal">
                  <p>Reason</p>
                  <p>{selectedAppointment.reason || 'General Checkup'}</p>
                </div>
                <div className="doc-info-block token">
                  <p>Token</p>
                  <p>#{selectedAppointment.tokenNumber || 1}</p>
                </div>
              </div>

              <div className="doc-form-group">
                <label className="label">Diagnosis</label>
                <textarea rows={2} required value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Bronchitis, Mild Hypertension..." className="textarea" />
              </div>
              <div className="doc-form-group">
                <label className="label">Prescription</label>
                <textarea rows={3} required value={prescription} onChange={(e) => setPrescription(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg - twice daily for 5 days" className="textarea" />
              </div>
              <div className="doc-form-group">
                <label className="label">Notes</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Follow-up instructions..." className="textarea" />
              </div>

              <div className="doc-form-actions">
                <button type="button" onClick={() => setSelectedAppointment(null)} className="btn btn-secondary cursor-pointer">Cancel</button>
                <button type="submit" disabled={savingConsultation} className="btn btn-primary cursor-pointer">
                  <MdSend />
                  {savingConsultation ? 'Saving...' : 'Complete Consultation'}
                </button>
              </div>
            </form>
          ) : (
            <div className="doc-no-patient">
              <MdPerson />
              <p>No Patient Selected</p>
              <p>Select an appointment from the queue to start consultation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
