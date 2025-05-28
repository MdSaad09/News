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

// Create news with file upload support
const createNews = async (newsData) => {
  // If newsData is already a FormData object, use it directly
  // Otherwise, create a new FormData object and append all fields
  const formData = newsData instanceof FormData ? newsData : new FormData();
  
  if (!(newsData instanceof FormData)) {
    Object.keys(newsData).forEach(key => {
      // Skip null or undefined values
      if (newsData[key] === null || newsData[key] === undefined) return;

      // Handle arrays specifically for MySQL compatibility
      if (Array.isArray(newsData[key])) {
        // For arrays like additionalCategories, tags, etc.
        newsData[key].forEach((value, index) => {
          if (typeof value === 'object') {
            formData.append(`${key}[${index}]`, JSON.stringify(value));
          } else {
            formData.append(`${key}[${index}]`, value);
          }
        });
      } 
      
      // Handle arrays/objects by converting to JSON string
      else if (typeof newsData[key] === 'object' && !(newsData[key] instanceof File)) {
        formData.append(key, JSON.stringify(newsData[key]));
      } else {
        formData.append(key, newsData[key]);
      }
    });
  }
  
  // Set hasVideo flag based on featuredVideo if not already set
  if (newsData.featuredVideo && !formData.has('hasVideo')) {
    formData.append('hasVideo', 'true');
  }
  
  const response = await api.post('/news', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update news with file upload support
const updateNews = async (id, newsData) => {
  const formData = newsData instanceof FormData ? newsData : new FormData();
  
  if (!(newsData instanceof FormData)) {
    Object.keys(newsData).forEach(key => {
      // Skip null or undefined values
      if (newsData[key] === null || newsData[key] === undefined) return;

      // Handle arrays specifically for MySQL compatibility
      if (Array.isArray(newsData[key])) {
        // For arrays like additionalCategories, tags, etc.
        newsData[key].forEach((value, index) => {
          if (typeof value === 'object') {
            formData.append(`${key}[${index}]`, JSON.stringify(value));
          } else {
            formData.append(`${key}[${index}]`, value);
          }
        });
      } 
      
      // Handle arrays/objects by converting to JSON string
      else if (typeof newsData[key] === 'object' && !(newsData[key] instanceof File)) {
        formData.append(key, JSON.stringify(newsData[key]));
      } else {
        formData.append(key, newsData[key]);
      }
    });
  }
  
  const response = await api.put(`/news/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete news
const deleteNews = async (id) => {
  const response = await api.delete(`/news/${id}`);
  return response.data;
};

// Import news from document file
const importNews = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/news/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Bulk import news from parsed document
const bulkImportNews = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/news/import/parse', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get reporter's news articles
const getReporterNews = async () => {
  const response = await api.get('/news/reporter/mynews');
  return response.data;
};

// Get reporter statistics
const getReporterStats = async (timeRange = 'all') => {
  const response = await api.get(`/news/reporter/stats?timeRange=${timeRange}`);
  return response.data;
};

// Get all news articles for admin (with filters)
const getAdminNews = async (filters = {}) => {
  const response = await api.get('/news/admin', { params: filters });
  return response.data;
};

// Toggle publish status of a news article
const togglePublishNews = async (id) => {
  const response = await api.put(`/news/${id}/publish`);
  return response.data;
};

const getVideoNews = async (page = 1, limit = 10) => {
  const response = await api.get(`/news/videos?page=${page}&limit=${limit}`);
  return response.data;
};
const newsService = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  importNews,
  bulkImportNews,
  getReporterNews,
  getReporterStats,
  getAdminNews,
  togglePublishNews,
  getVideoNews,
};

export default newsService;