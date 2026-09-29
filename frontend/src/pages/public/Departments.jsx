import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import departmentService from '../../services/departmentService';
import {
  MdFavorite,
  MdPsychology,
  MdHealthAndSafety,
  MdScience,
  MdMedicalServices,
  MdChildCare,
  MdHearing,
  MdVisibility,
  MdArrowForward,
  MdSearch,
} from 'react-icons/md';
import './Departments.css';

const defaultDepts = [
  { name: 'Cardiology', icon: MdFavorite, description: 'Heart and cardiovascular system care with advanced diagnostics and treatment.' },
  { name: 'Neurology', icon: MdPsychology, description: 'Specialized diagnosis and treatment of brain, spinal cord, and nerve disorders.' },
  { name: 'Orthopedics', icon: MdHealthAndSafety, description: 'Bone, joint, ligament, tendon, and muscle disorder management.' },
  { name: 'Dermatology', icon: MdScience, description: 'Skin, hair, and nail health care with advanced dermatological procedures.' },
  { name: 'General Medicine', icon: MdMedicalServices, description: 'Comprehensive primary care, health screenings, and adult medical management.' },
  { name: 'Pediatrics', icon: MdChildCare, description: 'Dedicated healthcare for infants, children, and adolescents.' },
  { name: 'ENT', icon: MdHearing, description: 'Diagnosis and surgical care for ear, nose, and throat conditions.' },
  { name: 'Ophthalmology', icon: MdVisibility, description: 'Comprehensive eye care, vision testing, and ocular surgery.' },
];

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      const apiData = res.data?.data || [];
      if (apiData.length > 0) {
        setDepartments(apiData);
      } else {
        setDepartments(defaultDepts);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
      setDepartments(defaultDepts);
    } finally {
      setLoading(false);
    }
  };

  const filtered = departments.filter((d) =>
    (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="departments-page">
      <Navbar />

      <main className="dept-main">
        <section className="dept-hero-section">
          <div className="dept-hero-content">
            <span className="home-section-tag">Clinical Departments</span>
            <h1 className="text-hero-headline">Specialized Medical Care</h1>
            <p className="dept-hero-desc">
              Explore our comprehensive departments staffed by dedicated medical experts.
            </p>
            <div className="dept-search-wrapper">
              <MdSearch className="dept-search-icon" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input dept-search-input"
              />
            </div>
          </div>
        </section>

        <section className="dept-grid-section">
          <div className="dept-container">
            {loading ? (
              <div className="dept-skeleton-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton h-48" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-subtext">No departments match your search "{searchTerm}"</p>
              </div>
            ) : (
              <div className="dept-cards-grid">
                {filtered.map((dept, index) => {
                  const fallbackObj = defaultDepts.find(d => d.name.toLowerCase() === dept.name?.toLowerCase()) || defaultDepts[index % defaultDepts.length];
                  const Icon = fallbackObj.icon || MdMedicalServices;
                  return (
                    <div key={dept.id || index} className="card card-interactive dept-card">
                      <div className="dept-card-icon-wrap">
                        <Icon />
                      </div>
                      <h3 className="text-card-title mb-2">{dept.name}</h3>
                      <p className="text-subtext text-xs mb-4">
                        {dept.description || fallbackObj.description}
                      </p>
                      <Link to="/doctors" className="btn btn-ghost btn-sm text-primary-600 mt-auto flex items-center gap-1">
                        Book in Department <MdArrowForward />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
