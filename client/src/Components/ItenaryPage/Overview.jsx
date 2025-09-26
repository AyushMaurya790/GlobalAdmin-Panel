import React, { useState, useEffect } from 'react';
import { 
  FaImage, 
  FaPlus, 
  FaSpinner, 
  FaEdit, 
  FaTrash, 
  FaGlobe,
  FaMapMarkerAlt,
  FaHeading,
  FaList,
  FaInfoCircle,
  FaCheckCircle,
  FaWindowClose,
  FaSearch
} from 'react-icons/fa';
import { viewAPI, countryAPI, continentAPI, getImageUrl } from '../../services/itenaryAPI';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Overview = () => {
  // State for views data
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State for form data
  const [formData, setFormData] = useState({
    country: '',
    heading: '',
    description: '',
    image: null,
    features: [{ title: '', description: '' }]
  });
  const [featureIcons, setFeatureIcons] = useState([null]);
  const [imagePreview, setImagePreview] = useState(null);
  const [featureIconPreviews, setFeatureIconPreviews] = useState([null]);
  
  // State for editing
  const [editingId, setEditingId] = useState(null);
  
  // State for filtering and countries/continents
  const [countries, setCountries] = useState([]);
  const [continents, setContinents] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for viewing details
  const [selectedView, setSelectedView] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch views data
  const fetchViews = async () => {
    setLoading(true);
    try {
      const data = await viewAPI.getAll();
      setViews(data);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch views' });
      toast.error('Failed to fetch views');
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
    fetchViews();
    fetchContinents();
    fetchCountries();
    
    // Cleanup function for previews
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      featureIconPreviews.forEach(preview => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
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

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(previewUrl);
    }
  };

  // Handle viewing details
  const handleViewDetails = (view) => {
    setSelectedView(view);
    setShowDetailsModal(true);
  };

  // Handle feature changes
  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };

  // Handle feature icon changes
  const handleFeatureIconChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedIcons = [...featureIcons];
      updatedIcons[index] = file;
      setFeatureIcons(updatedIcons);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      const updatedPreviews = [...featureIconPreviews];
      
      // Revoke old preview URL if exists
      if (updatedPreviews[index] && updatedPreviews[index].startsWith('blob:')) {
        URL.revokeObjectURL(updatedPreviews[index]);
      }
      
      updatedPreviews[index] = previewUrl;
      setFeatureIconPreviews(updatedPreviews);
    }
  };

  // Add new feature field
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { title: '', description: '' }]
    }));
    setFeatureIcons(prev => [...prev, null]);
    setFeatureIconPreviews(prev => [...prev, null]);
  };

  // Remove feature field
  const removeFeature = (index) => {
    if (formData.features.length <= 1) {
      toast.warning('At least one feature is required');
      return;
    }
    
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    const updatedIcons = featureIcons.filter((_, i) => i !== index);
    const updatedPreviews = featureIconPreviews.filter((_, i) => i !== index);
    
    // Revoke the preview URL being removed
    if (featureIconPreviews[index] && featureIconPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(featureIconPreviews[index]);
    }
    
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
    setFeatureIcons(updatedIcons);
    setFeatureIconPreviews(updatedPreviews);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validation
      if (!formData.country || !formData.heading || !formData.description) {
        throw new Error('Country, heading, and description are required');
      }
      
      if (!editingId && !formData.image) {
        throw new Error('Main image is required');
      }
      
      // Check if all features have icons when creating new view
      if (!editingId) {
        const missingIcons = featureIcons.some(icon => !icon);
        if (missingIcons) {
          throw new Error('Each feature must have an icon');
        }
      }
      
      const viewDataToSubmit = {
        ...formData,
        featureIcons
      };
      
      let response;
      if (editingId) {
        // Update existing view
        response = await viewAPI.update(editingId, viewDataToSubmit);
        toast.success('View updated successfully');
      } else {
        // Create new view
        response = await viewAPI.create(viewDataToSubmit);
        toast.success('View created successfully');
      }
      
      // Reset form and refresh views
      resetForm();
      fetchViews();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to save view';
      setMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Edit view
  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const view = await viewAPI.getById(id);
      
      setEditingId(id);
      setFormData({
        country: view.country._id,
        heading: view.heading,
        description: view.description,
        image: null, // Keep null as we don't want to force image upload on edit
        features: view.features.map(f => ({
          title: f.title,
          description: f.description
        }))
      });
      
      // Set image preview from existing image
      setImagePreview(getImageUrl(view.image));
      
      // Set feature icon previews from existing icons
      setFeatureIconPreviews(view.features.map(f => getImageUrl(f.icon)));
      
      // Reset feature icons array but with correct length
      setFeatureIcons(Array(view.features.length).fill(null));
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      toast.error('Failed to load view for editing');
    } finally {
      setLoading(false);
    }
  };

  // Delete view
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this view?')) {
      return;
    }
    
    setLoading(true);
    try {
      await viewAPI.delete(id);
      toast.success('View deleted successfully');
      fetchViews();
    } catch (error) {
      toast.error('Failed to delete view');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      country: '',
      heading: '',
      description: '',
      image: null,
      features: [{ title: '', description: '' }]
    });
    setFeatureIcons([null]);
    
    // Clear previews
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    
    featureIconPreviews.forEach(preview => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    setFeatureIconPreviews([null]);
  };

  // Filter views by search term
  const filteredViews = views.filter(view => {
    const searchLower = searchTerm.toLowerCase();
    return (
      view.heading.toLowerCase().includes(searchLower) ||
      view.country.name.toLowerCase().includes(searchLower) ||
      view.country.continent.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-blue-800">
        <FaGlobe className="inline-block mr-2 mb-1" />
        Itinerary Overview Management
      </h1>
      
      {/* Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? 'Edit Overview' : 'Add New Overview'}
        </h2>
        
        {message.text && (
          <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Country Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="country">
              Country <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <select 
                className="w-1/3 p-2 border rounded" 
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
              
              <select 
                id="country"
                name="country"
                className="w-2/3 p-2 border rounded" 
                value={formData.country} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select a Country</option>
                {countries.map(country => (
                  <option key={country._id} value={country._id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Heading */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="heading">
              Heading <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="heading" 
              name="heading" 
              value={formData.heading} 
              onChange={handleInputChange} 
              className="w-full p-2 border rounded" 
              required 
            />
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              className="w-full p-2 border rounded" 
              rows="4" 
              required 
            />
          </div>
          
          {/* Main Image */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="image">
              Main Image {editingId && '(Leave empty to keep current image)'} {!editingId && <span className="text-red-500">*</span>}
            </label>
            <input 
              type="file" 
              id="image" 
              name="image" 
              onChange={handleImageChange} 
              className="w-full p-2 border rounded" 
              accept="image/*" 
              required={!editingId} 
            />
            
            {imagePreview && (
              <div className="mt-2">
                <p className="text-gray-700 mb-2">Image Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Main Preview" 
                  className="w-64 h-auto object-cover border rounded" 
                />
              </div>
            )}
          </div>
          
          {/* Features Section */}
          <div className="mb-4 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                <FaList className="inline-block mr-2 mb-1" />
                Features
              </h3>
              <button 
                type="button" 
                onClick={addFeature} 
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                <FaPlus className="inline-block mr-1" /> Add Feature
              </button>
            </div>
            
            {formData.features.map((feature, index) => (
              <div key={index} className="p-4 border rounded mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Feature #{index + 1}</h4>
                  {formData.features.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeFeature(index)} 
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash className="inline-block" />
                    </button>
                  )}
                </div>
                
                {/* Feature Title */}
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1" htmlFor={`feature-title-${index}`}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id={`feature-title-${index}`}
                    value={feature.title} 
                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)} 
                    className="w-full p-2 border rounded" 
                    required 
                  />
                </div>
                
                {/* Feature Description */}
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1" htmlFor={`feature-desc-${index}`}>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id={`feature-desc-${index}`}
                    value={feature.description} 
                    onChange={(e) => handleFeatureChange(index, 'description', e.target.value)} 
                    className="w-full p-2 border rounded" 
                    rows="2" 
                    required 
                  />
                </div>
                
                {/* Feature Icon */}
                <div>
                  <label className="block text-gray-700 mb-1" htmlFor={`feature-icon-${index}`}>
                    Icon {editingId && '(Leave empty to keep current icon)'} {!editingId && <span className="text-red-500">*</span>}
                  </label>
                  <input 
                    type="file" 
                    id={`feature-icon-${index}`}
                    onChange={(e) => handleFeatureIconChange(index, e)} 
                    className="w-full p-2 border rounded" 
                    accept="image/*" 
                    required={!editingId && !featureIconPreviews[index]} 
                  />
                  
                  {featureIconPreviews[index] && (
                    <div className="mt-2">
                      <img 
                        src={featureIconPreviews[index]} 
                        alt={`Feature ${index + 1} Icon`} 
                        className="w-16 h-16 object-cover border rounded" 
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Form Buttons */}
          <div className="flex items-center mt-6">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 flex items-center" 
              disabled={loading}
            >
              {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaCheckCircle className="mr-2" />}
              {editingId ? 'Update Overview' : 'Save Overview'}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center"
              >
                <FaWindowClose className="mr-2" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Views Listing Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            <FaGlobe className="inline-block mr-2 mb-1" />
            Overview Sections
          </h2>
          
          {/* Search & Filter */}
          <div className="flex">
            <div className="relative">
              <input
                type="text"
                placeholder="Search overviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 pr-8 border rounded"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Views Table */}
        {loading && !editingId ? (
          <div className="flex justify-center my-8">
            <FaSpinner className="animate-spin text-blue-500 text-4xl" />
          </div>
        ) : filteredViews.length === 0 ? (
          <p className="text-gray-500 my-4">No overview sections found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Country</th>
                  <th className="py-2 px-4 border-b text-left">Continent</th>
                  <th className="py-2 px-4 border-b text-left">Heading</th>
                  <th className="py-2 px-4 border-b text-left">Image</th>
                  <th className="py-2 px-4 border-b text-left">Features</th>
                  <th className="py-2 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredViews.map(view => (
                  <tr key={view._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{view.country.name}</td>
                    <td className="py-2 px-4 border-b">{view.country.continent.name}</td>
                    <td className="py-2 px-4 border-b">{view.heading}</td>
                    <td className="py-2 px-4 border-b">
                      {view.image && (
                        <img
                          src={getImageUrl(view.image)}
                          alt={view.heading}
                          className="w-16 h-12 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="relative group">
                        <button className="text-blue-500 hover:text-blue-700 flex items-center">
                          {view.features.length} features <FaInfoCircle className="ml-1" />
                        </button>
                        <div className="absolute left-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-4 hidden group-hover:block z-10">
                          <h4 className="font-bold text-lg mb-2">{view.heading}</h4>
                          <p className="text-sm mb-3">{view.description}</p>
                          <div className="space-y-3">
                            {view.features.map(feature => (
                              <div key={feature._id} className="flex bg-gray-50 p-2 rounded">
                                {feature.icon && (
                                  <img 
                                    src={getImageUrl(feature.icon)} 
                                    alt={feature.title} 
                                    className="w-10 h-10 object-cover rounded mr-2" 
                                  />
                                )}
                                <div>
                                  <h5 className="font-semibold">{feature.title}</h5>
                                  <p className="text-xs text-gray-600">{feature.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        onClick={() => handleEdit(view._id)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(view._id)}
                        className="text-red-500 hover:text-red-700 mr-2"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => handleViewDetails(view)}
                        className="text-green-500 hover:text-green-700"
                        title="View Details"
                      >
                        <FaInfoCircle />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Details Modal */}
      {showDetailsModal && selectedView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Overview Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaWindowClose className="text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Basic Info */}
              <div className="mb-6">
                <div className="flex flex-wrap md:flex-nowrap gap-6">
                  <div className="w-full md:w-1/3">
                    {selectedView.image && (
                      <img 
                        src={getImageUrl(selectedView.image)} 
                        alt={selectedView.heading}
                        className="w-full h-64 object-cover rounded-lg shadow-md" 
                      />
                    )}
                  </div>
                  <div className="w-full md:w-2/3">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedView.heading}</h3>
                    <div className="mb-3 text-sm text-gray-600 flex items-center">
                      <FaGlobe className="mr-2" />
                      <span>{selectedView.country.continent.name} / {selectedView.country.name}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{selectedView.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Features */}
              <div>
                <h4 className="text-xl font-semibold mb-4 border-b pb-2">Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedView.features.map(feature => (
                    <div key={feature._id} className="bg-gray-50 rounded-lg p-4 flex">
                      {feature.icon && (
                        <div className="mr-4">
                          <img 
                            src={getImageUrl(feature.icon)} 
                            alt={feature.title}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm" 
                          />
                        </div>
                      )}
                      <div>
                        <h5 className="font-bold text-gray-800 mb-1">{feature.title}</h5>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
