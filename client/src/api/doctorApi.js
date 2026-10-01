import api from './axiosConfig';

export const searchDoctors = (params) => api.get('/doctors', { params });
export const getDoctorProfile = (id) => api.get(`/doctors/${id}`);
export const getMyDoctorProfile = () => api.get('/doctors/profile/me');
export const createDoctorProfile = (data) => {
  const isFormData = data instanceof FormData;
  return api.post('/doctors/profile', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};
export const updateDoctorProfile = (data) => {
  const isFormData = data instanceof FormData;
  return api.put('/doctors/profile', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};
