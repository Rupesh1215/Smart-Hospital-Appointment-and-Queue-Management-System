import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS } from '../utils/constants';
import PageTransition from './PageTransition';
import {
  MdDashboard,
  MdSearch,
  MdCalendarMonth,
  MdPeople,
  MdPerson,
  MdLocalHospital,
  MdSupervisorAccount,
  MdBusiness,
  MdBarChart,
  MdHistory,
  MdSettings,
  MdCheckCircle,
  MdQueue,
  MdLogout,
  MdMenu,
  MdClose,
  MdChevronRight,
  MdSmartToy,
  MdNotifications,
  MdMedicalServices,
  MdEventNote,
} from 'react-icons/md';

import NotificationDropdown from './NotificationDropdown';
import ChatbotWidget from './ChatbotWidget';
import './DashboardLayout.css';

const iconMap = {
  MdDashboard,
  MdSearch,
  MdCalendarMonth,
  MdPeople,
  MdPerson,
  MdLocalHospital,
  MdSupervisorAccount,
  MdBusiness,
  MdBarChart,
  MdHistory,
  MdSettings,
  MdCheckCircle,
  MdQueue,
  MdSmartToy,
  MdNotifications,
  MdMedicalServices,
  MdEventNote,
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = NAV_ITEMS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const currentPageLabel = navItems.find((item) => isActive(item.path))?.label || 'Dashboard';

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="dashboard-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        {/* Logo */}
        <div className="dashboard-logo-area">
          <Link to="/" className="dashboard-logo-link">
            <div className="dashboard-logo-icon">
              <MdLocalHospital />
            </div>
            <span className="dashboard-logo-text">SmartHospital</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="dashboard-close-btn"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="dashboard-user-info">
          <div className="dashboard-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="dashboard-user-details">
            <p className="dashboard-user-name">
              {user?.name || 'User'}
            </p>
            <p className="dashboard-user-role">
              {user?.role?.toLowerCase() || 'user'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="dashboard-nav">
          <p className="dashboard-nav-title">Menu</p>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || MdChevronRight;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`dashboard-nav-item ${active ? 'active' : ''}`}
              >
                <Icon className="dashboard-nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="dashboard-logout-area">
          <button
            onClick={handleLogout}
            className="dashboard-logout-btn"
          >
            <MdLogout size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main-area">
        {/* Top Bar */}
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button
              onClick={() => setSidebarOpen(true)}
              className="dashboard-menu-btn"
            >
              <MdMenu size={20} />
            </button>
            <h1 className="dashboard-page-title">{currentPageLabel}</h1>
          </div>

          <div className="dashboard-topbar-right">
            <NotificationDropdown />
            <div className="dashboard-user-profile">
              <div className="dashboard-user-profile-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="dashboard-user-profile-name">
                <p>{user?.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-content-wrapper">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      {/* AI Chatbot */}
      <ChatbotWidget />
    </div>
  );
}
