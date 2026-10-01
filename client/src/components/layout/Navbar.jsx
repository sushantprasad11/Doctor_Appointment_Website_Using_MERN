import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiMenu, FiX } from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';

export default function Navbar() {
  const { user, isAuthenticated, logout, isDoctor, isPatient, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isDoctor) return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <MdLocalHospital size={28} />
          Doctor Appointment
        </Link>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <ul className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/doctors" className={isActive('/doctors')} onClick={() => setMenuOpen(false)}>Find Doctors</Link></li>
          {isAuthenticated && (
            <li>
              <Link to={getDashboardLink()} className={isActive(getDashboardLink())} onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {user.name}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
