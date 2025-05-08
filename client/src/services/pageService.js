import api from './api';

// Get all pages (admin)
const getPages = async () => {
  const response = await api.get('/pages');
  return response.data;
};

// Get page by ID (admin)
const getPageById = async (id) => {
  const response = await api.get(`/pages/${id}`);
  return response.data;
};

// Get page by slug (public)
const getPageBySlug = async (slug) => {
  const response = await api.get(`/pages/slug/${slug}`);
  return response.data;
};

// Create new page (admin)
const createPage = async (pageData) => {
  const response = await api.post('/pages', pageData);
  return response.data;
};

// Update page (admin)
const updatePage = async (id, pageData) => {
  const response = await api.put(`/pages/${id}`, pageData);
  return response.data;
};

// Delete page (admin)
const deletePage = async (id) => {
  const response = await api.delete(`/pages/${id}`);
  return response.data;
};

const pageService = {
  getPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage
};

export default pageService;