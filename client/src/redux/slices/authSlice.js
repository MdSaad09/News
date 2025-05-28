// authSlice.js - Enhanced version
import { createSlice } from '@reduxjs/toolkit';

// Get user from localStorage
const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

const initialState = {
  user: userFromStorage,
  isLoading: false,
  error: null,
  reporterApplication: {
    isSubmitting: false,
    status: userFromStorage?.reporterApplicationStatus || 'none',
    error: null,
  },
  session: {
    isExpired: false,
    lastActivity: Date.now()
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login reducers
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
      state.session.isExpired = false;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
      state.reporterApplication.status = action.payload.reporterApplicationStatus || 'none';
      state.session.lastActivity = Date.now();
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Logout reducer
    logout: (state) => {
      state.user = null;
      state.reporterApplication.status = 'none';
      state.session.isExpired = false;
    },
    
    // Register reducers
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
      state.reporterApplication.status = action.payload.reporterApplicationStatus || 'none';
      state.session.lastActivity = Date.now();
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Profile update reducers
    updateProfileStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
      state.session.lastActivity = Date.now();
    },
    updateProfileFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Reporter application reducers
    applyReporterStart: (state) => {
      state.reporterApplication.isSubmitting = true;
      state.reporterApplication.error = null;
    },
    applyReporterSuccess: (state, action) => {
      state.reporterApplication.isSubmitting = false;
      state.reporterApplication.status = 'pending';
      state.reporterApplication.error = null;
      if (state.user) {
        state.user.reporterApplicationStatus = 'pending';
      }
      state.session.lastActivity = Date.now();
    },
    applyReporterFailure: (state, action) => {
      state.reporterApplication.isSubmitting = false;
      state.reporterApplication.error = action.payload;
    },
    
    // Update reporter application status
    updateReporterStatusSuccess: (state, action) => {
      state.reporterApplication.status = action.payload.status;
      if (state.user) {
        state.user.reporterApplicationStatus = action.payload.status;
        if (action.payload.status === 'approved') {
          state.user.role = 'reporter';
        }
      }
      state.session.lastActivity = Date.now();
    },
    
    // Session management
    sessionExpired: (state) => {
      state.session.isExpired = true;
    },
    refreshSession: (state) => {
      state.session.lastActivity = Date.now();
      state.session.isExpired = false;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
      state.reporterApplication.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  applyReporterStart,
  applyReporterSuccess,
  applyReporterFailure,
  updateReporterStatusSuccess,
  sessionExpired,
  refreshSession,
  clearError,
} = authSlice.actions;

// Enhanced selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.user;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectIsReporter = (state) => 
  state.auth.user?.role === 'reporter' || state.auth.user?.role === 'admin';
export const selectIsModerator = (state) => 
  ['admin', 'reporter', 'moderator'].includes(state.auth.user?.role);
export const selectUserRole = (state) => state.auth.user?.role || 'user';
export const selectReporterApplicationStatus = (state) => 
  state.auth.reporterApplication.status;
export const selectReporterApplicationSubmitting = (state) => 
  state.auth.reporterApplication.isSubmitting;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectReporterApplicationError = (state) => 
  state.auth.reporterApplication.error;
export const selectIsSessionExpired = (state) => state.auth.session.isExpired;
export const selectLastActivity = (state) => state.auth.session.lastActivity;

export default authSlice.reducer;