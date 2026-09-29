import { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
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
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#2563eb', '#0d9488', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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
        <div className="skeleton h-24" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
        <div className="skeleton h-72" />
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
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: MdPeople, colorClass: 'stat-blue' },
    { label: 'Active Doctors', value: analytics?.totalDoctors || 0, icon: MdLocalHospital, colorClass: 'stat-teal' },
    { label: 'Appointments', value: analytics?.totalAppointments || 0, icon: MdCalendarMonth, colorClass: 'stat-amber' },
    { label: 'Total Revenue', value: `$${analytics?.estimatedRevenue || 0}`, icon: MdAttachMoney, colorClass: 'stat-emerald' },
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Executive Analytics Overview</h1>
          <p className="admin-header-subtitle">Real-time hospital metrics, revenue projections, and appointment volume</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary btn-sm">
          <MdRefresh /> Sync Data
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="admin-stat-card">
            <div className={`admin-stat-icon ${stat.colorClass}`}>
              <stat.icon />
            </div>
            <div>
              <p className="admin-stat-val">{stat.value}</p>
              <p className="admin-stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-charts-grid">
        <div className="card admin-chart-card">
          <h3 className="text-card-title flex items-center gap-2 mb-4">
            <MdBusiness className="text-primary-600" />
            Appointments by Department
          </h3>
          <div className="admin-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData.length > 0 ? deptData : [{ name: 'General', count: 1 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card admin-chart-card">
          <h3 className="text-card-title flex items-center gap-2 mb-4">
            <MdCheckCircle className="text-emerald-600" />
            Appointment Fulfillment Status
          </h3>
          <div className="admin-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-chart-legend">
            {statusData.map((item, i) => (
              <div key={i} className="admin-legend-item">
                <div className="admin-legend-dot" style={{ backgroundColor: COLORS[i] }} />
                <span>{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
