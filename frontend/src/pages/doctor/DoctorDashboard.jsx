import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import queueService from '../../services/queueService';
import consultationService from '../../services/consultationService';
import doctorService from '../../services/doctorService';
import feedbackService from '../../services/feedbackService';
import capacityService from '../../services/capacityService';
import { formatTime, isToday } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdPeople, MdCheckCircle, MdPlayArrow, MdMedicalServices,
  MdSchedule, MdPerson, MdSend, MdStar, MdAddAlert,
} from 'react-icons/md';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [capacityRequests, setCapacityRequests] = useState([]);
  const [extraSlotsInput, setExtraSlotsInput] = useState(5);
  const [extraSlotsMsg, setExtraSlotsMsg] = useState('Willing to accept extra consultations today.');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submittingReq, setSubmittingReq] = useState(false);
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
        const [aptRes, qRes, fbRes, reqRes] = await Promise.all([
          appointmentService.getByDoctor(currentDoc.id),
          queueService.getByDoctor(currentDoc.id),
          feedbackService.getByDoctor(currentDoc.id).catch(() => ({ data: { data: [] } })),
          capacityService.getRequests(currentDoc.id).catch(() => ({ data: { data: [] } })),
        ]);
        setAppointments(aptRes.data?.data || []);
        setQueue(qRes.data?.data || null);
        setFeedbacks(fbRes.data?.data || []);
        setCapacityRequests(reqRes.data?.data || []);
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

  const handleSendExtraCapacityRequest = async (e) => {
    e.preventDefault();
    if (!doctorProfile?.id) return;
    setSubmittingReq(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await capacityService.submitExtraCapacityRequest(
        doctorProfile.id,
        todayStr,
        extraSlotsInput,
        extraSlotsMsg
      );
      toast.success(`Extra capacity request (+${extraSlotsInput} slots) sent to Receptionist!`);
      setShowRequestModal(false);
      fetchDoctorData(true);
    } catch (err) {
      toast.error('Failed to submit extra capacity request.');
    } finally {
      setSubmittingReq(false);
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn btn-secondary btn-md shadow-sm"
            style={{ background: '#4F46E5', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}
          >
            <MdAddAlert /> Request Extra Capacity
          </button>
          <button onClick={handleCallNext} className="btn btn-teal btn-md shadow-sm">
            <MdPlayArrow /> Call Next Patient
          </button>
        </div>
      </div>

      {/* Extra Capacity Request Modal */}
      {showRequestModal && (
        <div className="rb-modal-overlay">
          <div className="rb-modal-card">
            <button className="rb-close-btn" onClick={() => setShowRequestModal(false)}>×</button>
            <div className="rb-header">
              <div className="rb-badge-icon">⚡</div>
              <h3>Request Extra Patient Capacity</h3>
              <p>Notify receptionist if you are willing to take additional walk-in or online consultations today.</p>
            </div>
            <form onSubmit={handleSendExtraCapacityRequest} className="rb-body">
              <div className="rb-input-group">
                <label>Additional Patients Willing to Consult Today:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={extraSlotsInput}
                  onChange={(e) => setExtraSlotsInput(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="rb-input-group">
                <label>Message / Note to Receptionist:</label>
                <textarea
                  rows="3"
                  value={extraSlotsMsg}
                  onChange={(e) => setExtraSlotsMsg(e.target.value)}
                  style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.6rem', fontSize: '0.85rem' }}
                />
              </div>
              <div className="rb-actions">
                <button type="button" className="rb-btn-cancel" onClick={() => setShowRequestModal(false)}>Cancel</button>
                <button type="submit" className="rb-btn-submit" disabled={submittingReq}>
                  {submittingReq ? 'Sending...' : 'Send Request to Receptionist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Patient Feedback & Ratings Section */}
      <div className="card mt-6" style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.875rem' }}>
          <div>
            <h3 className="text-card-title flex items-center gap-2" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A' }}>
              <MdStar style={{ color: '#F59E0B', fontSize: '1.4rem' }} />
              Patient Feedback & Ratings
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Reviews and satisfaction ratings submitted by your patients</p>
          </div>
          <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', padding: '0.5rem 1rem', borderRadius: '12px', textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#92400E' }}>
              ⭐ {(doctorProfile?.rating || 5.0).toFixed(1)} / 5.0
            </span>
            <p style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: '600' }}>
              Based on {doctorProfile?.totalRatings || feedbacks.length || 0} reviews
            </p>
          </div>
        </div>

        {feedbacks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8' }}>
            <MdStar style={{ fontSize: '2.5rem', color: '#CBD5E1', margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: '600', color: '#475569' }}>No patient feedback received yet.</p>
            <p style={{ fontSize: '0.8rem' }}>When patients complete consultations and rate your care, reviews will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {feedbacks.map((fb) => (
              <div key={fb.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1E293B' }}>{fb.patientName || 'Patient'}</span>
                  <span style={{ fontSize: '1.4rem' }}>{fb.emoji || '😄'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <MdStar key={s} style={{ color: s <= fb.rating ? '#F59E0B' : '#CBD5E1', fontSize: '1rem' }} />
                  ))}
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginLeft: '0.3rem' }}>
                    {fb.rating} / 5
                  </span>
                </div>
                {fb.comment && (
                  <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                    "{fb.comment}"
                  </p>
                )}
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', alignSelf: 'flex-end' }}>
                  {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
