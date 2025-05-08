import api from './api';

// Get site settings
const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

// Update site settings
const updateSettings = async (settingsData) => {
  const response = await api.put('/settings', settingsData);
  return response.data;
};

const settingsService = {
  getSettings,
  updateSettings
};

export default settingsService;