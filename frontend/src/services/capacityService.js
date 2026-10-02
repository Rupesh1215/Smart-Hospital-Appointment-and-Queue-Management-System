import api from './api';

const capacityService = {
  getCapacity: (doctorId, date) =>
    api.get(`/capacity/doctor/${doctorId}`, { params: { date } }),

  updateSlotAllocation: (doctorId, date, onlineLimit, offlineLimit) =>
    api.put(`/capacity/doctor/${doctorId}`, null, {
      params: { date, onlineLimit, offlineLimit },
    }),

  submitExtraCapacityRequest: (doctorId, date, extraSlots, message) =>
    api.post('/capacity/request', null, {
      params: { doctorId, date, extraSlots, message },
    }),

  getRequests: (doctorId) =>
    api.get('/capacity/requests', { params: { doctorId } }),

  approveRequest: (requestId) =>
    api.put(`/capacity/requests/${requestId}/approve`),

  rejectRequest: (requestId) =>
    api.put(`/capacity/requests/${requestId}/reject`),
};

export default capacityService;
