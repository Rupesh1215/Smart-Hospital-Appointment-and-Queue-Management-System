
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import doctorService from '../../services/doctorService';
import toast from 'react-hot-toast';
import {
  MdPerson,
  MdMedicalServices,
  MdSchedule,
  MdSave,
  MdCheckCircle,
  MdCancel,
} from 'react-icons/md';
import './DoctorProfile.css';

const ALL_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export default function DoctorProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const docsRes = await doctorService.getAll();
      const allDocs = docsRes.data?.data || [];

      const currentDoc =
        allDocs.find(
          (d) => d.email === user?.email || d.userId === user?.id
        ) || allDocs[0];

      setProfile(currentDoc);

      if (currentDoc) {
        setForm({
          doctorName: currentDoc.doctorName || '',
          specialization: currentDoc.specialization || '',
          qualification: currentDoc.qualification || '',
          experience: currentDoc.experience || '',
          phone: currentDoc.phone || '',
          consultationFee: currentDoc.consultationFee || 0,
          averageConsultationTime:
            currentDoc.averageConsultationTime || 20,
          maxPatientsPerDay: currentDoc.maxPatientsPerDay || 30,
          workingDays:
            currentDoc.workingDays || [
              'MONDAY',
              'TUESDAY',
              'WEDNESDAY',
              'THURSDAY',
              'FRIDAY',
            ],
          workingHoursStart:
            currentDoc.workingHoursStart || '09:00',
          workingHoursEnd:
            currentDoc.workingHoursEnd || '17:00',
          breakStart: currentDoc.breakStart || '13:00',
          breakEnd: currentDoc.breakEnd || '14:00',
        });
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);

    try {
      await doctorService.update(profile.id, form);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  if (loading) {
    return (
      <div className="doc-spinner-wrap">
        <div className="doc-spinner" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="doc-profile-page">
        <div
          className="dp-card"
          style={{
            textAlign: 'center',
            padding: '3rem',
          }}
        >
          <MdPerson
            style={{
              fontSize: '3rem',
              color: '#cbd5e1',
            }}
          />

          <p
            style={{
              color: '#64748b',
              marginTop: '0.5rem',
            }}
          >
            Doctor profile not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-profile-page">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h1 className="doc-profile-title">My Profile</h1>

          <p className="doc-profile-subtitle">
            View and manage your doctor profile
          </p>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="dp-save-btn secondary"
          >
            <MdPerson /> Edit Profile
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <button
              onClick={() => setEditing(false)}
              className="dp-save-btn ghost"
            >
              <MdCancel /> Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="dp-save-btn"
            >
              <MdSave /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="dp-card">
        <h3 className="dp-card-title">
          <MdPerson /> Basic Information
        </h3>

        {!editing ? (
          <div className="dp-info-grid cols-3">
            <div className="dp-field">
              <p className="dp-field-label">Name</p>
              <p className="dp-field-value">
                Dr. {profile.doctorName}
              </p>
            </div>

            <div className="dp-field">
              <p className="dp-field-label">Specialization</p>
              <p className="dp-field-value">
                {profile.specialization || '—'}
              </p>
            </div>

            <div className="dp-field">
              <p className="dp-field-label">Department</p>
              <p className="dp-field-value">
                {profile.departmentName || '—'}
              </p>
            </div>

            <div className="dp-field">
              <p className="dp-field-label">Qualification</p>
              <p className="dp-field-value">
                {profile.qualification || '—'}
              </p>
            </div>

            <div className="dp-field">
              <p className="dp-field-label">Experience</p>
              <p className="dp-field-value">
                {profile.experience || '—'}
              </p>
            </div>

            <div className="dp-field">
              <p className="dp-field-label">Phone</p>
              <p className="dp-field-value">
                {profile.phone || '—'}
              </p>
            </div>

            <div className="dp-field">
              <p className="dp-field-label">Consultation Fee</p>
              <p className="dp-field-value">
                ₹{profile.consultationFee || 0}
              </p>
            </div>

            <div className="dp-field">
              <p className="dp-field-label">Availability</p>

              <span
                className={`dp-availability ${profile.available || profile.isAvailable
                    ? 'available'
                    : 'unavailable'
                  }`}
              >
                {profile.available || profile.isAvailable ? (
                  <>
                    <MdCheckCircle /> Available
                  </>
                ) : (
                  <>
                    <MdCancel /> Unavailable
                  </>
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="dp-form-grid">
            <div className="dp-input-group">
              <label>Name</label>
              <input
                value={form.doctorName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    doctorName: e.target.value,
                  })
                }
              />
            </div>

            <div className="dp-input-group">
              <label>Specialization</label>
              <input
                value={form.specialization}
                onChange={(e) =>
                  setForm({
                    ...form,
                    specialization: e.target.value,
                  })
                }
              />
            </div>

            <div className="dp-input-group">
              <label>Qualification</label>
              <input
                value={form.qualification}
                onChange={(e) =>
                  setForm({
                    ...form,
                    qualification: e.target.value,
                  })
                }
              />
            </div>

            <div className="dp-input-group">
              <label>Experience</label>
              <input
                value={form.experience}
                onChange={(e) =>
                  setForm({
                    ...form,
                    experience: e.target.value,
                  })
                }
              />
            </div>

            <div className="dp-input-group">
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            <div className="dp-input-group">
              <label>Consultation Fee (₹)</label>
              <input
                type="number"
                value={form.consultationFee}
                onChange={(e) =>
                  setForm({
                    ...form,
                    consultationFee: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="dp-card">
        <h3 className="dp-card-title">
          <MdSchedule /> Schedule
        </h3>

        {!editing ? (
          <div className="dp-info-grid cols-3">
            <div className="dp-field">
              <p className="dp-field-label">Working Hours</p>
              <p className="dp-field-value">
                {profile.workingHoursStart || '09:00'} –{' '}
                {profile.workingHoursEnd || '17:00'}
              </p>
            </div>

            <div className="dp-field">
              <p className="dp-field-label">Break Time</p>
              <p className="dp-field-value">
                {profile.breakStart || '13:00'} –{' '}
                {profile.breakEnd || '14:00'}
              </p>
            </div>

            <div className="dp-field">
              <p className="dp-field-label">
                Avg Consultation Time
              </p>
              <p className="dp-field-value">
                {profile.averageConsultationTime || 20} min
              </p>
            </div>

            <div className="dp-field">
              <p className="dp-field-label">Max Patients/Day</p>
              <p className="dp-field-value">
                {profile.maxPatientsPerDay || 30}
              </p>
            </div>

            <div
              className="dp-field"
              style={{ gridColumn: 'span 2' }}
            >
              <p className="dp-field-label">Working Days</p>

              <div className="dp-days-row">
                {ALL_DAYS.map((day) => (
                  <span
                    key={day}
                    className={`dp-day-chip ${(profile.workingDays || []).includes(day)
                        ? 'active'
                        : ''
                      }`}
                  >
                    {day.slice(0, 3)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="dp-form-grid">
              <div className="dp-input-group">
                <label>Working Hours Start</label>
                <input
                  type="time"
                  value={form.workingHoursStart}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      workingHoursStart: e.target.value,
                    })
                  }
                />
              </div>

              <div className="dp-input-group">
                <label>Working Hours End</label>
                <input
                  type="time"
                  value={form.workingHoursEnd}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      workingHoursEnd: e.target.value,
                    })
                  }
                />
              </div>

              <div className="dp-input-group">
                <label>Break Start</label>
                <input
                  type="time"
                  value={form.breakStart}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      breakStart: e.target.value,
                    })
                  }
                />
              </div>

              <div className="dp-input-group">
                <label>Break End</label>
                <input
                  type="time"
                  value={form.breakEnd}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      breakEnd: e.target.value,
                    })
                  }
                />
              </div>

              <div className="dp-input-group">
                <label>Avg Consultation (min)</label>
                <input
                  type="number"
                  value={form.averageConsultationTime}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      averageConsultationTime: Number(
                        e.target.value
                      ),
                    })
                  }
                />
              </div>

              <div className="dp-input-group">
                <label>Max Patients/Day</label>
                <input
                  type="number"
                  value={form.maxPatientsPerDay}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxPatientsPerDay: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#475569',
                  marginBottom: '0.5rem',
                }}
              >
                Working Days
              </p>

              <div className="dp-days-row">
                {ALL_DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`dp-day-chip ${form.workingDays.includes(day)
                        ? 'active'
                        : ''
                      }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
