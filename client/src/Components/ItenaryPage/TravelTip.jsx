import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaImage, 
  FaSpinner, 
  FaGlobe,
  FaMapMarkerAlt,
  FaHeading,
  FaLightbulb,
  FaCheckCircle,
  FaWindowClose,
  FaSearch,
  FaPlus as FaAddTip
} from 'react-icons/fa';
import { travelTipAPI, getImageUrl } from '../../services/travelTipAPI';
import { countryAPI, continentAPI } from '../../services/itenaryAPI';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TravelTip = () => {
  // State for travel tips
  const [travelTips, setTravelTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State for form data
  const [formData, setFormData] = useState({
    country: '',
    mainHeading: '',
    mainImage: null,
    tips: ['']
  });
  
  // State for form visuals
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // State for countries/continents filtering
  const [countries, setCountries] = useState([]);
  const [continents, setContinents] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch travel tips
  const fetchTravelTips = async () => {
    setLoading(true);
    try {
      const data = await travelTipAPI.getAll();
      setTravelTips(data);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch travel tips' });
      toast.error('Failed to fetch travel tips');
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
    fetchTravelTips();
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
        mainImage: file
      }));
      
      // Create preview
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // Handle tip input changes
  const handleTipChange = (index, value) => {
    const updatedTips = [...formData.tips];
    updatedTips[index] = value;
    
    setFormData(prev => ({
      ...prev,
      tips: updatedTips
    }));
  };
  
  // Add new tip
  const addTip = () => {
    setFormData(prev => ({
      ...prev,
      tips: [...prev.tips, '']
    }));
  };
  
  // Remove tip
  const removeTip = (index) => {
    if (formData.tips.length <= 1) {
      toast.warning('At least one travel tip is required');
      return;
    }
    
    const updatedTips = formData.tips.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      tips: updatedTips
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validation
      if (!formData.country || !formData.mainHeading) {
        throw new Error('Country and main heading are required');
      }
      
      // Validate all tips have content
      const invalidTips = formData.tips.some(tip => !tip.trim());
      if (invalidTips) {
        throw new Error('All travel tips must have content');
      }
      
      // Check if image is provided when creating a new travel tip
      if (!editingId && !formData.mainImage) {
        throw new Error('Main image is required for new travel tips');
      }
      
      // Create or update travel tip
      let response;
      if (editingId) {
        response = await travelTipAPI.update(editingId, formData);
        toast.success('Travel tip updated successfully');
      } else {
        response = await travelTipAPI.create(formData);
        toast.success('Travel tip created successfully');
      }
      
      // Reset form
      resetForm();
      
      // Refresh travel tips list
      fetchTravelTips();
      
    } catch (error) {
      toast.error(error.message || 'Failed to save travel tip');
      setMessage({ type: 'error', text: error.message || 'Failed to save travel tip' });
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      country: '',
      mainHeading: '',
      mainImage: null,
      tips: ['']
    });
    
    // Clear preview
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    
    // Clear editing state
    setEditingId(null);
  };
  
  // Handle edit travel tip
  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const travelTip = await travelTipAPI.getById(id);
      
      setFormData({
        country: travelTip.country._id || travelTip.country,
        mainHeading: travelTip.mainHeading,
        mainImage: null, // No file, just keep existing image
        tips: travelTip.tips || ['']
      });
      
      // Set image preview if image exists
      if (travelTip.mainImage) {
        setImagePreview(getImageUrl(travelTip.mainImage));
      }
      
      setEditingId(id);
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      toast.error('Failed to load travel tip for editing');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete travel tip
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this travel tip?')) {
      setLoading(true);
      try {
        await travelTipAPI.delete(id);
        toast.success('Travel tip deleted successfully');
        fetchTravelTips();
      } catch (error) {
        toast.error('Failed to delete travel tip');
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
      
      <h1 className="text-2xl font-bold mb-6">Travel Tips Management</h1>
      
      {/* Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Travel Tip' : 'Add New Travel Tip'}
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
          
          {/* Main Heading */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              <FaHeading className="inline mr-2" /> Main Heading
            </label>
            <input
              type="text"
              name="mainHeading"
              className="w-full p-2 border rounded"
              value={formData.mainHeading}
              onChange={handleInputChange}
              placeholder="Enter main heading"
              required
            />
          </div>
          
          {/* Main Image */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              <FaImage className="inline mr-2" /> Main Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="mainImage"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <label
                htmlFor="mainImage"
                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 flex items-center"
              >
                <FaImage className="mr-2" /> Choose Image
              </label>
              <span className="text-gray-500 text-sm">
                {formData.mainImage ? formData.mainImage.name : (editingId && !formData.mainImage ? 'Current image will be kept' : 'No image selected')}
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
          
          {/* Travel Tips */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700">
                <FaLightbulb className="inline mr-2" /> Travel Tips
              </label>
              <button
                type="button"
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center"
                onClick={addTip}
              >
                <FaAddTip className="mr-1" /> Add Tip
              </button>
            </div>
            
            {formData.tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2 mb-2">
                <textarea
                  className="flex-grow p-2 border rounded"
                  value={tip}
                  onChange={(e) => handleTipChange(index, e.target.value)}
                  placeholder={`Enter travel tip #${index + 1}`}
                  rows="2"
                  required
                />
                <button
                  type="button"
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  onClick={() => removeTip(index)}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
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
      
      {/* Travel Tips List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Travel Tips List</h2>
        
        {loading && !editingId ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-3xl text-blue-500" />
          </div>
        ) : travelTips.length === 0 ? (
          <div className="bg-gray-100 p-4 text-center rounded">
            No travel tips found. Add your first one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Image</th>
                  <th className="py-2 px-4 text-left">Country</th>
                  <th className="py-2 px-4 text-left">Main Heading</th>
                  <th className="py-2 px-4 text-left">Tips</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {travelTips.map(tip => (
                  <tr key={tip._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      {tip.mainImage ? (
                        <img
                          src={getImageUrl(tip.mainImage)}
                          alt={tip.mainHeading}
                          className="h-16 w-24 object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-24 bg-gray-200 flex items-center justify-center rounded">
                          <FaImage className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4">{tip.country?.name || 'Unknown'}</td>
                    <td className="py-2 px-4">{tip.mainHeading}</td>
                    <td className="py-2 px-4">
                      {tip.tips && tip.tips.length > 0 ? (
                        <span>{tip.tips.length} tips</span>
                      ) : (
                        <span className="text-gray-400">No tips</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(tip._id)}
                          className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(tip._id)}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelTip;
