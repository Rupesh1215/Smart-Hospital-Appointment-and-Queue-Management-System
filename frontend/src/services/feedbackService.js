import api from './api';

const feedbackService = {
  submit: (data) => api.post('/feedbacks', data),
  getPending: () => api.get('/feedbacks/pending'),
  getByDoctor: (doctorId) => api.get(`/feedbacks/doctor/${doctorId}`),
};

export default feedbackService;
