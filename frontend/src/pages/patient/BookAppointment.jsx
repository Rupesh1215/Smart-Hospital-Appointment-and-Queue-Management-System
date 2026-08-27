import { useState, useEffect } from 'react';
import doctorService from '../../services/doctorService';
import departmentService from '../../services/departmentService';
import appointmentService from '../../services/appointmentService';
import { formatTime } from '../../utils/dateUtils';
import { isNotPastDate } from '../../utils/validators';
import toast from 'react-hot-toast';
import {
  MdSearch,
  MdLocalHospital,
  MdCalendarMonth,
  MdAccessTime,
  MdArrowBack,
  MdArrowForward,
  MdCheckCircle,
  MdFilterList,
  MdStar,
  MdWork,
  MdCurrencyRupee,
} from 'react-icons/md';
import './BookAppointment.css';

export default function BookAppointment() {
  // Step state: 1=select doctor, 2=select slot, 3=confirm
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Selection
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsRes, deptsRes] = await Promise.all([
        doctorService.getAll(),
        departmentService.getAll(),
      ]);
      setDoctors(doctorsRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (doctorId, date) => {
    setSlotsLoading(true);
    try {
      const res = await doctorService.getSlots(doctorId, date);
      setSlots(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load slots');
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    fetchSlots(doctor.id, today);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (selectedDoctor) {
      fetchSlots(selectedDoctor.id, date);
    }
  };

  const handleSelectSlot = (slot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot || !selectedDate) return;

    setBooking(true);
    try {
      await appointmentService.create({
        doctorId: selectedDoctor.id,
        departmentId: selectedDoctor.departmentId,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        reason: reason || 'General Consultation',
      });
      toast.success('Appointment booked successfully!');
      // Reset
      setStep(1);
      setSelectedDoctor(null);
      setSelectedSlot(null);
      setSelectedDate('');
      setReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchSearch =
      !searchTerm ||
      doc.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = !selectedDept || doc.departmentId === selectedDept;
    return matchSearch && matchDept && doc.available;
  });

  // Generate next 7 dates for quick selection
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateNum: date.getDate(),
    };
  });

  if (loading) {
    return (
      <div className="book-loader-wrap">
        <div className="book-loader" />
      </div>
    );
  }

  return (
    <div className="book-apt-page">
      {/* Progress Steps */}
      <div className="book-steps-card">
        <div className="book-steps-container">
          {[
            { num: 1, label: 'Select Doctor' },
            { num: 2, label: 'Choose Slot' },
            { num: 3, label: 'Confirm' },
          ].map((s, i) => (
            <div key={s.num} className="book-step-wrapper">
              <div className={`book-step-circle ${step >= s.num ? 'active' : 'inactive'}`}>
                {step > s.num ? <MdCheckCircle /> : s.num}
              </div>
              <span className={`book-step-label ${step >= s.num ? 'active' : 'inactive'}`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`book-step-line ${step > s.num ? 'active' : 'inactive'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 className="book-section-title">Find a Doctor</h2>

          {/* Search & Filter */}
          <div className="book-panel">
            <div className="book-filters-row">
              <div className="book-search-wrap">
                <MdSearch />
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="book-search-input"
                />
              </div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="book-select-input"
                style={{ width: 'auto', flexShrink: 0 }}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctor Cards */}
          {filteredDoctors.length === 0 ? (
            <div className="book-empty-state">
              <MdLocalHospital />
              <p>No doctors found matching your criteria.</p>
            </div>
          ) : (
            <div className="book-doc-grid">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="book-doc-card"
                  onClick={() => handleSelectDoctor(doc)}
                >
                  <div className="book-doc-avatar">
                    {doc.doctorName?.charAt(0) || 'D'}
                  </div>
                  <div className="book-doc-info">
                    <h3 className="book-doc-name">
                      Dr. {doc.doctorName}
                    </h3>
                    <p className="book-doc-spec">
                      {doc.specialization}
                    </p>
                    <p className="book-doc-dept">
                      {doc.departmentName || 'General'}
                    </p>

                    <div className="book-doc-meta">
                      {doc.experience > 0 && (
                        <div className="book-doc-meta-item">
                          <MdWork />
                          {doc.experience} yrs
                        </div>
                      )}
                      {doc.consultationFee > 0 && (
                        <div className="book-doc-meta-item">
                          <MdCurrencyRupee />
                          ₹{doc.consultationFee}
                        </div>
                      )}
                      {doc.qualification && (
                        <div className="book-doc-meta-item">
                          {doc.qualification}
                        </div>
                      )}
                    </div>
                  </div>
                  <MdArrowForward className="book-doc-arrow" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Slot */}
      {step === 2 && selectedDoctor && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={() => { setStep(1); setSelectedSlot(null); }}
            className="book-back-btn"
          >
            <MdArrowBack />
            Back to Doctors
          </button>

          {/* Selected Doctor Card */}
          <div className="book-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="book-doc-avatar" style={{ width: '3.5rem', height: '3.5rem' }}>
              {selectedDoctor.doctorName?.charAt(0)}
            </div>
            <div>
              <h3 className="book-doc-name">
                Dr. {selectedDoctor.doctorName}
              </h3>
              <p className="book-doc-spec">{selectedDoctor.specialization}</p>
              <p className="book-doc-dept">{selectedDoctor.departmentName}</p>
            </div>
          </div>

          {/* Date Selection */}
          <div className="book-panel">
            <h3 className="book-panel-title">Select Date</h3>
            <div className="book-date-row">
              {dateOptions.map((d) => (
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

          {/* Time Slots */}
          <div className="book-panel">
            <h3 className="book-panel-title">
              Available Slots
              {selectedDate && (
                <span>
                  for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              )}
            </h3>

            {slotsLoading ? (
              <div className="book-loader-wrap book-loader-py">
                <div className="book-loader small" />
              </div>
            ) : slots.length === 0 ? (
              <div className="book-empty-state" style={{ padding: '3rem 1rem' }}>
                <MdAccessTime />
                <p>No slots available for this date.</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Try selecting a different date.</p>
              </div>
            ) : (
              <div className="book-slot-grid">
                {slots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => slot.available && handleSelectSlot(slot)}
                    disabled={!slot.available}
                    className={`book-slot-btn ${
                      !slot.available
                        ? 'unavailable'
                        : selectedSlot?.startTime === slot.startTime
                        ? 'active'
                        : 'available'
                    }`}
                  >
                    {formatTime(slot.startTime)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && selectedDoctor && selectedSlot && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={() => setStep(2)}
            className="book-back-btn"
          >
            <MdArrowBack />
            Back to Slots
          </button>

          <div className="book-confirm-card">
            <div className="book-confirm-header">
              <div className="book-confirm-icon-wrap">
                <MdCheckCircle />
              </div>
              <h2 className="book-confirm-title">Confirm Appointment</h2>
              <p className="book-confirm-subtitle">Review the details below</p>
            </div>

            <div className="book-confirm-details">
              <div className="book-confirm-row">
                <span className="book-confirm-label">Doctor</span>
                <span className="book-confirm-val">
                  Dr. {selectedDoctor.doctorName}
                </span>
              </div>
              <div className="book-confirm-row">
                <span className="book-confirm-label">Department</span>
                <span className="book-confirm-val">
                  {selectedDoctor.departmentName || 'General'}
                </span>
              </div>
              <div className="book-confirm-row">
                <span className="book-confirm-label">Date</span>
                <span className="book-confirm-val">
                  {new Date(selectedDate).toLocaleDateString('en-IN', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
              <div className="book-confirm-row">
                <span className="book-confirm-label">Time</span>
                <span className="book-confirm-val">
                  {formatTime(selectedSlot.startTime)} — {formatTime(selectedSlot.endTime)}
                </span>
              </div>
              {selectedDoctor.consultationFee > 0 && (
                <div className="book-confirm-row">
                  <span className="book-confirm-label">Fee</span>
                  <span className="book-confirm-val fee">
                    ₹{selectedDoctor.consultationFee}
                  </span>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="book-reason-group">
              <label className="book-reason-label">
                Reason for visit (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief description of your symptoms or reason..."
                rows={3}
                className="book-reason-input"
              />
            </div>

            <button
              onClick={handleBook}
              disabled={booking}
              className="book-submit-btn"
            >
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
