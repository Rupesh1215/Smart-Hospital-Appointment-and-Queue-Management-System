import { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import { formatDate, formatTime, isToday } from '../../utils/dateUtils';
import { STATUS_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  MdSearch,
  MdPeople,
  MdCalendarMonth,
  MdFilterList,
  MdHowToReg,
  MdClose,
  MdPhone,
  MdLocalHospital,
} from 'react-icons/md';
import './ReceptionistPatients.css';

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_QUEUE', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'];

export default function ReceptionistPatients() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showTodayOnly, setShowTodayOnly] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getAll();
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  // Build a unique patients list from appointments
  const patientsMap = new Map();
  appointments.forEach((apt) => {
    if (!patientsMap.has(apt.patientId)) {
      patientsMap.set(apt.patientId, {
        patientId: apt.patientId,
        patientName: apt.patientName,
        appointments: [],
      });
    }
    patientsMap.get(apt.patientId).appointments.push(apt);
  });

  const filteredAppointments = appointments.filter((apt) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.appointmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;

    // Today filter
    const matchesToday = !showTodayOnly || (apt.appointmentDate && isToday(apt.appointmentDate));

    return matchesSearch && matchesStatus && matchesToday;
  });

  // Sort by time (earliest first)
  filteredAppointments.sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    return 0;
  });

  if (loading) {
    return (
      <div className="rec-pat-loader-wrap">
        <div className="rec-pat-loader" />
      </div>
    );
  }

  return (
    <div className="rec-pat-page">
      {/* Header */}
      <div>
        <h1 className="rec-pat-header-title">Patients</h1>
        <p className="rec-pat-header-subtitle">
          Search and manage patient appointments
        </p>
      </div>

      {/* Filters Bar */}
      <div className="rec-pat-filters-card">
        <div className="rec-pat-filters-row">
          {/* Search */}
          <div className="rec-pat-search-wrap">
            <MdSearch />
            <input
              type="text"
              placeholder="Search by patient name, appointment #, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rec-pat-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="rec-pat-search-clear"
              >
                <MdClose />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="rec-pat-filter-wrap">
            <MdFilterList />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rec-pat-select-input"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Today Toggle */}
          <button
            onClick={() => setShowTodayOnly(!showTodayOnly)}
            className={`rec-pat-toggle-btn ${showTodayOnly ? 'active' : 'inactive'}`}
          >
            {showTodayOnly ? "Today's Only" : 'All Dates'}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="rec-pat-results-bar">
        <p className="rec-pat-results-text">
          Showing <span>{filteredAppointments.length}</span> appointment{filteredAppointments.length !== 1 ? 's' : ''}
          {showTodayOnly && ' for today'}
        </p>
        <div className="rec-pat-unique-patients">
          <div className="rec-pat-unique-dot" />
          <span className="rec-pat-unique-text">
            {patientsMap.size} unique patient{patientsMap.size !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Patient Appointments List */}
      <div className="rec-pat-table-card">
        {filteredAppointments.length === 0 ? (
          <div className="rec-pat-empty-state">
            <div className="rec-pat-empty-icon">
              <MdPeople />
            </div>
            <p className="rec-pat-empty-title">No patients found</p>
            <p className="rec-pat-empty-desc">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="rec-pat-table-wrap">
            <table className="rec-pat-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Appt #</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => {
                  const statusColor = STATUS_COLORS[apt.status] || STATUS_COLORS.PENDING;
                  return (
                    <tr key={apt.id}>
                      <td>
                        <div className="rec-pat-cell-user">
                          <div className="rec-pat-avatar">
                            {apt.patientName?.charAt(0)?.toUpperCase() || 'P'}
                          </div>
                          <p className="rec-pat-cell-name">{apt.patientName || 'Unknown'}</p>
                        </div>
                      </td>
                      <td>
                        <p className="rec-pat-cell-mono">{apt.appointmentNumber || '—'}</p>
                      </td>
                      <td>
                        <div>
                          <p className="rec-pat-cell-doc">Dr. {apt.doctorName || 'Unknown'}</p>
                          <p className="rec-pat-cell-sub">{apt.departmentName || '—'}</p>
                        </div>
                      </td>
                      <td>
                        <p className="rec-pat-cell-doc">
                          {apt.appointmentDate ? formatDate(apt.appointmentDate) : '—'}
                        </p>
                        <p className="rec-pat-cell-sub">
                          {apt.startTime ? formatTime(apt.startTime) : '—'}
                        </p>
                      </td>
                      <td>
                        <p className="rec-pat-cell-truncate">
                          {apt.reason || '—'}
                        </p>
                      </td>
                      <td>
                        <span className={`rec-pat-badge ${statusColor.bg} ${statusColor.text}`}>
                          {apt.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
