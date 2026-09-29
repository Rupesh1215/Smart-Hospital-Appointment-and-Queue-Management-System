import api from './api';

const appointmentService = {
  getAll: (params) => api.get('/appointments', { params }),
  getMine: (date) => api.get('/appointments/mine', { params: date ? { date } : {} }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
  cancel: (id, reason) => api.put(`/appointments/${id}/cancel`, null, { params: reason ? { reason } : {} }),
  cancelById: (id) => api.delete(`/appointments/${id}`),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
  checkIn: (appointmentId) => api.post('/queues/check-in', { appointmentId }),
};

export default appointmentService;
