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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
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
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-teal-600 to-teal-700" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
              {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="pb-1">
              <h2 className="text-lg font-bold text-slate-900">
                {displayUser?.name || 'User'}
              </h2>
              <p className="text-sm text-slate-500">{displayUser?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Personal Information</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {profileFields.map((field) => (
            <div key={field.label} className="flex items-center gap-4 px-6 py-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                <field.icon className="text-lg text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">{field.label}</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">
                  {field.value || '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Account</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Account Status</p>
              <p className="text-xs text-slate-500 mt-1">Your account is active and verified</p>
            </div>
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
