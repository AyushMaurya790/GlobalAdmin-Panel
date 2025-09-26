// API service functions for Sport management
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';

// Helper function to get image URL
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}/${path.startsWith('/') ? path.substring(1) : path}`;
};

// Helper function to create form data
export const createFormData = (data, fileField, isMultiple = false) => {
  const formData = new FormData();

  // Add all non-file fields to form data
  Object.keys(data).forEach(key => {
    if (key !== fileField) {
      if (typeof data[key] === 'object' && data[key] !== null && !(data[key] instanceof File)) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });

  // Add files
  if (data[fileField]) {
    if (isMultiple && Array.isArray(data[fileField])) {
      Array.from(data[fileField]).forEach(file => {
        if (file instanceof File) {
          formData.append(fileField, file);
        }
      });
    } else if (!isMultiple && data[fileField] instanceof File) {
      formData.append(fileField, data[fileField]);
    }
  }

  return formData;
};

// Moment API Services (Hero Section)
export const momentAPI = {
  // Get all moments
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/moment`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // Process images
      return data.map(moment => ({
        ...moment,
        image: Array.isArray(moment.image) 
          ? moment.image.map(getImageUrl) 
          : getImageUrl(moment.image)
      }));
    } catch (error) {
      console.error("Error fetching moments:", error);
      throw error;
    }
  },

  // Get single moment
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/moment/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return {
        ...data,
        image: Array.isArray(data.image) 
          ? data.image.map(getImageUrl) 
          : getImageUrl(data.image)
      };
    } catch (error) {
      console.error("Error fetching moment:", error);
      throw error;
    }
  },

  // Create moment
  create: async (momentData) => {
    try {
      const formData = new FormData();
      formData.append('title', momentData.title);
      formData.append('description', momentData.description);

      if (momentData.images && momentData.images.length > 0) {
        Array.from(momentData.images).forEach(file => {
          formData.append('images', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/sport/moment`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error creating moment:", error);
      throw error;
    }
  },

  // Update moment
  update: async (id, momentData) => {
    try {
      const formData = new FormData();
      formData.append('title', momentData.title);
      formData.append('description', momentData.description);

      if (momentData.images && momentData.images.length > 0) {
        Array.from(momentData.images).forEach(file => {
          formData.append('images', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/sport/moment/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error updating moment:", error);
      throw error;
    }
  },

  // Delete moment
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/moment/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error deleting moment:", error);
      throw error;
    }
  }
};

// Card API Services (for sport/card)
export const cardAPI = {
  // Get all cards
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/card`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // Process images for cards array (not items)
      return data.map(section => ({
        ...section,
        cards: section.cards
          ? section.cards.map(card => ({
              ...card,
              image: getImageUrl(card.image)
            }))
          : []
      }));
    } catch (error) {
      console.error("Error fetching cards:", error);
      throw error;
    }
  },

  // Get single card
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/card/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      return {
        ...data,
        cards: data.cards
          ? data.cards.map(card => ({
              ...card,
              image: getImageUrl(card.image)
            }))
          : []
      };
    } catch (error) {
      console.error("Error fetching card:", error);
      throw error;
    }
  },

  // Create card
  create: async (cardData) => {
    try {
      const formData = new FormData();
      formData.append('mainHeading', cardData.mainHeading);
      formData.append('subHeading', cardData.subHeading);

      // Handle cards with images
      if (cardData.cards && cardData.cards.length > 0) {
        formData.append('cards', JSON.stringify(cardData.cards.map(card => ({
          title: card.title,
          location: card.location,
          startDate: card.startDate,
          endDate: card.endDate,
          pageType: card.pageType
        }))));
        // Append images
        cardData.cards.forEach(card => {
          if (card.image instanceof File) {
            formData.append('images', card.image);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/sport/card`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error creating card:", error);
      throw error;
    }
  },

  // Update card
  update: async (id, cardData) => {
    try {
      const formData = new FormData();
      formData.append('mainHeading', cardData.mainHeading);
      formData.append('subHeading', cardData.subHeading);

      // Handle cards with images
      if (cardData.cards && cardData.cards.length > 0) {
        formData.append('cards', JSON.stringify(cardData.cards.map(card => ({
          title: card.title,
          location: card.location,
          startDate: card.startDate,
          endDate: card.endDate,
          pageType: card.pageType,
          _id: card._id, // Include card ID if it exists
          image: typeof card.image === 'string' ? card.image : undefined
        }))));
        // Append new images
        cardData.cards.forEach(card => {
          if (card.image instanceof File) {
            formData.append('images', card.image);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/sport/card/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error updating card:", error);
      throw error;
    }
  },

  // Delete card
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/card/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error deleting card:", error);
      throw error;
    }
  },

  // Get Cards by PageType
  getByPageType: async (pageType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/card/type/${pageType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // Process images for cards in each section
      return data.map(section => ({
        ...section,
        cards: section.cards
          ? section.cards.map(card => ({
              ...card,
              image: getImageUrl(card.image)
            }))
          : []
      }));
    } catch (error) {
      console.error("Error fetching cards by page type:", error);
      throw error;
    }
  },

  // Add single card to existing section
  addCard: async (sectionId, cardData) => {
    try {
      const formData = new FormData();
      formData.append('title', cardData.title);
      formData.append('location', cardData.location);
      formData.append('startDate', cardData.startDate);
      formData.append('endDate', cardData.endDate);
      formData.append('pageType', cardData.pageType);

      if (cardData.image instanceof File) {
        formData.append('image', cardData.image);
      }

      const response = await fetch(`${API_BASE_URL}/sport/card/${sectionId}/cards`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error adding card:", error);
      throw error;
    }
  },

  // Update single card in section
  updateCard: async (sectionId, cardId, cardData) => {
    try {
      const formData = new FormData();
      if (cardData.title) formData.append('title', cardData.title);
      if (cardData.location) formData.append('location', cardData.location);
      if (cardData.startDate) formData.append('startDate', cardData.startDate);
      if (cardData.endDate) formData.append('endDate', cardData.endDate);
      if (cardData.pageType) formData.append('pageType', cardData.pageType);

      if (cardData.image instanceof File) {
        formData.append('image', cardData.image);
      }

      const response = await fetch(`${API_BASE_URL}/sport/card/${sectionId}/cards/${cardId}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error updating card:", error);
      throw error;
    }
  },

  // Delete single card from section
  deleteCard: async (sectionId, cardId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/card/${sectionId}/cards/${cardId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error deleting card:", error);
      throw error;
    }
  }
};

export const serviceAPI = {
  // Get all services
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/service`);
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
      const response = await fetch(`${API_BASE_URL}/sport/service/${id}`);
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
      formData.append('highlights', JSON.stringify(serviceData.highlights));

      if (serviceData.image) {
        formData.append('image', serviceData.image);
      }

      const response = await fetch(`${API_BASE_URL}/sport/service`, {
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
      formData.append('highlights', JSON.stringify(serviceData.highlights));

      if (serviceData.image) {
        formData.append('image', serviceData.image);
      }

      const response = await fetch(`${API_BASE_URL}/sport/service/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/sport/service/${id}`, {
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
// Book API Services
export const bookAPI = {
  // Get all book sections
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/book`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      // Process images in items
      return data.map(book => ({
        ...book,
        items: book.items ? book.items.map(item => ({
          ...item,
          image: getImageUrl(item.image)
        })) : []
      }));
    } catch (error) {
      console.error("Error fetching book sections:", error);
      throw error;
    }
  },

  // Get single book section
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/book/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      return {
        ...data,
        items: data.items ? data.items.map(item => ({
          ...item,
          image: getImageUrl(item.image)
        })) : []
      };
    } catch (error) {
      console.error("Error fetching book section:", error);
      throw error;
    }
  },

  // Create book section
  create: async (bookData) => {
    try {
      const formData = new FormData();
      formData.append('mainHeading', bookData.mainHeading);

      // Handle items with images
      if (bookData.items && bookData.items.length > 0) {
        formData.append('items', JSON.stringify(bookData.items.map(item => ({
          title: item.title,
          description: item.description
        }))));
        // Append images
        bookData.items.forEach(item => {
          if (item.image instanceof File) {
            formData.append('images', item.image);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/sport/book`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error creating book section:", error);
      throw error;
    }
  },

  // Update book section
  update: async (id, bookData) => {
    try {
      const formData = new FormData();
      formData.append('mainHeading', bookData.mainHeading);

      // Handle items with images
      if (bookData.items && bookData.items.length > 0) {
        formData.append('items', JSON.stringify(bookData.items.map(item => ({
          title: item.title,
          description: item.description,
          _id: item._id, // Include item ID if it exists
          image: typeof item.image === 'string' ? item.image : undefined
        }))));
        // Append new images
        bookData.items.forEach(item => {
          if (item.image instanceof File) {
            formData.append('images', item.image);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/sport/book/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error updating book section:", error);
      throw error;
    }
  },

  // Delete book section
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/book/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error deleting book section:", error);
      throw error;
    }
  }
};

// Choose API Services (Why Choose Section)
export const chooseAPI = {
  // Get all choose sections
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/choose`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      // Process images in items
      return data.map(choose => ({
        ...choose,
        items: choose.items ? choose.items.map(item => ({
          ...item,
          image: getImageUrl(item.image)
        })) : []
      }));
    } catch (error) {
      console.error("Error fetching choose sections:", error);
      throw error;
    }
  },

  // Get single choose section
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/choose/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      return {
        ...data,
        items: data.items ? data.items.map(item => ({
          ...item,
          image: getImageUrl(item.image)
        })) : []
      };
    } catch (error) {
      console.error("Error fetching choose section:", error);
      throw error;
    }
  },

  // Create choose section
  create: async (chooseData) => {
    try {
      const formData = new FormData();
      formData.append('mainHeading', chooseData.mainHeading);
      
      // Handle items with images
      if (chooseData.items && chooseData.items.length > 0) {
        formData.append('items', JSON.stringify(chooseData.items.map(item => ({
          title: item.title,
          description: item.description
        }))));
        
        // Append images
        chooseData.items.forEach(item => {
          if (item.image instanceof File) {
            formData.append('images', item.image);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/sport/choose`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error creating choose section:", error);
      throw error;
    }
  },

  // Update choose section
  update: async (id, chooseData) => {
    try {
      const formData = new FormData();
      formData.append('mainHeading', chooseData.mainHeading);
      
      // Handle items with images
      if (chooseData.items && chooseData.items.length > 0) {
        formData.append('items', JSON.stringify(chooseData.items.map(item => ({
          title: item.title,
          description: item.description,
          _id: item._id, // Include item ID if it exists
          image: typeof item.image === 'string' ? item.image : undefined
        }))));
        
        // Append new images
        chooseData.items.forEach(item => {
          if (item.image instanceof File) {
            formData.append('images', item.image);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/sport/choose/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error updating choose section:", error);
      throw error;
    }
  },

  // Delete choose section
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sport/choose/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error deleting choose section:", error);
      throw error;
    }
  }
};