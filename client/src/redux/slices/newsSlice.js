// src/redux/slices/newsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch published news (public)
export const fetchPublishedNews = createAsyncThunk(
  'news/fetchPublishedNews',
  async ({ page = 1, limit = 10, categoryId = null, personId = null }, { rejectWithValue }) => {
    try {
      let url = `/api/news?page=${page}&limit=${limit}`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      if (personId) url += `&personId=${personId}`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch news');
    }
  }
);

// Fetch a single news article by ID
export const fetchNewsById = createAsyncThunk(
  'news/fetchNewsById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/news/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch news details');
    }
  }
);

// Fetch news with videos
export const fetchVideoNews = createAsyncThunk(
  'news/fetchVideoNews',
  async ({ page = 1, limit = 12 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/news/videos?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch video news');
    }
  }
);

// Fetch reporter's own news (protected)
export const fetchReporterNews = createAsyncThunk(
  'news/fetchReporterNews',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/news/reporter/mynews?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reporter news');
    }
  }
);

// Fetch all news (admin only)
export const fetchAllNews = createAsyncThunk(
  'news/fetchAllNews',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/news/admin?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all news');
    }
  }
);

// Create news article (reporter/admin)
export const createNews = createAsyncThunk(
  'news/createNews',
  async (newsData, { rejectWithValue }) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add text fields
      Object.keys(newsData).forEach(key => {
        if (key !== 'coverImage' && key !== 'videoThumbnail') {
          if (Array.isArray(newsData[key])) {
            // Handle arrays like categories or people
            newsData[key].forEach(value => {
              formData.append(`${key}[]`, value);
            });
          } else {
            formData.append(key, newsData[key]);
          }
        }
      });
      
      // Add files if they exist
      if (newsData.coverImage) formData.append('coverImage', newsData.coverImage);
      if (newsData.videoThumbnail) formData.append('videoThumbnail', newsData.videoThumbnail);
      
      // Set hasVideo flag based on featuredVideo
      if (newsData.featuredVideo && !formData.has('hasVideo')) {
        formData.append('hasVideo', 'true');
      }
      
      const response = await axios.post('/api/news', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create news');
    }
  }
);

// Update news article (reporter/admin)
export const updateNews = createAsyncThunk(
  'news/updateNews',
  async ({ id, newsData }, { rejectWithValue }) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add text fields
      Object.keys(newsData).forEach(key => {
        if (key !== 'coverImage' && key !== 'videoThumbnail') {
          if (Array.isArray(newsData[key])) {
            // Handle arrays like categories or people
            newsData[key].forEach(value => {
              formData.append(`${key}[]`, value);
            });
          } else {
            formData.append(key, newsData[key]);
          }
        }
      });
      
      // Add files if they exist
      if (newsData.coverImage) formData.append('coverImage', newsData.coverImage);
      if (newsData.videoThumbnail) formData.append('videoThumbnail', newsData.videoThumbnail);
      
      // Set hasVideo flag based on featuredVideo
      if (newsData.featuredVideo && !formData.has('hasVideo')) {
        formData.append('hasVideo', 'true');
      }
      
      const response = await axios.put(`/api/news/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update news');
    }
  }
);

// Delete news article (reporter/admin)
export const deleteNews = createAsyncThunk(
  'news/deleteNews',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/news/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete news');
    }
  }
);

// Toggle publish status (admin only)
export const togglePublishNews = createAsyncThunk(
  'news/togglePublishNews',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/news/${id}/publish`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle publish status');
    }
  }
);

