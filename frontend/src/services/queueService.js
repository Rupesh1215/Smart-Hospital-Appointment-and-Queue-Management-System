import api from './api';

const queueService = {
  // ── Query ──────────────────────────────────────────────────────────────────
  getByDoctor: (doctorId, date) =>
    api.get(`/queues/${doctorId}`, date ? { params: { date } } : {}),
  getByPatient: (patientId, date) =>
    api.get(`/queues/patient/${patientId}`, date ? { params: { date } } : {}),
  /** Patient: get own active queue status (JWT-based) */
  getMyQueue: () => api.get('/queues/patient/me'),
  /** Doctor: get own today's queue (JWT-based) */
  getMyDoctorQueue: (date) =>
    api.get('/queues/doctor/me', date ? { params: { date } } : {}),
  /** Admin: get all queues for today */
  getAllToday: (date) =>
    api.get('/queues/today', date ? { params: { date } } : {}),

  // ── State transitions ──────────────────────────────────────────────────────
  checkIn: (data) => api.post('/queues/check-in', data),
  callNext: (data) => api.post('/queues/call-next', data),
  startConsultation: (data) => api.post('/queues/start', data),
  completeConsultation: (data) => api.post('/queues/complete', data),
  skip: (data) => api.post('/queues/skip', data),
  noShow: (data) => api.post('/queues/no-show', data),
};

export default queueService;
