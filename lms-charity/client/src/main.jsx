import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Configure axios defaults - FORCE correct API URL
const apiUrl = 'https://eduback.vercel.app/api'; // Hardcoded to force correct URL
console.log('🔗 API URL configured (FORCED):', apiUrl);
console.log('🔗 Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
axios.defaults.baseURL = apiUrl;
axios.defaults.withCredentials = true;

// Add auth token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.startsWith('/admin-approve')
    ) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
