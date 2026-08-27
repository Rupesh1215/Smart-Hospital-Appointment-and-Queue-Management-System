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
      <div className="admin-skeleton-container">
        <div className="skeleton-box h-24" />
        <div className="admin-stats-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-box h-24" />)}
        </div>
        <div className="skeleton-box h-72" />
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
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: MdPeople, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Active Doctors', value: analytics?.totalDoctors || 0, icon: MdLocalHospital, color: '#0d9488', bg: '#f0fdfa' },
    { label: 'Appointments', value: analytics?.totalAppointments || 0, icon: MdCalendarMonth, color: '#d97706', bg: '#fffbeb' },
    { label: 'Revenue', value: `$${analytics?.estimatedRevenue || 0}`, icon: MdAttachMoney, color: '#16a34a', bg: '#f0fdf4' },
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Hospital Overview</h1>
          <p className="admin-header-subtitle">Real-time statistics and analytics</p>
        </div>
        <button onClick={fetchData} className="admin-refresh-btn">
          <MdRefresh /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="admin-stat-card">
            <div className="admin-stat-icon-wrap" style={{ backgroundColor: stat.bg }}>
              <stat.icon style={{ color: stat.color }} />
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
        <div className="admin-chart-card">
          <h3 className="admin-chart-header">
            <MdBusiness />
            Appointments by Department
          </h3>
          <div className="admin-chart-container">
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

        <div className="admin-chart-card">
          <h3 className="admin-chart-header">
            <MdCheckCircle />
            Appointment Status
          </h3>
          <div className="admin-chart-container">
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
          <div className="admin-chart-legend">
            {statusData.map((item, i) => (
              <div key={i} className="admin-legend-item">
                <div className="admin-legend-dot" style={{ backgroundColor: COLORS[i] }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
