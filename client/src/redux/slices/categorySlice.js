// src/redux/slices/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../services/categoryService';

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await categoryService.getCategories();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Fetch category by ID
export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (id, { rejectWithValue }) => {
    try {
      return await categoryService.getCategoryById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category');
    }
  }
);

// Admin-only thunks
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      return await categoryService.createCategory(categoryData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      return await categoryService.updateCategory(id, categoryData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

const initialState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
  success: false
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    clearCategorySuccess: (state) => {
      state.success = false;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentCategory = action.payload;
        
        const index = state.categories.findIndex(c => Number(c.id) === Number(action.payload.id));
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.categories = state.categories.filter(c => Number(c.id) !== Number(action.payload));
        if (state.currentCategory && state.currentCategory.id === action.payload) {
          state.currentCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCategoryError, clearCategorySuccess, clearCurrentCategory } = categorySlice.actions;

// Selectors
export const selectAllCategories = (state) => state.categories.categories;
export const selectCurrentCategory = (state) => state.categories.currentCategory;
export const selectCategoriesLoading = (state) => state.categories.loading;
export const selectCategoriesError = (state) => state.categories.error;
export const selectCategoriesSuccess = (state) => state.categories.success;

export default categorySlice.reducer;