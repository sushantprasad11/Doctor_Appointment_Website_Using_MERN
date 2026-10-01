import api from './axiosConfig';

export const createReview = (data) => api.post('/reviews', data);
export const getDoctorReviews = (doctorId, params) => api.get(`/reviews/doctor/${doctorId}`, { params });
export const getConsultationAccess = (appointmentId) => api.get(`/consultation/${appointmentId}/access`);
