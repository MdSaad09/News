import axios from 'axios';

// Add this line to define the server base URL
export const SERVER_BASE_URL = 'http://localhost:5000';
const API_URL = `${SERVER_BASE_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling for SQL/Sequelize specific errors
    const message = 
      error.response?.data?.message ||
      (error.response?.data?.errors && Array.isArray(error.response.data.errors) 
        ? error.response.data.errors[0].message 
        : null) ||
      error.message ||
      'Something went wrong';
      
    console.error('API Error:', message);
    
    return Promise.reject(error);
  }
);

export default api;