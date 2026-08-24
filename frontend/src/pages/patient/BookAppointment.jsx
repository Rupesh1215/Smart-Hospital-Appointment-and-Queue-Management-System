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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress Steps */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          {[
            { num: 1, label: 'Select Doctor' },
            { num: 2, label: 'Choose Slot' },
            { num: 3, label: 'Confirm' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step >= s.num
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s.num ? <MdCheckCircle className="text-lg" /> : s.num}
              </div>
              <span
                className={`text-sm font-medium hidden sm:inline ${
                  step >= s.num ? 'text-teal-700' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
              {i < 2 && (
                <div className={`w-12 h-0.5 mx-1 ${step > s.num ? 'bg-teal-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">Find a Doctor</h2>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
              <MdLocalHospital className="text-5xl text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No doctors found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer card-hover"
                  onClick={() => handleSelectDoctor(doc)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {doc.doctorName?.charAt(0) || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-900">
                        Dr. {doc.doctorName}
                      </h3>
                      <p className="text-sm text-teal-600 font-medium mt-0.5">
                        {doc.specialization}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.departmentName || 'General'}
                      </p>

                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        {doc.experience > 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MdWork className="text-sm text-slate-400" />
                            {doc.experience} yrs
                          </div>
                        )}
                        {doc.consultationFee > 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MdCurrencyRupee className="text-sm text-slate-400" />
                            ₹{doc.consultationFee}
                          </div>
                        )}
                        {doc.qualification && (
                          <div className="text-xs text-slate-400">
                            {doc.qualification}
                          </div>
                        )}
                      </div>
                    </div>
                    <MdArrowForward className="text-xl text-slate-300 flex-shrink-0 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Slot */}
      {step === 2 && selectedDoctor && (
        <div className="space-y-4">
          <button
            onClick={() => { setStep(1); setSelectedSlot(null); }}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <MdArrowBack />
            Back to Doctors
          </button>

          {/* Selected Doctor Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {selectedDoctor.doctorName?.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Dr. {selectedDoctor.doctorName}
                </h3>
                <p className="text-sm text-teal-600">{selectedDoctor.specialization}</p>
                <p className="text-xs text-slate-500">{selectedDoctor.departmentName}</p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Select Date</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dateOptions.map((d) => (
                <button
                  key={d.value}
                  onClick={() => handleDateChange(d.value)}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[70px] text-sm transition-all cursor-pointer flex-shrink-0 ${
                    selectedDate === d.value
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-medium opacity-75">{d.day}</span>
                  <span className="text-lg font-bold">{d.dateNum}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Available Slots
              {selectedDate && (
                <span className="font-normal text-slate-500 ml-2">
                  for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              )}
            </h3>

            {slotsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12">
                <MdAccessTime className="text-4xl text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No slots available for this date.</p>
                <p className="text-slate-400 text-xs mt-1">Try selecting a different date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {slots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => slot.available && handleSelectSlot(slot)}
                    disabled={!slot.available}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      !slot.available
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                        : selectedSlot?.startTime === slot.startTime
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
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
        <div className="space-y-4">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <MdArrowBack />
            Back to Slots
          </button>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                <MdCheckCircle className="text-3xl text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Confirm Appointment</h2>
              <p className="text-sm text-slate-500 mt-1">Review the details below</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">Doctor</span>
                <span className="text-sm font-medium text-slate-900">
                  Dr. {selectedDoctor.doctorName}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">Department</span>
                <span className="text-sm font-medium text-slate-900">
                  {selectedDoctor.departmentName || 'General'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">Date</span>
                <span className="text-sm font-medium text-slate-900">
                  {new Date(selectedDate).toLocaleDateString('en-IN', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">Time</span>
                <span className="text-sm font-medium text-slate-900">
                  {formatTime(selectedSlot.startTime)} — {formatTime(selectedSlot.endTime)}
                </span>
              </div>
              {selectedDoctor.consultationFee > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Fee</span>
                  <span className="text-sm font-semibold text-teal-600">
                    ₹{selectedDoctor.consultationFee}
                  </span>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for visit (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief description of your symptoms or reason..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <button
              onClick={handleBook}
              disabled={booking}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-sm btn-press"
            >
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
