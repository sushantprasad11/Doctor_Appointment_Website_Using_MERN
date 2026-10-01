import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorProfile } from '../api/doctorApi';
import { getAvailableSlots, createAppointment } from '../api/appointmentApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { FiCheckCircle, FiMapPin } from 'react-icons/fi';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const { data } = await getDoctorProfile(doctorId);
      setDoctor(data.doctor);
    } catch (err) {
      showToast('Doctor not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date) => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const { data } = await getAvailableSlots(doctorId, date);
      setSlots(data.slots);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    if (e.target.value) fetchSlots(e.target.value);
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      showToast('Please select date and time slot', 'error');
      return;
    }
    setBooking(true);
    try {
      await createAppointment({
        doctorId,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        consultationType: 'audio', // Default value for backend compatibility
      });
      showToast('Appointment booked successfully!', 'success');
      setTimeout(() => navigate('/patient/dashboard'), 1500);
    } catch (err) {
      showToast(err.message || 'Booking failed', 'error');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!doctor) return <div className="page container"><h2>Doctor not found</h2></div>;

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  return (
    <div className="page">
      <Toast toast={toast} />
      <div className="container" style={{ maxWidth: '700px' }}>
        <h1 className="page-title mb-6">Book Clinic Appointment</h1>

        {/* Doctor Info */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <div className="doctor-avatar">
              {doctor.profileImage?.url ? (
                <img src={doctor.profileImage.url} alt={doctor.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : doctor.fullName?.[0] || 'D'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{doctor.fullName}</h2>
                <span className="badge badge-verified"><FiCheckCircle size={12} /> Verified</span>
              </div>
              <p className="text-sm text-secondary">{doctor.qualification} • {doctor.specialization?.join(', ')}</p>
              {doctor.location?.clinicName && (
                <p className="text-sm text-muted mt-1 flex items-center gap-1">
                  <FiMapPin size={12} /> {doctor.location.clinicName}, {doctor.location.city}
                </p>
              )}
              <p className="font-semibold mt-1" style={{ color: 'var(--color-primary)' }}>Visiting Fee: ₹{doctor.consultationFee}</p>
            </div>
          </div>
        </div>

        {/* Step 1: Date */}
        <div className="card mb-6">
          <h3 className="card-title mb-4">1. Select Date</h3>
          <input
            className="form-input"
            type="date"
            min={today}
            max={maxDate.toISOString().split('T')[0]}
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        {/* Step 2: Time Slot */}
        {selectedDate && (
          <div className="card mb-6">
            <h3 className="card-title mb-4">2. Select Time Slot</h3>
            {slotsLoading ? (
              <LoadingSpinner />
            ) : slots.length === 0 ? (
              <p className="text-muted text-sm">No available slots on this date. Please try another date.</p>
            ) : (
              <div className="slot-grid">
                {slots.map((slot) => (
                  <button
                    key={slot.startTime}
                    className={`slot-btn ${selectedSlot?.startTime === slot.startTime ? 'slot-selected' : ''}`}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary & Book */}
        {selectedDate && selectedSlot && (
          <div className="card">
            <h3 className="card-title mb-4">Appointment Summary</h3>
            <div className="flex flex-col gap-2 mb-6 text-sm">
              <div className="flex justify-between"><span className="text-secondary">Doctor</span><span className="font-medium">{doctor.fullName}</span></div>
              {doctor.location?.clinicName && (
                <div className="flex justify-between"><span className="text-secondary">Clinic</span><span className="font-medium">{doctor.location.clinicName}</span></div>
              )}
              <div className="flex justify-between"><span className="text-secondary">Date</span><span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
              <div className="flex justify-between"><span className="text-secondary">Time</span><span className="font-medium">{selectedSlot.startTime} - {selectedSlot.endTime}</span></div>
              <div className="flex justify-between"><span className="text-secondary">Visiting Fee</span><span className="font-bold" style={{ color: 'var(--color-primary)' }}>₹{doctor.consultationFee}</span></div>
              <p className="text-xs text-muted mt-2" style={{ fontStyle: 'italic' }}>* Visiting fee is payable at the clinic</p>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleBook} disabled={booking}>
              {booking ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
