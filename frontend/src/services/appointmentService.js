import api from './api';

const appointmentService = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
};

export default appointmentService;
