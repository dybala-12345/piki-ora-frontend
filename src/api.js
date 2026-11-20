import axios from 'axios';

// Base URL of the Django REST API. Set VITE_API_URL in .env (local) or on Render.
export const BaseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

// One shared axios instance for the whole app
const api = axios.create({
  baseURL: BaseUrl + '/api/',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the saved token to every request (same idea as the
// "Authorization: Token ..." header we used in Postman)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Token ' + token;
  }
  return config;
});

// If the token is no longer valid, log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Turn a DRF error response into one readable message
export function errorMessage(error) {
  const data = error?.response?.data;
  if (!data) return 'Cannot reach the server. Please try again.';
  if (typeof data === 'string') return 'Something went wrong on the server.';
  if (data.detail) return data.detail;
  return Object.entries(data)
    .map(([field, msgs]) => {
      const text = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
      return field === 'non_field_errors' ? text : `${field.replace(/_/g, ' ')}: ${text}`;
    })
    .join(' ');
}

export default api;
