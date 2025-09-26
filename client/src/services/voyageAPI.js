// API service functions for Voyage management
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust based on your backend URL

// Hero API Services
export const heroAPI = {
  // Get all heroes
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/hero`);
    return response.json();
  },

  // Get single hero
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/hero/${id}`);
    return response.json();
  },

  // Create hero
  create: async (heroData) => {
    const formData = new FormData();
    formData.append('mainHeading', heroData.mainHeading);
    formData.append('styleHeading', heroData.styleHeading);
    formData.append('subheading', heroData.subheading);
    if (heroData.videoFile) {
      formData.append('videoFile', heroData.videoFile);
    }

    const response = await fetch(`${API_BASE_URL}/hero`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  // Update hero
  update: async (id, heroData) => {
    const formData = new FormData();
    formData.append('mainHeading', heroData.mainHeading);
    formData.append('styleHeading', heroData.styleHeading);
    formData.append('subheading', heroData.subheading);
    if (heroData.videoFile) {
      formData.append('videoFile', heroData.videoFile);
    }

    const response = await fetch(`${API_BASE_URL}/hero/${id}`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  },

  // Delete hero
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/hero/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Journey API Services
export const journeyAPI = {
  // Get all journeys
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/journeys`);
    return response.json();
  },

  // Create journey
  create: async (journeyData) => {
    const formData = new FormData();
    formData.append('mainHeading', journeyData.mainHeading);
    formData.append('styleHeading', journeyData.styleHeading);
    formData.append('firstParagraph', journeyData.firstParagraph);
    formData.append('secondParagraph', journeyData.secondParagraph);
    if (journeyData.journeysImage) {
      formData.append('journeysImage', journeyData.journeysImage);
    }

    const response = await fetch(`${API_BASE_URL}/journeys`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // Update journey
  update: async (id, journeyData) => {
    const formData = new FormData();
    formData.append('mainHeading', journeyData.mainHeading);
    formData.append('styleHeading', journeyData.styleHeading);
    formData.append('firstParagraph', journeyData.firstParagraph);
    formData.append('secondParagraph', journeyData.secondParagraph);
    if (journeyData.journeysImage) {
      formData.append('journeysImage', journeyData.journeysImage);
    }

    const response = await fetch(`${API_BASE_URL}/journeys/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // Delete journey
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/journeys/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }
};

// Partners API Services
export const partnersAPI = {
  // Get all partners
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/partners`);
    return response.json();
  },

  // Add partner images
  create: async (images) => {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await fetch(`${API_BASE_URL}/partners`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  // Update partner image by index
  update: async (index, image) => {
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch(`${API_BASE_URL}/partners/${index}`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  },

  // Delete partner image by index
  delete: async (index) => {
    const response = await fetch(`${API_BASE_URL}/partners/${index}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Cruise API Services
export const cruiseAPI = {
  // Get all cruises
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/cruise`);
    return response.json();
  },

  // Create cruise
  create: async (cruiseData) => {
    const formData = new FormData();
    formData.append('mainHeading', cruiseData.mainHeading);
    
    // Handle cruise details
    if (cruiseData.cruises && cruiseData.cruises.length > 0) {
      cruiseData.cruises.forEach((cruise, index) => {
        formData.append(`cruises[${index}][cruiseLiner]`, cruise.cruiseLiner);
        formData.append(`cruises[${index}][shipName]`, cruise.shipName);
        formData.append(`cruises[${index}][sailingName]`, cruise.sailingName);
        formData.append(`cruises[${index}][departurePort]`, cruise.departurePort);
        formData.append(`cruises[${index}][cruiseDuration]`, cruise.cruiseDuration);
        formData.append(`cruises[${index}][cabinPrice]`, cruise.cabinPrice);
        formData.append(`cruises[${index}][sailingDates]`, cruise.sailingDates.join(','));
        formData.append(`cruises[${index}][destinations]`, cruise.destinations.join(','));
        if (cruise.mapImage) {
          formData.append('mapImage', cruise.mapImage);
        }
      });
    } else {
      // Single cruise format
      formData.append('cruiseLiner', cruiseData.cruiseLiner);
      formData.append('shipName', cruiseData.shipName);
      formData.append('sailingName', cruiseData.sailingName);
      formData.append('departurePort', cruiseData.departurePort);
      formData.append('cruiseDuration', cruiseData.cruiseDuration);
      formData.append('cabinPrice', cruiseData.cabinPrice);
      formData.append('sailingDates', cruiseData.sailingDates.join(','));
      formData.append('destinations', cruiseData.destinations.join(','));
      if (cruiseData.mapImage) {
        formData.append('mapImage', cruiseData.mapImage);
      }
    }

    const response = await fetch(`${API_BASE_URL}/cruise`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // Delete cruise
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/cruise/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }
};