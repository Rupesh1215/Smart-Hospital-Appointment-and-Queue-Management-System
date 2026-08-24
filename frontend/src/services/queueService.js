import api from './api';

const queueService = {
  getByDoctor: (doctorId) => api.get(`/queues/${doctorId}`),
  getByPatient: (patientId) => api.get(`/queues/patient/${patientId}`),
  checkIn: (data) => api.post('/queues/check-in', data),
  callNext: (data) => api.post('/queues/call-next', data),
  startConsultation: (data) => api.post('/queues/start', data),
  completeConsultation: (data) => api.post('/queues/complete', data),
  skip: (data) => api.post('/queues/skip', data),
};

export default queueService;
