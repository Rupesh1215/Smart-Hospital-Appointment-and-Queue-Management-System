import api from './api';

const consultationService = {
  save: (data) => api.post('/consultations', data),
  getByAppointment: (appointmentId) => api.get(`/consultations/appointment/${appointmentId}`),
  getByPatient: (patientId) => api.get(`/consultations/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/consultations/doctor/${doctorId}`),
};

export default consultationService;
