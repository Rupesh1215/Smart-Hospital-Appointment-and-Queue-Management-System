import { useState, useEffect, useRef } from 'react';
import { MdNotifications, MdCheck, MdDoneAll, MdInfo } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import { formatTime } from '../utils/dateUtils';
import './NotificationDropdown.css';

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const [resList, resCount] = await Promise.all([
        notificationService.getByUser(user.id),
        notificationService.getUnreadCount(user.id),
      ]);
      setNotifications(resList.data?.data || []);
      setUnreadCount(resCount.data?.data || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="notification-toggle-btn"
      >
        <MdNotifications size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-menu">
          {/* Header */}
          <div className="notification-header">
            <h4 className="notification-title">
              Notifications
              {unreadCount > 0 && (
                <span className="notification-unread-count">
                  {unreadCount} unread
                </span>
              )}
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="notification-mark-all"
              >
                <MdDoneAll size={16} /> Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <MdNotifications />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`notification-item ${!item.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-icon-wrapper">
                    <MdInfo size={18} />
                  </div>
                  <div className="notification-content">
                    <p className={`notification-item-title ${item.isRead ? 'read' : 'unread'}`}>
                      {item.title}
                    </p>
                    <p className="notification-item-message">
                      {item.message}
                    </p>
                    <span className="notification-item-time">
                      {item.createdAt ? formatTime(item.createdAt) : 'Just now'}
                    </span>
                  </div>
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      title="Mark as read"
                      className="notification-mark-btn"
                    >
                      <MdCheck size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
