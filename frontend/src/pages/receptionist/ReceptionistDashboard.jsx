import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import doctorService from '../../services/doctorService';
import { formatDate, formatTime, isToday } from '../../utils/dateUtils';
import { STATUS_COLORS } from '../../utils/constants';
import {
  MdCalendarMonth, MdCheckCircle, MdPeople, MdArrowForward,
  MdSchedule, MdHowToReg, MdQueue, MdPersonAdd,
} from 'react-icons/md';

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [aptRes, docRes] = await Promise.all([
        appointmentService.getAll(),
        doctorService.getAll(),
      ]);
      setAppointments(aptRes.data.data || []);
      setDoctors(docRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayApts = appointments.filter((apt) => apt.appointmentDate && isToday(apt.appointmentDate));
  const pendingCount = todayApts.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
  const checkedInCount = todayApts.filter((a) => a.status === 'CHECKED_IN' || a.status === 'IN_QUEUE').length;
  const completedCount = todayApts.filter((a) => a.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-24 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  const stats = [
    { label: "Today's Appointments", value: todayApts.length, icon: MdCalendarMonth, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Awaiting Check-In', value: pendingCount, icon: MdSchedule, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Checked In', value: checkedInCount, icon: MdHowToReg, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Completed', value: completedCount, icon: MdCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome + Quick Actions */}
      <div className="bg-[#2563eb] rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Reception</p>
          <h1 className="text-xl font-bold">Welcome, {user?.name?.split(' ')[0] || 'Receptionist'}</h1>
          <p className="text-blue-200 text-sm mt-0.5">Manage check-ins, appointments, and patient queues.</p>
        </div>
        <div className="flex gap-2 self-start">
          <Link to="/receptionist/check-in" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#2563eb] font-semibold rounded-lg hover:bg-blue-50 text-sm">
            <MdHowToReg /> Check In
          </Link>
          <Link to="/receptionist/appointments" className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 text-sm">
            <MdPersonAdd /> Walk-In
          </Link>
        </div>
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

      {/* Appointments Table */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Today's Appointments</h2>
          <Link to="/receptionist/appointments" className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
            View All <MdArrowForward className="text-sm" />
          </Link>
        </div>

        {todayApts.length === 0 ? (
          <div className="p-10 text-center">
            <MdCalendarMonth className="text-3xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Doctor</th>
                  <th className="table-header">Time</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {todayApts.slice(0, 10).map((apt) => {
                  const statusColor = STATUS_COLORS[apt.status] || STATUS_COLORS.PENDING;
                  const canCheckIn = apt.status === 'PENDING' || apt.status === 'CONFIRMED';
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-cell">
                        <p className="font-medium text-slate-900">{apt.patientName || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{apt.appointmentNumber}</p>
                      </td>
                      <td className="table-cell">
                        <p className="text-slate-700">Dr. {apt.doctorName || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{apt.departmentName || '—'}</p>
                      </td>
                      <td className="table-cell text-slate-700">
                        {apt.startTime ? formatTime(apt.startTime) : '—'}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${statusColor.bg} ${statusColor.text}`}>
                          {apt.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="table-cell">
                        {canCheckIn && (
                          <Link to="/receptionist/check-in" className="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">
                            <MdHowToReg className="text-sm" /> Check In
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Available Doctors */}
      {doctors.length > 0 && (
        <div className="card">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Available Doctors</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {doctors.filter((d) => d.available).slice(0, 6).map((doc) => (
              <div key={doc.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                  {doc.doctorName?.charAt(0)?.toUpperCase() || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">Dr. {doc.doctorName || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{doc.departmentName || 'General'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
