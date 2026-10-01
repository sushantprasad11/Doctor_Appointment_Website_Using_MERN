import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyAppointments, cancelAppointment } from '../api/appointmentApi';
import { createReview } from '../api/reviewApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { FiCalendar, FiClock, FiX, FiStar, FiMapPin } from 'react-icons/fi';

export default function PatientDashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const { toast, showToast } = useToast();
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, review: '' });

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await getMyAppointments();
      setAppointments(data.appointments);
    } catch (err) {
      showToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await cancelAppointment(id, { cancellationReason: 'Cancelled by patient' });
      showToast('Appointment cancelled', 'success');
      fetchAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReview = async () => {
    try {
      await createReview({ appointmentId: reviewModal._id, ...reviewData });
      showToast('Review submitted!', 'success');
      setReviewModal(null);
      setReviewData({ rating: 5, review: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const now = new Date();
  const upcoming = appointments.filter(a => ['confirmed', 'pending'].includes(a.status) && new Date(a.appointmentDate) >= new Date(now.toDateString()));
  const past = appointments.filter(a => ['completed', 'cancelled', 'rejected', 'no_show'].includes(a.status) || new Date(a.appointmentDate) < new Date(now.toDateString()));

  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="page">
      <Toast toast={toast} />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Appointments</h1>
          <p className="page-subtitle">Manage your clinic appointments</p>
        </div>

        <div className="grid grid-3 mb-8">
          <div className="stat-card"><div className="stat-value">{upcoming.length}</div><div className="stat-label">Upcoming</div></div>
          <div className="stat-card"><div className="stat-value">{appointments.filter(a => a.status === 'completed').length}</div><div className="stat-label">Completed</div></div>
          <div className="stat-card"><div className="stat-value">{appointments.length}</div><div className="stat-label">Total</div></div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'upcoming' ? 'tab-active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming ({upcoming.length})</button>
          <button className={`tab ${tab === 'past' ? 'tab-active' : ''}`} onClick={() => setTab('past')}>History ({past.length})</button>
        </div>

        {loading ? <LoadingSpinner /> : displayed.length === 0 ? (
          <EmptyState icon="📅" title="No appointments" message={tab === 'upcoming' ? 'Book your first appointment' : 'No past appointments'} action={tab === 'upcoming' ? <Link to="/doctors" className="btn btn-primary">Find Doctors</Link> : null} />
        ) : (
          <div className="flex flex-col gap-4">
            {displayed.map((appt) => (
              <div key={appt._id} className="appointment-card">
                <div className="doctor-avatar" style={{ width: '48px', height: '48px', fontSize: 'var(--font-size-base)' }}>
                  {appt.doctor?.profileImage?.url ? <img src={appt.doctor.profileImage.url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : appt.doctor?.fullName?.[0] || 'D'}
                </div>
                <div className="appointment-card-info">
                  <h4 className="font-semibold">{appt.doctor?.fullName || 'Doctor'}</h4>
                  <p className="text-sm text-secondary">{appt.doctor?.specialization?.join(', ')}</p>
                  <div className="flex gap-4 mt-2 text-sm text-muted flex-wrap">
                    <span className="flex items-center gap-1"><FiCalendar size={12} /> {new Date(appt.appointmentDate).toLocaleDateString('en-IN')}</span>
                    <span className="flex items-center gap-1"><FiClock size={12} /> {appt.startTime} - {appt.endTime}</span>
                    {appt.doctor?.location?.clinicName && (
                      <span className="flex items-center gap-1"><FiMapPin size={12} /> {appt.doctor.location.clinicName}</span>
                    )}
                    <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                  </div>
                </div>
                <div className="appointment-card-actions">
                  {['confirmed', 'pending'].includes(appt.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt._id)}><FiX size={14} /> Cancel</button>
                  )}
                  {appt.status === 'completed' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setReviewModal(appt)}><FiStar size={14} /> Review</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {reviewModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
              <h3 className="mb-4">Review Dr. {reviewModal.doctor?.fullName}</h3>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(r => (
                    <button key={r} onClick={() => setReviewData({...reviewData, rating: r})} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: r <= reviewData.rating ? 'var(--color-warning)' : 'var(--color-border)' }}>★</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Review (optional)</label>
                <textarea className="form-textarea" value={reviewData.review} onChange={(e) => setReviewData({...reviewData, review: e.target.value})} placeholder="Share your experience..." />
              </div>
              <div className="flex gap-3 justify-end">
                <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleReview}>Submit Review</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
