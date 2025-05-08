import api from './api';

// Get admin dashboard statistics
const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

const adminService = {
  getAdminStats
};

export default adminService;