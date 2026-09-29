import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdAdminPanelSettings,
  MdVerified,
  MdSecurity,
  MdCheckCircle,
  MdBadge,
  MdVpnKey,
} from 'react-icons/md';
import './AdminProfile.css';

export default function AdminProfile() {
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
      <div className="adm-profile-loader-wrap">
        <div className="adm-profile-loader" />
      </div>
    );
  }

  const displayUser = profile || user;

  const personalFields = [
    { icon: MdPerson, label: 'Super Admin Name', value: displayUser?.name || 'Administrator' },
    { icon: MdEmail, label: 'Root Email', value: displayUser?.email || 'admin@gmail.com' },
    { icon: MdPhone, label: 'Contact Phone', value: displayUser?.phone || '+91 9876543210' },
    { icon: MdBadge, label: 'Admin ID', value: `ADM-001-ROOT` },
    { icon: MdAdminPanelSettings, label: 'Access Level', value: 'Root Super Administrator' },
    { icon: MdVpnKey, label: 'Security Clearance', value: 'Tier 1 Hospital Systems' },
  ];

  return (
    <div className="adm-profile-container">
      {/* ── Top Hero Header Card ── */}
      <div className="adm-profile-hero-card">
        <div className="adm-profile-hero-banner" />
        <div className="adm-profile-hero-body">
          <div className="adm-profile-avatar-wrapper">
            <div className="adm-profile-avatar-circle">
              <MdAdminPanelSettings />
            </div>
            <span className="adm-profile-online-dot" />
          </div>

          <div className="adm-profile-header-details">
            <div className="adm-profile-name-row">
              <h1 className="adm-profile-user-name">
                {displayUser?.name || 'Administrator'}
              </h1>
              <span className="adm-profile-verified-badge">
                <MdVerified /> Root Administrator
              </span>
            </div>
            <p className="adm-profile-user-email">{displayUser?.email}</p>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Grid Layout ── */}
      <div className="adm-profile-grid">
        {/* Personal Details Section */}
        <div className="adm-profile-card">
          <div className="adm-profile-card-header">
            <div className="adm-profile-card-header-icon">
              <MdAdminPanelSettings />
            </div>
            <div>
              <h3 className="adm-profile-card-title">System Credentials</h3>
              <p className="adm-profile-card-sub">Root access details & identity token</p>
            </div>
          </div>

          <div className="adm-profile-fields-grid">
            {personalFields.map((field) => (
              <div key={field.label} className="adm-profile-field-tile">
                <div className="adm-profile-tile-icon">
                  <field.icon />
                </div>
                <div>
                  <span className="adm-profile-tile-label">{field.label}</span>
                  <p className="adm-profile-tile-value">{field.value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Audit Controls */}
        <div className="adm-profile-card">
          <div className="adm-profile-card-header">
            <div className="adm-profile-card-header-icon security">
              <MdSecurity />
            </div>
            <div>
              <h3 className="adm-profile-card-title">System Privileges</h3>
              <p className="adm-profile-card-sub">Core permissions & audit logging</p>
            </div>
          </div>

          <div className="adm-profile-security-list">
            <div className="adm-profile-sec-item">
              <div>
                <span className="adm-profile-sec-title">Full Database Access</span>
                <p className="adm-profile-sec-desc">Create/read/update/delete rights across all collections</p>
              </div>
              <span className="adm-profile-badge-amber">
                <MdCheckCircle /> Unrestricted
              </span>
            </div>

            <div className="adm-profile-sec-item">
              <div>
                <span className="adm-profile-sec-title">Audit Logging</span>
                <p className="adm-profile-sec-desc">All admin actions are recorded in system audit logs</p>
              </div>
              <span className="adm-profile-badge-green">Active</span>
            </div>

            <div className="adm-profile-sec-item">
              <div>
                <span className="adm-profile-sec-title">JWT Authentication</span>
                <p className="adm-profile-sec-desc">Bearer token session active</p>
              </div>
              <span className="adm-profile-badge-green">Secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
