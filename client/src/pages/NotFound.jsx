import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-5xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>404</h1>
        <h2 className="mb-2">Page Not Found</h2>
        <p className="text-muted mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  );
}
