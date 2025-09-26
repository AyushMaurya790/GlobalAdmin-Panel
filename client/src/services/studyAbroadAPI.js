// API service functions for Study Abroad management
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';

// Hero API Services
export const heroAPI = {
  // Get all heroes
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/hero`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching heroes:", error);
      throw error;
    }
  },

  // Get single hero
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/hero/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching hero:", error);
      throw error;
    }
  },

  // Create hero
  create: async (heroData) => {
    try {
      const formData = new FormData();
      formData.append('title', heroData.title);
      formData.append('subtitle', heroData.subtitle);
      
      if (heroData.backgroundImage && heroData.backgroundImage.length > 0) {
        heroData.backgroundImage.forEach(file => {
          formData.append('backgroundImage', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/studyabroad/hero`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating hero:", error);
      throw error;
    }
  },

  // Update hero
  update: async (id, heroData) => {
    try {
      const formData = new FormData();
      formData.append('title', heroData.title);
      formData.append('subtitle', heroData.subtitle);
      
      if (heroData.backgroundImage && heroData.backgroundImage.length > 0) {
        heroData.backgroundImage.forEach(file => {
          formData.append('backgroundImage', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/studyabroad/hero/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating hero:", error);
      throw error;
    }
  },

  // Delete hero
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/hero/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting hero:", error);
      throw error;
    }
  }
};

// Eduwing API Services (Why Choose Us)
export const eduwingAPI = {
  // Get all eduwings
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/eduwing`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching eduwings:", error);
      throw error;
    }
  },

  // Get single eduwing
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/eduwing/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching eduwing:", error);
      throw error;
    }
  },

  // Create eduwing
  create: async (eduwingData) => {
    try {
      const formData = new FormData();
      formData.append('title', eduwingData.title);
      formData.append('description', eduwingData.description);
      
      if (eduwingData.icon) {
        formData.append('icon', eduwingData.icon);
      }

      const response = await fetch(`${API_BASE_URL}/studyabroad/eduwing`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating eduwing:", error);
      throw error;
    }
  },

  // Update eduwing
  update: async (id, eduwingData) => {
    try {
      const formData = new FormData();
      formData.append('title', eduwingData.title);
      formData.append('description', eduwingData.description);
      
      if (eduwingData.icon) {
        formData.append('icon', eduwingData.icon);
      }

      const response = await fetch(`${API_BASE_URL}/studyabroad/eduwing/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating eduwing:", error);
      throw error;
    }
  },

  // Delete eduwing
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/eduwing/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting eduwing:", error);
      throw error;
    }
  }
};

// Feature API Services (Global Steps)
export const featureAPI = {
  // Get all features
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/feature`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching features:", error);
      throw error;
    }
  },

  // Get single feature
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/feature/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching feature:", error);
      throw error;
    }
  },

  // Create feature
  create: async (featureData) => {
    try {
      const formData = new FormData();
      formData.append('title', featureData.title);
      formData.append('description', featureData.description);
      
      if (featureData.icon) {
        formData.append('icon', featureData.icon);
      }

      const response = await fetch(`${API_BASE_URL}/studyabroad/feature`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating feature:", error);
      throw error;
    }
  },

  // Update feature
  update: async (id, featureData) => {
    try {
      const formData = new FormData();
      formData.append('title', featureData.title);
      formData.append('description', featureData.description);
      
      if (featureData.icon) {
        formData.append('icon', featureData.icon);
      }

      const response = await fetch(`${API_BASE_URL}/studyabroad/feature/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating feature:", error);
      throw error;
    }
  },

  // Delete feature
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/feature/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting feature:", error);
      throw error;
    }
  }
};

// Program API Services (Programs We Offer)
export const programAPI = {
  // Get all programs
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/program`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching programs:", error);
      throw error;
    }
  },

  // Get single program
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/program/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching program:", error);
      throw error;
    }
  },

  // Create program
  create: async (programData) => {
    try {
      const formData = new FormData();
      formData.append('title', programData.title);
      formData.append('description', programData.description);
      
      if (programData.icon) {
        formData.append('icon', programData.icon);
      }

      const response = await fetch(`${API_BASE_URL}/studyabroad/program`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating program:", error);
      throw error;
    }
  },

  // Update program
  update: async (id, programData) => {
    try {
      const formData = new FormData();
      formData.append('title', programData.title);
      formData.append('description', programData.description);
      
      if (programData.icon) {
        formData.append('icon', programData.icon);
      }

      const response = await fetch(`${API_BASE_URL}/studyabroad/program/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating program:", error);
      throw error;
    }
  },

  // Delete program
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/studyabroad/program/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting program:", error);
      throw error;
    }
  }
};

export const getImageUrl = (path) => {
  if (!path) return '';
  return `${BASE_URL}/${path.replace(/\\/g, '/')}`;
};