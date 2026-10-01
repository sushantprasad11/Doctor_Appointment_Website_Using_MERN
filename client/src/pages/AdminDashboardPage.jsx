import { useState, useEffect } from 'react';
import { getDashboardStats, getVerifications, approveVerification, rejectVerification, getAllAppointments } from '../api/adminApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { FiUsers, FiCheckCircle, FiClock, FiCalendar, FiX, FiCheck, FiEye } from 'react-icons/fi';

export default function AdminDashboardPage() {
  const [section, setSection] = useState('overview');
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchData(); }, [section]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (section === 'overview') {
        const { data } = await getDashboardStats();
        setStats(data.stats);
      } else if (section === 'verifications') {
        const { data } = await getVerifications();
        setVerifications(data.verifications);
      } else if (section === 'appointments') {
        const { data } = await getAllAppointments();
        setAppointments(data.appointments);
      }
    } catch (err) { showToast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try { await approveVerification(id, {}); showToast('Doctor approved!', 'success'); fetchData(); setSelectedVerification(null); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) { showToast('Please provide a rejection reason', 'error'); return; }
    try { await rejectVerification(id, { action: 'reject', rejectionReason: rejectReason }); showToast('Verification rejected', 'success'); fetchData(); setSelectedVerification(null); setRejectReason(''); }
    catch (err) { showToast(err.message, 'error'); }
  };

  const sidebarItems = [
    { key: 'overview', label: 'Dashboard', icon: <FiCalendar /> },
    { key: 'verifications', label: 'Verifications', icon: <FiCheckCircle /> },
    { key: 'appointments', label: 'Appointments', icon: <FiClock /> },
  ];

  return (
    <div className="page">
      <Toast toast={toast} />
      <div className="container">
        <div className="flex gap-8" style={{ alignItems: 'flex-start' }}>
          <div style={{ minWidth: '200px' }}>
            <ul className="sidebar-nav">
              {sidebarItems.map(item => (
                <li key={item.key}>
                  <button className={`sidebar-link ${section === item.key ? 'active' : ''}`} onClick={() => setSection(item.key)} style={{ width: '100%', border: 'none', cursor: 'pointer' }}>{item.icon} {item.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ flex: 1 }}>
            {loading ? <LoadingSpinner /> : <>
              {/* Overview */}
              {section === 'overview' && stats && (
                <>
                  <h2 className="page-title mb-6">Admin Dashboard</h2>
                  <div className="grid grid-4 mb-8">
                    <div className="stat-card"><div className="stat-value">{stats.totalPatients}</div><div className="stat-label">Patients</div></div>
                    <div className="stat-card"><div className="stat-value">{stats.totalDoctors}</div><div className="stat-label">Doctors</div></div>
                    <div className="stat-card"><div className="stat-value">{stats.verifiedDoctors}</div><div className="stat-label">Verified</div></div>
                    <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats.pendingVerifications}</div><div className="stat-label">Pending</div></div>
                  </div>
                  <div className="grid grid-3">
                    <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-error)' }}>{stats.rejectedDoctors}</div><div className="stat-label">Rejected</div></div>
                    <div className="stat-card"><div className="stat-value">{stats.totalAppointments}</div><div className="stat-label">Total Appointments</div></div>
                    <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-secondary)' }}>{stats.todayAppointments}</div><div className="stat-label">Today</div></div>
                  </div>
                </>
              )}

              {/* Verifications */}
              {section === 'verifications' && (
                <>
                  <h2 className="page-title mb-6">Doctor Verification Queue</h2>
                  {verifications.length === 0 ? <EmptyState icon="✅" title="All clear" message="No pending verifications" /> : (
                    <div className="flex flex-col gap-4">
                      {verifications.map(v => (
                        <div key={v._id} className="card">
                          <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                              <h3 className="font-semibold">{v.doctor?.fullName || 'Unknown'}</h3>
                              <p className="text-sm text-secondary">{v.doctor?.qualification} • {v.doctor?.specialization?.join(', ')}</p>
                              <p className="text-sm text-muted mt-1">{v.doctor?.user?.email}</p>
                              <p className="text-sm text-muted">Submitted: {new Date(v.submittedAt).toLocaleDateString('en-IN')}</p>
                              <p className="text-sm mt-1">Documents: {v.documents?.length || 0} file(s)</p>
                              <span className={`badge badge-${v.status === 'approved' ? 'verified' : v.status === 'rejected' ? 'rejected' : 'pending'} mt-2`}>{v.status}</span>
                            </div>
                            <div className="flex gap-2">
                              {v.documents?.map((doc, i) => (
                                <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><FiEye size={14} /> Doc {i + 1}</a>
                              ))}
                              {['pending', 'under_review'].includes(v.status) && <>
                                <button className="btn btn-success btn-sm" onClick={() => handleApprove(v._id)}><FiCheck size={14} /> Approve</button>
                                <button className="btn btn-danger btn-sm" onClick={() => setSelectedVerification(v)}><FiX size={14} /> Reject</button>
                              </>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Appointments */}
              {section === 'appointments' && (
                <>
                  <h2 className="page-title mb-6">All Appointments</h2>
                  {appointments.length === 0 ? <EmptyState icon="📅" title="No appointments" message="No appointments yet" /> : (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {appointments.map(a => (
                            <tr key={a._id}>
                              <td>{a.patient?.name}</td>
                              <td>{a.doctor?.fullName}</td>
                              <td>{new Date(a.appointmentDate).toLocaleDateString('en-IN')}</td>
                              <td>{a.startTime}</td>
                              <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>}
          </div>
        </div>

        {/* Reject Modal */}
        {selectedVerification && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
              <h3 className="mb-4">Reject Verification — {selectedVerification.doctor?.fullName}</h3>
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea className="form-textarea" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Provide reason for rejection..." required />
              </div>
              <div className="flex gap-3 justify-end">
                <button className="btn btn-ghost" onClick={() => { setSelectedVerification(null); setRejectReason(''); }}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleReject(selectedVerification._id)}>Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