const initialState = {
  publishedNews: {
    items: [],
    pagination: { page: 1, totalPages: 1, totalItems: 0 }
  },
  videoNews: {
    items: [],
    pagination: { page: 1, totalPages: 1, totalItems: 0 }
  },
  reporterNews: {
    items: [],
    pagination: { page: 1, totalPages: 1, totalItems: 0 }
  },
  adminNews: {
    items: [],
    pagination: { page: 1, totalPages: 1, totalItems: 0 }
  },
  currentNews: null,
  loading: false,
  error: null,
  success: false
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    clearNewsError: (state) => {
      state.error = null;
    },
    clearNewsSuccess: (state) => {
      state.success = false;
    },
    clearCurrentNews: (state) => {
      state.currentNews = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch published news
      .addCase(fetchPublishedNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublishedNews.fulfilled, (state, action) => {
        state.loading = false;
        state.publishedNews.items = action.payload.items || action.payload;
        if (action.payload.pagination) {
          state.publishedNews.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchPublishedNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch news by ID
      .addCase(fetchNewsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNews = action.payload;
      })
      .addCase(fetchNewsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch video news
      .addCase(fetchVideoNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideoNews.fulfilled, (state, action) => {
        state.loading = false;
        state.videoNews.items = action.payload.items || action.payload;
        if (action.payload.pagination) {
          state.videoNews.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchVideoNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch reporter news
      .addCase(fetchReporterNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReporterNews.fulfilled, (state, action) => {
        state.loading = false;
        state.reporterNews.items = action.payload.items || action.payload;
        if (action.payload.pagination) {
          state.reporterNews.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchReporterNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all news (admin)
      .addCase(fetchAllNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNews.fulfilled, (state, action) => {
        state.loading = false;
        state.adminNews.items = action.payload.items || action.payload;
        if (action.payload.pagination) {
          state.adminNews.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAllNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create news
      .addCase(createNews.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // If reporter is viewing their news, add the new article to their list
        state.reporterNews.items.unshift(action.payload);
      })
      .addCase(createNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update news
      .addCase(updateNews.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentNews = action.payload;
        
        // Update in all relevant lists
        const updateInList = (list) => {
          const index = list.findIndex(item => Number(item.id) === Number(action.payload.id));
          if (index !== -1) {
            list[index] = action.payload;
          }
        };
        
        updateInList(state.publishedNews.items);
        updateInList(state.reporterNews.items);
        updateInList(state.adminNews.items);
        updateInList(state.videoNews.items);
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete news
      .addCase(deleteNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Remove from all relevant lists
        const deleteFromList = (list) => {
          return list.filter(item => Number(item.id) !== Number(action.payload));
        };
        
        state.publishedNews.items = deleteFromList(state.publishedNews.items);
        state.reporterNews.items = deleteFromList(state.reporterNews.items);
        state.adminNews.items = deleteFromList(state.adminNews.items);
        state.videoNews.items = deleteFromList(state.videoNews.items);
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle publish status
      .addCase(togglePublishNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePublishNews.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Update the article in all relevant lists
        const updateInList = (list) => {
          const index = list.findIndex(item => item.id === action.payload.id);
          if (index !== -1) {
            list[index] = action.payload;
          }
        };
        
        updateInList(state.publishedNews.items);
        updateInList(state.reporterNews.items);
        updateInList(state.adminNews.items);
        updateInList(state.videoNews.items);
        
        // If this is the current news article, update it
        if (state.currentNews && state.currentNews.id === action.payload.id) {
          state.currentNews = action.payload;
        }
      })
      .addCase(togglePublishNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearNewsError, clearNewsSuccess, clearCurrentNews } = newsSlice.actions;

// Selectors
export const selectPublishedNews = (state) => state.news.publishedNews.items;
export const selectPublishedNewsPagination = (state) => state.news.publishedNews.pagination;
export const selectVideoNews = (state) => state.news.videoNews.items;
export const selectVideoNewsPagination = (state) => state.news.videoNews.pagination;
export const selectReporterNews = (state) => state.news.reporterNews.items;
export const selectReporterNewsPagination = (state) => state.news.reporterNews.pagination;
export const selectAdminNews = (state) => state.news.adminNews.items;
export const selectAdminNewsPagination = (state) => state.news.adminNews.pagination;
export const selectCurrentNews = (state) => state.news.currentNews;
export const selectNewsLoading = (state) => state.news.loading;
export const selectNewsError = (state) => state.news.error;
export const selectNewsSuccess = (state) => state.news.success;

export default newsSlice.reducer;