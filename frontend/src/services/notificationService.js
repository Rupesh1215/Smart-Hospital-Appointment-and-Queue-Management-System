import api from './api';

const notificationService = {
  getByUser: (userId) => api.get(`/notifications/user/${userId}`),
  getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
};

export default notificationService;
