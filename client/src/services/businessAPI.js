// API service functions for Business Travel management
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';

// Hero API Services
export const heroAPI = {
  // Get all heroes
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/business/hero`);
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
      const response = await fetch(`${API_BASE_URL}/business/hero/${id}`);
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

      const response = await fetch(`${API_BASE_URL}/business/hero`, {
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

      const response = await fetch(`${API_BASE_URL}/business/hero/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/business/hero/${id}`, {
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

// Service API Services
export const serviceAPI = {
  // Get all services
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/business/service`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
  },

  // Get single service
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/business/service/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching service:", error);
      throw error;
    }
  },

  // Create service
  create: async (serviceData) => {
    try {
      const formData = new FormData();
      formData.append('title', serviceData.title);
      formData.append('description', serviceData.description);
      
      // Handle highlights array
      if (serviceData.highlights && serviceData.highlights.length > 0) {
        serviceData.highlights.forEach((highlight, index) => {
          formData.append(`highlights[${index}]`, highlight);
        });
      }
      
      if (serviceData.image) {
        formData.append('image', serviceData.image);
      }

      const response = await fetch(`${API_BASE_URL}/business/service`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  },

  // Update service
  update: async (id, serviceData) => {
    try {
      const formData = new FormData();
      formData.append('title', serviceData.title);
      formData.append('description', serviceData.description);
      
      // Handle highlights array
      if (serviceData.highlights && serviceData.highlights.length > 0) {
        serviceData.highlights.forEach((highlight, index) => {
          formData.append(`highlights[${index}]`, highlight);
        });
      }
      
      if (serviceData.image) {
        formData.append('image', serviceData.image);
      }

      const response = await fetch(`${API_BASE_URL}/business/service/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating service:", error);
      throw error;
    }
  },

  // Delete service
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/business/service/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting service:", error);
      throw error;
    }
  }
};

// Feature API Services
export const featureAPI = {
  // Get all features
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/business/feature`);
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
      const response = await fetch(`${API_BASE_URL}/business/feature/${id}`);
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

      const response = await fetch(`${API_BASE_URL}/business/feature`, {
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

      const response = await fetch(`${API_BASE_URL}/business/feature/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/business/feature/${id}`, {
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

// Step API Services
export const stepAPI = {
  // Get all steps
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/business/step`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching steps:", error);
      throw error;
    }
  },

  // Get single step
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/business/step/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching step:", error);
      throw error;
    }
  },

  // Create step
  create: async (stepData) => {
    try {
      const formData = new FormData();
      formData.append('stepTitle', stepData.stepTitle);
      formData.append('contentTitle', stepData.contentTitle);
      formData.append('description', stepData.description);
      formData.append('order', stepData.order);
      
      if (stepData.icon) {
        formData.append('icon', stepData.icon);
      }
      
      if (stepData.images && stepData.images.length > 0) {
        stepData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await fetch(`${API_BASE_URL}/business/step`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error creating step:", error);
      throw error;
    }
  },

  // Update step
  update: async (id, stepData) => {
    try {
      const formData = new FormData();
      
      if (stepData.stepTitle) formData.append('stepTitle', stepData.stepTitle);
      if (stepData.contentTitle) formData.append('contentTitle', stepData.contentTitle);
      if (stepData.description) formData.append('description', stepData.description);
      if (stepData.order) formData.append('order', stepData.order);
      
      if (stepData.icon) {
        formData.append('icon', stepData.icon);
      }
      
      if (stepData.images && stepData.images.length > 0) {
        stepData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await fetch(`${API_BASE_URL}/business/step/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error updating step:", error);
      throw error;
    }
  },

  // Delete step
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/business/step/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error deleting step:", error);
      throw error;
    }
  }
};

export const getImageUrl = (path) => {
  if (!path) return '';
  return `${BASE_URL}/${path.replace(/\\/g, '/')}`;
};