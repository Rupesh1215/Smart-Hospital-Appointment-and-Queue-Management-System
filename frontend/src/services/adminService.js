import api from './api';

const adminService = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role?role=${role}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings),
};

export default adminService;
