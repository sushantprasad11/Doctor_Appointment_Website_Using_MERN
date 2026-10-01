import api from './axiosConfig';

export const getMyAvailability = () => api.get('/availability/me');
export const getDoctorAvailability = (doctorId) => api.get(`/availability/doctor/${doctorId}`);
export const createAvailability = (data) => api.post('/availability', data);
export const updateAvailability = (id, data) => api.put(`/availability/${id}`, data);
export const deleteAvailability = (id) => api.delete(`/availability/${id}`);
