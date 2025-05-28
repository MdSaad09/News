import api from './api';

// Get admin dashboard statistics
const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// Get all news articles (published and unpublished)
const getAllNews = async (params = {}) => {
  const response = await api.get('/news/admin', { params });
  return response.data;
};

// Toggle publish status of a news article
const togglePublishNews = async (id) => {
  const response = await api.put(`/news/${id}/publish`);
  return response.data;
};

const adminService = {
  getAdminStats,
  getAllNews,
  togglePublishNews
};

export default adminService;