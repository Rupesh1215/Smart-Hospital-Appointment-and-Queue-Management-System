import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import doctorService from '../../services/doctorService';
import departmentService from '../../services/departmentService';
import { useAuth } from '../../context/AuthContext';
import {
  MdSearch,
  MdFilterList,
  MdLocalHospital,
  MdCalendarMonth,
  MdCheckCircle,
  MdPerson,
} from 'react-icons/md';
import './Doctors.css';

export default function Doctors() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

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
      console.error('Error fetching doctors page data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (docId) => {
    if (isAuthenticated) {
      if (user?.role === 'PATIENT') {
        navigate(`/patient/doctors?doctorId=${docId}`);
      } else {
        navigate(`/${user?.role?.toLowerCase()}/dashboard`);
      }
    } else {
      navigate('/login');
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const docName = doc.doctorName || doc.name || '';
    const matchesSearch = docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.specialization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.departmentName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || doc.departmentId === selectedDept || doc.departmentName === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="doctors-page">
      <Navbar />

      <main className="doc-main-content">
        <section className="doc-hero-header">
          <div className="doc-hero-inner">
            <span className="home-section-tag">Medical Specialists</span>
            <h1 className="text-hero-headline">Find Our Expert Doctors</h1>
            <p className="doc-hero-sub">
              Book consultations with experienced medical professionals across multiple specialties.
            </p>

            <div className="doc-filter-bar">
              <div className="doc-search-box">
                <MdSearch className="doc-search-icon" />
                <input
                  type="text"
                  placeholder="Search doctor name, specialty, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input doc-search-input"
                />
              </div>

              <div className="doc-dept-select-wrap">
                <MdFilterList className="doc-filter-icon" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="select doc-dept-select"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="doc-cards-section">
          <div className="doc-container">
            {loading ? (
              <div className="doc-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton h-64" />
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="card text-center py-12">
                <MdPerson className="text-4xl text-muted mx-auto mb-2" />
                <h3 className="text-card-title mb-1">No Doctors Found</h3>
                <p className="text-subtext">Try changing your search keywords or department filter.</p>
              </div>
            ) : (
              <div className="doc-grid">
                {filteredDoctors.map((doc) => (
                  <div key={doc.id} className="card doc-card">
                    <div className="doc-card-top">
                      <div className="doc-avatar">
                        {(doc.doctorName || doc.name || 'D').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="doc-name">Dr. {doc.doctorName || doc.name}</h3>
                        <p className="doc-spec">{doc.specialization || 'Consultant Specialist'}</p>
                        <span className="badge badge-teal mt-1">
                          <MdLocalHospital size={12} />
                          {doc.departmentName || 'General Medicine'}
                        </span>
                      </div>
                    </div>

                    <div className="doc-card-body">
                      <div className="doc-info-row">
                        <span className="text-caption">Experience</span>
                        <span className="text-xs font-semibold">{doc.experienceYears || '5+'} Years</span>
                      </div>
                      <div className="doc-info-row">
                        <span className="text-caption">Consultation Fee</span>
                        <span className="text-xs font-semibold">${doc.consultationFee || '50'}</span>
                      </div>
                      <div className="doc-info-row">
                        <span className="text-caption">Status</span>
                        <span className={`badge ${doc.available !== false ? 'badge-success' : 'badge-neutral'}`}>
                          {doc.available !== false ? '● Available' : 'Off-duty'}
                        </span>
                      </div>
                    </div>

                    <div className="doc-card-footer">
                      <button
                        onClick={() => handleBookClick(doc.id)}
                        className="btn btn-primary w-full"
                      >
                        <MdCalendarMonth />
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
