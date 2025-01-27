<<<<<<< HEAD

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:7002/api/v1',
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
=======
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.get('/users/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
>>>>>>> 05991ed67e2f0e622862bf77b13bf0a6869f19b5
