// API service functions for Departure City management
const API_BASE_URL = 'http://globe.ridealmobility.com/api';

// Departure City API Services
export const departureCityAPI = {
  // Get all departure cities
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departure-cities`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching departure cities:", error);
      throw error;
    }
  },
  
  // Create card landing with file uploads
  createCardLanding: async (formData) => {
    try {
      // No Content-Type header is needed as FormData sets it automatically with the correct boundary
      const response = await fetch(`${API_BASE_URL}/card-landing`, {
        method: 'POST',
        body: formData, // FormData will handle multipart/form-data format
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error parsing error response' }));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error creating card landing:", error);
      throw error;
    }
  },

  // Get single departure city by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departure-cities/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching departure city:", error);
      throw error;
    }
  },

  // Get departure city by tour and card
  getByTourAndCard: async (itenaryTourId, cardId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departure-cities/tour/${itenaryTourId}/card/${cardId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching departure city by tour and card:", error);
      throw error;
    }
  },

  // Get departure cities by tour
  getByTour: async (itenaryTourId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departure-cities?itenaryTourId=${itenaryTourId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching departure cities by tour:", error);
      throw error;
    }
  },

  // Create departure city
  create: async (departureCityData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departure-cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departureCityData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error creating departure city:", error);
      throw error;
    }
  },

  // Update departure city
  update: async (id, departureCityData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departure-cities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departureCityData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error updating departure city:", error);
      throw error;
    }
  },

  // Delete departure city
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departure-cities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error deleting departure city:", error);
      throw error;
    }
  },

  // Get pricing details
  getPricing: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departure-cities/${id}/pricing`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching pricing details:", error);
      throw error;
    }
  },

  // Update pricing details
  updatePricing: async (id, pricingDetails) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departure-cities/${id}/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pricingDetails }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error updating pricing details:", error);
      throw error;
    }
  },

  // Get departure options with filtering
  getDepartureOptions: async (id, filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.date) queryParams.append('date', filters.date);

      const url = `${API_BASE_URL}/departure-cities/${id}/options${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching departure options:", error);
      throw error;
    }
  },

  // Get packages
  getPackages: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departure-cities/${id}/packages`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching packages:", error);
      throw error;
    }
  },

  // Update packages
  updatePackages: async (id, packages) => {
    try {
      const response = await fetch(`${API_BASE_URL}/departure-cities/${id}/packages`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error updating packages:", error);
      throw error;
    }
  }
};

// Itenary Tour API Services (for fetching tours by country)
export const itenaryTourAPI = {
  // Get tours by country
  getByCountry: async (countryId) => {
    try {
      const endpoint = `${API_BASE_URL}/itenary-tour/country/${countryId}`;
      console.log('Making API call to:', endpoint);
      
      const response = await fetch(endpoint);
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error("Error fetching tours by country:", error);
      throw error;
    }
  },

  // Get single tour with cards
  getById: async (id) => {
    try {
      const endpoint = `${API_BASE_URL}/itenary-tour/${id}`;
      console.log('Making API call to:', endpoint);
      
      const response = await fetch(endpoint);
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Tour details fetched:', data);
      return data;
    } catch (error) {
      console.error("Error fetching tour details:", error);
      throw error;
    }
  }
};

// Country API Services
export const countryAPI = {
  // Get all countries
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/countries`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw error;
    }
  },

  // Get countries by continent
  getByContinent: async (continentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/countries?continentId=${continentId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching countries by continent:", error);
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
  },

  // Get single continent
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/continents/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching continent:", error);
      throw error;
    }
  }
};