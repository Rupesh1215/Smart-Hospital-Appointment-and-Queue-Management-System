import { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import adminService from '../../services/adminService';
import {
  MdPeople,
  MdLocalHospital,
  MdBusiness,
  MdCalendarMonth,
  MdAttachMoney,
  MdCheckCircle,
  MdRefresh,
} from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#2563eb', '#0f766e', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [anaRes] = await Promise.all([analyticsService.getAnalytics()]);
      setAnalytics(anaRes.data?.data || null);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-24 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <div className="skeleton h-72 rounded-xl" />
      </div>
    );
  }

  const deptData = Object.entries(analytics?.departmentDistribution || {}).map(([name, count]) => ({ name, count }));
  const statusData = [
    { name: 'Completed', value: analytics?.completedAppointments || 0 },
    { name: 'Pending', value: analytics?.pendingAppointments || 0 },
    { name: 'Cancelled', value: analytics?.cancelledAppointments || 0 },
  ];

  const stats = [
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: MdPeople, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Doctors', value: analytics?.totalDoctors || 0, icon: MdLocalHospital, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Appointments', value: analytics?.totalAppointments || 0, icon: MdCalendarMonth, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Revenue', value: `$${analytics?.estimatedRevenue || 0}`, icon: MdAttachMoney, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hospital Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time statistics and analytics</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary btn-sm cursor-pointer">
          <MdRefresh className="text-lg" /> Refresh
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MdBusiness className="text-blue-600" />
            Appointments by Department
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData.length > 0 ? deptData : [{ name: 'General', count: 1 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MdCheckCircle className="text-blue-600" />
            Appointment Status
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
