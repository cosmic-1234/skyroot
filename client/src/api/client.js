import axios from 'axios';

// In production: VITE_API_URL = https://your-app.onrender.com/api/v1
// In dev: Vite proxy forwards /api/* to localhost:4000
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({ baseURL: API_BASE });

export const fetchDashboard = () => api.get('/dashboard').then(r => r.data);
export const fetchTriage = () => api.get('/readiness/triage').then(r => r.data);
export const fetchCorridor = () => api.get('/risk/corridor').then(r => r.data);
export const postSimulate = (data) => api.post('/simulate', data).then(r => r.data);

export default api;
