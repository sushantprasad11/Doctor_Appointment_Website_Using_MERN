import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/common/Toast';
import { useToast } from '../hooks/useToast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await register(form);
      showToast('Registration successful!', 'success');
      setTimeout(() => {
        if (data.user.role === 'doctor') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
      }, 500);
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Toast toast={toast} />
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card" style={{ padding: 'var(--space-10)' }}>
          <div className="text-center mb-8">
            <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>Create Account</h1>
            <p className="text-muted">Join DocterApp today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">I am a</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={form.role === 'patient'}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                  <span className="font-medium">Patient</span>
                </label>
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={form.role === 'doctor'}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                  <span className="font-medium">Doctor</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" className="form-input" type="text" placeholder="Enter your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input id="reg-email" className="form-input" type="email" placeholder="Enter your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone (optional)</label>
              <input id="reg-phone" className="form-input" type="tel" placeholder="Enter your phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" className="form-input" type="password" placeholder="Minimum 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
