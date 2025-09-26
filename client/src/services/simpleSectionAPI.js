// API service functions for Simple Section management
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return `${BASE_URL}/${imagePath.replace(/\\/g, '/')}`;
};

// Simple Section API Services
export const simpleSectionAPI = {
  // Get all simple sections
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/simple-section`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching simple sections:", error);
      throw error;
    }
  },

  // Get single simple section by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/simple-section/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching simple section:", error);
      throw error;
    }
  },

  // Get simple sections by country ID
  getByCountryId: async (countryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/simple-section/country/${countryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching simple sections by country:", error);
      throw error;
    }
  },

  // Create simple section
  create: async (sectionData) => {
    try {
      const formData = new FormData();
      formData.append('country', sectionData.country);
      formData.append('mainHeading', sectionData.mainHeading);
      
      // Process cards with images
      if (sectionData.cards && sectionData.cards.length > 0) {
        // Create a cards array without the image files for JSON
        const cardsForJson = sectionData.cards.map(card => ({
          title: card.title,
          description: card.description,
          // For existing cards that already have an image path
          ...(card.existingImage && { image: card.existingImage })
        }));
        
        formData.append('cards', JSON.stringify(cardsForJson));
        
        // Append card images separately
        sectionData.cards.forEach((card, index) => {
          if (card.image && typeof card.image !== 'string') {
            formData.append('images', card.image);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/simple-section`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating simple section:", error);
      throw error;
    }
  },

  // Update simple section
  update: async (id, sectionData) => {
    try {
      const formData = new FormData();
      
      if (sectionData.country) formData.append('country', sectionData.country);
      if (sectionData.mainHeading) formData.append('mainHeading', sectionData.mainHeading);
      
      // Process cards with images
      if (sectionData.cards && sectionData.cards.length > 0) {
        // Create a cards array without the image files for JSON
        const cardsForJson = sectionData.cards.map(card => ({
          title: card.title,
          description: card.description,
          // For existing cards that already have an image path
          ...(card.existingImage && { image: card.existingImage })
        }));
        
        formData.append('cards', JSON.stringify(cardsForJson));
        
        // Append card images separately
        sectionData.cards.forEach((card, index) => {
          if (card.image && typeof card.image !== 'string') {
            formData.append('images', card.image);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/simple-section/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating simple section:", error);
      throw error;
    }
  },

  // Delete simple section
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/simple-section/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting simple section:", error);
      throw error;
    }
  }
};