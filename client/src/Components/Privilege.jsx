import React, { useState, useEffect } from 'react';
import { FaStar, FaImage, FaMapMarkerAlt, FaSpinner, FaEdit, FaTrash, FaPlus, FaUpload, FaTimes } from 'react-icons/fa';
import axios from 'axios';

// API service functions
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';
const PRIVILEGE_API_URL = `${API_BASE_URL}/priviledge`;

const privilegeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/priviledge`);
    return response.json();
  },
  
  getByCity: async (cityId) => {
    const response = await fetch(`${API_BASE_URL}/priviledge/city/${cityId}`);
    return response.json();
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/priviledge/${id}`);
    return response.json();
  },
  
  create: async (data) => {
    const formData = new FormData();
    formData.append('heading', data.heading);
    
    // Convert cards to the format expected by the API
    formData.append('cards', JSON.stringify(data.cards.map(card => ({
      title: card.title
    }))));

    // Append each image file
    data.cards.forEach((card, index) => {
      if (card.file) {
        formData.append('image', card.file);
      }
    });
    
    try {
      const response = await axios.post(`${PRIVILEGE_API_URL}/${data.city}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating privilege:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    const formData = new FormData();
    formData.append('heading', data.heading);
    
    // Convert cards to the format expected by the API
    formData.append('cards', JSON.stringify(data.cards.map(card => ({
      title: card.title
    }))));

    // Append each image file
    data.cards.forEach((card, index) => {
      if (card.file) {
        formData.append('image', card.file);
      }
    });
    
    try {
      const response = await axios.put(`${PRIVILEGE_API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating privilege:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/priviledge/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

const luxuryCityAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/luxury-cities`);
    return response.json();
  }
};

const Privilege = () => {
  // State management
  const [privileges, setPrivileges] = useState([]);
  const [luxuryCities, setLuxuryCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    city: '',
    heading: '',
    cards: []
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchPrivileges();
    fetchLuxuryCities();
  }, []);

  // API Functions
  const fetchPrivileges = async () => {
    try {
      setLoading(true);
      const response = await privilegeAPI.getAll();
      setPrivileges(response || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch privilege sections' });
    } finally {
      setLoading(false);
    }
  };

  const fetchLuxuryCities = async () => {
    try {
      const response = await luxuryCityAPI.getAll();
      setLuxuryCities(response || []);
    } catch (error) {
      console.error('Failed to fetch luxury cities:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      let response;
      if (editingId) {
        response = await privilegeAPI.update(editingId, formData);
      } else {
        response = await privilegeAPI.create(formData);
      }
      
      if (response.message || response._id) {
        setMessage({ type: 'success', text: response.message || 'Operation successful' });
        resetForm();
        fetchPrivileges();
      } else {
        throw new Error('Operation failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (privilege) => {
    try {
      setLoading(true);
      const fullPrivilege = await privilegeAPI.getById(privilege._id);
      
      setFormData({
        city: fullPrivilege.city._id || fullPrivilege.city,
        heading: fullPrivilege.heading,
        cards: fullPrivilege.cards.map(card => ({
          ...card,
          file: null // reset file for editing
        }))
      });
      
      setEditingId(privilege._id);
      setShowForm(true);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load privilege details' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this privilege section?')) {
      try {
        setLoading(true);
        const response = await privilegeAPI.delete(id);
        setMessage({ type: 'success', text: response.message || 'Deleted successfully' });
        fetchPrivileges();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete privilege section' });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      city: '',
      heading: '',
      cards: []
    });
    setEditingId(null);
    setShowForm(false);
    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addCard = () => {
    setFormData(prev => ({
      ...prev,
      cards: [
        ...prev.cards,
        { title: '', image: null, file: null }
      ]
    }));
  };

  const removeCard = (index) => {
    setFormData(prev => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index)
    }));
  };

  const updateCard = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      )
    }));
  };

  const handleCardImageChange = (index, file) => {
    updateCard(index, 'file', file);
  };

  // Generate API preview
  const getApiPreviewText = () => {
    if (!formData.city || formData.cards.length === 0) {
      return 'Please fill in city and add at least one card to see API preview';
    }

    return `curl -X POST ${PRIVILEGE_API_URL}/${formData.city || '<CITY_ID>'} \\
  -H "Content-Type: multipart/form-data" \\
  -F "heading=${formData.heading || 'Privileged Experiences'}" \\
  -F 'cards=${JSON.stringify(formData.cards.map(card => ({ title: card.title || 'Card Title' })))}' \\
${formData.cards.map((card, index) => `  -F "image=@${card.file ? card.file.name : `image_${index+1}.png`}"`).join(' \\\n')}`;
  };

  return (
    <div className="p-5 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Privilege Management</h1>
        <p className="text-lg opacity-90">Manage privilege cards and sections by city</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
          message.type === 'error' 
            ? 'bg-red-50 border-red-500 text-red-700' 
            : 'bg-green-50 border-green-500 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Add New Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shadow-lg"
        >
          <FaPlus />
          {showForm ? 'Cancel' : 'Add New Privilege Section'}
        </button>
      </div>

      {/* Privilege Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingId ? 'Edit Privilege Section' : 'Add New Privilege Section'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline mr-2" />
                City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              >
                <option value="">Select a city</option>
                {luxuryCities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Heading
              </label>
              <input
                type="text"
                name="heading"
                value={formData.heading}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter main heading"
                required
              />
            </div>
          </div>

          {/* Privilege Cards */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Privilege Cards</h4>
              <button
                type="button"
                onClick={addCard}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <FaPlus /> Add Card
              </button>
            </div>

            {formData.cards.map((card, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">Card {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeCard(index)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      placeholder="Card title"
                      value={card.title}
                      onChange={(e) => updateCard(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCardImageChange(index, e.target.files[0])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required={!card.image}
                    />
                    {card.image && !card.file && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center">
                        <span className="mr-2">Current image:</span>
                        <img 
                          src={
                            card.image.startsWith('/') 
                              ? `${BASE_URL}${card.image}` 
                              : `${BASE_URL}/${card.image}`
                          }
                          alt={card.title}
                          className="h-8 w-8 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {formData.cards.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FaImage className="mx-auto text-3xl text-gray-400 mb-2" />
                <p className="text-gray-500">No cards added yet. Click "Add Card" to create your first card.</p>
              </div>
            )}
          </div>

        
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 font-medium"
          >
            {loading ? (
              <FaSpinner className="animate-spin inline mr-2" />
            ) : null}
            {loading ? 'Processing...' : (editingId ? 'Update Privilege Section' : 'Create Privilege Section')}
          </button>
        </form>
      )}

      {/* Privilege List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">
          Privilege Sections ({privileges.length})
        </h2>

        {privileges.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
            <FaStar className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No privilege sections found. Create your first section above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {privileges.map((privilege) => (
              <div key={privilege._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 truncate">{privilege.heading}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(privilege)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(privilege._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <FaMapMarkerAlt className="text-indigo-500" />
                  <p className="text-gray-700 text-sm">
                    City: {privilege.city?.name || privilege.city}
                  </p>
                </div>

                {privilege.cards && privilege.cards.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">
                      Privilege Cards ({privilege.cards.length})
                    </h6>
                    <div className="grid grid-cols-2 gap-2">
                      {privilege.cards.slice(0, 4).map((card, idx) => (
                        <div key={idx} className="relative">
                          <img 
                            src={
                              card.image && (
                                card.image.startsWith('/') 
                                ? `${BASE_URL}${card.image}` 
                                : `${BASE_URL}/${card.image}`
                              )
                            }
                            alt={card.title}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                            {card.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created: {new Date(privilege.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <FaSpinner className="animate-spin text-3xl text-indigo-500 mx-auto mb-3" />
            <p className="text-gray-700">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Privilege;