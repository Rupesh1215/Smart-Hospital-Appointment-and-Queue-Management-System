import { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MdTrendingUp } from 'react-icons/md';
import './AdminReports.css';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0891b2'];

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getAnalytics();
      setData(res.data?.data || null);
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-rep-page">
        <div className="admin-rep-card">
          <div className="admin-rep-empty">
            <MdTrendingUp />
            <p>No analytics data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Format data for charts
  const deptData = data.departmentStats?.map((d) => ({
    name: d.departmentName,
    doctors: d.doctorCount,
  })) || [];

  const aptData = [
    { name: 'Pending', value: data.appointmentsByStatus?.PENDING || 0 },
    { name: 'Confirmed', value: data.appointmentsByStatus?.CONFIRMED || 0 },
    { name: 'Completed', value: data.appointmentsByStatus?.COMPLETED || 0 },
    { name: 'Cancelled', value: data.appointmentsByStatus?.CANCELLED || 0 },
  ].filter(item => item.value > 0);

  return (
    <div className="admin-rep-page">
      <div className="admin-rep-header">
        <div>
          <h1 className="admin-rep-title">Analytics & Reports</h1>
          <p className="admin-rep-subtitle">Hospital performance and statistics</p>
        </div>
      </div>

      <div className="admin-rep-grid">
        <div className="admin-rep-card">
          <h2 className="admin-rep-card-title">Doctors by Department</h2>
          <div className="admin-rep-chart-container">
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} angle={-45} textAnchor="end" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="doctors" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="admin-rep-empty">No department data</p>
            )}
          </div>
        </div>

        <div className="admin-rep-card">
          <h2 className="admin-rep-card-title">Appointments Overview</h2>
          <div className="admin-rep-chart-container">
            {aptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={aptData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {aptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="admin-rep-empty">No appointment data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
