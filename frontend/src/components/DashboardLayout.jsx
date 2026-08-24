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
    <div className="h-screen flex overflow-hidden bg-[#f8fafc]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
              <MdLocalHospital className="text-white text-lg" />
            </div>
            <span className="text-base font-bold text-slate-900">SmartHospital</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2563eb] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {user?.role?.toLowerCase() || 'user'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto no-scrollbar">
          <p className="text-[0.65rem] uppercase tracking-widest text-slate-400 font-semibold px-3 mb-2">Menu</p>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || MdChevronRight;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                  active
                    ? 'bg-[#eff6ff] text-[#2563eb]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`text-lg flex-shrink-0 ${active ? 'text-[#2563eb]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-100 p-3 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <MdLogout className="text-lg" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <MdMenu className="text-xl" />
            </button>
            <h1 className="text-base font-semibold text-slate-900">{currentPageLabel}</h1>
          </div>

          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 ml-2">
              <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white font-semibold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
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
