// API service functions for Travel Tips management
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return `${BASE_URL}/${imagePath.replace(/\\/g, '/')}`;
};

// Travel Tips API Services
export const travelTipAPI = {
  // Get all travel tips
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mapcard`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching travel tips:", error);
      throw error;
    }
  },

  // Get single travel tip by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mapcard/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching travel tip:", error);
      throw error;
    }
  },

  // Get travel tip by country ID
  getByCountryId: async (countryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mapcard/country/${countryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching travel tip by country:", error);
      throw error;
    }
  },

  // Create travel tip
  create: async (travelTipData) => {
    try {
      const formData = new FormData();
      formData.append('country', travelTipData.country);
      formData.append('mainHeading', travelTipData.mainHeading);
      
      // Append main image
      if (travelTipData.mainImage) {
        formData.append('mainImage', travelTipData.mainImage);
      }
      
      // Append tips array
      if (travelTipData.tips && travelTipData.tips.length > 0) {
        formData.append('tips', JSON.stringify(travelTipData.tips));
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
      console.error("Error creating travel tip:", error);
      throw error;
    }
  },

  // Update travel tip
  update: async (id, travelTipData) => {
    try {
      const formData = new FormData();
      
      if (travelTipData.country) formData.append('country', travelTipData.country);
      if (travelTipData.mainHeading) formData.append('mainHeading', travelTipData.mainHeading);
      
      // Append main image if exists
      if (travelTipData.mainImage) {
        formData.append('mainImage', travelTipData.mainImage);
      }
      
      // Append tips array
      if (travelTipData.tips) {
        formData.append('tips', JSON.stringify(travelTipData.tips));
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
      console.error("Error updating travel tip:", error);
      throw error;
    }
  },

  // Delete travel tip
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
      console.error("Error deleting travel tip:", error);
      throw error;
    }
  }
};