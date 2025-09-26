import React, { useState, useEffect } from 'react';
import { FaStar, FaImage, FaMapMarkerAlt, FaSpinner, FaEdit, FaTrash, FaPlus, FaUpload, FaTimes, FaVideo, FaLightbulb, FaCrown } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// API service functions
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';
const INSPIRATION_API_URL = `${API_BASE_URL}/inspiration`;
const BESTTIME_API_URL = `${API_BASE_URL}/besttime`;

const luxuryOptionAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/luxury-options`);
    return response.json();
  },
  
  getByCity: async (city) => {
    const response = await fetch(`${API_BASE_URL}/luxury-options/${city}`);
    return response.json();
  },
  
  create: async (optionData) => {
    const formData = new FormData();
    formData.append('city', optionData.city);
    formData.append('heading', optionData.heading);
    formData.append('subheading', optionData.subheading);
    
    if (optionData.dashboardImage) {
      formData.append('dashboardImage', optionData.dashboardImage);
    }
    
    if (optionData.signatureExperiences && optionData.signatureExperiences.length > 0) {
      formData.append('signatureExperiences', JSON.stringify(
        optionData.signatureExperiences.map(exp => ({ 
          heading: exp.heading, 
          subheading: exp.subheading 
        }))
      ));
      optionData.signatureExperiences.forEach(exp => {
        if (exp.file) {
          formData.append('signatureExperiences', exp.file);
        }
      });
    }
    
    if (optionData.luxuryResorts && optionData.luxuryResorts.length > 0) {
      formData.append('luxuryResorts', JSON.stringify(
        optionData.luxuryResorts.map(resort => ({ 
          heading: resort.heading, 
          subheading: resort.subheading 
        }))
      ));
      optionData.luxuryResorts.forEach(resort => {
        if (resort.file) {
          formData.append('luxuryResorts', resort.file);
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/luxury-options`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  
  update: async (id, optionData) => {
    const formData = new FormData();
    formData.append('city', optionData.city);
    formData.append('heading', optionData.heading);
    formData.append('subheading', optionData.subheading);
    
    if (optionData.dashboardImage) {
      formData.append('dashboardImage', optionData.dashboardImage);
    }
    
    const response = await fetch(`${API_BASE_URL}/luxury-options/${id}`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/luxury-options/${id}`, {
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

const inspirationAPI = {
  getAll: async () => {
    const response = await fetch(INSPIRATION_API_URL);
    return response.json();
  },
  create: async (data) => {
    const formData = new FormData();
    formData.append('city', data.city);
    formData.append('heading', data.heading);
    formData.append('cards', JSON.stringify(data.cards.map(card => ({
      title: card.title,
      subtitle: card.subtitle,
      details: card.details,
      price: card.price,
      emi: card.emi,
      totalPrice: card.totalPrice,
      duration: card.duration,
      highlight: card.highlight,
      image: card.image // for update, not for create
    }))));

    data.cards.forEach(card => {
      if (card.file) formData.append('cardsImages', card.file);
    });
    const response = await fetch(INSPIRATION_API_URL, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  update: async (id, data) => {
    const formData = new FormData();
    formData.append('city', data.city);
    formData.append('heading', data.heading);
    formData.append('cards', JSON.stringify(data.cards.map(card => ({
      title: card.title,
      subtitle: card.subtitle,
      details: card.details,
      price: card.price,
      emi: card.emi,
      totalPrice: card.totalPrice,
      duration: card.duration,
      highlight: card.highlight,
      image: card.image
    }))));

    data.cards.forEach(card => {
      if (card.file) formData.append('cardsImages', card.file);
    });
    const response = await fetch(`${INSPIRATION_API_URL}/${id}`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${INSPIRATION_API_URL}/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

const bestTimeAPI = {
  getAll: async () => {
    const response = await fetch(BESTTIME_API_URL);
    return response.json();
  },
  create: async (city, data) => {
    const formData = new FormData();
    formData.append('heading', data.heading);
    formData.append('seasons', JSON.stringify(data.seasons));
    if (data.image) formData.append('image', data.image);
    data.seasons.forEach(season => {
      if (season.iconFile) formData.append('icons', season.iconFile);
    });
    const response = await fetch(`${BESTTIME_API_URL}/${city}`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  update: async (id, data) => {
    const formData = new FormData();
    formData.append('heading', data.heading);
    formData.append('seasons', JSON.stringify(data.seasons));
    if (data.image) formData.append('image', data.image);
    if (data.city) formData.append('city', data.city);
    data.seasons.forEach(season => {
      if (season.iconFile) formData.append('icons', season.iconFile);
    });
    const response = await fetch(`${BESTTIME_API_URL}/${id}`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${BESTTIME_API_URL}/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

const LuxuryOption = () => {
  // State management
  const [luxuryOptions, setLuxuryOptions] = useState([]);
  const [luxuryCities, setLuxuryCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [existingDashboardImage, setExistingDashboardImage] = useState(null);
  const [formData, setFormData] = useState({
    city: '',
    heading: '',
    subheading: '',
    dashboardImage: null,
    signatureExperiences: [],
    luxuryResorts: []
  });

  // Trip Inspiration state
  const [inspirations, setInspirations] = useState([]);
  const [inspirationLoading, setInspirationLoading] = useState(false);
  const [inspirationMsg, setInspirationMsg] = useState({ type: '', text: '' });
  const [showInspirationForm, setShowInspirationForm] = useState(false);
  const [editingInspirationId, setEditingInspirationId] = useState(null);
  const [inspirationForm, setInspirationForm] = useState({
    city: '',
    heading: '',
    cards: []
  });

  // Best Time state
  const [bestTimes, setBestTimes] = useState([]);
  const [bestTimeLoading, setBestTimeLoading] = useState(false);
  const [bestTimeMsg, setBestTimeMsg] = useState({ type: '', text: '' });
  const [showBestTimeForm, setShowBestTimeForm] = useState(false);
  const [editingBestTimeId, setEditingBestTimeId] = useState(null);
  const [bestTimeForm, setBestTimeForm] = useState({
    city: '',
    heading: '',
    image: null,
    seasons: []
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchLuxuryOptions();
    fetchLuxuryCities();
    fetchInspirations();
    fetchBestTimes();
  }, []);

  // API Functions
  const fetchLuxuryOptions = async () => {
    try {
      setLoading(true);
      const response = await luxuryOptionAPI.getAll();
      setLuxuryOptions(response || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch luxury options' });
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

  const fetchInspirations = async () => {
    try {
      setInspirationLoading(true);
      const data = await inspirationAPI.getAll();
      setInspirations(data || []);
    } catch (err) {
      setInspirationMsg({ type: 'error', text: 'Failed to fetch inspirations' });
    } finally {
      setInspirationLoading(false);
    }
  };

  const fetchBestTimes = async () => {
    try {
      setBestTimeLoading(true);
      const data = await bestTimeAPI.getAll();
      setBestTimes(data || []);
    } catch (err) {
      setBestTimeMsg({ type: 'error', text: 'Failed to fetch best time sections' });
    } finally {
      setBestTimeLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      let response;
      if (editingId) {
        response = await luxuryOptionAPI.update(editingId, formData);
      } else {
        response = await luxuryOptionAPI.create(formData);
      }
      
      if (response.message) {
        setMessage({ type: 'success', text: response.message });
        resetForm();
        fetchLuxuryOptions();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (option) => {
    setFormData({
      city: option.city || '',
      heading: option.heading || '',
      subheading: option.subheading || '',
      dashboardImage: null, // This will be handled separately for file preview
      signatureExperiences: option.signatureExperiences || [],
      luxuryResorts: option.luxuryResorts || []
    });
    setExistingDashboardImage(option.dashboardImage || null);
    setEditingId(option._id);
    setShowForm(true);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this luxury option?')) {
      try {
        setLoading(true);
        const response = await luxuryOptionAPI.delete(id);
        setMessage({ type: 'success', text: response.message });
        fetchLuxuryOptions();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete luxury option' });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      city: '',
      heading: '',
      subheading: '',
      dashboardImage: null,
      signatureExperiences: [],
      luxuryResorts: []
    });
    setEditingId(null);
    setExistingDashboardImage(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      dashboardImage: file
    }));
  };

  const addSignatureExperience = () => {
    setFormData(prev => ({
      ...prev,
      signatureExperiences: [
        ...prev.signatureExperiences,
        { heading: '', subheading: '', file: null }
      ]
    }));
  };

  const removeSignatureExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      signatureExperiences: prev.signatureExperiences.filter((_, i) => i !== index)
    }));
  };

  const updateSignatureExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      signatureExperiences: prev.signatureExperiences.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addLuxuryResort = () => {
    setFormData(prev => ({
      ...prev,
      luxuryResorts: [
        ...prev.luxuryResorts,
        { heading: '', subheading: '', file: null }
      ]
    }));
  };

  const removeLuxuryResort = (index) => {
    setFormData(prev => ({
      ...prev,
      luxuryResorts: prev.luxuryResorts.filter((_, i) => i !== index)
    }));
  };

  const updateLuxuryResort = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      luxuryResorts: prev.luxuryResorts.map((resort, i) =>
        i === index ? { ...resort, [field]: value } : resort
      )
    }));
  };

  // Trip Inspiration Functions
  const handleInspirationSubmit = async (e) => {
    e.preventDefault();
    try {
      setInspirationLoading(true);
      let response;
      if (editingInspirationId) {
        response = await inspirationAPI.update(editingInspirationId, inspirationForm);
      } else {
        response = await inspirationAPI.create(inspirationForm);
      }
      if (response._id || response.message) {
        setInspirationMsg({ type: 'success', text: editingInspirationId ? 'Updated successfully' : 'Created successfully' });
        resetInspirationForm();
        fetchInspirations();
      } else {
        setInspirationMsg({ type: 'error', text: response.error || 'Operation failed' });
      }
    } catch (err) {
      setInspirationMsg({ type: 'error', text: 'Operation failed' });
    } finally {
      setInspirationLoading(false);
    }
  };

  const handleEditInspiration = (insp) => {
    setInspirationForm({
      city: insp.city?._id || insp.city,
      heading: insp.heading,
      cards: insp.cards.map(card => ({
        ...card,
        file: null // reset file for editing, but keep existing image reference
      }))
    });
    setEditingInspirationId(insp._id);
    setShowInspirationForm(true);
    setInspirationMsg({ type: '', text: '' });
  };

  const handleDeleteInspiration = async (id) => {
    if (window.confirm('Delete this inspiration?')) {
      try {
        setInspirationLoading(true);
        const response = await inspirationAPI.delete(id);
        setInspirationMsg({ type: 'success', text: response.message });
        fetchInspirations();
      } catch (err) {
        setInspirationMsg({ type: 'error', text: 'Failed to delete inspiration' });
      } finally {
        setInspirationLoading(false);
      }
    }
  };

  const resetInspirationForm = () => {
    setInspirationForm({
      city: '',
      heading: '',
      cards: []
    });
    setEditingInspirationId(null);
    setShowInspirationForm(false);
    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  const handleInspirationInputChange = (e) => {
    const { name, value } = e.target;
    setInspirationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addInspirationCard = () => {
    setInspirationForm(prev => ({
      ...prev,
      cards: [
        ...prev.cards,
        { title: '', subtitle: '', details: '', price: '', emi: '', totalPrice: '', duration: '', highlight: '', file: null }
      ]
    }));
  };

  const removeInspirationCard = (idx) => {
    setInspirationForm(prev => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== idx)
    }));
  };

  const updateInspirationCard = (idx, field, value) => {
    setInspirationForm(prev => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === idx ? { ...card, [field]: value } : card
      )
    }));
  };

  // Best Time Functions
  const handleBestTimeInputChange = (e) => {
    const { name, value } = e.target;
    setBestTimeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBestTimeImageChange = (e) => {
    setBestTimeForm(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const addSeason = () => {
    setBestTimeForm(prev => ({
      ...prev,
      seasons: [
        ...prev.seasons,
        { title: '', period: '', icon: '', iconFile: null }
      ]
    }));
  };

  const removeSeason = (idx) => {
    setBestTimeForm(prev => ({
      ...prev,
      seasons: prev.seasons.filter((_, i) => i !== idx)
    }));
  };

  const updateSeason = (idx, field, value) => {
    setBestTimeForm(prev => ({
      ...prev,
      seasons: prev.seasons.map((season, i) =>
        i === idx ? { ...season, [field]: value } : season
      )
    }));
  };

  const handleSeasonIconChange = (idx, file) => {
    setBestTimeForm(prev => ({
      ...prev,
      seasons: prev.seasons.map((season, i) =>
        i === idx ? { ...season, iconFile: file } : season
      )
    }));
  };

  const resetBestTimeForm = () => {
    setBestTimeForm({
      city: '',
      heading: '',
      image: null,
      seasons: []
    });
    setEditingBestTimeId(null);
    setShowBestTimeForm(false);
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  const handleBestTimeSubmit = async (e) => {
    e.preventDefault();
    try {
      setBestTimeLoading(true);
      let response;
      if (editingBestTimeId) {
        response = await bestTimeAPI.update(editingBestTimeId, bestTimeForm);
      } else {
        response = await bestTimeAPI.create(bestTimeForm.city, bestTimeForm);
      }
      if (response._id || response.message) {
        setBestTimeMsg({ type: 'success', text: editingBestTimeId ? 'Updated successfully' : 'Created successfully' });
        resetBestTimeForm();
        fetchBestTimes();
      } else {
        setBestTimeMsg({ type: 'error', text: response.message || 'Operation failed' });
      }
    } catch (err) {
      setBestTimeMsg({ type: 'error', text: 'Operation failed' });
    } finally {
      setBestTimeLoading(false);
    }
  };

  const handleEditBestTime = (section) => {
    setBestTimeForm({
      city: section.city,
      heading: section.heading,
      image: null,
      seasons: section.seasons.map(season => ({
        ...season,
        iconFile: null
      }))
    });
    setEditingBestTimeId(section._id);
    setShowBestTimeForm(true);
    setBestTimeMsg({ type: '', text: '' });
  };

  const handleDeleteBestTime = async (id) => {
    if (window.confirm('Delete this section?')) {
      try {
        setBestTimeLoading(true);
        const response = await bestTimeAPI.delete(id);
        setBestTimeMsg({ type: 'success', text: response.message });
        fetchBestTimes();
      } catch (err) {
        setBestTimeMsg({ type: 'error', text: 'Failed to delete section' });
      } finally {
        setBestTimeLoading(false);
      }
    }
  };

  return (
    <div className="p-5 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Luxury Options Management</h1>
        <p className="text-lg opacity-90">Manage luxury experiences and resort options by city</p>
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
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all transform hover:-translate-y-0.5 shadow-lg"
        >
          <FaPlus />
          {showForm ? 'Cancel' : 'Add New Luxury Option'}
        </button>
      </div>

      {/* Luxury Option Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingId ? 'Edit Luxury Option' : 'Add New Luxury Option'}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
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
                <FaVideo className="inline mr-2" />
                Dashboard Media (Image/Video) {editingId ? '' : '*'}
              </label>
              {editingId && existingDashboardImage && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  <span className="font-medium">📁 Existing media will be kept</span>
                  {!formData.dashboardImage && ' (Upload new file only if you want to replace it)'}
                </div>
              )}
              <input
                type="file"
                accept="image/*,video/*"
                required={!editingId}
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
              {formData.dashboardImage ? (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {formData.dashboardImage.name} ({(formData.dashboardImage.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              ) : editingId && existingDashboardImage && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Current file: {existingDashboardImage.split('/').pop()}</p>
                  {existingDashboardImage.includes('.mp4') || existingDashboardImage.includes('.webm') || existingDashboardImage.includes('.ogg') ? (
                    <video
                      src={existingDashboardImage.startsWith('http') ? existingDashboardImage : `${BASE_URL}${existingDashboardImage}`}
                      controls
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src={existingDashboardImage.startsWith('http') ? existingDashboardImage : `${BASE_URL}${existingDashboardImage}`}
                      alt="Current dashboard media"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Heading
              </label>
              <input
                type="text"
                name="heading"
                value={formData.heading}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="Enter main heading"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subheading
              </label>
              <input
                type="text"
                name="subheading"
                value={formData.subheading}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="Enter subheading"
                required
              />
            </div>
          </div>

          {/* Signature Experiences */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Signature Experiences</h4>
              <button
                type="button"
                onClick={addSignatureExperience}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <FaPlus /> Add Experience
              </button>
            </div>

            {formData.signatureExperiences.map((experience, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">Experience {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeSignatureExperience(index)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Experience heading"
                    value={experience.heading}
                    onChange={(e) => updateSignatureExperience(index, 'heading', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Experience subheading"
                    value={experience.subheading}
                    onChange={(e) => updateSignatureExperience(index, 'subheading', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => updateSignatureExperience(index, 'file', e.target.files[0])}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required={!editingId || !experience.url}
                    />
                    {editingId && experience.url && !experience.file && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Current image:</p>
                        <img
                          src={experience.url.startsWith('http') ? experience.url : `${BASE_URL}${experience.url}`}
                          alt="Experience image"
                          className="w-full h-20 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Luxury Resorts */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Luxury Resorts</h4>
              <button
                type="button"
                onClick={addLuxuryResort}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <FaPlus /> Add Resort
              </button>
            </div>

            {formData.luxuryResorts.map((resort, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">Resort {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeLuxuryResort(index)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Resort heading"
                    value={resort.heading}
                    onChange={(e) => updateLuxuryResort(index, 'heading', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Resort subheading"
                    value={resort.subheading}
                    onChange={(e) => updateLuxuryResort(index, 'subheading', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => updateLuxuryResort(index, 'file', e.target.files[0])}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required={!editingId || !resort.url}
                    />
                    {editingId && resort.url && !resort.file && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Current image:</p>
                        <img
                          src={resort.url.startsWith('http') ? resort.url : `${BASE_URL}${resort.url}`}
                          alt="Resort image"
                          className="w-full h-20 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 font-medium"
          >
            {loading ? (
              <FaSpinner className="animate-spin inline mr-2" />
            ) : null}
            {loading ? 'Processing...' : (editingId ? 'Update Luxury Option' : 'Create Luxury Option')}
          </button>
        </form>
      )}

      {/* Luxury Options List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">
          Luxury Options ({luxuryOptions.length})
        </h2>

        {luxuryOptions.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
            <FaStar className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No luxury options found. Create your first option above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {luxuryOptions.map((option) => (
              <div key={option._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 truncate">{option.heading}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(option)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(option._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 italic">{option.subheading}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-amber-500" />
                    <p className="text-gray-700 text-sm">
                      City: {option.city?.name || option.city}
                    </p>
                  </div>

                  {option.dashboardImage && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {option.dashboardImage.includes('.mp4') || option.dashboardImage.includes('.webm') || option.dashboardImage.includes('.ogg') ? (
                          <FaVideo className="text-purple-500" />
                        ) : (
                          <FaImage className="text-blue-500" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          Dashboard {option.dashboardImage.includes('.mp4') || option.dashboardImage.includes('.webm') || option.dashboardImage.includes('.ogg') ? 'Video' : 'Image'}
                        </span>
                      </div>
                      {option.dashboardImage.includes('.mp4') || option.dashboardImage.includes('.webm') || option.dashboardImage.includes('.ogg') ? (
                        <video 
                          controls 
                          className="w-full h-32 object-cover rounded-lg border"
                          src={`${BASE_URL}${option.dashboardImage}`}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img 
                          src={`${BASE_URL}${option.dashboardImage}`}
                          alt="Dashboard"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      )}
                    </div>
                  )}

                  {option.signatureExperiences && option.signatureExperiences.length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-sm font-medium text-gray-700 mb-2">
                        Signature Experiences ({option.signatureExperiences.length})
                      </h6>
                      <div className="grid grid-cols-2 gap-2">
                        {option.signatureExperiences.slice(0, 4).map((exp, idx) => (
                          <div key={idx} className="relative">
                            <img 
                              src={`${BASE_URL}${exp.url}`}
                              alt={exp.heading}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                              {exp.heading}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {option.luxuryResorts && option.luxuryResorts.length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-sm font-medium text-gray-700 mb-2">
                        Luxury Resorts ({option.luxuryResorts.length})
                      </h6>
                      <div className="grid grid-cols-2 gap-2">
                        {option.luxuryResorts.slice(0, 4).map((resort, idx) => (
                          <div key={idx} className="relative">
                            <img 
                              src={`${BASE_URL}${resort.url}`}
                              alt={resort.heading}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                              {resort.heading}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created: {new Date(option.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trip Inspiration Section */}
      <div className="mt-16">
        <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <FaLightbulb className="inline text-yellow-300" />
            Trip Inspiration Management
          </h1>
          <p className="text-lg opacity-90">Create and manage trip inspiration cards by city</p>
        </div>

        {/* Message Display */}
        {inspirationMsg.text && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            inspirationMsg.type === 'error'
              ? 'bg-red-50 border-red-500 text-red-700'
              : 'bg-green-50 border-green-500 text-green-700'
          }`}>
            {inspirationMsg.text}
          </div>
        )}

        {/* Add New Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowInspirationForm(!showInspirationForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shadow-lg"
          >
            <FaPlus />
            {showInspirationForm ? 'Cancel' : 'Add Trip Inspiration'}
          </button>
        </div>

        {/* Inspiration Form */}
        {showInspirationForm && (
          <form onSubmit={handleInspirationSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingInspirationId ? 'Edit Trip Inspiration' : 'Add Trip Inspiration'}
              </h3>
              <button
                type="button"
                onClick={resetInspirationForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  City
                </label>
                <select
                  name="city"
                  value={inspirationForm.city}
                  onChange={handleInspirationInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  Heading
                </label>
                <input
                  type="text"
                  name="heading"
                  value={inspirationForm.heading}
                  onChange={handleInspirationInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter heading"
                  required
                />
              </div>
            </div>

            {/* Cards */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Cards</h4>
                <button
                  type="button"
                  onClick={addInspirationCard}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  <FaPlus /> Add Card
                </button>
              </div>
              {inspirationForm.cards.map((card, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-4 border">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-700">Card {idx + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeInspirationCard(idx)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={card.title}
                      onChange={e => updateInspirationCard(idx, 'title', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Subtitle"
                      value={card.subtitle}
                      onChange={e => updateInspirationCard(idx, 'subtitle', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Details"
                      value={card.details}
                      onChange={e => updateInspirationCard(idx, 'details', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => updateInspirationCard(idx, 'file', e.target.files[0])}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        required={!card.image}
                      />
                      {editingInspirationId && card.image && !card.file && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-1">Current image:</p>
                          <img
                            src={card.image.startsWith('http') ? card.image : `${BASE_URL}${card.image}`}
                            alt="Card image"
                            className="w-full h-20 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Price"
                      value={card.price}
                      onChange={e => updateInspirationCard(idx, 'price', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                    <input
                      type="text"
                      placeholder="EMI"
                      value={card.emi}
                      onChange={e => updateInspirationCard(idx, 'emi', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                    <input
                      type="text"
                      placeholder="Total Price"
                      value={card.totalPrice}
                      onChange={e => updateInspirationCard(idx, 'totalPrice', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={card.duration}
                      onChange={e => updateInspirationCard(idx, 'duration', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Highlight"
                      value={card.highlight}
                      onChange={e => updateInspirationCard(idx, 'highlight', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 w-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={inspirationLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 font-medium"
            >
              {inspirationLoading ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : null}
              {inspirationLoading ? 'Processing...' : (editingInspirationId ? 'Update Inspiration' : 'Create Inspiration')}
            </button>
          </form>
        )}

        {/* Inspiration List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">
            Trip Inspirations ({inspirations.length})
          </h2>
          {inspirations.length === 0 && !inspirationLoading ? (
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
              <FaLightbulb className="mx-auto text-4xl text-yellow-400 mb-4" />
              <p className="text-gray-500 text-lg">No trip inspirations found. Create your first inspiration above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {inspirations.map(insp => (
                <div key={insp._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800 truncate">{insp.heading}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditInspiration(insp)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteInspiration(insp._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-blue-500" />
                    <p className="text-gray-700 text-sm">
                      City: {insp.city?.name || insp.city}
                    </p>
                  </div>
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-2">
                      Cards ({insp.cards.length})
                    </h6>
                    <div className="grid grid-cols-2 gap-2">
                      {insp.cards.slice(0, 4).map((card, idx) => (
                        <div key={idx} className="relative bg-gray-100 rounded border p-2">
                          <img
                            src={
                              card.image
                                ? card.image.startsWith('/') 
                                  ? `${BASE_URL}${card.image}` 
                                  : `${BASE_URL}/${card.image}`
                                : ''
                            }
                            alt={card.title}
                            className="w-full h-20 object-cover rounded"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                            {card.title}
                          </div>
                          <div className="mt-1 text-xs text-gray-700">{card.subtitle}</div>
                          <div className="mt-1 text-xs text-gray-500">{card.details}</div>
                          <div className="mt-1 text-xs text-gray-600 font-semibold">{card.price && `Price: ${card.price}`}</div>
                          <div className="mt-1 text-xs text-gray-600">{card.duration && `Duration: ${card.duration}`}</div>
                          <div className="mt-1 text-xs text-yellow-700">{card.highlight}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(insp.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Loading Overlay */}
        {inspirationLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto mb-3" />
              <p className="text-gray-700">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Best Time To Visit Section */}
      <div className="mt-16">
        <div className="text-center mb-8 p-6 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <FaStar className="inline text-yellow-300" />
            Best Time To Visit Management
          </h1>
          <p className="text-lg opacity-90">Create and manage best time to visit by city and season</p>
        </div>

        {/* Message Display */}
        {bestTimeMsg.text && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            bestTimeMsg.type === 'error'
              ? 'bg-red-50 border-red-500 text-red-700'
              : 'bg-green-50 border-green-500 text-green-700'
          }`}>
            {bestTimeMsg.text}
          </div>
        )}

        {/* Add New Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowBestTimeForm(!showBestTimeForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg hover:from-green-500 hover:to-blue-600 transition-all transform hover:-translate-y-0.5 shadow-lg"
          >
            <FaPlus />
            {showBestTimeForm ? 'Cancel' : 'Add Best Time Section'}
          </button>
        </div>

        {/* Best Time Form */}
        {showBestTimeForm && (
          <form onSubmit={handleBestTimeSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingBestTimeId ? 'Edit Best Time Section' : 'Add Best Time Section'}
              </h3>
              <button
                type="button"
                onClick={resetBestTimeForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  City
                </label>
                <select
                  name="city"
                  value={bestTimeForm.city}
                  onChange={handleBestTimeInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                  Heading
                </label>
                <input
                  type="text"
                  name="heading"
                  value={bestTimeForm.heading}
                  onChange={handleBestTimeInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter heading"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBestTimeImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
              {bestTimeForm.image && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {bestTimeForm.image.name} ({(bestTimeForm.image.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Seasons */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Seasons</h4>
                <button
                  type="button"
                  onClick={addSeason}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <FaPlus /> Add Season
                </button>
              </div>
              {bestTimeForm.seasons.map((season, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-4 border">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-700">Season {idx + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeSeason(idx)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Season title"
                      value={season.title}
                      onChange={e => updateSeason(idx, 'title', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Period"
                      value={season.period}
                      onChange={e => updateSeason(idx, 'period', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleSeasonIconChange(idx, e.target.files[0])}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required={!season.icon}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={bestTimeLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg hover:from-green-500 hover:to-blue-600 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 font-medium"
            >
              {bestTimeLoading ? (
                <FaSpinner className="animate-spin inline mr-2" />
              ) : null}
              {bestTimeLoading ? 'Processing...' : (editingBestTimeId ? 'Update Section' : 'Create Section')}
            </button>
          </form>
        )}

        {/* Best Time List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">
            Best Time Sections ({bestTimes.length})
          </h2>
          {bestTimes.length === 0 && !bestTimeLoading ? (
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
              <FaStar className="mx-auto text-4xl text-yellow-400 mb-4" />
              <p className="text-gray-500 text-lg">No best time sections found. Create your first section above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {bestTimes.map(section => (
                <div key={section._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800 truncate">{section.heading}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditBestTime(section)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteBestTime(section._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-green-500" />
                    <p className="text-gray-700 text-sm">
                      City: {section.city?.name || section.city}
                    </p>
                  </div>
                  {section.image && (
                    <img
                      src={
                        section.image.startsWith('/')
                          ? `${BASE_URL}${section.image}`
                          : `${BASE_URL}/${section.image}`
                      }
                      alt="Best Time"
                      className="w-full h-32 object-cover rounded-lg border mb-4"
                    />
                  )}
                  {section.seasons && section.seasons.length > 0 && (
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">
                        Seasons ({section.seasons.length})
                      </h6>
                      <div className="grid grid-cols-2 gap-2">
                        {section.seasons.map((season, idx) => (
                          <div key={idx} className="relative bg-gray-100 rounded border p-2">
                            {season.icon && (
                              <img
                                src={
                                  season.icon.startsWith('/')
                                    ? `${BASE_URL}${season.icon}`
                                    : `${BASE_URL}/${season.icon}`
                                }
                                alt={season.title}
                                className="w-full h-12 object-cover rounded"
                              />
                            )}
                            <div className="mt-1 text-xs text-gray-700 font-semibold">{season.title}</div>
                            <div className="mt-1 text-xs text-gray-500">{season.period}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(section.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {bestTimeLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <FaSpinner className="animate-spin text-3xl text-green-500 mx-auto mb-3" />
              <p className="text-gray-700">Processing...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Privilege Section */}
      <div className="mt-16">
        <div className="text-center mb-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <FaCrown className="inline text-yellow-300" />
            Privilege Management
          </h1>
          <p className="text-lg opacity-90">Create and manage privilege cards and sections by city</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
          <FaCrown className="mx-auto text-4xl text-indigo-400 mb-4" />
          <p className="text-gray-700 text-lg mb-6">
            Manage privilege sections and cards for luxury cities in our dedicated privilege management interface.
          </p>
          <Link
            to="/privilege"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shadow-lg"
          >
            <FaCrown className="text-yellow-300" />
            Go to Privilege Management
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LuxuryOption;