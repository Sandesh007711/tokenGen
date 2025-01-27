import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8007/api/v1',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for handling tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
