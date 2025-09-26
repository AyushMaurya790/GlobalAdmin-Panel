import axios from 'axios';

const BASE_URL = 'http://globe.ridealmobility.com';

// Create an axios instance
const api = axios.create({
  baseURL: BASE_URL
});

// Helper function to ensure image URLs are absolute
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If image path already includes http or https, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, prepend the base URL
  return `${BASE_URL}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
};

// Sky (Hero) Section API calls
export const skyAPI = {
  getAll: async () => {
    const response = await api.get('/api/private/sky');
    // Convert all image paths to full URLs
    response.data = response.data.map(item => ({
      ...item,
      backgroundImage: Array.isArray(item.backgroundImage) 
        ? item.backgroundImage.map(getFullImageUrl) 
        : getFullImageUrl(item.backgroundImage)
    }));
    return response;
  },
  getById: async (id) => {
    const response = await api.get(`/api/private/sky/${id}`);
    // Convert all image paths to full URLs
    response.data = {
      ...response.data,
      backgroundImage: Array.isArray(response.data.backgroundImage) 
        ? response.data.backgroundImage.map(getFullImageUrl) 
        : getFullImageUrl(response.data.backgroundImage)
    };
    return response;
  },
  create: (formData) => api.post('/api/private/sky', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/private/sky/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/private/sky/${id}`)
};

// Overview Section API calls
export const overviewAPI = {
  getAll: async () => {
    const response = await api.get('/api/private/overview');
    // Convert image paths to full URLs
    response.data = response.data.map(item => ({
      ...item,
      rightImage: getFullImageUrl(item.rightImage)
    }));
    return response;
  },
  getById: async (id) => {
    const response = await api.get(`/api/private/overview/${id}`);
    response.data = {
      ...response.data,
      rightImage: getFullImageUrl(response.data.rightImage)
    };
    return response;
  },
  create: (formData) => api.post('/api/private/overview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/private/overview/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/private/overview/${id}`)
};

// Fly Section API calls
export const flyAPI = {
  getAll: async () => {
    const response = await api.get('/api/private/fly');
    // Convert image paths to full URLs in items array
    response.data = response.data.map(item => ({
      ...item,
      items: item.items ? item.items.map(subItem => ({
        ...subItem,
        icon: getFullImageUrl(subItem.icon)
      })) : []
    }));
    return response;
  },
  getById: async (id) => {
    const response = await api.get(`/api/private/fly/${id}`);
    response.data = {
      ...response.data,
      items: response.data.items ? response.data.items.map(item => ({
        ...item,
        icon: getFullImageUrl(item.icon)
      })) : []
    };
    return response;
  },
  create: (formData) => api.post('/api/private/fly', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/private/fly/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/private/fly/${id}`)
};

// Charter Section API calls
export const charterAPI = {
  getAll: async () => {
    const response = await api.get('/api/private/charter');
    // Convert image paths to full URLs in items array
    response.data = response.data.map(item => ({
      ...item,
      items: item.items ? item.items.map(subItem => ({
        ...subItem,
        image: getFullImageUrl(subItem.image)
      })) : []
    }));
    return response;
  },
  getById: async (id) => {
    const response = await api.get(`/api/private/charter/${id}`);
    response.data = {
      ...response.data,
      items: response.data.items ? response.data.items.map(item => ({
        ...item,
        image: getFullImageUrl(item.image)
      })) : []
    };
    return response;
  },
  create: (formData) => api.post('/api/private/charter', formData),
  update: (id, formData) => api.put(`/api/private/charter/${id}`, formData),
  delete: (id) => api.delete(`/api/private/charter/${id}`)
};

// Mission Section API calls
export const missionAPI = {
  getAll: async () => {
    const response = await api.get('/api/private/mission');
    // Convert image paths to full URLs in items array
    response.data = response.data.map(item => ({
      ...item,
      items: item.items ? item.items.map(subItem => ({
        ...subItem,
        image: getFullImageUrl(subItem.image)
      })) : []
    }));
    return response;
  },
  getById: async (id) => {
    const response = await api.get(`/api/private/mission/${id}`);
    response.data = {
      ...response.data,
      items: response.data.items ? response.data.items.map(item => ({
        ...item,
        image: getFullImageUrl(item.image)
      })) : []
    };
    return response;
  },
  create: (formData) => api.post('/api/private/mission', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/private/mission/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/private/mission/${id}`)
};

// Fleet Section API calls
export const fleetAPI = {
  getAll: async () => {
    const response = await api.get('/api/private/fleet');
    // Convert image paths to full URLs in items array
    response.data = response.data.map(item => ({
      ...item,
      items: item.items ? item.items.map(subItem => ({
        ...subItem,
        imageUrl: getFullImageUrl(subItem.imageUrl)
      })) : []
    }));
    return response;
  },
  getById: async (id) => {
    const response = await api.get(`/api/private/fleet/${id}`);
    response.data = {
      ...response.data,
      items: response.data.items ? response.data.items.map(item => ({
        ...item,
        imageUrl: getFullImageUrl(item.imageUrl)
      })) : []
    };
    return response;
  },
  create: (formData) => api.post('/api/private/fleet', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/private/fleet/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/private/fleet/${id}`)
};

// Helper function to convert JavaScript object to FormData
export const createFormData = (data, imageFieldName = 'images') => {
  const formData = new FormData();
  
  // Add all non-file fields to the formData
  Object.entries(data).forEach(([key, value]) => {
    if (key !== imageFieldName && typeof value !== 'object') {
      formData.append(key, value);
    } else if (key !== imageFieldName && Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (key !== imageFieldName && typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    }
  });
  
  // Add files if present
  if (data[imageFieldName]) {
    if (Array.isArray(data[imageFieldName])) {
      data[imageFieldName].forEach((file, index) => {
        if (file instanceof File) {
          formData.append(imageFieldName, file);
        }
      });
    } else if (data[imageFieldName] instanceof File) {
      formData.append(imageFieldName, data[imageFieldName]);
    }
  }
  
  return formData;
};