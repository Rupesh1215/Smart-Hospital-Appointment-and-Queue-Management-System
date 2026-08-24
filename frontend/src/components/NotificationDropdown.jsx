import { useState, useEffect, useRef } from 'react';
import { MdNotifications, MdCheck, MdDoneAll, MdInfo } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import { formatTime } from '../utils/dateUtils';

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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
      >
        <MdNotifications className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white animate-scale-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[60] overflow-hidden animate-dropdown">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                  {unreadCount} unread
                </span>
              )}
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <MdDoneAll /> Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MdNotifications className="text-4xl mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-50 animate-fade-in ${
                    item.isRead ? 'bg-white' : 'bg-teal-50/40'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-teal-100 text-teal-600 flex-shrink-0">
                    <MdInfo className="text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${item.isRead ? 'text-slate-700' : 'text-slate-900 font-semibold'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {item.createdAt ? formatTime(item.createdAt) : 'Just now'}
                    </span>
                  </div>
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      title="Mark as read"
                      className="p-1 text-slate-400 hover:text-teal-600 rounded-lg cursor-pointer transition-colors"
                    >
                      <MdCheck className="text-base" />
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
