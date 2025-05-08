import api from './api';

// Get all users (admin only)
const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Get user by ID (admin only)
const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Update user (admin only)
const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Delete user (admin only)
const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Get reporter applications (admin only)
const getReporterApplications = async () => {
  const response = await api.get('/users/reporter-applications');
  return response.data;
};

// Review reporter application (admin only)
const reviewReporterApplication = async (userId, status, feedback) => {
  const response = await api.put(`/users/reporter-applications/${userId}`, { status, feedback });
  return response.data;
};

const userService = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getReporterApplications,
  reviewReporterApplication
};

export default userService;