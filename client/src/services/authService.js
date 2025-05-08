import api from './api';

// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Get user profile
const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// Update user profile
const updateUserProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Apply for reporter role
const applyForReporter = async (motivation) => {
  const response = await api.post('/auth/apply-reporter', { motivation });
  return response.data;
};

const authService = {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  applyForReporter
};

export default authService;