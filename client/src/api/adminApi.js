import api from './axiosConfig';

export const getDashboardStats = () => api.get('/admin/dashboard');
export const getVerifications = (params) => api.get('/admin/verifications', { params });
export const getVerificationDetail = (id) => api.get(`/admin/verifications/${id}`);
export const approveVerification = (id, data) => api.patch(`/admin/verifications/${id}/approve`, data);
export const rejectVerification = (id, data) => api.patch(`/admin/verifications/${id}/reject`, data);
export const suspendDoctor = (id) => api.patch(`/admin/doctors/${id}/suspend`);
export const getAllAppointments = (params) => api.get('/admin/appointments', { params });

export const submitVerification = (formData) =>
  api.post('/verification/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getVerificationStatus = () => api.get('/verification/status');
