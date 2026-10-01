import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/common/Toast';
import { useToast } from '../hooks/useToast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      showToast('Login successful!', 'success');
      const role = data.user.role;
      setTimeout(() => {
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'doctor') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
      }, 500);
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Toast toast={toast} />
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="card" style={{ padding: 'var(--space-10)' }}>
          <div className="text-center mb-8">
            <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>Welcome Back</h1>
            <p className="text-muted">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
