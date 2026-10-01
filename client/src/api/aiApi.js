import api from './axiosConfig';

export const analyzeSymptoms = (message, history = []) =>
  api.post('/ai/symptom-check', { message, history });
