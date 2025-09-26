import React, { useState, useEffect } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaVideo, FaSpinner, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

// API service functions
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';


const contactAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/contact`);
    return response.json();
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/contact/${id}`);
    return response.json();
  },
  
  create: async (contactData) => {
    const formData = new FormData();
    formData.append('mainHeading', contactData.mainHeading);
    formData.append('subtitle', contactData.subtitle);
    formData.append('address', contactData.address);
    formData.append('number', contactData.number);
    formData.append('email', contactData.email);
    if (contactData.backgroundVideo) {
      formData.append('backgroundVideo', contactData.backgroundVideo);
    }
    
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  
  update: async (id, contactData) => {
    const formData = new FormData();
    formData.append('mainHeading', contactData.mainHeading);
    formData.append('subtitle', contactData.subtitle);
    formData.append('address', contactData.address);
    formData.append('number', contactData.number);
    formData.append('email', contactData.email);
    if (contactData.backgroundVideo) {
      formData.append('backgroundVideo', contactData.backgroundVideo);
    }
    
    const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

const Contact = () => {
  // State management
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    mainHeading: '',
    subtitle: '',
    address: '',
    number: '',
    email: '',
    backgroundVideo: null
  });

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // API Functions
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getAll();
      setContacts(response || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch contacts' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      let response;
      if (editingId) {
        response = await contactAPI.update(editingId, formData);
      } else {
        response = await contactAPI.create(formData);
      }
      
      if (response.message) {
        setMessage({ type: 'success', text: response.message });
        resetForm();
        fetchContacts();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setFormData({
      mainHeading: contact.mainHeading,
      subtitle: contact.subtitle,
      address: contact.address,
      number: contact.number,
      email: contact.email,
      backgroundVideo: null
    });
    setEditingId(contact._id);
    setShowForm(true);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        setLoading(true);
        const response = await contactAPI.delete(id);
        setMessage({ type: 'success', text: response.message });
        fetchContacts();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete contact' });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      mainHeading: '',
      subtitle: '',
      address: '',
      number: '',
      email: '',
      backgroundVideo: null
    });
    setEditingId(null);
    setShowForm(false);
    // Reset file input
    const fileInput = document.getElementById('backgroundVideo');
    if (fileInput) fileInput.value = '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      backgroundVideo: file
    }));
  };

  return (
    <div className="p-5 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Contact Management</h1>
        <p className="text-lg opacity-90">Manage contact information and background content</p>
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
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all transform hover:-translate-y-0.5 shadow-lg"
        >
          <FaPlus />
          {showForm ? 'Cancel' : 'Add New Contact'}
        </button>
      </div>

      {/* Contact Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingId ? 'Edit Contact' : 'Add New Contact'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEdit className="inline mr-2" />
                Main Heading
              </label>
              <input
                type="text"
                name="mainHeading"
                value={formData.mainHeading}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter main heading"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter subtitle"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[100px]"
              placeholder="Enter full address"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaVideo className="inline mr-2" />
              Background Video
            </label>
            <input
              type="file"
              id="backgroundVideo"
              accept="video/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {formData.backgroundVideo && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {formData.backgroundVideo.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 font-medium"
          >
            {loading ? (
              <FaSpinner className="animate-spin inline mr-2" />
            ) : null}
            {loading ? 'Processing...' : (editingId ? 'Update Contact' : 'Create Contact')}
          </button>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">
          Contact Entries ({contacts.length})
        </h2>

        {contacts.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
            <FaPhone className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No contacts found. Create your first contact above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <div key={contact._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 truncate">{contact.mainHeading}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 italic">{contact.subtitle}</p>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">{contact.address}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaPhone className="text-green-500 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">{contact.number}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-blue-500 flex-shrink-0" />
                    <p className="text-gray-700 text-sm truncate">{contact.email}</p>
                  </div>

                  {contact.backgroundVideo && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaVideo className="text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">Background Video</span>
                      </div>
                      <video 
                        controls 
                        className="w-full h-32 object-cover rounded-lg border"
                        src={`${BASE_URL}/${contact.backgroundVideo.replace(/\\/g, '/')}`}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created: {new Date(contact.createdAt || Date.now()).toLocaleDateString()}
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
            <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto mb-3" />
            <p className="text-gray-700">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;