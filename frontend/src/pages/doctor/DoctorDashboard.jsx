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
      <div className="space-y-6">
        <div className="skeleton h-24 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const todayApts = appointments.filter((a) => a.appointmentDate && isToday(a.appointmentDate));
  const completedCount = todayApts.filter((a) => a.status === 'COMPLETED').length;
  const waitingCount = queue?.entries?.filter((e) => e.status === 'WAITING').length || 0;
  const currentToken = queue?.currentTokenNumber || 0;

  const stats = [
    { label: "Today's Appts", value: todayApts.length, icon: MdSchedule, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Waiting', value: waitingCount, icon: MdPeople, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Current Token', value: `#${currentToken}`, icon: MdMedicalServices, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Completed', value: completedCount, icon: MdCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#2563eb] rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Doctor Portal</p>
          <h1 className="text-xl font-bold">Welcome back, Dr. {user?.name || 'Doctor'}</h1>
          <p className="text-blue-200 text-sm mt-0.5">
            {doctorProfile?.departmentName || 'General Medicine'} • {doctorProfile?.specialization || 'Consultant'}
          </p>
        </div>
        <button
          onClick={handleCallNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#2563eb] font-semibold rounded-lg hover:bg-blue-50 transition-colors cursor-pointer text-sm self-start"
        >
          <MdPlayArrow className="text-xl" /> Call Next Patient
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`text-xl ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Queue + Consultation */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Queue */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Today's Queue</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{todayApts.length} total</span>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px]">
            {todayApts.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No appointments today.</p>
            ) : (
              todayApts.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedAppointment?.id === apt.id
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-200 hover:border-blue-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 text-sm">{apt.patientName || 'Patient'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                      #{apt.tokenNumber || 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
                    <span>{apt.timeSlot || '09:00 AM'}</span>
                    <span className="capitalize font-medium text-blue-600">{apt.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Consultation Form */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MdMedicalServices className="text-blue-600" />
            Patient Consultation
          </h3>

          {selectedAppointment ? (
            <form onSubmit={handleSaveConsultation} className="space-y-4">
              {/* Patient Info */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Patient</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedAppointment.patientName || 'Patient'}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Reason</p>
                  <p className="text-sm text-slate-700">{selectedAppointment.reason || 'General Checkup'}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Token</p>
                  <p className="text-sm font-bold text-blue-700">#{selectedAppointment.tokenNumber || 1}</p>
                </div>
              </div>

              <div>
                <label className="label">Diagnosis</label>
                <textarea rows={2} required value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Bronchitis, Mild Hypertension..." className="textarea" />
              </div>
              <div>
                <label className="label">Prescription</label>
                <textarea rows={3} required value={prescription} onChange={(e) => setPrescription(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg - twice daily for 5 days" className="textarea" />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Follow-up instructions..." className="textarea" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedAppointment(null)} className="btn btn-secondary cursor-pointer">Cancel</button>
                <button type="submit" disabled={savingConsultation} className="btn btn-primary cursor-pointer">
                  <MdSend className="text-lg" />
                  {savingConsultation ? 'Saving...' : 'Complete Consultation'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
              <MdPerson className="text-4xl mx-auto text-slate-300 mb-2" />
              <p className="text-slate-600 font-medium text-sm">No Patient Selected</p>
              <p className="text-slate-400 text-xs mt-1">Select an appointment from the queue to start consultation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
