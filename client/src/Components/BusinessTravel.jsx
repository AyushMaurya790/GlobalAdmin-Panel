import React, { useState, useEffect } from 'react';
import { 
  FaImage, 
  FaPlus, 
  FaSpinner, 
  FaEdit, 
  FaTrash, 
  FaBriefcase,
  FaCheckCircle,
  FaLightbulb,
  FaArrowRight,
  FaPlane
} from 'react-icons/fa';
import { heroAPI, serviceAPI, featureAPI, stepAPI, getImageUrl } from '../services/businessAPI';

const BusinessTravel = () => {
  const [activeTab, setActiveTab] = useState('hero');
  
  // Hero Section State
  const [heroes, setHeroes] = useState([]);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroMessage, setHeroMessage] = useState({ type: '', text: '' });
  const [heroForm, setHeroForm] = useState({
    title: '',
    subtitle: '',
    backgroundImage: []
  });
  const [editingHeroId, setEditingHeroId] = useState(null);
  const [heroPreview, setHeroPreview] = useState([]);
  const [existingHeroImages, setExistingHeroImages] = useState([]);

  // Service Section State
  const [services, setServices] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceMessage, setServiceMessage] = useState({ type: '', text: '' });
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    highlights: [''],
    image: null
  });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [servicePreview, setServicePreview] = useState(null);
  const [existingServiceImage, setExistingServiceImage] = useState(null);

  // Feature Section State
  const [features, setFeatures] = useState([]);
  const [featureLoading, setFeatureLoading] = useState(false);
  const [featureMessage, setFeatureMessage] = useState({ type: '', text: '' });
  const [featureForm, setFeatureForm] = useState({
    title: '',
    description: '',
    icon: null
  });
  const [editingFeatureId, setEditingFeatureId] = useState(null);
  const [featurePreview, setFeaturePreview] = useState(null);
  const [existingFeatureIcon, setExistingFeatureIcon] = useState(null);

  // Step Section State
  const [steps, setSteps] = useState([]);
  const [stepLoading, setStepLoading] = useState(false);
  const [stepMessage, setStepMessage] = useState({ type: '', text: '' });
  const [stepForm, setStepForm] = useState({
    stepTitle: '',
    contentTitle: '',
    description: '',
    order: '',
    icon: null,
    images: []
  });
  const [editingStepId, setEditingStepId] = useState(null);
  const [stepIconPreview, setStepIconPreview] = useState(null);
  const [stepImagesPreview, setStepImagesPreview] = useState([]);
  const [existingStepIcon, setExistingStepIcon] = useState(null);
  const [existingStepImages, setExistingStepImages] = useState([]);

  // Tabs configuration
  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: <FaImage /> },
    { id: 'services', name: 'Travel Services', icon: <FaBriefcase /> },
    { id: 'features', name: 'Why Choose Us', icon: <FaLightbulb /> },
    { id: 'steps', name: 'Brief Steps', icon: <FaArrowRight /> }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchHeroes();
    fetchServices();
    fetchFeatures();
    fetchSteps();
  }, []);

  // ==================== Hero Section Functions ====================
  const fetchHeroes = async () => {
    try {
      setHeroLoading(true);
      const response = await heroAPI.getAll();
      setHeroes(response || []);
    } catch (error) {
      setHeroMessage({ type: 'error', text: 'Failed to fetch heroes' });
    } finally {
      setHeroLoading(false);
    }
  };

  const handleHeroImageChange = (e) => {
    const files = Array.from(e.target.files);
    setHeroForm(prev => ({
      ...prev,
      backgroundImage: files
    }));
    
    // Create previews for selected images
    const previews = files.map(file => URL.createObjectURL(file));
    setHeroPreview(previews);
  };

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    try {
      setHeroLoading(true);
      let response;
      
      if (editingHeroId) {
        response = await heroAPI.update(editingHeroId, heroForm);
      } else {
        response = await heroAPI.create(heroForm);
      }
      
      if (response) {
        setHeroMessage({ type: 'success', text: editingHeroId ? 'Hero updated successfully!' : 'Hero created successfully!' });
        setHeroForm({ title: '', subtitle: '', backgroundImage: [] });
        setEditingHeroId(null);
        setHeroPreview([]);
        setExistingHeroImages([]);
        document.getElementById('heroImages').value = '';
        fetchHeroes();
      }
    } catch (error) {
      setHeroMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setHeroLoading(false);
    }
  };

  const handleHeroEdit = (hero) => {
    setHeroForm({
      title: hero.title,
      subtitle: hero.subtitle,
      backgroundImage: [] // Cannot pre-fill files
    });
    setEditingHeroId(hero._id);
    // Set existing images for preview
    setExistingHeroImages(hero.backgroundImage || []);
    setHeroPreview([]);
    setHeroMessage({ type: '', text: '' });
  };

  const handleHeroDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hero?')) {
      try {
        setHeroLoading(true);
        const response = await heroAPI.delete(id);
        if (response) {
          setHeroMessage({ type: 'success', text: response.message || 'Hero deleted successfully!' });
          fetchHeroes();
        }
      } catch (error) {
        setHeroMessage({ type: 'error', text: 'Failed to delete hero' });
      } finally {
        setHeroLoading(false);
      }
    }
  };

  // ==================== Service Section Functions ====================
  const fetchServices = async () => {
    try {
      setServiceLoading(true);
      const response = await serviceAPI.getAll();
      setServices(response || []);
    } catch (error) {
      setServiceMessage({ type: 'error', text: 'Failed to fetch services' });
    } finally {
      setServiceLoading(false);
    }
  };

  const handleServiceImageChange = (e) => {
    const file = e.target.files[0];
    setServiceForm(prev => ({
      ...prev,
      image: file
    }));
    
    // Create preview for selected image
    if (file) {
      setServicePreview(URL.createObjectURL(file));
    }
  };

  const handleAddHighlight = () => {
    setServiceForm(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const handleRemoveHighlight = (index) => {
    setServiceForm(prev => {
      const newHighlights = [...prev.highlights];
      newHighlights.splice(index, 1);
      return {
        ...prev,
        highlights: newHighlights
      };
    });
  };

  const handleHighlightChange = (index, value) => {
    setServiceForm(prev => {
      const newHighlights = [...prev.highlights];
      newHighlights[index] = value;
      return {
        ...prev,
        highlights: newHighlights
      };
    });
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      setServiceLoading(true);
      let response;
      
      // Filter out empty highlights
      const filteredForm = {
        ...serviceForm,
        highlights: serviceForm.highlights.filter(h => h.trim() !== '')
      };
      
      if (editingServiceId) {
        response = await serviceAPI.update(editingServiceId, filteredForm);
      } else {
        response = await serviceAPI.create(filteredForm);
      }
      
      if (response) {
        setServiceMessage({ type: 'success', text: editingServiceId ? 'Service updated successfully!' : 'Service created successfully!' });
        setServiceForm({ title: '', description: '', highlights: [''], image: null });
        setEditingServiceId(null);
        setServicePreview(null);
        setExistingServiceImage(null);
        document.getElementById('serviceImage').value = '';
        fetchServices();
      }
    } catch (error) {
      setServiceMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setServiceLoading(false);
    }
  };

  const handleServiceEdit = (service) => {
    setServiceForm({
      title: service.title,
      description: service.description,
      highlights: service.highlights && service.highlights.length > 0 ? service.highlights : [''],
      image: null // Cannot pre-fill files
    });
    setEditingServiceId(service._id);
    // Set existing image for preview
    setExistingServiceImage(service.image);
    setServicePreview(null); // Clear new image preview
    setServiceMessage({ type: '', text: '' });
  };

  const handleServiceDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        setServiceLoading(true);
        const response = await serviceAPI.delete(id);
        if (response) {
          setServiceMessage({ type: 'success', text: response.message || 'Service deleted successfully!' });
          fetchServices();
        }
      } catch (error) {
        setServiceMessage({ type: 'error', text: 'Failed to delete service' });
      } finally {
        setServiceLoading(false);
      }
    }
  };

  // ==================== Feature Section Functions ====================
  const fetchFeatures = async () => {
    try {
      setFeatureLoading(true);
      const response = await featureAPI.getAll();
      setFeatures(response || []);
    } catch (error) {
      setFeatureMessage({ type: 'error', text: 'Failed to fetch features' });
    } finally {
      setFeatureLoading(false);
    }
  };

  const handleFeatureIconChange = (e) => {
    const file = e.target.files[0];
    setFeatureForm(prev => ({
      ...prev,
      icon: file
    }));
    
    // Create preview for selected icon
    if (file) {
      setFeaturePreview(URL.createObjectURL(file));
    }
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    try {
      setFeatureLoading(true);
      let response;
      
      if (editingFeatureId) {
        response = await featureAPI.update(editingFeatureId, featureForm);
      } else {
        response = await featureAPI.create(featureForm);
      }
      
      if (response) {
        setFeatureMessage({ type: 'success', text: editingFeatureId ? 'Feature updated successfully!' : 'Feature created successfully!' });
        setFeatureForm({ title: '', description: '', icon: null });
        setEditingFeatureId(null);
        setFeaturePreview(null);
        setExistingFeatureIcon(null);
        document.getElementById('featureIcon').value = '';
        fetchFeatures();
      }
    } catch (error) {
      setFeatureMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setFeatureLoading(false);
    }
  };

  const handleFeatureEdit = (feature) => {
    setFeatureForm({
      title: feature.title,
      description: feature.description,
      icon: null // Cannot pre-fill files
    });
    setEditingFeatureId(feature._id);
    // Set existing icon for preview
    setExistingFeatureIcon(feature.icon);
    setFeaturePreview(null); // Clear new icon preview
    setFeatureMessage({ type: '', text: '' });
  };

  const handleFeatureDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        setFeatureLoading(true);
        const response = await featureAPI.delete(id);
        if (response) {
          setFeatureMessage({ type: 'success', text: response.message || 'Feature deleted successfully!' });
          fetchFeatures();
        }
      } catch (error) {
        setFeatureMessage({ type: 'error', text: 'Failed to delete feature' });
      } finally {
        setFeatureLoading(false);
      }
    }
  };

  // ==================== Step Section Functions ====================
  const fetchSteps = async () => {
    try {
      setStepLoading(true);
      const response = await stepAPI.getAll();
      setSteps(response || []);
    } catch (error) {
      setStepMessage({ type: 'error', text: 'Failed to fetch steps' });
    } finally {
      setStepLoading(false);
    }
  };

  const handleStepIconChange = (e) => {
    const file = e.target.files[0];
    setStepForm(prev => ({
      ...prev,
      icon: file
    }));
    
    // Create preview for selected icon
    if (file) {
      setStepIconPreview(URL.createObjectURL(file));
    }
  };

  const handleStepImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setStepForm(prev => ({
      ...prev,
      images: files
    }));
    
    // Create previews for selected images
    const previews = files.map(file => URL.createObjectURL(file));
    setStepImagesPreview(previews);
  };

  const handleStepSubmit = async (e) => {
    e.preventDefault();
    try {
      setStepLoading(true);
      let response;
      
      if (editingStepId) {
        response = await stepAPI.update(editingStepId, stepForm);
      } else {
        response = await stepAPI.create(stepForm);
      }
      
      if (response) {
        setStepMessage({ type: 'success', text: editingStepId ? 'Step updated successfully!' : 'Step created successfully!' });
        setStepForm({ stepTitle: '', contentTitle: '', description: '', order: '', icon: null, images: [] });
        setEditingStepId(null);
        setStepIconPreview(null);
        setStepImagesPreview([]);
        setExistingStepIcon(null);
        setExistingStepImages([]);
        document.getElementById('stepIcon').value = '';
        document.getElementById('stepImages').value = '';
        fetchSteps();
      }
    } catch (error) {
      setStepMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setStepLoading(false);
    }
  };

  const handleStepEdit = (step) => {
    setStepForm({
      stepTitle: step.stepTitle,
      contentTitle: step.contentTitle,
      description: step.description,
      order: step.order,
      icon: null, // Cannot pre-fill files
      images: [] // Cannot pre-fill files
    });
    setEditingStepId(step._id);
    // Set existing images for preview
    setExistingStepIcon(step.icon);
    setExistingStepImages(step.images || []);
    setStepIconPreview(null); // Clear new icon preview
    setStepImagesPreview([]); // Clear new images preview
    setStepMessage({ type: '', text: '' });
  };

  const handleStepDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this step?')) {
      try {
        setStepLoading(true);
        const response = await stepAPI.delete(id);
        if (response) {
          setStepMessage({ type: 'success', text: response.message || 'Step deleted successfully!' });
          fetchSteps();
        }
      } catch (error) {
        setStepMessage({ type: 'error', text: 'Failed to delete step' });
      } finally {
        setStepLoading(false);
      }
    }
  };

  // ==================== Render Sections ====================
  const renderHeroSection = () => {
    return (
      <div className="space-y-8">
        <form onSubmit={handleHeroSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {editingHeroId ? 'Edit Hero Section' : 'Add New Hero Section'}
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={heroForm.title}
              onChange={(e) => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
            <textarea
              value={heroForm.subtitle}
              onChange={(e) => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Images (Multiple)</label>
            <input
              id="heroImages"
              type="file"
              accept="image/*"
              onChange={handleHeroImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              multiple
              required={!editingHeroId}
            />
          </div>

          {editingHeroId && existingHeroImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
              <div className="flex flex-wrap gap-2">
                {existingHeroImages.map((img, index) => (
                  <img 
                    key={index} 
                    src={getImageUrl(img)} 
                    alt={`Current ${index + 1}`} 
                    className="h-24 w-auto object-cover rounded border border-green-300"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">Upload new images only if you want to replace existing ones</p>
            </div>
          )}
          
          {heroPreview.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Image Preview</p>
              <div className="flex flex-wrap gap-2">
                {heroPreview.map((url, index) => (
                  <img 
                    key={index} 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="h-24 w-auto object-cover rounded border border-gray-300"
                  />
                ))}
              </div>
            </div>
          )}
          
          {heroMessage.text && (
            <div className={`mb-4 p-3 rounded ${heroMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {heroMessage.text}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              disabled={heroLoading}
            >
              {heroLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {editingHeroId ? 'Update Hero' : 'Add Hero'}
                </>
              )}
            </button>
            
            {editingHeroId && (
              <button
                type="button"
                onClick={() => {
                  setHeroForm({ title: '', subtitle: '', backgroundImage: [] });
                  setEditingHeroId(null);
                  setHeroPreview([]);
                  setExistingHeroImages([]);
                  document.getElementById('heroImages').value = '';
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Existing Hero Sections</h3>
          
          {heroLoading && (
            <div className="flex justify-center items-center p-8">
              <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            </div>
          )}
          
          {!heroLoading && heroes.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center text-gray-500">
              No hero sections found. Create your first hero section above.
            </div>
          )}
          
          {!heroLoading && heroes.map((hero) => (
            <div key={hero._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold mb-1">{hero.title}</h4>
                  <p className="text-gray-600">{hero.subtitle}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleHeroEdit(hero)}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleHeroDelete(hero._id)}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              {hero.backgroundImage && hero.backgroundImage.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Background Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {hero.backgroundImage.map((img, index) => (
                      <img 
                        key={index} 
                        src={getImageUrl(img)} 
                        alt={`Hero Background ${index + 1}`} 
                        className="h-24 w-auto object-cover rounded border border-gray-300" 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderServiceSection = () => {
    return (
      <div className="space-y-8">
        <form onSubmit={handleServiceSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {editingServiceId ? 'Edit Travel Service' : 'Add New Travel Service'}
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={serviceForm.title}
              onChange={(e) => setServiceForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={serviceForm.description}
              onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Highlights</label>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <FaPlus className="mr-1" /> Add Highlight
              </button>
            </div>
            
            {serviceForm.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => handleHighlightChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Highlight ${index + 1}`}
                />
                {serviceForm.highlights.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(index)}
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Image</label>
            <input
              id="serviceImage"
              type="file"
              accept="image/*"
              onChange={handleServiceImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={!editingServiceId}
            />
          </div>

          {editingServiceId && existingServiceImage && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Image</p>
              <img 
                src={getImageUrl(existingServiceImage)} 
                alt="Current Service" 
                className="h-32 w-auto object-cover rounded border border-green-300" 
              />
              <p className="text-sm text-gray-600 mt-1">Upload new image only if you want to replace this one</p>
            </div>
          )}
          
          {servicePreview && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Image Preview</p>
              <img 
                src={servicePreview} 
                alt="Service Preview" 
                className="h-32 w-auto object-cover rounded border border-gray-300" 
              />
            </div>
          )}
          
          {serviceMessage.text && (
            <div className={`mb-4 p-3 rounded ${serviceMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {serviceMessage.text}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              disabled={serviceLoading}
            >
              {serviceLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {editingServiceId ? 'Update Service' : 'Add Service'}
                </>
              )}
            </button>
            
            {editingServiceId && (
              <button
                type="button"
                onClick={() => {
                  setServiceForm({ title: '', description: '', highlights: [''], image: null });
                  setEditingServiceId(null);
                  setServicePreview(null);
                  setExistingServiceImage(null);
                  document.getElementById('serviceImage').value = '';
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Existing Travel Services</h3>
          
          {serviceLoading && (
            <div className="flex justify-center items-center p-8">
              <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            </div>
          )}
          
          {!serviceLoading && services.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center text-gray-500">
              No travel services found. Create your first service above.
            </div>
          )}
          
          {!serviceLoading && services.map((service) => (
            <div key={service._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">{service.title}</h4>
                  <p className="text-gray-600 mb-2">{service.description}</p>
                  
                  {service.highlights && service.highlights.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Highlights:</p>
                      <ul className="list-disc list-inside text-gray-600">
                        {service.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {service.image && (
                  <img 
                    src={getImageUrl(service.image)} 
                    alt={service.title} 
                    className="ml-4 h-24 w-auto object-cover rounded border border-gray-300" 
                  />
                )}
              </div>
              
              <div className="flex space-x-2 justify-end mt-2">
                <button
                  onClick={() => handleServiceEdit(service)}
                  className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleServiceDelete(service._id)}
                  className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFeatureSection = () => {
    return (
      <div className="space-y-8">
        <form onSubmit={handleFeatureSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {editingFeatureId ? 'Edit Feature' : 'Add New Feature'}
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={featureForm.title}
              onChange={(e) => setFeatureForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={featureForm.description}
              onChange={(e) => setFeatureForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <input
              id="featureIcon"
              type="file"
              accept="image/*"
              onChange={handleFeatureIconChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={!editingFeatureId}
            />
          </div>

          {editingFeatureId && existingFeatureIcon && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Icon</p>
              <img 
                src={getImageUrl(existingFeatureIcon)} 
                alt="Current Feature Icon" 
                className="h-16 w-auto object-contain rounded border border-green-300" 
              />
              <p className="text-sm text-gray-600 mt-1">Upload new icon only if you want to replace this one</p>
            </div>
          )}
          
          {featurePreview && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Icon Preview</p>
              <img 
                src={featurePreview} 
                alt="Feature Icon Preview" 
                className="h-16 w-auto object-contain rounded border border-gray-300" 
              />
            </div>
          )}
          
          {featureMessage.text && (
            <div className={`mb-4 p-3 rounded ${featureMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {featureMessage.text}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              disabled={featureLoading}
            >
              {featureLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {editingFeatureId ? 'Update Feature' : 'Add Feature'}
                </>
              )}
            </button>
            
            {editingFeatureId && (
              <button
                type="button"
                onClick={() => {
                  setFeatureForm({ title: '', description: '', icon: null });
                  setEditingFeatureId(null);
                  setFeaturePreview(null);
                  setExistingFeatureIcon(null);
                  document.getElementById('featureIcon').value = '';
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Existing Features (Why Choose Us)</h3>
          
          {featureLoading && (
            <div className="flex justify-center items-center p-8">
              <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            </div>
          )}
          
          {!featureLoading && features.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center text-gray-500">
              No features found. Create your first feature above.
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!featureLoading && features.map((feature) => (
              <div key={feature._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center mb-3">
                  {feature.icon && (
                    <img 
                      src={getImageUrl(feature.icon)} 
                      alt={feature.title} 
                      className="h-10 w-10 object-contain mr-3" 
                    />
                  )}
                  <h4 className="text-lg font-semibold">{feature.title}</h4>
                </div>
                
                <p className="text-gray-600 mb-4">{feature.description}</p>
                
                <div className="flex space-x-2 justify-end">
                  <button
                    onClick={() => handleFeatureEdit(feature)}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleFeatureDelete(feature._id)}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStepSection = () => {
    return (
      <div className="space-y-8">
        <form onSubmit={handleStepSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {editingStepId ? 'Edit Step' : 'Add New Step'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Step Title</label>
              <input
                type="text"
                value={stepForm.stepTitle}
                onChange={(e) => setStepForm(prev => ({ ...prev, stepTitle: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Step 1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Title</label>
              <input
                type="text"
                value={stepForm.contentTitle}
                onChange={(e) => setStepForm(prev => ({ ...prev, contentTitle: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Plan Your Trip"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={stepForm.description}
              onChange={(e) => setStepForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Order (Numeric)</label>
            <input
              type="number"
              value={stepForm.order}
              onChange={(e) => setStepForm(prev => ({ ...prev, order: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 1"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <input
              id="stepIcon"
              type="file"
              accept="image/*"
              onChange={handleStepIconChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={!editingStepId}
            />
          </div>

          {editingStepId && existingStepIcon && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Icon</p>
              <img 
                src={getImageUrl(existingStepIcon)} 
                alt="Current Step Icon" 
                className="h-16 w-auto object-contain rounded border border-green-300" 
              />
              <p className="text-sm text-gray-600 mt-1">Upload new icon only if you want to replace this one</p>
            </div>
          )}
          
          {stepIconPreview && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Icon Preview</p>
              <img 
                src={stepIconPreview} 
                alt="Step Icon Preview" 
                className="h-16 w-auto object-contain rounded border border-gray-300" 
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Images (Multiple)</label>
            <input
              id="stepImages"
              type="file"
              accept="image/*"
              onChange={handleStepImagesChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              multiple
            />
          </div>

          {editingStepId && existingStepImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
              <div className="flex flex-wrap gap-2">
                {existingStepImages.map((img, index) => (
                  <img 
                    key={index} 
                    src={getImageUrl(img)} 
                    alt={`Current ${index + 1}`} 
                    className="h-24 w-auto object-cover rounded border border-green-300" 
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">Upload new images only if you want to replace existing ones</p>
            </div>
          )}
          
          {stepImagesPreview.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Images Preview</p>
              <div className="flex flex-wrap gap-2">
                {stepImagesPreview.map((url, index) => (
                  <img 
                    key={index} 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="h-24 w-auto object-cover rounded border border-gray-300" 
                  />
                ))}
              </div>
            </div>
          )}
          
          {stepMessage.text && (
            <div className={`mb-4 p-3 rounded ${stepMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {stepMessage.text}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              disabled={stepLoading}
            >
              {stepLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {editingStepId ? 'Update Step' : 'Add Step'}
                </>
              )}
            </button>
            
            {editingStepId && (
              <button
                type="button"
                onClick={() => {
                  setStepForm({ stepTitle: '', contentTitle: '', description: '', order: '', icon: null, images: [] });
                  setEditingStepId(null);
                  setStepIconPreview(null);
                  setStepImagesPreview([]);
                  setExistingStepIcon(null);
                  setExistingStepImages([]);
                  document.getElementById('stepIcon').value = '';
                  document.getElementById('stepImages').value = '';
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Existing Steps</h3>
          
          {stepLoading && (
            <div className="flex justify-center items-center p-8">
              <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            </div>
          )}
          
          {!stepLoading && steps.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center text-gray-500">
              No steps found. Create your first step above.
            </div>
          )}
          
          {!stepLoading && steps.map((step) => (
            <div key={step._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  {step.icon && (
                    <img 
                      src={getImageUrl(step.icon)} 
                      alt={step.stepTitle} 
                      className="h-10 w-10 object-contain mr-3 mt-1" 
                    />
                  )}
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                        {step.stepTitle}
                      </span>
                      <span className="text-sm text-gray-500">Order: {step.order}</span>
                    </div>
                    <h4 className="text-lg font-semibold mt-1">{step.contentTitle}</h4>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStepEdit(step)}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleStepDelete(step._id)}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              {step.images && step.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {step.images.map((img, index) => (
                      <img 
                        key={index} 
                        src={getImageUrl(img)} 
                        alt={`Step Image ${index + 1}`} 
                        className="h-24 w-auto object-cover rounded border border-gray-300" 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Business Travel Management</h1>
        <p className="text-lg opacity-90">Manage all business travel-related content sections</p>
      </div>

      <div className="flex bg-white rounded-xl p-2 mb-8 shadow-md overflow-x-auto gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex-1 min-w-[150px] px-5 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform -translate-y-0.5'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-sm">{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-8 shadow-md min-h-[600px]">
        {activeTab === 'hero' && renderHeroSection()}
        {activeTab === 'services' && renderServiceSection()}
        {activeTab === 'features' && renderFeatureSection()}
        {activeTab === 'steps' && renderStepSection()}
      </div>
    </div>
  );
};

export default BusinessTravel;
