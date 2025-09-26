import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaImage, 
  FaSpinner, 
  FaGlobe,
  FaMapMarkerAlt,
  FaCity,
  FaMapPin,
  FaMap,
  FaCheckCircle,
  FaWindowClose,
  FaSearch,
  FaInfoCircle
} from 'react-icons/fa';
import { mapCardAPI, getImageUrl } from '../../services/mapCardAPI';
import { countryAPI, continentAPI } from '../../services/itenaryAPI';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MapCard = () => {
  // State for map cards
  const [mapCards, setMapCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State for form data
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    description: '',
    latitude: '',
    longitude: '',
    image: null
  });
  
  // State for form visuals
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // State for countries/continents filtering
  const [countries, setCountries] = useState([]);
  const [continents, setContinents] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch map cards
  const fetchMapCards = async () => {
    setLoading(true);
    try {
      const data = await mapCardAPI.getAll();
      setMapCards(data);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch map cards' });
      toast.error('Failed to fetch map cards');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch countries based on continent filter
  const fetchCountries = async (continentId = '') => {
    try {
      const data = await countryAPI.getAll(continentId);
      setCountries(data);
    } catch (error) {
      toast.error('Failed to fetch countries');
    }
  };
  
  // Fetch continents
  const fetchContinents = async () => {
    try {
      const data = await continentAPI.getAll();
      setContinents(data);
    } catch (error) {
      toast.error('Failed to fetch continents');
    }
  };
  
  // Initial data loading
  useEffect(() => {
    fetchMapCards();
    fetchContinents();
    fetchCountries();
    
    // Cleanup function for preview
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);
  
  // Update countries when continent filter changes
  useEffect(() => {
    fetchCountries(selectedContinent);
  }, [selectedContinent]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle image changes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Basic validation
      if (!formData.country || !formData.city || !formData.description) {
        throw new Error('Country, city, and description are required');
      }
      
      if (!formData.latitude || !formData.longitude) {
        throw new Error('Latitude and longitude are required');
      }
      
      // Validate latitude and longitude
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        throw new Error('Latitude must be a number between -90 and 90');
      }
      
      if (isNaN(lng) || lng < -180 || lng > 180) {
        throw new Error('Longitude must be a number between -180 and 180');
      }
      
      // Check if image is provided when creating a new map card
      if (!editingId && !formData.image) {
        throw new Error('Image is required for new map cards');
      }
      
      // Create or update map card
      let response;
      if (editingId) {
        response = await mapCardAPI.update(editingId, formData);
        toast.success('Map card updated successfully');
      } else {
        response = await mapCardAPI.create(formData);
        toast.success('Map card created successfully');
      }
      
      // Reset form
      resetForm();
      
      // Refresh map cards list
      fetchMapCards();
      
    } catch (error) {
      toast.error(error.message || 'Failed to save map card');
      setMessage({ type: 'error', text: error.message || 'Failed to save map card' });
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      country: '',
      city: '',
      description: '',
      latitude: '',
      longitude: '',
      image: null
    });
    
    // Clear preview
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    
    // Clear editing state
    setEditingId(null);
  };
  
  // Handle edit map card
  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const mapCard = await mapCardAPI.getById(id);
      
      setFormData({
        country: mapCard.country._id || mapCard.country,
        city: mapCard.city || '',
        description: mapCard.description || '',
        latitude: mapCard.latitude || '',
        longitude: mapCard.longitude || '',
        image: null // No file, just keep existing image
      });
      
      // Set image preview if image exists
      if (mapCard.image) {
        setImagePreview(getImageUrl(mapCard.image));
      }
      
      setEditingId(id);
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      toast.error('Failed to load map card for editing');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete map card
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this map card?')) {
      setLoading(true);
      try {
        await mapCardAPI.delete(id);
        toast.success('Map card deleted successfully');
        fetchMapCards();
      } catch (error) {
        toast.error('Failed to delete map card');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Filter countries by search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h1 className="text-2xl font-bold mb-6">Map Card Management</h1>
      
      {/* Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Map Card' : 'Add New Map Card'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Country Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              <FaGlobe className="inline mr-2" /> Continent Filter
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
            >
              <option value="">All Continents</option>
              {continents.map(continent => (
                <option key={continent._id} value={continent._id}>
                  {continent.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              <FaMapMarkerAlt className="inline mr-2" /> Country
            </label>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search countries..."
                className="p-2 border rounded w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              name="country"
              className="w-full p-2 border rounded"
              value={formData.country}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Country</option>
              {filteredCountries.map(country => (
                <option key={country._id} value={country._id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* City */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              <FaCity className="inline mr-2" /> City
            </label>
            <input
              type="text"
              name="city"
              className="w-full p-2 border rounded"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter city name"
              required
            />
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              <FaInfoCircle className="inline mr-2" /> Description
            </label>
            <textarea
              name="description"
              rows="3"
              className="w-full p-2 border rounded"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter location description"
              required
            />
          </div>
          
          {/* Latitude and Longitude */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-1">
                <FaMapPin className="inline mr-2" /> Latitude
              </label>
              <input
                type="text"
                name="latitude"
                className="w-full p-2 border rounded"
                value={formData.latitude}
                onChange={handleInputChange}
                placeholder="Enter latitude (e.g., 40.7128)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Value between -90 and 90</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">
                <FaMap className="inline mr-2" /> Longitude
              </label>
              <input
                type="text"
                name="longitude"
                className="w-full p-2 border rounded"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="Enter longitude (e.g., -74.0060)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Value between -180 and 180</p>
            </div>
          </div>
          
          {/* Image */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              <FaImage className="inline mr-2" /> Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="image"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <label
                htmlFor="image"
                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 flex items-center"
              >
                <FaImage className="mr-2" /> Choose Image
              </label>
              <span className="text-gray-500 text-sm">
                {formData.image ? formData.image.name : (editingId && !formData.image ? 'Current image will be kept' : 'No image selected')}
              </span>
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3 border rounded p-2 inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-40 max-w-full object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Submit and Cancel Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle className="mr-2" /> {editingId ? 'Update' : 'Save'}
                </>
              )}
            </button>
            
            {editingId && (
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center"
                onClick={resetForm}
                disabled={loading}
              >
                <FaWindowClose className="mr-2" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Map Cards List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Map Cards List</h2>
        
        {loading && !editingId ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-3xl text-blue-500" />
          </div>
        ) : mapCards.length === 0 ? (
          <div className="bg-gray-100 p-4 text-center rounded">
            No map cards found. Add your first one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mapCards.map(card => (
              <div key={card._id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                {/* Card Image */}
                <div className="relative h-48 overflow-hidden">
                  {card.image ? (
                    <img
                      src={getImageUrl(card.image)}
                      alt={card.city}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full bg-gray-200 flex items-center justify-center">
                      <FaImage className="text-gray-400 text-3xl" />
                    </div>
                  )}
                  <div className="absolute top-0 right-0 p-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit(card._id)}
                      className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(card._id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{card.city}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <FaGlobe className="inline mr-1" /> {card.country?.name || 'Unknown Country'}
                  </p>
                  <p className="text-sm mb-3">{card.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      <FaMapPin className="inline mr-1" /> {card.latitude}
                    </span>
                    <span>
                      <FaMap className="inline mr-1" /> {card.longitude}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapCard;
