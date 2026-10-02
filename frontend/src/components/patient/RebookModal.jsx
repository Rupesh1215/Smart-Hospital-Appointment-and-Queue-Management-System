import React, { useState, useEffect } from 'react';
import { MdClose, MdCalendarMonth, MdAccessTime, MdLocalHospital, MdStar, MdCheckCircle, MdArrowForward, MdSwapHoriz } from 'react-icons/md';
import appointmentService from '../../services/appointmentService';
import doctorService from '../../services/doctorService';
import { formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import './RebookModal.css';

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function RebookModal({ appointment, onSuccess, onClose }) {
  const [deptDoctors, setDeptDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(appointment?.doctorId || '');
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('Unable to attend original slot on time.');
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!appointment) return;
    setSelectedDoctorId(appointment.doctorId);
    fetchDepartmentDoctors();
  }, [appointment]);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      fetchSlots(selectedDoctorId, selectedDate);
    }
  }, [selectedDoctorId, selectedDate]);

  const fetchDepartmentDoctors = async () => {
    setLoadingDocs(true);
    try {
      const res = await doctorService.getAll();
      const allDocs = res.data?.data || [];
      // Filter doctors in the same department
      const deptId = appointment?.departmentId;
      const matched = deptId
        ? allDocs.filter((d) => d.departmentId === deptId || d.departmentName === appointment?.departmentName)
        : allDocs;
      setDeptDoctors(matched.length > 0 ? matched : allDocs);
    } catch (err) {
      console.error('Error fetching doctors for rebooking:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchSlots = async (docId, date) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await doctorService.getSlots(docId, date);
      setSlots(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load slots for selected doctor.');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRebook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error('Please select an available slot.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedDocObj = deptDoctors.find((d) => d.id === selectedDoctorId);
      await appointmentService.reschedule(appointment.id, {
        newDate: selectedDate,
        newStartTime: selectedSlot.startTime,
        newDoctorId: selectedDoctorId !== appointment.doctorId ? selectedDoctorId : null,
        reason: reason,
      });

      toast.success(
        `Slot successfully rebooked with Dr. ${selectedDocObj?.doctorName || 'Doctor'} (No extra fee charged)!`,
        { duration: 5000, icon: '✨' }
      );
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rebook slot. Please try another time.');
    } finally {
      setSubmitting(false);
    }
  };

  /* Next 7 days date options */
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const val = `${year}-${month}-${day}`;
    return {
      value: val,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateNum: d.getDate(),
    };
  });

  if (!appointment) return null;

  const currentSelectedDoc = deptDoctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="rb-modal-overlay">
      <div className="rb-modal-card">
        <button className="rb-close-btn" onClick={onClose} aria-label="Close">
          <MdClose size={22} />
        </button>

        <div className="rb-header">
          <div className="rb-badge-icon">🔄</div>
          <h3>Free Rebooking Slot</h3>
          <p>Couldn't attend your scheduled visit? Rebook an available slot without any extra payment.</p>
        </div>

        {/* Free Rebook Guarantee Banner */}
        <div className="rb-guarantee-banner">
          <MdCheckCircle className="rb-guarantee-icon" />
          <div>
            <strong>100% Free Rebooking Guarantee</strong>
            <p>Your previous booking fee is fully transferred. No additional payment required.</p>
          </div>
        </div>

        {/* Original Visit Info */}
        <div className="rb-orig-card">
          <div className="rb-orig-label">Original Appointment</div>
          <div className="rb-orig-details">
            <div className="rb-orig-doc">
              <MdLocalHospital color="#059669" />
              <div>
                <strong>Dr. {appointment.doctorName || 'Doctor'}</strong>
                <span>{appointment.departmentName || 'Specialist'}</span>
              </div>
            </div>
            <div className="rb-orig-time">
              <span>{appointment.appointmentDate}</span>
              <span>{appointment.startTime ? formatTime(appointment.startTime) : ''}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleRebook} className="rb-body">
          {/* Select Doctor (Same or Similar Doctor in Department) */}
          <div className="rb-section">
            <label className="rb-section-title">
              <MdSwapHoriz size={18} />
              Select Doctor (Same or Similar Specialist)
            </label>

            {loadingDocs ? (
              <div className="rb-loader-sm" />
            ) : (
              <div className="rb-doc-selector-grid">
                {deptDoctors.map((doc) => {
                  const isSelected = doc.id === selectedDoctorId;
                  const isOriginal = doc.id === appointment.doctorId;

                  return (
                    <div
                      key={doc.id}
                      className={`rb-doc-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedDoctorId(doc.id)}
                    >
                      <div className="rb-doc-chip-avatar">
                        {(doc.doctorName || 'D').charAt(0)}
                      </div>
                      <div className="rb-doc-chip-info">
                        <span className="rb-doc-chip-name">Dr. {doc.doctorName}</span>
                        <span className="rb-doc-chip-sub">
                          {isOriginal ? 'Original Doctor' : 'Similar Specialist'}
                        </span>
                        <span className="rb-doc-chip-rating">
                          ⭐ {(doc.rating || 5.0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="rb-section">
            <label className="rb-section-title">
              <MdCalendarMonth size={18} />
              Choose New Date
            </label>
            <div className="rb-date-grid">
              {dateOptions.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  className={`rb-date-btn ${selectedDate === d.value ? 'active' : ''}`}
                  onClick={() => setSelectedDate(d.value)}
                >
                  <span className="rb-date-day">{d.day}</span>
                  <span className="rb-date-num">{d.dateNum}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Slot Grid */}
          <div className="rb-section">
            <label className="rb-section-title">
              <MdAccessTime size={18} />
              Available Slots for Dr. {currentSelectedDoc?.doctorName || 'Doctor'}
            </label>

            {loadingSlots ? (
              <div className="rb-loader-sm" />
            ) : slots.length === 0 ? (
              <div className="rb-no-slots">
                <p>No available slots on this date. Please try another day or doctor.</p>
              </div>
            ) : (
              <div className="rb-slots-grid">
                {slots.map((slot, i) => {
                  const isAvailable = (slot.isAvailable ?? slot.available) === true;
                  const isSelected = selectedSlot?.startTime === slot.startTime;

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!isAvailable}
                      className={`rb-slot-btn ${!isAvailable ? 'disabled' : isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {formatTime(slot.startTime)}
                      {!isAvailable && <span className="rb-slot-taken">Taken</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reason Input */}
          <div className="rb-input-group">
            <label>Reason for Rebooking (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Could not reach hospital on time..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="rb-actions">
            <button type="button" className="rb-btn-cancel" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="rb-btn-submit"
              disabled={submitting || !selectedSlot}
            >
              {submitting ? 'Rebooking...' : 'Confirm Free Rebook ✨'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
