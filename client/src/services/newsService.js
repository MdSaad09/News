import api from './api';

// Get all news
const getAllNews = async () => {
  const response = await api.get('/news');
  return response.data;
};

// Get news by ID
const getNewsById = async (id) => {
  const response = await api.get(`/news/${id}`);
  return response.data;
};

// Create news
const createNews = async (newsData) => {
  const response = await api.post('/news', newsData);
  return response.data;
};

// Update news
const updateNews = async (id, newsData) => {
  const response = await api.put(`/news/${id}`, newsData);
  return response.data;
};

// Delete news
const deleteNews = async (id) => {
  const response = await api.delete(`/news/${id}`);
  return response.data;
};

// Import multiple news items
const importNews = async (newsItems) => {
  const response = await api.post('/news/import', { newsItems });
  return response.data;
};

const newsService = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  importNews
};

export default newsService;