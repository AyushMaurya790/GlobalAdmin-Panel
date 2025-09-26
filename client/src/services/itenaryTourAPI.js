// API service functions for Itinerary Tour management
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return `${BASE_URL}/${imagePath.replace(/\\/g, '/')}`;
};

// Itinerary Tour API Services
export const itenaryTourAPI = {
  // Get all itinerary tours
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/itenary-tour`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching itinerary tours:", error);
      throw error;
    }
  },

  // Get single itinerary tour by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/itenary-tour/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching itinerary tour:", error);
      throw error;
    }
  },

  // Create itinerary tour
  create: async (tourData) => {
    try {
      const formData = new FormData();
      formData.append('country', tourData.country);
      formData.append('mainHeading', tourData.mainHeading);
      
      // Process cards with images
      if (tourData.cards && tourData.cards.length > 0) {
        // For each card, create a nested structure in FormData
        tourData.cards.forEach((card, index) => {
          formData.append(`cards[${index}][title]`, card.title);
          formData.append(`cards[${index}][description]`, card.description);
          
          // Handle image
          if (card.image && typeof card.image !== 'string') {
            formData.append(`cards[${index}][image]`, card.image);
          } else if (card.existingImage) {
            formData.append(`cards[${index}][image]`, card.existingImage);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/itenary-tour`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating itinerary tour:", error);
      throw error;
    }
  },

  // Update itinerary tour
  update: async (id, tourData) => {
    try {
      const formData = new FormData();
      
      if (tourData.country) formData.append('country', tourData.country);
      if (tourData.mainHeading) formData.append('mainHeading', tourData.mainHeading);
      
      // Process cards with images
      if (tourData.cards && tourData.cards.length > 0) {
        // For each card, create a nested structure in FormData
        tourData.cards.forEach((card, index) => {
          formData.append(`cards[${index}][title]`, card.title);
          formData.append(`cards[${index}][description]`, card.description);
          
          // Handle image
          if (card.image && typeof card.image !== 'string') {
            formData.append(`cards[${index}][image]`, card.image);
          } else if (card.existingImage) {
            formData.append(`cards[${index}][image]`, card.existingImage);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/itenary-tour/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating itinerary tour:", error);
      throw error;
    }
  },

  // Delete itinerary tour
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/itenary-tour/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting itinerary tour:", error);
      throw error;
    }
  }
};