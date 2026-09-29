import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import About from '../pages/public/About';
import Departments from '../pages/public/Departments';
import Doctors from '../pages/public/Doctors';

// Patient pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientAppointments from '../pages/patient/PatientAppointments';
import BookAppointment from '../pages/patient/BookAppointment';
import PatientQueue from '../pages/patient/PatientQueue';
import PatientProfile from '../pages/patient/PatientProfile';

// Doctor pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import DoctorQueue from '../pages/doctor/DoctorQueue';
import DoctorProfile from '../pages/doctor/DoctorProfile';

// Receptionist pages
import ReceptionistDashboard from '../pages/receptionist/ReceptionistDashboard';
import ReceptionistPatients from '../pages/receptionist/ReceptionistPatients';
import ReceptionistAppointments from '../pages/receptionist/ReceptionistAppointments';
import ReceptionistBookAppointment from '../pages/receptionist/ReceptionistBookAppointment';
import ReceptionistQueue from '../pages/receptionist/ReceptionistQueue';
import ReceptionistCheckIn from '../pages/receptionist/ReceptionistCheckIn';
import ReceptionistProfile from '../pages/receptionist/ReceptionistProfile';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageDoctors from '../pages/admin/ManageDoctors';
import ManageDepartments from '../pages/admin/ManageDepartments';
import ManageUsers from '../pages/admin/ManageUsers';
import AdminAppointments from '../pages/admin/AdminAppointments';
import AdminReports from '../pages/admin/AdminReports';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminProfile from '../pages/admin/AdminProfile';
import AdminQueueMonitor from '../pages/admin/AdminQueueMonitor';
import './AppRoutes.css';

// Placeholder pages — will be replaced in later phases
function ComingSoon({ title }) {
  return (
    <div className="coming-soon-wrapper">
      <Navbar />
      <main className="coming-soon-main">
        <div className="coming-soon-content">
          <div className="coming-soon-icon-wrap">
            <svg className="coming-soon-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="coming-soon-title">{title}</h1>
          <p className="coming-soon-desc">This page is coming in a future phase.</p>
          <a
            href="/"
            className="coming-soon-btn"
          >
            ← Back to Home
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Redirect authenticated users away from login/register to their role dashboard */
function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const dashboardPaths = {
      ADMIN: '/admin/dashboard',
      DOCTOR: '/doctor/dashboard',
      RECEPTIONIST: '/receptionist/dashboard',
      PATIENT: '/patient/dashboard',
    };
    return <Navigate to={dashboardPaths[user.role] || '/'} replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/departments" element={<Departments />} />
      <Route path="/doctors" element={<Doctors />} />

      {/* Auth Routes — redirect to dashboard if already logged in */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Patient Routes — Phase 9 */}
      <Route path="/patient/*" element={
        <ProtectedRoute allowedRoles={['PATIENT']}>
          <DashboardLayout>
            <Routes>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="doctors" element={<BookAppointment />} />
              <Route path="queue" element={<PatientQueue />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Doctor Routes — Phase 11 */}
      <Route path="/doctor/*" element={
        <ProtectedRoute allowedRoles={['DOCTOR']}>
          <DashboardLayout>
            <Routes>
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="queue" element={<DoctorQueue />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Receptionist Routes — Phase 10 */}
      <Route path="/receptionist/*" element={
        <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
          <DashboardLayout>
            <Routes>
              <Route path="dashboard" element={<ReceptionistDashboard />} />
              <Route path="patients" element={<ReceptionistPatients />} />
              <Route path="appointments" element={<ReceptionistAppointments />} />
              <Route path="book" element={<ReceptionistBookAppointment />} />
              <Route path="queue" element={<ReceptionistQueue />} />
              <Route path="check-in" element={<ReceptionistCheckIn />} />
              <Route path="profile" element={<ReceptionistProfile />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Admin Routes — Phase 12 */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="doctors" element={<ManageDoctors />} />
              <Route path="departments" element={<ManageDepartments />} />
              <Route path="patients" element={<ManageUsers />} />
              <Route path="receptionists" element={<ManageUsers />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="queue" element={<AdminQueueMonitor />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Error Pages */}
      <Route path="/forbidden" element={<ComingSoon title="403 — Forbidden" />} />
      <Route path="*" element={<ComingSoon title="404 — Page Not Found" />} />
    </Routes>
  );
}
