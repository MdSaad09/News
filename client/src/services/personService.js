// src/services/personService.js
import api from './api';

// Get all people
const getPeople = async () => {
  const response = await api.get('/people');
  return response.data;
};

// Get person by ID
const getPersonById = async (id) => {
  const response = await api.get(`/people/${id}`);
  return response.data;
};

// Get news by person
const getNewsByPerson = async (id, page = 1, limit = 10) => {
  const response = await api.get(`/people/${id}/news?page=${page}&limit=${limit}`);
  return response.data;
};

// Create person (admin only)
const createPerson = async (personData) => {
  // If personData is already a FormData object, use it directly
  const formData = personData instanceof FormData ? personData : new FormData();
  
  if (!(personData instanceof FormData)) {
    Object.keys(personData).forEach(key => {
      // Skip null or undefined values
      if (personData[key] === null || personData[key] === undefined) return;
      
      // Handle arrays/objects by converting to JSON string
      if (typeof personData[key] === 'object' && !(personData[key] instanceof File)) {
        formData.append(key, JSON.stringify(personData[key]));
      } else {
        formData.append(key, personData[key]);
      }
    });
  }
  
  const response = await api.post('/people', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update person (admin only)
const updatePerson = async (id, personData) => {
  const formData = personData instanceof FormData ? personData : new FormData();
  
  if (!(personData instanceof FormData)) {
    Object.keys(personData).forEach(key => {
      // Skip null or undefined values
      if (personData[key] === null || personData[key] === undefined) return;
      
      // Handle arrays/objects by converting to JSON string
      if (typeof personData[key] === 'object' && !(personData[key] instanceof File)) {
        formData.append(key, JSON.stringify(personData[key]));
      } else {
        formData.append(key, personData[key]);
      }
    });
  }
  
  const response = await api.put(`/people/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete person (admin only)
const deletePerson = async (id) => {
  const response = await api.delete(`/people/${id}`);
  return response.data;
};

const personService = {
  getPeople,
  getPersonById,
  getNewsByPerson,
  createPerson,
  updatePerson,
  deletePerson
};

export default personService;