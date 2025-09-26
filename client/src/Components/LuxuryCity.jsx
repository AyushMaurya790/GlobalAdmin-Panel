import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaSearch, 
  FaStar,
  FaMapMarkerAlt,
  FaTimes,
  FaSave,
  FaSpinner,
  FaInfoCircle,
  FaCalendarAlt,
  FaCrown
} from 'react-icons/fa';

const LuxuryCity = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
  });

  const baseURL = 'http://globe.ridealmobility.com';

  // Fetch cities
  const fetchCities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/luxury-cities`);
      if (!response.ok) throw new Error('Failed to fetch luxury cities');
      
      const data = await response.json();
      setCities(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if city name already exists
  const checkDuplicateName = (name) => {
    const existingCity = cities.find(city => 
      city.name.toLowerCase() === name.toLowerCase()
    );
    return existingCity;
  };

  // Create city
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for duplicate name before submission
    const duplicate = checkDuplicateName(formData.name);
    if (duplicate) {
      setError(`A luxury city with the name "${formData.name}" already exists. Please use a different name.`);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${baseURL}/api/luxury-cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (result.message && result.message.includes('unique')) {
          throw new Error(`A luxury city with the name "${formData.name}" already exists. Please use a different name.`);
        }
        throw new Error(result.message || 'Failed to create luxury city');
      }

      setSuccess(result.message);
      resetForm();
      fetchCities();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete city
  const handleDelete = async (cityId) => {
    if (!window.confirm('Are you sure you want to delete this luxury city?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/luxury-cities/${cityId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete luxury city');

      const result = await response.json();
      setSuccess(result.message);
      fetchCities();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: ''
    });
    setIsModalOpen(false);
  };

  // Filter cities by search term
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCities();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-purple-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <FaCrown className="text-yellow-500" />
                Luxury Cities Management
              </h1>
              <p className="text-gray-600 mt-2">Manage premium luxury destinations and cities</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <FaPlus />
              Add Luxury City
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
            <FaInfoCircle />
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
            <FaInfoCircle />
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-purple-100">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search luxury cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Cities Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading luxury cities...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCities.map(city => (
              <div key={city._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-purple-100">
                {/* City Header */}
                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <FaStar className="text-yellow-300" />
                      <span className="text-sm font-medium opacity-90">Luxury Destination</span>
                    </div>
                    <h3 className="text-xl font-bold">{city.name}</h3>
                  </div>
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
                  <div className="absolute -right-8 -bottom-8 w-20 h-20 bg-white bg-opacity-5 rounded-full"></div>
                </div>

                {/* City Details */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaMapMarkerAlt className="text-purple-500" />
                    <span className="text-sm font-medium">Premium Location</span>
                  </div>
                  
                  {city.createdAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCalendarAlt className="text-pink-500" />
                      <span className="text-sm">Added: {new Date(city.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => handleDelete(city._id)}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors font-medium"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCities.length === 0 && !loading && (
          <div className="text-center py-16">
            <FaCrown className="text-8xl text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl text-gray-600 mb-3">No luxury cities found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first luxury destination'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto transition-all transform hover:scale-105 shadow-lg"
              >
                <FaPlus />
                Add First Luxury City
              </button>
            )}
          </div>
        )}

        {/* Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaCrown className="text-yellow-500" />
                    Add Luxury City
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Luxury City Name *
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
                    className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      checkDuplicateName(formData.name) 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter luxury city name"
                  />
                  {checkDuplicateName(formData.name) && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <FaInfoCircle />
                      A luxury city with this name already exists
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading || checkDuplicateName(formData.name)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all font-medium shadow-lg"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {loading ? 'Creating...' : 'Create City'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default LuxuryCity;