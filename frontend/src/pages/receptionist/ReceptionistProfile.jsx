import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdCalendarMonth,
  MdSupportAgent,
  MdVerified,
  MdSecurity,
  MdCheckCircle,
  MdBadge,
} from 'react-icons/md';
import './ReceptionistProfile.css';

export default function ReceptionistProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authService.getCurrentUser();
      setProfile(res.data.data || null);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rec-profile-loader-wrap">
        <div className="rec-profile-loader" />
      </div>
    );
  }

  const displayUser = profile || user;

  const personalFields = [
    { icon: MdPerson, label: 'Full Name', value: displayUser?.name || 'Receptionist' },
    { icon: MdEmail, label: 'Email Address', value: displayUser?.email || 'receptionist@gmail.com' },
    { icon: MdPhone, label: 'Contact Phone', value: displayUser?.phone || '+91 9876543211' },
    { icon: MdBadge, label: 'Staff ID', value: `REC-${(displayUser?.id || '98761').slice(-6).toUpperCase()}` },
    { icon: MdSupportAgent, label: 'Department Role', value: 'Front Desk & Patient Services' },
    { icon: MdCalendarMonth, label: 'Shift Access', value: 'Full Access (Morning & Evening)' },
  ];

  return (
    <div className="rec-profile-container">
      {/* ── Top Hero Header Card ── */}
      <div className="rec-profile-hero-card">
        <div className="rec-profile-hero-banner" />
        <div className="rec-profile-hero-body">
          <div className="rec-profile-avatar-wrapper">
            <div className="rec-profile-avatar-circle">
              <MdSupportAgent />
            </div>
            <span className="rec-profile-online-dot" />
          </div>

          <div className="rec-profile-header-details">
            <div className="rec-profile-name-row">
              <h1 className="rec-profile-user-name">
                {displayUser?.name || 'Receptionist'}
              </h1>
              <span className="rec-profile-verified-badge">
                <MdVerified /> Staff Account
              </span>
            </div>
            <p className="rec-profile-user-email">{displayUser?.email}</p>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Grid Layout ── */}
      <div className="rec-profile-grid">
        {/* Personal Details Section */}
        <div className="rec-profile-card">
          <div className="rec-profile-card-header">
            <div className="rec-profile-card-header-icon">
              <MdPerson />
            </div>
            <div>
              <h3 className="rec-profile-card-title">Staff Profile Details</h3>
              <p className="rec-profile-card-sub">Reception & administrative credentials</p>
            </div>
          </div>

          <div className="rec-profile-fields-grid">
            {personalFields.map((field) => (
              <div key={field.label} className="rec-profile-field-tile">
                <div className="rec-profile-tile-icon">
                  <field.icon />
                </div>
                <div>
                  <span className="rec-profile-tile-label">{field.label}</span>
                  <p className="rec-profile-tile-value">{field.value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & System Info Section */}
        <div className="rec-profile-card">
          <div className="rec-profile-card-header">
            <div className="rec-profile-card-header-icon security">
              <MdSecurity />
            </div>
            <div>
              <h3 className="rec-profile-card-title">Operational Access</h3>
              <p className="rec-profile-card-sub">Assigned privileges and portal permissions</p>
            </div>
          </div>

          <div className="rec-profile-security-list">
            <div className="rec-profile-sec-item">
              <div>
                <span className="rec-profile-sec-title">Patient Check-In Control</span>
                <p className="rec-profile-sec-desc">Authorized to check in patients and manage queues</p>
              </div>
              <span className="rec-profile-badge-green">
                <MdCheckCircle /> Granted
              </span>
            </div>

            <div className="rec-profile-sec-item">
              <div>
                <span className="rec-profile-sec-title">Appointment Scheduling</span>
                <p className="rec-profile-sec-desc">Full booking & rescheduling authorization</p>
              </div>
              <span className="rec-profile-badge-green">
                <MdCheckCircle /> Granted
              </span>
            </div>

            <div className="rec-profile-sec-item">
              <div>
                <span className="rec-profile-sec-title">System Status</span>
                <p className="rec-profile-sec-desc">Active staff session authenticated</p>
              </div>
              <span className="rec-profile-badge-blue">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
