// API Base URL — uses Vite proxy in development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// User Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
  PATIENT: 'PATIENT',
};

// Appointment Statuses
export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  IN_QUEUE: 'IN_QUEUE',
  IN_CONSULTATION: 'IN_CONSULTATION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  RESCHEDULED: 'RESCHEDULED',
};

// Queue Statuses
export const QUEUE_STATUS = {
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  IN_CONSULTATION: 'IN_CONSULTATION',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
  NO_SHOW: 'NO_SHOW',
  CANCELLED: 'CANCELLED',
};

// Booking Types
export const BOOKING_TYPE = {
  ONLINE: 'ONLINE',
  RECEPTIONIST: 'RECEPTIONIST',
  AI_CHATBOT: 'AI_CHATBOT',
};

// Priority Levels
export const PRIORITY = {
  NORMAL: 'NORMAL',
  URGENT: 'URGENT',
  EMERGENCY: 'EMERGENCY',
};

// Departments
export const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Dermatology',
  'General Medicine',
  'Pediatrics',
  'ENT',
  'Ophthalmology',
];

// Navigation items per role
export const NAV_ITEMS = {
  [ROLES.PATIENT]: [
    { label: 'Dashboard', path: '/patient/dashboard', icon: 'MdDashboard' },
    { label: 'Find Doctor', path: '/patient/doctors', icon: 'MdSearch' },
    { label: 'My Appointments', path: '/patient/appointments', icon: 'MdCalendarMonth' },
    { label: 'Queue Status', path: '/patient/queue', icon: 'MdPeople' },
    { label: 'Profile', path: '/patient/profile', icon: 'MdPerson' },
  ],
  [ROLES.DOCTOR]: [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: 'MdDashboard' },
    { label: 'Appointments', path: '/doctor/appointments', icon: 'MdCalendarMonth' },
    { label: 'Queue', path: '/doctor/queue', icon: 'MdPeople' },
    { label: 'Profile', path: '/doctor/profile', icon: 'MdPerson' },
  ],
  [ROLES.RECEPTIONIST]: [
    { label: 'Dashboard', path: '/receptionist/dashboard', icon: 'MdDashboard' },
    { label: 'Patients', path: '/receptionist/patients', icon: 'MdPeople' },
    { label: 'Appointments', path: '/receptionist/appointments', icon: 'MdCalendarMonth' },
    { label: 'Queue', path: '/receptionist/queue', icon: 'MdQueue' },
    { label: 'Check-In', path: '/receptionist/check-in', icon: 'MdCheckCircle' },
    { label: 'Profile', path: '/receptionist/profile', icon: 'MdPerson' },
  ],
  [ROLES.ADMIN]: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'MdDashboard' },
    { label: 'Doctors', path: '/admin/doctors', icon: 'MdLocalHospital' },
    { label: 'Patients', path: '/admin/patients', icon: 'MdPeople' },
    { label: 'Receptionists', path: '/admin/receptionists', icon: 'MdSupervisorAccount' },
    { label: 'Departments', path: '/admin/departments', icon: 'MdBusiness' },
    { label: 'Appointments', path: '/admin/appointments', icon: 'MdCalendarMonth' },
    { label: 'Queue Monitor', path: '/admin/queue', icon: 'MdQueue' },
    { label: 'Reports', path: '/admin/reports', icon: 'MdBarChart' },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'MdHistory' },
    { label: 'Profile', path: '/admin/profile', icon: 'MdPerson' },
    { label: 'Settings', path: '/admin/settings', icon: 'MdSettings' },
  ],
};

// Status color mapping
export const STATUS_COLORS = {
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  CHECKED_IN: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  IN_QUEUE: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  IN_CONSULTATION: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  NO_SHOW: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
  RESCHEDULED: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  WAITING: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  CALLED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  SKIPPED: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
};
