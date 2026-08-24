import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { STATUS_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  MdCalendarMonth,
  MdAdd,
  MdCancel,
  MdRefresh,
  MdFilterList,
  MdLocalHospital,
  MdAccessTime,
  MdSearch,
} from 'react-icons/md';

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAll();
      setAppointments(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  const filteredAppointments = appointments
    .filter((apt) => filter === 'ALL' || apt.status === filter)
    .filter(
      (apt) =>
        !searchTerm ||
        apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track your appointments
          </p>
        </div>
        <button
          onClick={() => navigate('/patient/doctors')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-sm btn-press"
        >
          <MdAdd className="text-lg" />
          Book Appointment
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Search by doctor, department, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-50 flex items-center justify-center">
            <MdCalendarMonth className="text-4xl text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {filter === 'ALL' ? 'No appointments yet' : `No ${filter.toLowerCase()} appointments`}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Book your first appointment to get started.
          </p>
          <button
            onClick={() => navigate('/patient/doctors')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <MdLocalHospital />
            Find a Doctor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt) => {
            const statusColor = STATUS_COLORS[apt.status] || STATUS_COLORS.PENDING;
            const canCancel = ['PENDING', 'CONFIRMED'].includes(apt.status);

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 card-hover"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <MdLocalHospital className="text-xl text-teal-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        Dr. {apt.doctorName || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {apt.departmentName || 'General'}
                        {apt.appointmentNumber && (
                          <span className="ml-2 text-slate-400">• {apt.appointmentNumber}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm">
                      <MdCalendarMonth className="text-slate-400" />
                      <span className="text-slate-700">
                        {apt.appointmentDate ? formatDate(apt.appointmentDate) : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MdAccessTime className="text-slate-400" />
                      <span className="text-slate-700">
                        {apt.startTime ? formatTime(apt.startTime) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                      {apt.status}
                    </span>
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Cancel Appointment"
                      >
                        <MdCancel className="text-lg" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Reason */}
                {apt.reason && (
                  <p className="mt-3 text-xs text-slate-500 pl-16">
                    <span className="font-medium text-slate-600">Reason:</span> {apt.reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
