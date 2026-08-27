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
  MdEdit,
  MdSave,
  MdClose,
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

  const profileFields = [
    { icon: MdPerson, label: 'Full Name', value: displayUser?.name },
    { icon: MdEmail, label: 'Email', value: displayUser?.email },
    { icon: MdPhone, label: 'Phone', value: displayUser?.phone || 'Not provided' },
    {
      icon: MdPerson,
      label: 'Gender',
      value: displayUser?.gender
        ? displayUser.gender.charAt(0) + displayUser.gender.slice(1).toLowerCase()
        : 'Not provided',
    },
    {
      icon: MdCalendarMonth,
      label: 'Role',
      value: displayUser?.role
        ? displayUser.role.charAt(0) + displayUser.role.slice(1).toLowerCase()
        : 'Patient',
    },
  ];

  return (
    <div className="pat-profile-page">
      <h1 className="pat-profile-title">My Profile</h1>

      {/* Profile Header */}
      <div className="pat-profile-card">
        <div className="pat-profile-hero" />
        <div className="pat-profile-hero-content">
          <div className="pat-profile-user-info">
            <div className="pat-profile-avatar">
              {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ paddingBottom: '0.25rem' }}>
              <h2 className="pat-profile-name">
                {displayUser?.name || 'User'}
              </h2>
              <p className="pat-profile-email">{displayUser?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="pat-profile-card">
        <div className="pat-profile-section-header">
          <h3 className="pat-profile-section-title">Personal Information</h3>
        </div>
        <div className="pat-profile-details">
          {profileFields.map((field) => (
            <div key={field.label} className="pat-profile-field">
              <div className="pat-profile-icon">
                <field.icon />
              </div>
              <div style={{ flex: 1 }}>
                <p className="pat-profile-label">{field.label}</p>
                <p className="pat-profile-val">
                  {field.value || '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="pat-profile-card">
        <div className="pat-profile-section-header">
          <h3 className="pat-profile-section-title">Account</h3>
        </div>
        <div className="pat-profile-status">
          <div>
            <p className="pat-profile-status-label">Account Status</p>
            <p className="pat-profile-status-desc">Your account is active and verified</p>
          </div>
          <span className="pat-profile-status-badge">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
