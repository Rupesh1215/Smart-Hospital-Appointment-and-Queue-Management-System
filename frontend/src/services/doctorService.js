import api from './api';

const doctorService = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
  getAvailability: (id, date) => api.get(`/doctors/${id}/availability`, { params: { date } }),
  getSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
};

export default doctorService;
