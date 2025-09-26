// API service functions for Map Card management
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return `${BASE_URL}/${imagePath.replace(/\\/g, '/')}`;
};

// Map Card API Services
export const mapCardAPI = {
  // Get all map cards
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mapcard`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching map cards:", error);
      throw error;
    }
  },

  // Get single map card by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mapcard/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching map card:", error);
      throw error;
    }
  },

  // Get map cards by country ID
  getByCountryId: async (countryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mapcard/country/${countryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching map cards by country:", error);
      throw error;
    }
  },

  // Create map card
  create: async (mapCardData) => {
    try {
      const formData = new FormData();
      
      if (mapCardData.country) formData.append('country', mapCardData.country);
      if (mapCardData.city) formData.append('city', mapCardData.city);
      if (mapCardData.description) formData.append('description', mapCardData.description);
      if (mapCardData.latitude) formData.append('latitude', mapCardData.latitude);
      if (mapCardData.longitude) formData.append('longitude', mapCardData.longitude);
      
      // Append image
      if (mapCardData.image) {
        formData.append('image', mapCardData.image);
      }

      const response = await fetch(`${API_BASE_URL}/mapcard`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating map card:", error);
      throw error;
    }
  },

  // Update map card
  update: async (id, mapCardData) => {
    try {
      const formData = new FormData();
      
      if (mapCardData.country) formData.append('country', mapCardData.country);
      if (mapCardData.city) formData.append('city', mapCardData.city);
      if (mapCardData.description) formData.append('description', mapCardData.description);
      if (mapCardData.latitude) formData.append('latitude', mapCardData.latitude);
      if (mapCardData.longitude) formData.append('longitude', mapCardData.longitude);
      
      // Append image if exists
      if (mapCardData.image) {
        formData.append('image', mapCardData.image);
      }

      const response = await fetch(`${API_BASE_URL}/mapcard/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating map card:", error);
      throw error;
    }
  },

  // Delete map card
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mapcard/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting map card:", error);
      throw error;
    }
  }
};