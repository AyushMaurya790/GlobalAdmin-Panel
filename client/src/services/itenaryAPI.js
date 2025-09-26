// API service functions for Itinerary View management
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';

// View API Services
export const viewAPI = {
  // Get all views
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/view`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching views:", error);
      throw error;
    }
  },

  // Get single view by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/view/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching view:", error);
      throw error;
    }
  },

  // Get view by country ID
  getByCountryId: async (countryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/view/country/${countryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching view by country:", error);
      throw error;
    }
  },

  // Create view
  create: async (viewData) => {
    try {
      const formData = new FormData();
      formData.append('country', viewData.country);
      formData.append('heading', viewData.heading);
      formData.append('description', viewData.description);
      
      // Append main image
      if (viewData.image) {
        formData.append('image', viewData.image);
      }
      
      // Append features and their icons
      if (viewData.features && viewData.features.length > 0) {
        formData.append('features', JSON.stringify(viewData.features));
        
        // Append feature icons separately
        viewData.featureIcons.forEach((icon, index) => {
          if (icon) {
            formData.append('featureIcons', icon);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/view`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating view:", error);
      throw error;
    }
  },

  // Update view
  update: async (id, viewData) => {
    try {
      const formData = new FormData();
      
      if (viewData.country) formData.append('country', viewData.country);
      if (viewData.heading) formData.append('heading', viewData.heading);
      if (viewData.description) formData.append('description', viewData.description);
      
      // Append main image if exists
      if (viewData.image) {
        formData.append('image', viewData.image);
      }
      
      // Append features and their icons
      if (viewData.features && viewData.features.length > 0) {
        formData.append('features', JSON.stringify(viewData.features));
        
        // Append new feature icons if available
        if (viewData.featureIcons && viewData.featureIcons.length > 0) {
          viewData.featureIcons.forEach((icon, index) => {
            if (icon) {
              formData.append('featureIcons', icon);
            }
          });
        }
      }

      const response = await fetch(`${API_BASE_URL}/view/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating view:", error);
      throw error;
    }
  },

  // Delete view
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/view/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting view:", error);
      throw error;
    }
  }
};

// Country API Services
export const countryAPI = {
  // Get all countries
  getAll: async (continentId = '') => {
    try {
      let url = `${API_BASE_URL}/countries`;
      if (continentId) {
        url += `?continentId=${continentId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw error;
    }
  },
  
  // Get single country
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/countries/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching country:", error);
      throw error;
    }
  }
};

// Continent API Services
export const continentAPI = {
  // Get all continents
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/continents`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching continents:", error);
      throw error;
    }
  }
};

// Curated API Services
export const curatedAPI = {
  // Get all curated sections
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/curated`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching curated sections:", error);
      throw error;
    }
  },

  // Get single curated section by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/curated/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching curated section:", error);
      throw error;
    }
  },

  // Get curated sections by country ID
  getByCountryId: async (countryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/curated/country/${countryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching curated sections by country:", error);
      throw error;
    }
  },

  // Create curated section
  create: async (curatedData) => {
    try {
      const formData = new FormData();
      formData.append('country', curatedData.country);
      formData.append('mainHeading', curatedData.mainHeading);
      
      // Append cards array as JSON string
      if (curatedData.cards && curatedData.cards.length > 0) {
        // First extract the images from cards to append separately
        const cardsWithoutImages = curatedData.cards.map(card => {
          const { image, ...cardWithoutImage } = card;
          return cardWithoutImage;
        });
        
        formData.append('cards', JSON.stringify(cardsWithoutImages));
        
        // Append each card image
        curatedData.cards.forEach((card, index) => {
          if (card.image && typeof card.image !== 'string') {
            formData.append('images', card.image);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/curated`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating curated section:", error);
      throw error;
    }
  },

  // Update curated section
  update: async (id, curatedData) => {
    try {
      const formData = new FormData();
      
      if (curatedData.country) formData.append('country', curatedData.country);
      if (curatedData.mainHeading) formData.append('mainHeading', curatedData.mainHeading);
      
      // Append cards array as JSON string
      if (curatedData.cards && curatedData.cards.length > 0) {
        // We need to handle existing images (string) vs new uploaded images (File objects)
        const processedCards = curatedData.cards.map(card => {
          if (card.image && typeof card.image !== 'string') {
            // This is a new image upload - remove from card object to append separately
            const { image, ...cardWithoutImage } = card;
            return cardWithoutImage;
          } else {
            // Keep existing image path in the card object
            return card;
          }
        });
        
        formData.append('cards', JSON.stringify(processedCards));
        
        // Append each new card image
        curatedData.cards.forEach((card, index) => {
          if (card.image && typeof card.image !== 'string') {
            formData.append('images', card.image);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/curated/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating curated section:", error);
      throw error;
    }
  },

  // Delete curated section
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/curated/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting curated section:", error);
      throw error;
    }
  }
};

// Helper function to get image URL
export const getImageUrl = (path) => {
  if (!path) return '';
  return `${BASE_URL}/${path.replace(/\\/g, '/')}`;
};

export default { viewAPI, countryAPI, continentAPI, curatedAPI, getImageUrl };