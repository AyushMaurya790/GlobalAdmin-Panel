import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFilter,
  FaGlobe,
  FaMapMarkerAlt,
  FaDollarSign,
  FaPassport,
  FaClock,
  FaInfoCircle,
  FaCalendarAlt,
  FaVideo,
  FaTimes,
  FaSave,
  FaSpinner
} from 'react-icons/fa';

const Country = () => {
  const [countries, setCountries] = useState([]);
  const [continents, setContinents] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [formData, setFormData] = useState({
    name: '',           // ✅ matches schema
    continentId: '',    // ✅ maps to continent field
    capital: '',        // ✅ matches schema
    currency: '',       // ✅ matches schema
    visa: '',          // ✅ matches schema
    timezone: '',      // ✅ matches schema
    info: '',          // ✅ matches schema
    bestTimeToVisit: '', // ✅ matches schema
    heading: '',        // ✅ matches schema
    title: '',          // ✅ matches schema
    video: null         // ✅ matches schema (file upload)
  });

  const baseURL = 'http://globe.ridealmobility.com';

  // Fetch countries
  const fetchCountries = async (continentFilter = '') => {
    setLoading(true);
    try {
      let url = `${baseURL}/api/countries`;
      if (continentFilter) {
        url += `?continentId=${continentFilter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch countries');
      
      const data = await response.json();
      setCountries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch continents
  const fetchContinents = async () => {
    try {
      const response = await fetch(`${baseURL}/api/continents`);
      if (!response.ok) throw new Error('Failed to fetch continents');
      
      const data = await response.json();
      setContinents(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch country details with destinations
  const fetchCountryDetails = async (countryId) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/countries/${countryId}`);
      if (!response.ok) throw new Error('Failed to fetch country details');
      
      const data = await response.json();
      setCurrentCountry(data);
      setDestinations(data.destinations || []);
      setIsViewModalOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if country name already exists
  const checkDuplicateName = (name) => {
    const existingCountry = countries.find(country => 
      country.name.toLowerCase() === name.toLowerCase()
    );
    return existingCountry;
  };

  // Create country
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for duplicate name before submission
    const duplicate = checkDuplicateName(formData.name);
    if (duplicate) {
      setError(`A country with the name "${formData.name}" already exists. Please use a different name.`);
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'video' && formData[key] instanceof File) {
          formDataToSend.append('video', formData[key]);
        } else if (key !== 'video') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${baseURL}/api/countries`, {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (result.message && result.message.includes('E11000 duplicate key error')) {
          if (result.message.includes('name_1')) {
            throw new Error(`A country with the name "${formData.name}" already exists. Please use a different name.`);
          }
        }
        throw new Error(result.message || 'Failed to save country');
      }

      setSuccess(result.message);
      resetForm();
      fetchCountries(selectedContinent);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete country
  const handleDelete = async (countryId) => {
    if (!window.confirm('Are you sure you want to delete this country and all its destinations?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/countries/${countryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete country');

      const result = await response.json();
      setSuccess(result.message);
      fetchCountries(selectedContinent);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',           // ✅ matches schema
      continentId: '',    // ✅ maps to continent field
      capital: '',        // ✅ matches schema
      currency: '',       // ✅ matches schema
      visa: '',          // ✅ matches schema
      timezone: '',      // ✅ matches schema
      info: '',          // ✅ matches schema
      bestTimeToVisit: '', // ✅ matches schema
      heading: '',        // ✅ matches schema
      title: '',          // ✅ matches schema
      video: null         // ✅ matches schema (file upload)
    });
    setCurrentCountry(null);
    setIsModalOpen(false);
  };



  // Filter countries by search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.capital?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.continent?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCountries();
    fetchContinents();
  }, []);

  useEffect(() => {
    fetchCountries(selectedContinent);
  }, [selectedContinent]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FaGlobe className="text-blue-600" />
                Countries Management
              </h1>
              <p className="text-gray-600 mt-2">Manage countries and their information</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus />
              Add New Country
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <FaInfoCircle />
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <FaInfoCircle />
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries, capitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedContinent}
                onChange={(e) => setSelectedContinent(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Continents</option>
                {continents.map(continent => (
                  <option key={continent._id} value={continent._id}>
                    {continent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Countries Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCountries.map(country => (
              <div key={country._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Country Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
                  <h3 className="text-xl font-semibold">{country.name}</h3>
                  <p className="text-blue-100 text-sm">{country.continent?.name}</p>
                </div>

                {/* Country Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaMapMarkerAlt className="text-red-500" />
                    <span className="text-sm">Capital: {country.capital || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaDollarSign className="text-green-500" />
                    <span className="text-sm">Currency: {country.currency || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaClock className="text-blue-500" />
                    <span className="text-sm">Timezone: {country.timezone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPassport className="text-purple-500" />
                    <span className="text-sm">Visa: {country.visa || 'N/A'}</span>
                  </div>
                  
                  {country.bestTimeToVisit && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCalendarAlt className="text-orange-500" />
                      <span className="text-sm">Best Time: {country.bestTimeToVisit}</span>
                    </div>
                  )}

                  {country.info && (
                    <p className="text-gray-600 text-sm line-clamp-2">{country.info}</p>
                  )}

                  {country.video && (
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <FaVideo className="text-red-500" />
                      <span className="text-sm text-red-600 font-medium">Video Available</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => fetchCountryDetails(country._id)}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <FaEye />
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(country._id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCountries.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaGlobe className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">No countries found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Add New Country
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({...formData, name: e.target.value});
                        // Clear error when user types
                        if (error && error.includes('already exists')) {
                          setError('');
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        checkDuplicateName(formData.name) 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter country name"
                    />
                    {checkDuplicateName(formData.name) && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <FaInfoCircle />
                        A country with this name already exists
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Continent *
                    </label>
                    <select
                      required
                      value={formData.continentId}
                      onChange={(e) => setFormData({...formData, continentId: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Continent</option>
                      {continents.map(continent => (
                        <option key={continent._id} value={continent._id}>
                          {continent.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capital
                    </label>
                    <input
                      type="text"
                      value={formData.capital}
                      onChange={(e) => setFormData({...formData, capital: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter capital city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter currency"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visa Requirements
                    </label>
                    <input
                      type="text"
                      value={formData.visa}
                      onChange={(e) => setFormData({...formData, visa: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter visa requirements"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={formData.timezone}
                      onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter timezone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Best Time to Visit
                    </label>
                    <input
                      type="text"
                      value={formData.bestTimeToVisit}
                      onChange={(e) => setFormData({...formData, bestTimeToVisit: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter best time to visit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heading
                    </label>
                    <input
                      type="text"
                      value={formData.heading}
                      onChange={(e) => setFormData({...formData, heading: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter heading"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter title"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Information
                    </label>
                    <textarea
                      value={formData.info}
                      onChange={(e) => setFormData({...formData, info: e.target.value})}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter country information"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Upload
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setFormData({...formData, video: e.target.files[0]})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">Upload a video file (optional)</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading || checkDuplicateName(formData.name)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {loading ? 'Saving...' : 'Create Country'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {isViewModalOpen && currentCountry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaGlobe className="text-blue-600" />
                    {currentCountry.name}
                  </h2>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-500" />
                        <span className="font-medium">Capital:</span>
                        <span>{currentCountry.capital || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-green-500" />
                        <span className="font-medium">Currency:</span>
                        <span>{currentCountry.currency || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-blue-500" />
                        <span className="font-medium">Timezone:</span>
                        <span>{currentCountry.timezone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPassport className="text-purple-500" />
                        <span className="font-medium">Visa:</span>
                        <span>{currentCountry.visa || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-orange-500" />
                        <span className="font-medium">Best Time to Visit:</span>
                        <span>{currentCountry.bestTimeToVisit || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Continent:</span>
                        <span className="ml-2">{currentCountry.continent?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Heading:</span>
                        <span className="ml-2">{currentCountry.heading || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Title:</span>
                        <span className="ml-2">{currentCountry.title || 'N/A'}</span>
                      </div>
                      {currentCountry.video && (
                        <div className="flex items-center gap-2">
                          <FaVideo className="text-red-500" />
                          <span className="font-medium">Video Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {currentCountry.info && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Information</h3>
                    <p className="text-gray-600 leading-relaxed">{currentCountry.info}</p>
                  </div>
                )}

                {currentCountry.video && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaVideo className="text-red-500" />
                      Country Video
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <video 
                        controls 
                        className="w-full max-w-2xl h-64 bg-black rounded-lg shadow-lg"
                        preload="metadata"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'block';
                        }}
                      >
                        <source 
                          src={currentCountry.video.startsWith('http') 
                            ? currentCountry.video 
                            : `${baseURL}/${currentCountry.video}`
                          } 
                          type="video/mp4" 
                        />
                        <source 
                          src={currentCountry.video.startsWith('http') 
                            ? currentCountry.video 
                            : `${baseURL}/${currentCountry.video}`
                          } 
                          type="video/webm" 
                        />
                        Your browser does not support the video tag.
                      </video>
                      <div className="hidden bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mt-2">
                        <div className="flex items-center gap-2">
                          <FaInfoCircle />
                          <span className="font-medium">Video could not be loaded</span>
                        </div>
                        <p className="text-sm mt-1">The video file may be corrupted or in an unsupported format.</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Video path: {currentCountry.video}
                      </p>
                    </div>
                  </div>
                )}

                {destinations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Destinations ({destinations.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {destinations.map(destination => (
                        <div key={destination._id} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900">{destination.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{destination.description}</p>
                          {destination.images && destination.images.length > 0 && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                              <FaImages />
                              {destination.images.length} image(s)
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Country;