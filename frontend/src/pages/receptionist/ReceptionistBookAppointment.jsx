import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import doctorService from '../../services/doctorService';
import departmentService from '../../services/departmentService';
import appointmentService from '../../services/appointmentService';
import { formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdSearch, MdLocalHospital, MdArrowBack, MdArrowForward,
  MdCheckCircle, MdPerson, MdCalendarMonth,
} from 'react-icons/md';
import './ReceptionistAppointments.css';

const DEPT_ICONS = {
  Cardiology: '❤️', Neurology: '🧠', Orthopedics: '🦴', Dermatology: '🌿',
  'General Medicine': '🏥', Pediatrics: '👶', ENT: '👂', Ophthalmology: '👁️',
  Psychiatry: '🧩', Oncology: '🔬', Radiology: '📡', Gynecology: '🌸',
};

export default function ReceptionistBookAppointment() {
  const navigate = useNavigate();

  // Step: 0=select patient, 1=select dept, 2=select doctor, 3=pick slot, 4=confirm
  const [step, setStep] = useState(0);

  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes, deptsRes] = await Promise.all([
        api.get('/patients'),
        doctorService.getAll(),
        departmentService.getAll(),
      ]);
      setPatients(patientsRes.data?.data || []);
      setDoctors(doctorsRes.data?.data || []);
      setDepartments(deptsRes.data?.data || []);
    } catch {
      toast.error('Failed to load data from server');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (doctorId, date) => {
    setSlotsLoading(true);
    try {
      const res = await doctorService.getSlots(doctorId, date);
      setSlots(res.data?.data || []);
    } catch {
      toast.error('Failed to load available slots');
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setStep(1);
  };

  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    setSearchTerm('');
    setStep(2);
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    fetchSlots(doctor.id, today);
    setStep(3);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (selectedDoctor?.id) fetchSlots(selectedDoctor.id, date);
  };

  const handleSelectSlot = (slot) => {
    if (!(slot.isAvailable ?? slot.available)) return;
    setSelectedSlot(slot);
    setStep(4);
  };

  const handleBook = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedSlot || !selectedDate) return;
    setBooking(true);
    try {
      await appointmentService.create({
        doctorId: selectedDoctor.id,
        departmentId: selectedDoctor.departmentId || selectedDept?.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        reason: reason || 'Walk-in / Receptionist Booking',
        bookingType: 'WALK_IN',
        patientId: selectedPatient.id,  // Receptionist booking on behalf of patient
      });
      toast.success(`Appointment booked for ${selectedPatient.patientName}!`);
      navigate('/receptionist/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const deptDoctors = doctors.filter(d => d.departmentId === selectedDept?.id && d.isAvailable !== false);
  const filteredDoctors = deptDoctors.filter(d =>
    !searchTerm ||
    d.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter(p =>
    !patientSearch ||
    p.patientName?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone?.includes(patientSearch) ||
    p.email?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateNum: d.getDate(),
    };
  });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
      <div style={{ width: '2rem', height: '2rem', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const stepLabels = ['Patient', 'Department', 'Doctor', 'Slot', 'Confirm'];

  return (
    <div className="rec-apt-page">
      {/* Header */}
      <div className="rec-apt-header">
        <div>
          <h1 className="rec-apt-title">Book Appointment for Patient</h1>
          <p className="rec-apt-subtitle">Walk-in booking — select patient, doctor, and time slot</p>
        </div>
        <button onClick={() => navigate('/receptionist/appointments')} className="rec-apt-btn secondary">
          <MdArrowBack /> All Appointments
        </button>
      </div>

      {/* Progress Steps */}
      <div className="rec-apt-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < stepLabels.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step > i ? '#16a34a' : step === i ? '#2563eb' : '#e2e8f0',
                  color: step >= i ? '#fff' : '#94a3b8',
                  fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
                }}>
                  {step > i ? <MdCheckCircle /> : i + 1}
                </div>
                <span style={{ fontSize: '0.65rem', color: step >= i ? '#1e40af' : '#94a3b8', fontWeight: step === i ? 700 : 400 }}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: step > i ? '#16a34a' : '#e2e8f0', margin: '0 0.5rem', marginBottom: '1.25rem', transition: 'all 0.2s' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 0 — Select Patient */}
      {step === 0 && (
        <div className="rec-apt-card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: '#0f172a' }}>
            <MdPerson style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Select Patient
          </h2>
          <div className="rec-apt-search" style={{ maxWidth: '100%', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <MdSearch />
            <input
              placeholder="Search by name, email, or phone..."
              value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', background: 'transparent' }}
            />
          </div>
          {filteredPatients.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No patients found. Register a patient first.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '24rem', overflowY: 'auto' }}>
              {filteredPatients.map(p => (
                <button key={p.id} onClick={() => handleSelectPatient(p)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                  borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 700, flexShrink: 0 }}>
                    {p.patientName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '0.875rem' }}>{p.patientName}</p>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.75rem' }}>{p.phone || p.email || '—'}</p>
                  </div>
                  <MdArrowForward style={{ marginLeft: 'auto', color: '#94a3b8' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 1 — Select Department */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => setStep(0)} className="rec-apt-btn secondary" style={{ alignSelf: 'flex-start' }}>
            <MdArrowBack /> Back
          </button>
          <div className="rec-apt-panel" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534' }}>
              Booking for: <strong>{selectedPatient?.patientName}</strong>
            </p>
          </div>
          <div className="rec-apt-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: '#0f172a' }}>Select Department</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {departments.map(dept => (
                <button key={dept.id} onClick={() => handleSelectDept(dept)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem',
                  borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#fff',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = '#fff'}
                >
                  <span style={{ fontSize: '1.5rem' }}>{DEPT_ICONS[dept.name] || '🏥'}</span>
                  <div>
                    <p style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '0.875rem' }}>{dept.name}</p>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.75rem' }}>
                      {doctors.filter(d => d.departmentId === dept.id).length} doctors
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 — Select Doctor */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => setStep(1)} className="rec-apt-btn secondary" style={{ alignSelf: 'flex-start' }}>
            <MdArrowBack /> Back
          </button>
          <div className="rec-apt-panel">
            <div className="rec-apt-search" style={{ maxWidth: '100%' }}>
              <MdSearch />
              <input placeholder="Search doctors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', background: 'transparent' }} />
            </div>
          </div>
          {filteredDoctors.length === 0 ? (
            <div className="rec-apt-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8' }}>No doctors available in {selectedDept?.name}.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {filteredDoctors.map(doc => (
                <button key={doc.id} onClick={() => handleSelectDoctor(doc)} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
                  borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#fff',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontWeight: 700, fontSize: '1.125rem', flexShrink: 0 }}>
                    {doc.doctorName?.charAt(0) || 'D'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>Dr. {doc.doctorName}</p>
                    <p style={{ color: '#64748b', margin: '0.125rem 0 0', fontSize: '0.75rem' }}>
                      {doc.specialization} · ₹{doc.consultationFee}/consultation
                    </p>
                  </div>
                  <MdArrowForward style={{ color: '#94a3b8' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 3 — Select Slot */}
      {step === 3 && selectedDoctor && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => setStep(2)} className="rec-apt-btn secondary" style={{ alignSelf: 'flex-start' }}>
            <MdArrowBack /> Back
          </button>
          <div className="rec-apt-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontWeight: 700, flexShrink: 0 }}>
              {selectedDoctor.doctorName?.charAt(0)}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>Dr. {selectedDoctor.doctorName}</p>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.75rem' }}>{selectedDoctor.specialization}</p>
            </div>
          </div>

          <div className="rec-apt-panel">
            <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              <MdCalendarMonth style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> Select Date
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {dateOptions.map(d => (
                <button key={d.value} onClick={() => handleDateChange(d.value)} style={{
                  padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid',
                  borderColor: selectedDate === d.value ? '#2563eb' : '#e2e8f0',
                  background: selectedDate === d.value ? '#eff6ff' : '#fff',
                  color: selectedDate === d.value ? '#1e40af' : '#475569',
                  cursor: 'pointer', fontWeight: selectedDate === d.value ? 700 : 400,
                  fontSize: '0.75rem',
                }}>
                  <div>{d.day}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{d.dateNum}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rec-apt-panel">
            <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Available Slots</p>
            {slotsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '1.5rem', height:  '1.5rem', border: '3px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : slots.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No slots available for this date.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {slots.map((slot, i) => {
                  const isAvailable = (slot.isAvailable ?? slot.available) === true;
                  return (
                    <button key={i} onClick={() => isAvailable && handleSelectSlot(slot)}
                      disabled={!isAvailable}
                      style={{
                        padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: '1px solid',
                        borderColor: !isAvailable ? '#e2e8f0' : selectedSlot?.startTime === slot.startTime ? '#2563eb' : '#bfdbfe',
                        background: !isAvailable ? '#f8fafc' : selectedSlot?.startTime === slot.startTime ? '#2563eb' : '#eff6ff',
                        color: !isAvailable ? '#94a3b8' : selectedSlot?.startTime === slot.startTime ? '#fff' : '#1e40af',
                        cursor: !isAvailable ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem', fontWeight: 600,
                      }}>
                      {formatTime(slot.startTime)}
                      {!isAvailable && <span style={{ display: 'block', fontSize: '0.6rem', opacity: 0.7 }}>Booked</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4 — Confirm */}
      {step === 4 && selectedPatient && selectedDoctor && selectedSlot && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => setStep(3)} className="rec-apt-btn secondary" style={{ alignSelf: 'flex-start' }}>
            <MdArrowBack /> Back
          </button>
          <div className="rec-apt-card" style={{ padding: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <MdCheckCircle style={{ fontSize: '2.5rem', color: '#16a34a' }} />
              <h2 style={{ fontWeight: 700, color: '#0f172a', margin: '0.5rem 0 0.25rem' }}>Confirm Booking</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Review appointment details before confirming</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Patient', value: selectedPatient.patientName },
                { label: 'Doctor', value: `Dr. ${selectedDoctor.doctorName}` },
                { label: 'Department', value: selectedDoctor.departmentName || selectedDept?.name || '—' },
                { label: 'Date', value: new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Time', value: `${formatTime(selectedSlot.startTime)} — ${formatTime(selectedSlot.endTime)}` },
                { label: 'Booking Type', value: 'Walk-In / Receptionist' },
                { label: 'Status', value: 'CONFIRMED', highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: highlight ? '#16a34a' : '#0f172a', fontSize: '0.875rem' }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#475569', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Reason for visit (optional)
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Walk-in, follow-up, symptoms..."
                rows={3}
                style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button onClick={handleBook} disabled={booking} style={{
              width: '100%', padding: '0.875rem', borderRadius: '0.625rem', border: 'none',
              background: booking ? '#94a3b8' : '#2563eb', color: '#fff',
              fontWeight: 700, fontSize: '0.9rem', cursor: booking ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>
              <MdCheckCircle />
              {booking ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
