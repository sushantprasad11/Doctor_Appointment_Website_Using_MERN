import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoctorProfile } from '../api/doctorApi';
import { getDoctorAvailability } from '../api/availabilityApi';
import { getDoctorReviews } from '../api/reviewApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiCheckCircle, FiMapPin, FiClock, FiAward, FiStar } from 'react-icons/fi';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [reviews, setReviews] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, availRes, revRes] = await Promise.all([
        getDoctorProfile(id),
        getDoctorAvailability(id),
        getDoctorReviews(id).catch(() => ({ data: { reviews: [], averageRating: 0, totalReviews: 0 } })),
      ]);
      setDoctor(docRes.data.doctor);
      setAvailability(availRes.data.availability);
      setReviews(revRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!doctor) return <div className="page container"><h2>Doctor not found</h2></div>;

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Profile Header */}
        <div className="card mb-6">
          <div className="flex gap-6 items-start" style={{ flexWrap: 'wrap' }}>
            <div className="doctor-avatar" style={{ width: '100px', height: '100px', fontSize: 'var(--font-size-3xl)' }}>
              {doctor.profileImage?.url ? (
                <img src={doctor.profileImage.url} alt={doctor.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : getInitials(doctor.fullName)}
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-3 mb-2">
                <h1 style={{ fontSize: 'var(--font-size-2xl)' }}>{doctor.fullName}</h1>
                <span className="badge badge-verified"><FiCheckCircle size={14} /> Verified Doctor</span>
              </div>
              <p className="text-secondary mb-2">{doctor.qualification}</p>
              <p className="font-medium" style={{ color: 'var(--color-primary)' }}>{doctor.specialization?.join(' • ')}</p>

              <div className="flex gap-6 mt-4 flex-wrap text-sm text-secondary">
                {doctor.experience > 0 && <span className="flex items-center gap-1"><FiClock size={14} /> {doctor.experience} yrs exp</span>}
                {doctor.location?.city && <span className="flex items-center gap-1"><FiMapPin size={14} /> {doctor.location.city}</span>}
                {reviews.averageRating > 0 && <span className="flex items-center gap-1"><FiStar size={14} /> {reviews.averageRating} ({reviews.totalReviews} reviews)</span>}
              </div>

              <div className="flex gap-3 mt-6">
                <Link to={`/book/${doctor._id}`} className="btn btn-primary btn-lg">Book Appointment</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          {/* Left Column */}
          <div>
            {/* About */}
            {doctor.bio && (
              <div className="card mb-6">
                <h3 className="card-title mb-4">About</h3>
                <p className="text-secondary" style={{ lineHeight: 'var(--line-height-relaxed)' }}>{doctor.bio}</p>
              </div>
            )}

            {/* Expertise */}
            {(doctor.expertise?.length > 0 || doctor.diseasesTreated?.length > 0) && (
              <div className="card mb-6">
                <h3 className="card-title mb-4">Expertise & Conditions Treated</h3>
                <div className="flex flex-wrap gap-2">
                  {[...(doctor.expertise || []), ...(doctor.diseasesTreated || [])].map((item, i) => (
                    <span key={i} className="tag">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.reviews?.length > 0 && (
              <div className="card">
                <h3 className="card-title mb-4">Patient Reviews</h3>
                {reviews.reviews.map((rev) => (
                  <div key={rev._id} style={{ padding: 'var(--space-4) 0', borderBottom: '1px solid var(--color-border-light)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <strong className="text-sm">{rev.patient?.name || 'Patient'}</strong>
                      <span className="text-sm" style={{ color: 'var(--color-warning)' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                    </div>
                    {rev.review && <p className="text-sm text-secondary">{rev.review}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {/* Visiting Fee */}
            <div className="card mb-6">
              <h3 className="card-title mb-4">Visiting Fee</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Clinic Visiting Fee</span>
                  <span className="font-bold" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-xl)' }}>₹{doctor.consultationFee}</span>
                </div>
                {doctor.languages?.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-secondary">Languages</span>
                    <span className="text-sm">{doctor.languages.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="card mb-6">
              <h3 className="card-title mb-4">Clinic Hours</h3>
              {availability.length === 0 ? (
                <p className="text-muted text-sm">No availability set yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {availability.map((slot) => (
                    <div key={slot._id} className="flex justify-between text-sm" style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border-light)' }}>
                      <span className="font-medium">{DAYS[slot.dayOfWeek]}</span>
                      <span className="text-secondary">{slot.startTime} – {slot.endTime}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            {doctor.location?.clinicName && (
              <div className="card">
                <h3 className="card-title mb-4">Clinic Location</h3>
                <p className="font-medium">{doctor.location.clinicName}</p>
                <p className="text-sm text-secondary mt-1">
                  {[doctor.location.address, doctor.location.city, doctor.location.state, doctor.location.postalCode].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
