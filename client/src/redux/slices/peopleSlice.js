// src/redux/slices/peopleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import personService from '../../services/personService';

// Fetch all people
export const fetchPeople = createAsyncThunk(
  'people/fetchPeople',
  async (_, { rejectWithValue }) => {
    try {
      return await personService.getPeople();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch people');
    }
  }
);

// Fetch person by ID
export const fetchPersonById = createAsyncThunk(
  'people/fetchPersonById',
  async (id, { rejectWithValue }) => {
    try {
      return await personService.getPersonById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch person');
    }
  }
);

// Fetch news by person
export const fetchNewsByPerson = createAsyncThunk(
  'people/fetchNewsByPerson',
  async ({ id, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await personService.getNewsByPerson(id, page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch person news');
    }
  }
);

// Admin-only thunks
export const createPerson = createAsyncThunk(
  'people/createPerson',
  async (personData, { rejectWithValue }) => {
    try {
      return await personService.createPerson(personData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create person');
    }
  }
);

export const updatePerson = createAsyncThunk(
  'people/updatePerson',
  async ({ id, personData }, { rejectWithValue }) => {
    try {
      return await personService.updatePerson(id, personData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update person');
    }
  }
);

export const deletePerson = createAsyncThunk(
  'people/deletePerson',
  async (id, { rejectWithValue }) => {
    try {
      await personService.deletePerson(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete person');
    }
  }
);

const initialState = {
  people: [],
  currentPerson: null,
  personNews: {
    items: [],
    pagination: { page: 1, totalPages: 1, totalItems: 0 }
  },
  loading: false,
  error: null,
  success: false
};

const peopleSlice = createSlice({
  name: 'people',
  initialState,
  reducers: {
    clearPeopleError: (state) => {
      state.error = null;
    },
    clearPeopleSuccess: (state) => {
      state.success = false;
    },
    clearCurrentPerson: (state) => {
      state.currentPerson = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all people
      .addCase(fetchPeople.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPeople.fulfilled, (state, action) => {
        state.loading = false;
        state.people = action.payload;
      })
      .addCase(fetchPeople.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch person by ID
      .addCase(fetchPersonById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPerson = action.payload;
      })
      .addCase(fetchPersonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch news by person
      .addCase(fetchNewsByPerson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsByPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.personNews.items = action.payload.items || action.payload;
        if (action.payload.pagination) {
          state.personNews.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchNewsByPerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create person
      .addCase(createPerson.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.people.push(action.payload);
      })
      .addCase(createPerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update person
      .addCase(updatePerson.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePerson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentPerson = action.payload;
        
        // Update in people list
        const index = state.people.findIndex(p => Number(p.id) === Number(action.payload.id));
        if (index !== -1) {
          state.people[index] = action.payload;
        }
      })
      .addCase(updatePerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete person
      .addCase(deletePerson.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deletePerson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.people = state.people.filter(p => Number(p.id) !== Number(action.payload));
        if (state.currentPerson && state.currentPerson.id === action.payload) {
          state.currentPerson = null;
        }
      })
      .addCase(deletePerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearPeopleError, clearPeopleSuccess, clearCurrentPerson } = peopleSlice.actions;

// Selectors
export const selectAllPeople = (state) => state.people.people;
export const selectCurrentPerson = (state) => state.people.currentPerson;
export const selectPersonNews = (state) => state.people.personNews.items;
export const selectPersonNewsPagination = (state) => state.people.personNews.pagination;
export const selectPeopleLoading = (state) => state.people.loading;
export const selectPeopleError = (state) => state.people.error;
export const selectPeopleSuccess = (state) => state.people.success;

export default peopleSlice.reducer;