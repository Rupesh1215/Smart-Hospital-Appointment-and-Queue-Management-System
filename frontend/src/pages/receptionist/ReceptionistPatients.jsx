import { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import { formatDate, formatTime, isToday } from '../../utils/dateUtils';
import { STATUS_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  MdSearch,
  MdPeople,
  MdCalendarMonth,
  MdFilterList,
  MdHowToReg,
  MdClose,
  MdPhone,
  MdLocalHospital,
} from 'react-icons/md';

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_QUEUE', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'];

export default function ReceptionistPatients() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showTodayOnly, setShowTodayOnly] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getAll();
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  // Build a unique patients list from appointments
  const patientsMap = new Map();
  appointments.forEach((apt) => {
    if (!patientsMap.has(apt.patientId)) {
      patientsMap.set(apt.patientId, {
        patientId: apt.patientId,
        patientName: apt.patientName,
        appointments: [],
      });
    }
    patientsMap.get(apt.patientId).appointments.push(apt);
  });

  const filteredAppointments = appointments.filter((apt) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.appointmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;

    // Today filter
    const matchesToday = !showTodayOnly || (apt.appointmentDate && isToday(apt.appointmentDate));

    return matchesSearch && matchesStatus && matchesToday;
  });

  // Sort by time (earliest first)
  filteredAppointments.sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    return 0;
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
        <p className="text-sm text-slate-500 mt-1">
          Search and manage patient appointments
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Search by patient name, appointment #, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <MdClose />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <MdFilterList className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none bg-white cursor-pointer"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Today Toggle */}
          <button
            onClick={() => setShowTodayOnly(!showTodayOnly)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              showTodayOnly
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {showTodayOnly ? "Today's Only" : 'All Dates'}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filteredAppointments.length}</span> appointment{filteredAppointments.length !== 1 ? 's' : ''}
          {showTodayOnly && ' for today'}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="text-xs text-slate-500">
            {patientsMap.size} unique patient{patientsMap.size !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Patient Appointments List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center">
              <MdPeople className="text-3xl text-slate-300" />
            </div>
            <p className="text-slate-500 mb-1">No patients found</p>
            <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Patient</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Appt #</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Doctor</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Date & Time</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Reason</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAppointments.map((apt) => {
                  const statusColor = STATUS_COLORS[apt.status] || STATUS_COLORS.PENDING;
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                            {apt.patientName?.charAt(0)?.toUpperCase() || 'P'}
                          </div>
                          <p className="text-sm font-medium text-slate-900">{apt.patientName || 'Unknown'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 font-mono">{apt.appointmentNumber || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-slate-700">Dr. {apt.doctorName || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{apt.departmentName || '—'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">
                          {apt.appointmentDate ? formatDate(apt.appointmentDate) : '—'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {apt.startTime ? formatTime(apt.startTime) : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 max-w-[200px] truncate">
                          {apt.reason || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                          {apt.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
