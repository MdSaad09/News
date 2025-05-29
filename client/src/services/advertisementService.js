// src/services/advertisementService.js
import api from './api';

// Get active advertisements for display
const getActiveAdvertisements = async (position, page = 'all', device = 'all') => {
  const params = new URLSearchParams();
  if (position) params.append('position', position);
  if (page !== 'all') params.append('page', page);
  if (device !== 'all') params.append('device', device);
  
  const response = await api.get(`/advertisements/active?${params}`);
  return response.data;
};

// Admin functions
const getAdminAdvertisements = async (filters = {}) => {
  const response = await api.get('/advertisements/admin', { params: filters });
  return response.data;
};

const createAdvertisement = async (adData) => {
  const formData = adData instanceof FormData ? adData : new FormData();
  
  if (!(adData instanceof FormData)) {
    Object.keys(adData).forEach(key => {
      if (adData[key] !== null && adData[key] !== undefined) {
        if (Array.isArray(adData[key])) {
          formData.append(key, JSON.stringify(adData[key]));
        } else if (typeof adData[key] === 'object' && !(adData[key] instanceof File)) {
          formData.append(key, JSON.stringify(adData[key]));
        } else {
          formData.append(key, adData[key]);
        }
      }
    });
  }
  
  const response = await api.post('/advertisements', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const updateAdvertisement = async (id, adData) => {
  const formData = adData instanceof FormData ? adData : new FormData();
  
  if (!(adData instanceof FormData)) {
    Object.keys(adData).forEach(key => {
      if (adData[key] !== null && adData[key] !== undefined) {
        if (Array.isArray(adData[key])) {
          formData.append(key, JSON.stringify(adData[key]));
        } else if (typeof adData[key] === 'object' && !(adData[key] instanceof File)) {
          formData.append(key, JSON.stringify(adData[key]));
        } else {
          formData.append(key, adData[key]);
        }
      }
    });
  }
  
  const response = await api.put(`/advertisements/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const deleteAdvertisement = async (id) => {
  const response = await api.delete(`/advertisements/${id}`);
  return response.data;
};

const reorderAdvertisements = async (advertisements) => {
  const response = await api.put('/advertisements/reorder', { advertisements });
  return response.data;
};

const toggleAdvertisementStatus = async (id) => {
  const response = await api.put(`/advertisements/${id}/toggle`);
  return response.data;
};

const getAdvertisementAnalytics = async (id) => {
  const response = await api.get(`/advertisements/${id}/analytics`);
  return response.data;
};

// Public tracking functions
const trackImpression = async (id) => {
  try {
    await api.post(`/advertisements/${id}/impression`);
  } catch (error) {
    // Silently fail impression tracking
    console.warn('Failed to track impression:', error);
  }
};

const trackClick = async (id) => {
  try {
    const response = await api.post(`/advertisements/${id}/click`);
    return response.data;
  } catch (error) {
    console.warn('Failed to track click:', error);
    return { success: false };
  }
};

const advertisementService = {
  getActiveAdvertisements,
  getAdminAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  reorderAdvertisements,
  toggleAdvertisementStatus,
  getAdvertisementAnalytics,
  trackImpression,
  trackClick,
};

export default advertisementService;