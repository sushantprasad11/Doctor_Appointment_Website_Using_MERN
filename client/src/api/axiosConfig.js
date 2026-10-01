import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const message = data?.message || error.message || 'An error occurred';
    return Promise.reject({ message, errorCode: data?.errorCode, status: error.response?.status });
  }
);

export default api;
