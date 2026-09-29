import { useState, useEffect } from 'react';
import doctorService from '../../services/doctorService';
import departmentService from '../../services/departmentService';
import toast from 'react-hot-toast';
import { MdLocalHospital, MdAdd, MdDelete, MdSearch } from 'react-icons/md';
import './ManageDoctors.css';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [formData, setFormData] = useState({
    doctorName: '',
    email: '',
    password: '',
    specialization: 'General Physician',
    departmentId: '',
    qualification: 'MBBS, MD',
    experience: 5,
    phone: '',
    consultationFee: 50,
    maxPatientsPerDay: 20,
    averageConsultationTime: 20,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docRes, deptRes] = await Promise.all([
        doctorService.getAll(),
        departmentService.getAll(),
      ]);
      const docs = docRes.data?.data || [];
      const depts = deptRes.data?.data || [];
      setDoctors(docs);
      setDepartments(depts);
      if (depts.length > 0 && !formData.departmentId) {
        setFormData((prev) => ({ ...prev, departmentId: depts[0].id }));
      }
    } catch (err) {
      console.error('Failed to load doctors data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData({
      doctorName: '',
      email: '',
      password: '',
      specialization: 'General Physician',
      departmentId: departments[0]?.id || '',
      qualification: 'MBBS, MD',
      experience: 5,
      phone: '',
      consultationFee: 50,
      maxPatientsPerDay: 20,
      averageConsultationTime: 20,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await doctorService.update(editingDoctor.id, formData);
        toast.success('Doctor updated successfully');
      } else {
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }
        await doctorService.create(formData);
        toast.success('Doctor added successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving doctor:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.data || 'Failed to save doctor details';
      toast.error(typeof errMsg === 'string' ? errMsg : 'Failed to save doctor details');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await doctorService.delete(id);
      toast.success('Doctor deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete doctor');
    }
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      (d.doctorName || d.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.departmentName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="docs-page">
      {/* Top Header */}
      <div className="docs-header">
        <div>
          <h1 className="docs-header-title">
            <MdLocalHospital />
            Manage Doctor Profiles
          </h1>
          <p className="docs-header-subtitle">
            Add, update, or assign departments and schedules for hospital doctors.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="docs-add-btn">
          <MdAdd /> Add Doctor
        </button>
      </div>

      {/* Filter / Search */}
      <div className="docs-search-bar">
        <MdSearch className="docs-search-icon" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by doctor name, specialization, or department..."
          className="docs-search-input"
        />
      </div>

      {/* Doctor Table */}
      <div className="docs-table-container">
        <div className="docs-table-wrapper">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Department</th>
                <th>Specialization</th>
                <th>Consultation Fee</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="docs-empty-state">
                    No doctors found.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => {
                  const docName = doc.doctorName || doc.name || 'Unknown';
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div className="docs-name-cell">
                          <div className="docs-avatar">
                            {docName.charAt(0).toUpperCase()}
                          </div>
                          Dr. {docName}
                        </div>
                      </td>
                      <td className="docs-dept-cell">{doc.departmentName || 'General'}</td>
                      <td className="docs-spec-cell">{doc.specialization || 'Consultant'}</td>
                      <td className="docs-fee-cell">₹{doc.consultationFee || 50}</td>
                      <td className="docs-actions-cell">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="docs-delete-btn"
                          title="Delete Doctor"
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="docs-modal-overlay">
          <div className="docs-modal-content">
            <h3 className="docs-modal-title">
              {editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
            </h3>

            <form onSubmit={handleSubmit} className="docs-modal-form">
              <div className="docs-form-group">
                <label className="docs-form-label">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="docs-form-input"
                />
              </div>

              <div className="docs-form-group">
                <label className="docs-form-label">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="doctor@smarthospital.com"
                  className="docs-form-input"
                />
              </div>

              {!editingDoctor && (
                <div className="docs-form-group">
                  <label className="docs-form-label">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="docs-form-input"
                  />
                </div>
              )}

              <div className="docs-form-group">
                <label className="docs-form-label">Specialization</label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Senior Cardiologist"
                  className="docs-form-input"
                />
              </div>

              <div className="docs-form-group">
                <label className="docs-form-label">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="docs-form-select"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="docs-form-row">
                <div className="docs-form-group">
                  <label className="docs-form-label">Fee (₹)</label>
                  <input
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                    className="docs-form-input"
                  />
                </div>
                <div className="docs-form-group">
                  <label className="docs-form-label">Max Daily Patients</label>
                  <input
                    type="number"
                    value={formData.maxPatientsPerDay}
                    onChange={(e) => setFormData({ ...formData, maxPatientsPerDay: Number(e.target.value) })}
                    className="docs-form-input"
                  />
                </div>
              </div>

              <div className="docs-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="docs-cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="docs-submit-btn">
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
