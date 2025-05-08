import api from './api';

// Get all categories
const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Get category by ID
const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// Create new category
const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

// Update category
const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

// Delete category
const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

const categoryService = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

export default categoryService;