import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({ baseURL: API_BASE });

export const fetchDashboard = () => api.get('/dashboard').then(r => r.data);
export const fetchTriage = () => api.get('/readiness/triage').then(r => r.data);
export const fetchCorridor = () => api.get('/risk/corridor').then(r => r.data);
export const postSimulate = (data) => api.post('/simulate', data).then(r => r.data);

export default api;
