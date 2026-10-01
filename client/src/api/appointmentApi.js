import api from './axiosConfig';

export const createAppointment = (data) => api.post('/appointments', data);
export const getMyAppointments = (params) => api.get('/appointments', { params });
export const getAppointment = (id) => api.get(`/appointments/${id}`);
export const cancelAppointment = (id, data) => api.patch(`/appointments/${id}/cancel`, data);
export const completeAppointment = (id) => api.patch(`/appointments/${id}/complete`);
export const getAvailableSlots = (doctorId, date) => api.get(`/appointments/slots/${doctorId}`, { params: { date } });
