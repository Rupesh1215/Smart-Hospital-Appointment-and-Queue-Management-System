import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import './AdminSettings.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    defaultSlotDuration: 20,
    maxPatientsPerSlot: 1,
    bufferTimeBetweenSlots: 5,
    allowEmergencyQueueBypass: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSettings();
      if (res.data?.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ width: '2rem', height: '2rem', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      <div className="admin-settings-header">
        <div>
          <h1 className="admin-settings-title">Hospital Settings</h1>
          <p className="admin-settings-subtitle">Configure system-wide scheduling and operational parameters</p>
        </div>
      </div>

      <div className="admin-settings-card">
        <h2 className="admin-settings-card-title">Scheduling Configuration</h2>
        <form onSubmit={handleSave}>
          <div className="admin-settings-form">
            <div className="admin-settings-group">
              <label>Default Slot Duration (minutes)</label>
              <input 
                type="number" 
                name="defaultSlotDuration" 
                value={settings.defaultSlotDuration} 
                onChange={handleChange} 
                min="5" 
                max="60" 
              />
            </div>
            
            <div className="admin-settings-group">
              <label>Buffer Time Between Slots (minutes)</label>
              <input 
                type="number" 
                name="bufferTimeBetweenSlots" 
                value={settings.bufferTimeBetweenSlots} 
                onChange={handleChange} 
                min="0" 
                max="30" 
              />
            </div>
            
            <div className="admin-settings-group">
              <label>Max Patients Per Slot</label>
              <input 
                type="number" 
                name="maxPatientsPerSlot" 
                value={settings.maxPatientsPerSlot} 
                onChange={handleChange} 
                min="1" 
                max="10" 
              />
            </div>

            <div className="admin-settings-group" style={{ justifyContent: 'center' }}>
              <div className="admin-settings-toggle">
                <span>Allow Emergency Queue Bypass</span>
                <input 
                  type="checkbox" 
                  name="allowEmergencyQueueBypass" 
                  checked={settings.allowEmergencyQueueBypass} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
          
          <div className="admin-settings-actions">
            <button type="submit" disabled={saving} className="admin-settings-save-btn">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
