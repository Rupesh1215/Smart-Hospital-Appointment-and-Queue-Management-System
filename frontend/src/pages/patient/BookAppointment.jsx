import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import departmentService from '../../services/departmentService';
import appointmentService from '../../services/appointmentService';
import { formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MdSearch, MdLocalHospital, MdCalendarMonth, MdAccessTime,
  MdArrowBack, MdArrowForward, MdCheckCircle, MdStar,
  MdWork, MdCurrencyRupee, MdPeople, MdVerified,
} from 'react-icons/md';
import './BookAppointment.css';

const DEPT_ICONS = {
  Cardiology: '❤️', Neurology: '🧠', Orthopedics: '🦴', Dermatology: '🌿',
  'General Medicine': '🏥', Pediatrics: '👶', ENT: '👂', Ophthalmology: '👁️',
  Psychiatry: '🧩', Oncology: '🔬', Radiology: '📡', Gynecology: '🌸',
};

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function StarRating({ rating }) {
  return (
    <div className="ba-stars">
      {[1,2,3,4,5].map(s => (
        <MdStar key={s} style={{ color: s <= Math.round(rating) ? '#F59E0B' : '#D1D5DB', fontSize: '0.9rem' }} />
      ))}
      <span className="ba-rating-val">{(rating || 4.5).toFixed(1)}</span>
    </div>
  );
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryDoctorId = searchParams.get('doctorId');
  const queryDeptId = searchParams.get('departmentId') || searchParams.get('deptId');

  // Step: 0=departments, 1=doctors, 2=pick slot, 3=confirm
  const [step, setStep] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);   // all doctors for selected dept
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [doctorsRes, deptsRes] = await Promise.all([
        doctorService.getAll(),
        departmentService.getAll(),
      ]);
      const allDocs = doctorsRes.data?.data || [];
      const allDepts = deptsRes.data?.data || [];
      setDoctors(allDocs);
      setDepartments(allDepts);

      const todayStr = getTodayDateStr();

      if (queryDoctorId) {
        const doc = allDocs.find((d) => d.id === queryDoctorId);
        if (doc) {
          setSelectedDoctor(doc);
          const dept = allDepts.find((dp) => dp.id === doc.departmentId);
          if (dept) setSelectedDept(dept);
          setSelectedDate(todayStr);
          fetchSlots(doc.id, todayStr);
          setStep(2);
          return;
        }
      }

      if (queryDeptId) {
        const dept = allDepts.find((dp) => dp.id === queryDeptId);
        if (dept) {
          setSelectedDept(dept);
          setStep(1);
          return;
        }
      }
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

  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    setSearchTerm('');
    setStep(1);
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    const today = getTodayDateStr();
    setSelectedDate(today);
    fetchSlots(doctor.id, today);
    setStep(2);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (selectedDoctor?.id) {
      fetchSlots(selectedDoctor.id, date);
    }
  };

  const handleSelectSlot = (slot) => {
    if (!(slot.isAvailable ?? slot.available)) return;
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot || !selectedDate) return;
    setBooking(true);
    try {
      await appointmentService.create({
        doctorId: selectedDoctor.id,
        departmentId: selectedDoctor.departmentId || selectedDept?.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        reason: reason || 'General Consultation',
        bookingType: 'ONLINE',
      });
      toast.success('Appointment booked successfully!');
      setStep(0); setSelectedDept(null); setSelectedDoctor(null);
      setSelectedSlot(null); setSelectedDate(''); setReason('');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment. Slot may already be taken.');
    } finally {
      setBooking(false);
    }
  };

  /* Doctors filtered to selected department */
  const deptDoctors = selectedDept
    ? doctors.filter((d) => d.departmentId === selectedDept.id && d.isAvailable !== false)
    : doctors.filter((d) => d.isAvailable !== false);

  const filteredDoctors = deptDoctors.filter((d) =>
    !searchTerm ||
    (d.doctorName || d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* Next 7 days */
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const val = `${year}-${month}-${day}`;
    return {
      value: val,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateNum: d.getDate(),
    };
  });

  if (loading) return (
    <div className="book-loader-wrap"><div className="book-loader" /></div>
  );

  return (
    <div className="book-apt-page">
      {/* Progress */}
      <div className="book-steps-card">
        <div className="book-steps-container">
          {[
            { num: 1, label: 'Department' },
            { num: 2, label: 'Doctor' },
            { num: 3, label: 'Choose Slot' },
            { num: 4, label: 'Confirm' },
          ].map((s, i) => (
            <div key={s.num} className="book-step-wrapper">
              <div className={`book-step-circle ${step + 1 >= s.num ? 'active' : 'inactive'}`}>
                {step + 1 > s.num ? <MdCheckCircle /> : s.num}
              </div>
              <span className={`book-step-label ${step + 1 >= s.num ? 'active' : 'inactive'}`}>{s.label}</span>
              {i < 3 && <div className={`book-step-line ${step + 1 > s.num ? 'active' : 'inactive'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── STEP 0: Departments ── */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 className="book-section-title">Select a Department</h2>
          {departments.length === 0 ? (
            <div className="book-empty-state">
              <MdLocalHospital />
              <p>No departments available. Please contact administration.</p>
            </div>
          ) : (
            <div className="book-dept-grid">
              {departments.map(dept => {
                const docCount = doctors.filter(d => d.departmentId === dept.id).length;
                return (
                  <button key={dept.id} className="book-dept-card" onClick={() => handleSelectDept(dept)}>
                    <span className="book-dept-emoji">{DEPT_ICONS[dept.name] || '🏥'}</span>
                    <div className="book-dept-info">
                      <span className="book-dept-name">{dept.name}</span>
                      <span className="book-dept-sub">{docCount} doctor{docCount !== 1 ? 's' : ''} available</span>
                    </div>
                    <MdArrowForward className="book-dept-arrow" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 1: Doctors ── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => { setStep(0); setSelectedDept(null); }} className="book-back-btn">
            <MdArrowBack /> Back to Departments
          </button>

          <div className="book-dept-header-card">
            <span className="book-dept-header-emoji">{DEPT_ICONS[selectedDept?.name] || '🏥'}</span>
            <div>
              <h2 className="book-dept-header-title">{selectedDept?.name}</h2>
              <p className="book-dept-header-sub">{filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} available</p>
            </div>
          </div>

          <div className="book-panel">
            <div className="book-search-wrap">
              <MdSearch />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="book-search-input"
              />
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="book-empty-state">
              <MdLocalHospital />
              <p>No doctors found for this department.</p>
            </div>
          ) : (
            <div className="book-doctor-cards-grid">
              {filteredDoctors.map(doc => (
                <div key={doc.id} className="book-doctor-card">
                  <div className="bdc-photo-wrap">
                    <div className="bdc-avatar">{doc.doctorName?.charAt(0) || 'D'}</div>
                    <span className="bdc-available-badge">Available</span>
                  </div>
                  <div className="bdc-body">
                    <div className="bdc-name-row">
                      <h3 className="bdc-name">Dr. {doc.doctorName}</h3>
                      <MdVerified className="bdc-verified" />
                    </div>
                    <p className="bdc-spec">{doc.specialization}</p>
                    {doc.qualification && <p className="bdc-qual">{doc.qualification}</p>}

                    <StarRating rating={doc.rating || 4.5} />

                    <div className="bdc-stats">
                      {doc.experience > 0 && (
                        <div className="bdc-stat-item">
                          <MdWork className="bdc-stat-icon" />
                          <span>{doc.experience} yrs exp</span>
                        </div>
                      )}
                      {doc.maxPatientsPerDay > 0 && (
                        <div className="bdc-stat-item">
                          <MdPeople className="bdc-stat-icon" />
                          <span>Up to {doc.maxPatientsPerDay}/day</span>
                        </div>
                      )}
                      {doc.consultationFee > 0 && (
                        <div className="bdc-stat-item fee">
                          <MdCurrencyRupee className="bdc-stat-icon" />
                          <span>₹{doc.consultationFee}</span>
                        </div>
                      )}
                    </div>

                    <button className="bdc-book-btn" onClick={() => handleSelectDoctor(doc)}>
                      Book Appointment <MdArrowForward />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Slot picker ── */}
      {step === 2 && selectedDoctor && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => { setStep(1); setSelectedSlot(null); }} className="book-back-btn">
            <MdArrowBack /> Back to Doctors
          </button>

          <div className="book-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="book-doc-avatar" style={{ width: '3.5rem', height: '3.5rem' }}>
              {selectedDoctor.doctorName?.charAt(0)}
            </div>
            <div>
              <h3 className="book-doc-name">Dr. {selectedDoctor.doctorName}</h3>
              <p className="book-doc-spec">{selectedDoctor.specialization}</p>
              <p className="book-doc-dept">{selectedDoctor.departmentName}</p>
            </div>
          </div>

          <div className="book-panel">
            <h3 className="book-panel-title">Select Date</h3>
            <div className="book-date-row">
              {dateOptions.map(d => (
                <button
                  key={d.value}
                  onClick={() => handleDateChange(d.value)}
                  className={`book-date-btn ${selectedDate === d.value ? 'active' : 'inactive'}`}
                >
                  <span className="book-date-day">{d.day}</span>
                  <span className="book-date-num">{d.dateNum}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="book-panel">
            <h3 className="book-panel-title">
              Available Slots
              {selectedDate && (
                <span> for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              )}
            </h3>
            {slotsLoading ? (
              <div className="book-loader-wrap book-loader-py"><div className="book-loader small" /></div>
            ) : slots.length === 0 ? (
              <div className="book-empty-state" style={{ padding: '3rem 1rem' }}>
                <MdAccessTime />
                <p>No slots available for this date. Doctor may not work on this day.</p>
              </div>
            ) : (
              <div className="book-slot-grid">
                {slots.map((slot, i) => {
                  const isAvailable = (slot.isAvailable ?? slot.available) === true;
                  return (
                    <button
                      key={i}
                      onClick={() => isAvailable && handleSelectSlot(slot)}
                      disabled={!isAvailable}
                      className={`book-slot-btn ${!isAvailable ? 'unavailable' : selectedSlot?.startTime === slot.startTime ? 'active' : 'available'}`}
                    >
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

      {/* ── STEP 3: Confirm ── */}
      {step === 3 && selectedDoctor && selectedSlot && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => setStep(2)} className="book-back-btn">
            <MdArrowBack /> Back to Slots
          </button>
          <div className="book-confirm-card">
            <div className="book-confirm-header">
              <div className="book-confirm-icon-wrap"><MdCheckCircle /></div>
              <h2 className="book-confirm-title">Confirm Appointment</h2>
              <p className="book-confirm-subtitle">Review the details below</p>
            </div>
            <div className="book-confirm-details">
              <div className="book-confirm-row">
                <span className="book-confirm-label">Doctor</span>
                <span className="book-confirm-val">Dr. {selectedDoctor.doctorName}</span>
              </div>
              <div className="book-confirm-row">
                <span className="book-confirm-label">Department</span>
                <span className="book-confirm-val">{selectedDoctor.departmentName || selectedDept?.name || 'General'}</span>
              </div>
              <div className="book-confirm-row">
                <span className="book-confirm-label">Date</span>
                <span className="book-confirm-val">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="book-confirm-row">
                <span className="book-confirm-label">Time</span>
                <span className="book-confirm-val">{formatTime(selectedSlot.startTime)} — {formatTime(selectedSlot.endTime)}</span>
              </div>
              {selectedDoctor.consultationFee > 0 && (
                <div className="book-confirm-row">
                  <span className="book-confirm-label">Fee</span>
                  <span className="book-confirm-val fee">₹{selectedDoctor.consultationFee}</span>
                </div>
              )}
              <div className="book-confirm-row">
                <span className="book-confirm-label">Status</span>
                <span className="book-confirm-val" style={{ color: '#16a34a', fontWeight: 700 }}>CONFIRMED</span>
              </div>
            </div>
            <div className="book-reason-group">
              <label className="book-reason-label">Reason for visit (optional)</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Brief description of your symptoms or reason..."
                rows={3}
                className="book-reason-input"
              />
            </div>
            <button onClick={handleBook} disabled={booking} className="book-submit-btn">
              {booking ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
