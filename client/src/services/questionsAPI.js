// API service functions for Questions management
const API_BASE_URL = 'http://globe.ridealmobility.com/api';

// Questions API Services
export const questionsAPI = {
  // Get all questions
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  },

  // Get questions by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching questions by ID:", error);
      throw error;
    }
  },

  // Get questions by country ID
  getByCountryId: async (countryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/country/${countryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching questions by country:", error);
      throw error;
    }
  },

  // Create questions
  create: async (questionsData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionsData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating questions:", error);
      throw error;
    }
  },

  // Update questions
  update: async (id, questionsData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionsData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating questions:", error);
      throw error;
    }
  },

  // Delete questions
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting questions:", error);
      throw error;
    }
  }
};