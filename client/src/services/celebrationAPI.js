// API service for Celebration related endpoints
const BASE_URL = "http://globe.ridealmobility.com";

// Hero Section API Functions
export const fetchHeroSections = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/hero`);
    if (!response.ok) {
      throw new Error('Failed to fetch hero sections');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching hero sections:', error);
    throw error;
  }
};

export const fetchHeroSectionById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/hero/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch hero section');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching hero section:', error);
    throw error;
  }
};

export const createHeroSection = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/hero`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to create hero section');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating hero section:', error);
    throw error;
  }
};

export const updateHeroSection = async (id, formData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/hero/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to update hero section');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating hero section:', error);
    throw error;
  }
};

export const deleteHeroSection = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/hero/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete hero section');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting hero section:', error);
    throw error;
  }
};

// Feature Section API Functions (Destination Weddings)
export const fetchFeatures = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/feature`);
    if (!response.ok) {
      throw new Error('Failed to fetch features');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching features:', error);
    throw error;
  }
};

export const fetchFeatureById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/feature/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch feature');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching feature:', error);
    throw error;
  }
};

export const createFeature = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/feature`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to create feature');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating feature:', error);
    throw error;
  }
};

export const updateFeature = async (id, formData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/feature/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to update feature');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating feature:', error);
    throw error;
  }
};

export const deleteFeature = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/feature/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete feature');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting feature:', error);
    throw error;
  }
};

// Event Section API Functions (Why Choose Us)
export const fetchEvents = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/event`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const fetchEventById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/event/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

export const createEvent = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/event`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (id, formData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/event/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to update event');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/celebration/event/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};