import { useState, useEffect } from 'react';
import departmentService from '../../services/departmentService';
import toast from 'react-hot-toast';
import { MdBusiness, MdAdd, MdDelete } from 'react-icons/md';
import './ManageDepartments.css';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await departmentService.create({ name, description, code: code || name.substring(0, 4).toUpperCase() });
      toast.success('Department created!');
      setName('');
      setDescription('');
      setCode('');
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error('Failed to create department.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete department?')) return;
    try {
      await departmentService.delete(id);
      toast.success('Department deleted.');
      fetchDepartments();
    } catch (err) {
      toast.error('Failed to delete department.');
    }
  };

  return (
    <div className="dept-page">
      <div className="dept-header">
        <div>
          <h1 className="dept-header-title">
            <MdBusiness />
            Hospital Departments
          </h1>
          <p className="dept-header-subtitle">Configure medical specialties and department codes.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="dept-add-btn"
        >
          <MdAdd /> Add Department
        </button>
      </div>

      <div className="dept-grid">
        {departments.map((dept) => (
          <div key={dept.id} className="dept-card">
            <div>
              <div className="dept-card-top">
                <span className="dept-card-badge">
                  {dept.code || 'DEPT'}
                </span>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="dept-delete-btn"
                >
                  <MdDelete />
                </button>
              </div>
              <h3 className="dept-card-title">{dept.name}</h3>
              <p className="dept-card-desc">
                {dept.description || 'Specialized medical department providing expert healthcare services.'}
              </p>
            </div>

            <div className="dept-card-footer">
              <span>Status: Active</span>
              <span className="dept-card-count">{dept.doctorCount || 0} Doctors</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="dept-modal-overlay">
          <div className="dept-modal-content">
            <h3 className="dept-modal-title">Add Department</h3>
            <form onSubmit={handleCreate} className="dept-modal-form">
              <div className="dept-form-group">
                <label className="dept-form-label">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cardiology"
                  className="dept-form-input"
                />
              </div>

              <div className="dept-form-group">
                <label className="dept-form-label">Department Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CARD"
                  className="dept-form-input"
                />
              </div>

              <div className="dept-form-group">
                <label className="dept-form-label">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Department details..."
                  className="dept-form-input"
                />
              </div>

              <div className="dept-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="dept-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dept-submit-btn"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
