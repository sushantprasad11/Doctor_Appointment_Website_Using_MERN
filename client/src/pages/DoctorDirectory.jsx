import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchDoctors } from '../api/doctorApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { FiSearch, FiMapPin, FiClock, FiAward, FiCheckCircle } from 'react-icons/fi';

export default function DoctorDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    specialization: searchParams.get('specialization') || '',
    city: searchParams.get('city') || '',
  });

  useEffect(() => {
    fetchDoctors();
  }, [searchParams]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const { data } = await searchDoctors(params);
      setDoctors(data.doctors);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (filters.specialization) params.set('specialization', filters.specialization);
    if (filters.city) params.set('city', filters.city);
    setSearchParams(params);
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Find Verified Doctors</h1>
          <p className="page-subtitle">Search from our network of trusted healthcare professionals</p>
        </div>

        {/* Search & Filters */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="search-bar mb-4">
            <FiSearch size={20} style={{ marginLeft: '16px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, specialization, disease..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </div>

          <div className="flex gap-4 flex-wrap" style={{ justifyContent: 'center' }}>
            <select className="form-select" style={{ width: 'auto', minWidth: '180px' }} value={filters.specialization} onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}>
              <option value="">All Specializations</option>
              {['General Physician','Cardiologist','Dermatologist','Neurologist','Orthopedic','ENT Specialist','Gynecologist','Ophthalmologist','Dentist','Psychiatrist','Pulmonologist','Gastroenterologist','Pediatrician'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input className="form-input" style={{ width: 'auto', minWidth: '160px' }} type="text" placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <LoadingSpinner />
        ) : doctors.length === 0 ? (
          <EmptyState icon="🔍" title="No doctors found" message="Try adjusting your search or filters" />
        ) : (
          <>
            <p className="text-sm text-muted mb-4">{pagination.total} doctor(s) found</p>
            <div className="grid grid-3">
              {doctors.map((doc) => (
                <div key={doc._id} className="doctor-card">
                  <div className="doctor-card-body">
                    <div className="doctor-card-header">
                      <div className="doctor-avatar">
                        {doc.profileImage?.url ? (
                          <img src={doc.profileImage.url} alt={doc.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : getInitials(doc.fullName)}
                      </div>
                      <div className="doctor-card-info">
                        <h3>{doc.fullName}</h3>
                        <span className="badge badge-verified">
                          <FiCheckCircle size={12} /> Verified
                        </span>
                      </div>
                    </div>

                    <div className="doctor-card-meta">
                      <div className="doctor-card-meta-item">
                        <FiAward size={14} />
                        <span>{doc.qualification}</span>
                      </div>
                      {doc.specialization?.length > 0 && (
                        <div className="doctor-card-meta-item">
                          <span>🩺</span>
                          <span>{doc.specialization.join(', ')}</span>
                        </div>
                      )}
                      {doc.experience > 0 && (
                        <div className="doctor-card-meta-item">
                          <FiClock size={14} />
                          <span>{doc.experience} years experience</span>
                        </div>
                      )}
                      {doc.location?.city && (
                        <div className="doctor-card-meta-item">
                          <FiMapPin size={14} />
                          <span>{doc.location.city}{doc.location.state ? `, ${doc.location.state}` : ''}</span>
                        </div>
                      )}
                    </div>

                    <div className="doctor-card-footer">
                      <div className="doctor-fee">
                        ₹{doc.consultationFee} <span>/ visit</span>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/doctors/${doc._id}`} className="btn btn-secondary btn-sm">View</Link>
                        <Link to={`/book/${doc._id}`} className="btn btn-primary btn-sm">Book</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} className={`pagination-btn ${page === pagination.page ? 'active' : ''}`}
                    onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', page); setSearchParams(p); }}>
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
