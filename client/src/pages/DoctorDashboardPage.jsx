import { useState, useEffect } from 'react';
import { getMyDoctorProfile, createDoctorProfile, updateDoctorProfile } from '../api/doctorApi';
import { getMyAvailability, createAvailability, deleteAvailability } from '../api/availabilityApi';
import { getMyAppointments, completeAppointment } from '../api/appointmentApi';
import { submitVerification, getVerificationStatus } from '../api/adminApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { FiCalendar, FiClock, FiUser, FiSettings, FiUpload, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorDashboardPage() {
  const [section, setSection] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '', qualification: '', specialization: '', expertise: '', diseasesTreated: '',
    bodySystems: '', experience: 0, languages: 'English', bio: '', consultationFee: 0,
    clinicName: '', address: '', city: '', state: '', country: 'India', postalCode: '', professionalRegNumber: '',
  });

  // Availability form
  const [availForm, setAvailForm] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDuration: 30 });

  // Verification
  const [documents, setDocuments] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profRes, availRes, apptRes] = await Promise.all([
        getMyDoctorProfile().catch(() => ({ data: { doctor: null } })),
        getMyAvailability().catch(() => ({ data: { availability: [] } })),
        getMyAppointments().catch(() => ({ data: { appointments: [] } })),
      ]);
      setProfile(profRes.data.doctor);
      setAvailability(availRes.data.availability);
      setAppointments(apptRes.data.appointments);

      if (profRes.data.doctor) {
        const d = profRes.data.doctor;
        setProfileForm({
          fullName: d.fullName || '', qualification: d.qualification || '', specialization: d.specialization?.join(', ') || '', expertise: d.expertise?.join(', ') || '',
          diseasesTreated: d.diseasesTreated?.join(', ') || '', bodySystems: d.bodySystems?.join(', ') || '', experience: d.experience || 0, languages: d.languages?.join(', ') || 'English',
          bio: d.bio || '', consultationFee: d.consultationFee || 0, clinicName: d.location?.clinicName || '',
          address: d.location?.address || '', city: d.location?.city || '', state: d.location?.state || '', country: d.location?.country || 'India', postalCode: d.location?.postalCode || '',
          professionalRegNumber: d.professionalRegNumber || '',
        });
        try { const vRes = await getVerificationStatus(); setVerification(vRes.data); } catch {}
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...profileForm,
        specialization: profileForm.specialization.split(',').map(s => s.trim()).filter(Boolean),
        expertise: profileForm.expertise.split(',').map(s => s.trim()).filter(Boolean),
        diseasesTreated: profileForm.diseasesTreated.split(',').map(s => s.trim()).filter(Boolean),
        bodySystems: profileForm.bodySystems.split(',').map(s => s.trim()).filter(Boolean),
        languages: profileForm.languages.split(',').map(s => s.trim()).filter(Boolean),
        consultationTypes: ['audio'],
        location: { clinicName: profileForm.clinicName, address: profileForm.address, city: profileForm.city, state: profileForm.state, country: profileForm.country, postalCode: profileForm.postalCode },
      };
      delete payload.clinicName; delete payload.address; delete payload.city; delete payload.state; delete payload.country; delete payload.postalCode;

      if (profile) { await updateDoctorProfile(payload); showToast('Profile updated!', 'success'); }
      else { await createDoctorProfile(payload); showToast('Profile created!', 'success'); }
      fetchAll();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    try {
      await createAvailability(availForm);
      showToast('Clinic hours added!', 'success');
      fetchAll();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteAvailability = async (id) => {
    try { await deleteAvailability(id); showToast('Removed', 'success'); fetchAll(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!documents || documents.length === 0) { showToast('Please select documents', 'error'); return; }
    const formData = new FormData();
    for (const file of documents) formData.append('documents', file);
    formData.append('documentTypes', 'degree');
    try {
      await submitVerification(formData);
      showToast('Documents submitted for verification!', 'success');
      fetchAll();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleComplete = async (id) => {
    try { await completeAppointment(id); showToast('Marked complete', 'success'); fetchAll(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  if (loading) return <LoadingSpinner />;

  const upcoming = appointments.filter(a => ['confirmed', 'pending'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed');

  const sidebarItems = [
    { key: 'overview', label: 'Overview', icon: <FiCalendar /> },
    { key: 'profile', label: 'Profile', icon: <FiUser /> },
    { key: 'availability', label: 'Clinic Hours', icon: <FiClock /> },
    { key: 'verification', label: 'Verification', icon: <FiUpload /> },
    { key: 'appointments', label: 'Appointments', icon: <FiSettings /> },
  ];

  return (
    <div className="page">
      <Toast toast={toast} />
      <div className="container">
        <div className="flex gap-8" style={{ alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <div style={{ minWidth: '200px' }}>
            <ul className="sidebar-nav">
              {sidebarItems.map(item => (
                <li key={item.key}>
                  <button className={`sidebar-link ${section === item.key ? 'active' : ''}`} onClick={() => setSection(item.key)} style={{ width: '100%', border: 'none', cursor: 'pointer' }}>
                    {item.icon} {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Main */}
          <div style={{ flex: 1 }}>
            {/* Overview */}
            {section === 'overview' && (
              <>
                <h2 className="page-title mb-6">Doctor Dashboard</h2>
                {profile && (
                  <div className="mb-4">
                    <span className={`badge badge-${profile.verificationStatus === 'verified' ? 'verified' : profile.verificationStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                      Status: {profile.verificationStatus}
                    </span>
                  </div>
                )}
                <div className="grid grid-4 mb-8">
                  <div className="stat-card"><div className="stat-value">{upcoming.length}</div><div className="stat-label">Upcoming</div></div>
                  <div className="stat-card"><div className="stat-value">{completed.length}</div><div className="stat-label">Completed</div></div>
                  <div className="stat-card"><div className="stat-value">{appointments.length}</div><div className="stat-label">Total</div></div>
                  <div className="stat-card"><div className="stat-value">{availability.length}</div><div className="stat-label">Schedules</div></div>
                </div>
                {!profile && <div className="card text-center"><p className="mb-4">Create your professional profile to get started.</p><button className="btn btn-primary" onClick={() => setSection('profile')}>Create Profile</button></div>}
                {upcoming.length > 0 && <>
                  <h3 className="mb-4">Upcoming Appointments</h3>
                  <div className="flex flex-col gap-3">
                    {upcoming.slice(0, 5).map(appt => (
                      <div key={appt._id} className="appointment-card">
                        <div className="appointment-card-info">
                          <h4 className="font-semibold">{appt.patient?.name}</h4>
                          <p className="text-sm text-muted">{new Date(appt.appointmentDate).toLocaleDateString('en-IN')} • {appt.startTime}</p>
                        </div>
                        <div className="appointment-card-actions">
                          <button className="btn btn-success btn-sm" onClick={() => handleComplete(appt._id)}><FiCheck size={14} /> Complete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>}
              </>
            )}

            {/* Profile */}
            {section === 'profile' && (
              <>
                <h2 className="page-title mb-6">{profile ? 'Update Profile' : 'Create Profile'}</h2>
                <form onSubmit={handleProfileSave} className="card">
                  <div className="grid grid-2">
                    <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} required /></div>
                    <div className="form-group"><label className="form-label">Qualification *</label><input className="form-input" value={profileForm.qualification} onChange={e => setProfileForm({...profileForm, qualification: e.target.value})} required placeholder="e.g. MBBS, MD" /></div>
                    <div className="form-group"><label className="form-label">Specialization * (comma separated)</label><input className="form-input" value={profileForm.specialization} onChange={e => setProfileForm({...profileForm, specialization: e.target.value})} required placeholder="e.g. Cardiologist, General Physician" /></div>
                    <div className="form-group"><label className="form-label">Experience (years)</label><input className="form-input" type="number" min="0" value={profileForm.experience} onChange={e => setProfileForm({...profileForm, experience: Number(e.target.value)})} /></div>
                    <div className="form-group"><label className="form-label">Expertise (comma separated)</label><input className="form-input" value={profileForm.expertise} onChange={e => setProfileForm({...profileForm, expertise: e.target.value})} placeholder="e.g. Heart Surgery, ECG" /></div>
                    <div className="form-group"><label className="form-label">Diseases Treated (comma separated)</label><input className="form-input" value={profileForm.diseasesTreated} onChange={e => setProfileForm({...profileForm, diseasesTreated: e.target.value})} placeholder="e.g. Diabetes, Hypertension" /></div>
                    <div className="form-group"><label className="form-label">Languages (comma separated)</label><input className="form-input" value={profileForm.languages} onChange={e => setProfileForm({...profileForm, languages: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Visiting Fee (₹)</label><input className="form-input" type="number" min="0" value={profileForm.consultationFee} onChange={e => setProfileForm({...profileForm, consultationFee: Number(e.target.value)})} /></div>
                    <div className="form-group"><label className="form-label">Registration Number</label><input className="form-input" value={profileForm.professionalRegNumber} onChange={e => setProfileForm({...profileForm, professionalRegNumber: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Clinic Name</label><input className="form-input" value={profileForm.clinicName} onChange={e => setProfileForm({...profileForm, clinicName: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">City</label><input className="form-input" value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">State</label><input className="form-input" value={profileForm.state} onChange={e => setProfileForm({...profileForm, state: e.target.value})} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} placeholder="Tell patients about yourself..." /></div>
                  <button type="submit" className="btn btn-primary btn-lg">{profile ? 'Update Profile' : 'Create Profile'}</button>
                </form>
              </>
            )}

            {/* Clinic Hours */}
            {section === 'availability' && (
              <>
                <h2 className="page-title mb-6">Manage Clinic Hours</h2>
                <form onSubmit={handleAddAvailability} className="card mb-6">
                  <h3 className="card-title mb-4">Add Schedule</h3>
                  <div className="grid grid-4">
                    <div className="form-group"><label className="form-label">Day</label><select className="form-select" value={availForm.dayOfWeek} onChange={e => setAvailForm({...availForm, dayOfWeek: Number(e.target.value)})}>{DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></div>
                    <div className="form-group"><label className="form-label">Start</label><input className="form-input" type="time" value={availForm.startTime} onChange={e => setAvailForm({...availForm, startTime: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">End</label><input className="form-input" type="time" value={availForm.endTime} onChange={e => setAvailForm({...availForm, endTime: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Slot (min)</label><input className="form-input" type="number" min="5" max="120" value={availForm.slotDuration} onChange={e => setAvailForm({...availForm, slotDuration: Number(e.target.value)})} /></div>
                  </div>
                  <button type="submit" className="btn btn-primary"><FiPlus size={14} /> Add</button>
                </form>
                {availability.length === 0 ? <EmptyState icon="🕐" title="No schedules" message="Add your clinic hours above" /> : (
                  <div className="flex flex-col gap-3">
                    {availability.map(slot => (
                      <div key={slot._id} className="appointment-card">
                        <div className="appointment-card-info">
                          <h4 className="font-semibold">{DAYS[slot.dayOfWeek]}</h4>
                          <p className="text-sm text-muted">{slot.startTime} – {slot.endTime} • {slot.slotDuration}min slots</p>
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAvailability(slot._id)}><FiTrash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Verification */}
            {section === 'verification' && (
              <>
                <h2 className="page-title mb-6">Verification</h2>
                {verification && (
                  <div className="card mb-6">
                    <h3 className="card-title mb-2">Current Status</h3>
                    <span className={`badge badge-${verification.verificationStatus === 'verified' ? 'verified' : verification.verificationStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                      {verification.verificationStatus}
                    </span>
                    {verification.verification?.rejectionReason && <p className="text-sm mt-2" style={{ color: 'var(--color-error)' }}>Reason: {verification.verification.rejectionReason}</p>}
                  </div>
                )}
                <form onSubmit={handleVerificationSubmit} className="card">
                  <h3 className="card-title mb-4">Submit Documents</h3>
                  <div className="form-group">
                    <label className="form-label">Upload Documents (PDF, JPEG, PNG — max 5MB each)</label>
                    <input className="form-input" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={e => setDocuments(e.target.files)} />
                  </div>
                  <button type="submit" className="btn btn-primary"><FiUpload size={14} /> Submit for Verification</button>
                </form>
              </>
            )}

            {/* Appointments */}
            {section === 'appointments' && (
              <>
                <h2 className="page-title mb-6">All Appointments</h2>
                {appointments.length === 0 ? <EmptyState icon="📅" title="No appointments yet" message="Appointments will appear here once patients book with you" /> : (
                  <div className="flex flex-col gap-3">
                    {appointments.map(appt => (
                      <div key={appt._id} className="appointment-card">
                        <div className="appointment-card-info">
                          <h4 className="font-semibold">{appt.patient?.name}</h4>
                          <p className="text-sm text-muted">{new Date(appt.appointmentDate).toLocaleDateString('en-IN')} • {appt.startTime} - {appt.endTime}</p>
                          <div className="flex gap-2 mt-1">
                            <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                          </div>
                        </div>
                        <div className="appointment-card-actions">
                          {appt.status === 'confirmed' && (
                            <button className="btn btn-success btn-sm" onClick={() => handleComplete(appt._id)}>Complete</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
