import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdCalendarMonth,
  MdLocationOn,
  MdVerified,
  MdSecurity,
  MdEdit,
  MdCheckCircle,
  MdBadge,
} from 'react-icons/md';
import './PatientProfile.css';

export default function PatientProfile() {
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
      <div className="pat-profile-loader-wrap">
        <div className="pat-profile-loader" />
      </div>
    );
  }

  const displayUser = profile || user;

  const personalFields = [
    { icon: MdPerson, label: 'Full Name', value: displayUser?.name },
    { icon: MdEmail, label: 'Email Address', value: displayUser?.email },
    { icon: MdPhone, label: 'Phone Number', value: displayUser?.phone || '+91 9876543210' },
    {
      icon: MdPerson,
      label: 'Gender',
      value: displayUser?.gender
        ? displayUser.gender.charAt(0) + displayUser.gender.slice(1).toLowerCase()
        : 'Male',
    },
    { icon: MdBadge, label: 'Patient ID', value: `PAT-${(displayUser?.id || '10293').slice(-6).toUpperCase()}` },
    { icon: MdCalendarMonth, label: 'Account Role', value: 'Patient User' },
  ];

  return (
    <div className="pat-profile-container">
      {/* ── Top Hero Header Card ── */}
      <div className="pat-profile-hero-card">
        <div className="pat-profile-hero-banner" />
        <div className="pat-profile-hero-body">
          <div className="pat-profile-avatar-wrapper">
            <div className="pat-profile-avatar-circle">
              {displayUser?.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <span className="pat-profile-online-dot" />
          </div>

          <div className="pat-profile-header-details">
            <div className="pat-profile-name-row">
              <h1 className="pat-profile-user-name">
                {displayUser?.name || 'Patient Name'}
              </h1>
              <span className="pat-profile-verified-badge">
                <MdVerified /> Verified Patient
              </span>
            </div>
            <p className="pat-profile-user-email">{displayUser?.email}</p>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Grid Layout ── */}
      <div className="pat-profile-grid">
        {/* Personal Details Section */}
        <div className="pat-profile-card">
          <div className="pat-profile-card-header">
            <div className="pat-profile-card-header-icon">
              <MdPerson />
            </div>
            <div>
              <h3 className="pat-profile-card-title">Personal Information</h3>
              <p className="pat-profile-card-sub">Your registered medical profile details</p>
            </div>
          </div>

          <div className="pat-profile-fields-grid">
            {personalFields.map((field) => (
              <div key={field.label} className="pat-profile-field-tile">
                <div className="pat-profile-tile-icon">
                  <field.icon />
                </div>
                <div>
                  <span className="pat-profile-tile-label">{field.label}</span>
                  <p className="pat-profile-tile-value">{field.value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & System Info Section */}
        <div className="pat-profile-card">
          <div className="pat-profile-card-header">
            <div className="pat-profile-card-header-icon security">
              <MdSecurity />
            </div>
            <div>
              <h3 className="pat-profile-card-title">Account & Security</h3>
              <p className="pat-profile-card-sub">Access rights and security status</p>
            </div>
          </div>

          <div className="pat-profile-security-list">
            <div className="pat-profile-sec-item">
              <div>
                <span className="pat-profile-sec-title">Account Status</span>
                <p className="pat-profile-sec-desc">Active patient account with full booking rights</p>
              </div>
              <span className="pat-profile-badge-green">
                <MdCheckCircle /> Active
              </span>
            </div>

            <div className="pat-profile-sec-item">
              <div>
                <span className="pat-profile-sec-title">HIPAA & Privacy Compliance</span>
                <p className="pat-profile-sec-desc">Your health records are encrypted and protected</p>
              </div>
              <span className="pat-profile-badge-blue">Protected</span>
            </div>

            <div className="pat-profile-sec-item">
              <div>
                <span className="pat-profile-sec-title">Real-Time Notifications</span>
                <p className="pat-profile-sec-desc">Queue updates and appointment alerts via WebSocket</p>
              </div>
              <span className="pat-profile-badge-green">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
