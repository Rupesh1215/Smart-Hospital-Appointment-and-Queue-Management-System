import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';
import { formatDate, formatTime, isToday } from '../../utils/dateUtils';
import {
  MdCalendarMonth,
  MdAccessTime,
  MdArrowForward,
  MdCheckCircle,
  MdHourglassTop,
  MdAdd,
  MdLocalHospital,
  MdPeople,
  MdPerson,
} from 'react-icons/md';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getAll();
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayApts = appointments.filter((a) => a.appointmentDate && isToday(a.appointmentDate));
  const upcomingApts = appointments.filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status));
  const completedApts = appointments.filter((a) => a.status === 'COMPLETED');

  const stats = [
    { label: 'Total', value: appointments.length, icon: MdCalendarMonth, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Today', value: todayApts.length, icon: MdAccessTime, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Upcoming', value: upcomingApts.length, icon: MdHourglassTop, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Completed', value: completedApts.length, icon: MdCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="bg-[#2563eb] rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-blue-100 text-sm mb-1">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
          </p>
          <h1 className="text-xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Patient'}
          </h1>
          <p className="text-blue-200 text-sm">
            {todayApts.length > 0
              ? `You have ${todayApts.length} appointment${todayApts.length > 1 ? 's' : ''} today`
              : 'No appointments scheduled for today'}
          </p>
        </div>
        <Link
          to="/patient/doctors"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#2563eb] hover:bg-blue-50 transition-colors self-start"
        >
          <MdAdd className="text-lg" />
          Book Appointment
        </Link>
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

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Upcoming Appointments</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your next scheduled visits</p>
            </div>
            <Link to="/patient/appointments" className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
              View all <MdArrowForward className="text-sm" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {upcomingApts.length === 0 ? (
              <div className="p-10 text-center">
                <MdCalendarMonth className="text-3xl text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-1">No upcoming appointments</p>
                <Link to="/patient/doctors" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  Book your first appointment →
                </Link>
              </div>
            ) : (
              upcomingApts.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                  <div className={`w-1 h-10 rounded-full flex-shrink-0 ${
                    apt.status === 'CONFIRMED' ? 'bg-blue-500' : 'bg-amber-400'
                  }`} />
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MdLocalHospital className="text-blue-600 text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">Dr. {apt.doctorName || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{apt.departmentName || 'General'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-slate-700 font-medium">{apt.appointmentDate ? formatDate(apt.appointmentDate) : '—'}</p>
                    <p className="text-xs text-slate-400">{apt.startTime ? formatTime(apt.startTime) : '—'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                    apt.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h2>
            <div className="space-y-1">
              {[
                { icon: MdLocalHospital, label: 'Find Doctors', path: '/patient/doctors', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: MdCalendarMonth, label: 'My Appointments', path: '/patient/appointments', color: 'text-violet-600', bg: 'bg-violet-50' },
                { icon: MdPeople, label: 'Queue Status', path: '/patient/queue', color: 'text-amber-600', bg: 'bg-amber-50' },
                { icon: MdPerson, label: 'My Profile', path: '/patient/profile', color: 'text-slate-600', bg: 'bg-slate-50' },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.path}
                  className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center`}>
                    <action.icon className={`${action.color} text-lg`} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 flex-1">{action.label}</span>
                  <MdArrowForward className="text-slate-300 group-hover:text-slate-500 text-sm" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Recent Activity</h2>
            <div className="space-y-3">
              {appointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    apt.status === 'COMPLETED' ? 'bg-green-500' :
                    apt.status === 'CANCELLED' ? 'bg-red-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 truncate">
                      <span className="font-medium">Dr. {apt.doctorName}</span> — {apt.status?.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {apt.appointmentDate ? formatDate(apt.appointmentDate) : 'Date pending'}
                    </p>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
