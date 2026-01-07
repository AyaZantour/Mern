import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Question API calls
export const questionAPI = {
  generate: (data) => api.post('/questions/generate', data),
  refresh: (data) => api.post('/questions/refresh', data),
  // create: (data) => api.post('/questions', data), // CREATE single question
  create: (data) => api.post('/questions/create', data),

  getAll: () => api.get('/questions'),
  getTests: () => api.get('/tests'),
};

// Test API calls
export const testAPI = {
  create: (data) => api.post('/tests', data),
  getAll: () => api.get('/tests'),
  getById: (id) => api.get(`/tests/${id}`),
  update: (id, data) => api.put(`/tests/${id}`, data),
  delete: (id) => api.delete(`/tests/${id}`),
};

// Candidate Test API calls
export const candidateTestAPI = {
  create: (data) => api.post('/candidate-tests', data),
  getByLink: (uniqueLink) => api.get(`/candidate-tests/link/${uniqueLink}`),
  submit: (id, data) => api.put(`/candidate-tests/${id}/submit`, data),
  getAll: () => api.get('/candidate-tests'),
   evaluate: (id, data) => api.put(`/candidate-tests/${id}/evaluate`, data), // NEW
  getByTestId: (testId) => api.get(`/candidate-tests/test/${testId}`), // NEW
};

// Send Test API calls
export const sendTestAPI = {
  send: (data) => api.post('/send-test', data),
};

export default api;
