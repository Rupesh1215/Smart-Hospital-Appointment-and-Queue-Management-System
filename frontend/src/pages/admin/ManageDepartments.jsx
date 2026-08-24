import { useState, useEffect } from 'react';
import departmentService from '../../services/departmentService';
import toast from 'react-hot-toast';
import { MdBusiness, MdAdd, MdDelete } from 'react-icons/md';

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MdBusiness className="text-teal-600" />
            Hospital Departments
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure medical specialties and department codes.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm shadow-md flex items-center gap-2 cursor-pointer"
        >
          <MdAdd className="text-xl" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full">
                  {dept.code || 'DEPT'}
                </span>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                >
                  <MdDelete className="text-lg" />
                </button>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mt-3">{dept.name}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                {dept.description || 'Specialized medical department providing expert healthcare services.'}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Status: Active</span>
              <span className="text-teal-600 font-bold">{dept.doctorCount || 0} Doctors</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Add Department</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cardiology"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Department Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CARD"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Department details..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm text-slate-600 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md cursor-pointer"
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
