import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import './AdminAuditLogs.css';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs();
      setLogs(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load audit logs');
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

  return (
    <div className="admin-audit-page">
      <div className="admin-audit-header">
        <div>
          <h1 className="admin-audit-title">Audit Logs</h1>
          <p className="admin-audit-subtitle">System activity and security events</p>
        </div>
      </div>

      <div className="admin-audit-card">
        {logs.length === 0 ? (
          <div className="admin-audit-empty">No audit logs found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User ID</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div>{formatDate(log.timestamp)}</div>
                      <div className="admin-audit-details">{formatTime(new Date(log.timestamp).toTimeString().slice(0, 5))}</div>
                    </td>
                    <td>{log.userId || 'System'}</td>
                    <td className="admin-audit-action">{log.action}</td>
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
