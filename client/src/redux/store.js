// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import newsReducer from './slices/newsSlice';
import categoryReducer from './slices/categorySlice';
import peopleReducer from './slices/peopleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    news: newsReducer,
    categories: categoryReducer,
    people: peopleReducer,
  },
});

export default store;