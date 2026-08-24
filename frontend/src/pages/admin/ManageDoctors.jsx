import { useState, useEffect } from 'react';
import doctorService from '../../services/doctorService';
import departmentService from '../../services/departmentService';
import toast from 'react-hot-toast';
import { MdLocalHospital, MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    departmentId: '',
    consultationFee: 50,
    maxPatientsPerDay: 20,
    slotDurationMinutes: 20,
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
      setDoctors(docRes.data?.data || []);
      setDepartments(deptRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load doctors data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      email: '',
      specialization: 'General Physician',
      departmentId: departments[0]?.id || '',
      consultationFee: 50,
      maxPatientsPerDay: 20,
      slotDurationMinutes: 20,
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
        await doctorService.create(formData);
        toast.success('Doctor added successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving doctor:', err);
      toast.error('Failed to save doctor details');
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
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      d.departmentName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MdLocalHospital className="text-teal-600" />
            Manage Doctor Profiles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add, update, or assign departments and schedules for hospital doctors.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <MdAdd className="text-xl" /> Add Doctor
        </button>
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <MdSearch className="text-slate-400 text-xl" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by doctor name, specialization, or department..."
          className="w-full text-sm bg-transparent focus:outline-none text-slate-800"
        />
      </div>

      {/* Doctor Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Doctor Name</th>
                <th className="p-4">Department</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">Consultation Fee</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No doctors found.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                        {doc.name?.charAt(0) || 'D'}
                      </div>
                      Dr. {doc.name}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{doc.departmentName || 'General'}</td>
                    <td className="p-4 text-slate-600">{doc.specialization || 'Consultant'}</td>
                    <td className="p-4 text-emerald-700 font-bold">${doc.consultationFee || 50}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Doctor"
                      >
                        <MdDelete className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-scale-in">
            <h3 className="font-bold text-slate-900 text-lg mb-4">
              {editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. John Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="doctor@smarthospital.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Senior Cardiologist"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fee ($)</label>
                  <input
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Max Daily Patients</label>
                  <input
                    type="number"
                    value={formData.maxPatientsPerDay}
                    onChange={(e) => setFormData({ ...formData, maxPatientsPerDay: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md cursor-pointer"
                >
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
