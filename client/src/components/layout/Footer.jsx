import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div>
            <div className="footer-brand">🏥 Doctor Appointment</div>
            <p className="footer-desc">
              Your trusted platform for discovering verified doctors, checking availability, and booking clinic appointments.
              Quality healthcare made accessible and convenient.
            </p>
          </div>
          <div>
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/doctors">Find Doctors</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">For Doctors</h4>
            <ul className="footer-links">
              <li><Link to="/register">Join as Doctor</Link></li>
              <li><Link to="/doctor/dashboard">Doctor Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Doctor Appointment Website. All rights reserved.</p>
          <p style={{ marginTop: 'var(--space-2)' }}>Created & handled by <strong>Sushant Prasad</strong></p>
        </div>
      </div>
    </footer>
  );
}
