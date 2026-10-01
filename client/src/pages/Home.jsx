import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiShield, FiCalendar, FiMapPin } from 'react-icons/fi';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/doctors');
    }
  };

  const specializations = [
    { name: 'General Physician', icon: '🩺', desc: 'Fever, Cold, Flu' },
    { name: 'Cardiologist', icon: '❤️', desc: 'Heart & Cardiovascular' },
    { name: 'Dermatologist', icon: '🧴', desc: 'Skin, Hair, Nails' },
    { name: 'Neurologist', icon: '🧠', desc: 'Brain & Nervous System' },
    { name: 'Orthopedic', icon: '🦴', desc: 'Bones, Joints, Muscles' },
    { name: 'Dentist', icon: '🦷', desc: 'Teeth & Oral Health' },
    { name: 'Psychiatrist', icon: '🧘', desc: 'Mental Health' },
    { name: 'Gynecologist', icon: '👩‍⚕️', desc: "Women's Health" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Find & Book <span>Verified Doctors</span><br />
            Clinic Appointments
          </h1>
          <p className="hero-subtitle">
            Discover trusted, verified healthcare professionals. Check their availability
            and book clinic appointments with ease.
          </p>

          <form onSubmit={handleSearch} className="search-bar mb-8">
            <FiSearch size={20} style={{ marginLeft: '16px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by doctor name, specialization, disease, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Search Doctors
            </button>
          </form>

          <div className="hero-actions">
            <Link to="/doctors" className="btn btn-primary btn-lg">Find a Doctor</Link>
            <Link to="/register" className="btn btn-secondary btn-lg">Join as Doctor</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="page">
        <div className="container">
          <h2 className="text-center mb-2" style={{ fontSize: 'var(--font-size-3xl)' }}>Why Choose Us?</h2>
          <p className="text-center text-muted mb-8">Trusted by thousands of patients and doctors</p>

          <div className="grid grid-3">
            <div className="card text-center">
              <FiShield size={40} color="var(--color-primary)" style={{ margin: '0 auto var(--space-4)' }} />
              <h3 className="mb-2">Verified Doctors</h3>
              <p className="text-muted text-sm">Every doctor undergoes a rigorous verification process. Only approved professionals appear on our platform.</p>
            </div>
            <div className="card text-center">
              <FiCalendar size={40} color="var(--color-secondary)" style={{ margin: '0 auto var(--space-4)' }} />
              <h3 className="mb-2">Easy Booking</h3>
              <p className="text-muted text-sm">View real-time availability, choose your slot, and book your clinic appointment in just a few clicks.</p>
            </div>
            <div className="card text-center">
              <FiMapPin size={40} color="var(--color-accent)" style={{ margin: '0 auto var(--space-4)' }} />
              <h3 className="mb-2">Clinic Visits</h3>
              <p className="text-muted text-sm">Find clinics near you with detailed doctor profiles, visiting fees, and directions to the clinic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section style={{ padding: 'var(--space-16) 0', background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <h2 className="text-center mb-2" style={{ fontSize: 'var(--font-size-3xl)' }}>Browse by Specialization</h2>
          <p className="text-center text-muted mb-8">Find the right specialist for your needs</p>

          <div className="grid grid-4">
            {specializations.map((spec) => (
              <Link
                key={spec.name}
                to={`/doctors?specialization=${encodeURIComponent(spec.name)}`}
                className="card"
                style={{ textDecoration: 'none', textAlign: 'center' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>{spec.icon}</div>
                <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-1)' }}>{spec.name}</h3>
                <p className="text-sm text-muted">{spec.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="page">
        <div className="container">
          <div className="grid grid-4">
            <div className="stat-card">
              <div className="stat-value">500+</div>
              <div className="stat-label">Verified Doctors</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">10K+</div>
              <div className="stat-label">Happy Patients</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">25+</div>
              <div className="stat-label">Specializations</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">50K+</div>
              <div className="stat-label">Appointments Booked</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--space-16) 0', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-4)', color: 'white' }}>Are You a Doctor?</h2>
          <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-6)', opacity: 0.9 }}>
            Join our platform and reach thousands of patients. Register, get verified, and start receiving appointments.
          </p>
          <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--color-primary)', borderColor: 'white' }}>
            Register as Doctor
          </Link>
        </div>
      </section>
    </>
  );
}
