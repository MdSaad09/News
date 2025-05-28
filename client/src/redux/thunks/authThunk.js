// authThunk.js - Enhanced version
import authService from '../../services/authService';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  registerStart,
  registerSuccess,
  registerFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  applyReporterStart,
  applyReporterSuccess,
  applyReporterFailure,
  clearError,
  sessionExpired,
  refreshSession
} from '../slices/authSlice';

// Helper to extract error messages
const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'Something went wrong';
};

// Login user
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const userData = await authService.login(credentials);
    dispatch(loginSuccess(userData));
    return userData;
  } catch (error) {
    const message = getErrorMessage(error);
    dispatch(loginFailure(message));
    throw error;
  }
};

// Logout user
export const logout = () => (dispatch) => {
  authService.logout();
  dispatch(logoutAction());
};

// Register user
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(registerStart());
    const user = await authService.register(userData);
    dispatch(registerSuccess(user));
    return user;
  } catch (error) {
    const message = getErrorMessage(error);
    dispatch(registerFailure(message));
    throw error;
  }
};

// Update user profile
export const updateProfile = (userData) => async (dispatch) => {
  try {
    dispatch(updateProfileStart());
    const updatedUser = await authService.updateUserProfile(userData);
    dispatch(updateProfileSuccess(updatedUser));
    return updatedUser;
  } catch (error) {
    const message = getErrorMessage(error);
    dispatch(updateProfileFailure(message));
    throw error;
  }
};

// Get user profile
export const getUserProfile = () => async (dispatch) => {
  try {
    dispatch(updateProfileStart());
    const profileData = await authService.getUserProfile();
    dispatch(updateProfileSuccess(profileData));
    return profileData;
  } catch (error) {
    const message = getErrorMessage(error);
    dispatch(updateProfileFailure(message));
    throw error;
  }
};

// Apply for reporter role
export const applyForReporter = (motivation) => async (dispatch) => {
  try {
    dispatch(applyReporterStart());
    const result = await authService.applyForReporter(motivation);
    dispatch(applyReporterSuccess(result));
    return result;
  } catch (error) {
    const message = getErrorMessage(error);
    dispatch(applyReporterFailure(message));
    throw error;
  }
};

// Clear any auth errors
export const clearAuthError = () => (dispatch) => {
  dispatch(clearError());
};

// Check if token is valid and user is authenticated
export const checkAuth = () => async (dispatch) => {
  try {
    // Get user profile to verify token is still valid
    const profileData = await authService.getUserProfile();
    dispatch(updateProfileSuccess(profileData));
    return true;
  } catch (error) {
    // If token is invalid, logout the user
    dispatch(logout());
    return false;
  }
};

// Session management
export const markSessionExpired = () => (dispatch) => {
  dispatch(sessionExpired());
};

export const refreshUserSession = () => (dispatch) => {
  dispatch(refreshSession());
};

// Auto logout after session expiration
export const setupSessionMonitoring = (expirationTime = 30 * 60 * 1000) => (dispatch, getState) => {
  // Check session every minute
  const intervalId = setInterval(() => {
    const state = getState();
    const lastActivity = state.auth.session.lastActivity;
    const currentTime = Date.now();
    
    if (currentTime - lastActivity > expirationTime) {
      dispatch(sessionExpired());
      // Optionally auto-logout
      // dispatch(logout());
    }
  }, 60 * 1000);
  
  return intervalId; // Return so it can be cleared if needed
};