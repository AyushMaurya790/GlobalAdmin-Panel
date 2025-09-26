import React, { useState, useEffect } from 'react';
import { 
  FaImage, 
  FaPlus, 
  FaSpinner, 
  FaEdit, 
  FaTrash, 
  FaUniversity,
  FaCheckCircle,
  FaLightbulb,
  FaGlobeAmericas,
  FaGraduationCap
} from 'react-icons/fa';
import { heroAPI, eduwingAPI, featureAPI, programAPI, getImageUrl } from '../services/studyAbroadAPI';

const StudyAbroad = () => {
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

  // Eduwing Section State (Why Choose Us)
  const [eduwings, setEduwings] = useState([]);
  const [eduwingLoading, setEduwingLoading] = useState(false);
  const [eduwingMessage, setEduwingMessage] = useState({ type: '', text: '' });
  const [eduwingForm, setEduwingForm] = useState({
    title: '',
    description: '',
    icon: null
  });
  const [editingEduwingId, setEditingEduwingId] = useState(null);
  const [eduwingPreview, setEduwingPreview] = useState(null);

  // Feature Section State (Global Steps)
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

  // Program Section State (Programs We Offer)
  const [programs, setPrograms] = useState([]);
  const [programLoading, setProgramLoading] = useState(false);
  const [programMessage, setProgramMessage] = useState({ type: '', text: '' });
  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    icon: null
  });
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [programPreview, setProgramPreview] = useState(null);

  // Tabs configuration
  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: <FaImage /> },
    { id: 'eduwings', name: 'Why Choose Us', icon: <FaCheckCircle /> },
    { id: 'features', name: 'Global Steps', icon: <FaGlobeAmericas /> },
    { id: 'programs', name: 'Programs We Offer', icon: <FaGraduationCap /> }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchHeroes();
    fetchEduwings();
    fetchFeatures();
    fetchPrograms();
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
    // Clear image previews
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

  // ==================== Eduwing Section Functions (Why Choose Us) ====================
  const fetchEduwings = async () => {
    try {
      setEduwingLoading(true);
      const response = await eduwingAPI.getAll();
      setEduwings(response || []);
    } catch (error) {
      setEduwingMessage({ type: 'error', text: 'Failed to fetch eduwings' });
    } finally {
      setEduwingLoading(false);
    }
  };

  const handleEduwingIconChange = (e) => {
    const file = e.target.files[0];
    setEduwingForm(prev => ({
      ...prev,
      icon: file
    }));
    
    // Create preview for selected icon
    if (file) {
      setEduwingPreview(URL.createObjectURL(file));
    }
  };

  const handleEduwingSubmit = async (e) => {
    e.preventDefault();
    try {
      setEduwingLoading(true);
      let response;
      
      if (editingEduwingId) {
        response = await eduwingAPI.update(editingEduwingId, eduwingForm);
      } else {
        response = await eduwingAPI.create(eduwingForm);
      }
      
      if (response) {
        setEduwingMessage({ type: 'success', text: editingEduwingId ? 'Item updated successfully!' : 'Item created successfully!' });
        setEduwingForm({ title: '', description: '', icon: null });
        setEditingEduwingId(null);
        setEduwingPreview(null);
        document.getElementById('eduwingIcon').value = '';
        fetchEduwings();
      }
    } catch (error) {
      setEduwingMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setEduwingLoading(false);
    }
  };

  const handleEduwingEdit = (eduwing) => {
    setEduwingForm({
      title: eduwing.title,
      description: eduwing.description,
      icon: null // Cannot pre-fill files
    });
    setEditingEduwingId(eduwing._id);
    setEduwingPreview(null); // Clear icon preview
    setEduwingMessage({ type: '', text: '' });
  };

  const handleEduwingDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setEduwingLoading(true);
        const response = await eduwingAPI.delete(id);
        if (response) {
          setEduwingMessage({ type: 'success', text: response.message || 'Item deleted successfully!' });
          fetchEduwings();
        }
      } catch (error) {
        setEduwingMessage({ type: 'error', text: 'Failed to delete item' });
      } finally {
        setEduwingLoading(false);
      }
    }
  };

  // ==================== Feature Section Functions (Global Steps) ====================
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
    setFeaturePreview(null); // Clear icon preview
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

  // ==================== Program Section Functions (Programs We Offer) ====================
  const fetchPrograms = async () => {
    try {
      setProgramLoading(true);
      const response = await programAPI.getAll();
      setPrograms(response || []);
    } catch (error) {
      setProgramMessage({ type: 'error', text: 'Failed to fetch programs' });
    } finally {
      setProgramLoading(false);
    }
  };

  const handleProgramIconChange = (e) => {
    const file = e.target.files[0];
    setProgramForm(prev => ({
      ...prev,
      icon: file
    }));
    
    // Create preview for selected icon
    if (file) {
      setProgramPreview(URL.createObjectURL(file));
    }
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    try {
      setProgramLoading(true);
      let response;
      
      if (editingProgramId) {
        response = await programAPI.update(editingProgramId, programForm);
      } else {
        response = await programAPI.create(programForm);
      }
      
      if (response) {
        setProgramMessage({ type: 'success', text: editingProgramId ? 'Program updated successfully!' : 'Program created successfully!' });
        setProgramForm({ title: '', description: '', icon: null });
        setEditingProgramId(null);
        setProgramPreview(null);
        document.getElementById('programIcon').value = '';
        fetchPrograms();
      }
    } catch (error) {
      setProgramMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setProgramLoading(false);
    }
  };

  const handleProgramEdit = (program) => {
    setProgramForm({
      title: program.title,
      description: program.description,
      icon: null // Cannot pre-fill files
    });
    setEditingProgramId(program._id);
    setProgramPreview(null); // Clear icon preview
    setProgramMessage({ type: '', text: '' });
  };

  const handleProgramDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        setProgramLoading(true);
        const response = await programAPI.delete(id);
        if (response) {
          setProgramMessage({ type: 'success', text: response.message || 'Program deleted successfully!' });
          fetchPrograms();
        }
      } catch (error) {
        setProgramMessage({ type: 'error', text: 'Failed to delete program' });
      } finally {
        setProgramLoading(false);
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

  const renderEduwingSection = () => {
    return (
      <div className="space-y-8">
        <form onSubmit={handleEduwingSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {editingEduwingId ? 'Edit Why Choose Us Item' : 'Add New Why Choose Us Item'}
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={eduwingForm.title}
              onChange={(e) => setEduwingForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={eduwingForm.description}
              onChange={(e) => setEduwingForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <input
              id="eduwingIcon"
              type="file"
              accept="image/*"
              onChange={handleEduwingIconChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={!editingEduwingId}
            />
          </div>
          
          {eduwingPreview && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Icon Preview</p>
              <img 
                src={eduwingPreview} 
                alt="Icon Preview" 
                className="h-16 w-auto object-contain rounded border border-gray-300" 
              />
            </div>
          )}
          
          {eduwingMessage.text && (
            <div className={`mb-4 p-3 rounded ${eduwingMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {eduwingMessage.text}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              disabled={eduwingLoading}
            >
              {eduwingLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {editingEduwingId ? 'Update Item' : 'Add Item'}
                </>
              )}
            </button>
            
            {editingEduwingId && (
              <button
                type="button"
                onClick={() => {
                  setEduwingForm({ title: '', description: '', icon: null });
                  setEditingEduwingId(null);
                  setEduwingPreview(null);
                  document.getElementById('eduwingIcon').value = '';
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Existing Why Choose Us Items</h3>
          
          {eduwingLoading && (
            <div className="flex justify-center items-center p-8">
              <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            </div>
          )}
          
          {!eduwingLoading && eduwings.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center text-gray-500">
              No items found. Create your first item above.
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!eduwingLoading && eduwings.map((eduwing) => (
              <div key={eduwing._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center mb-3">
                  {eduwing.icon && (
                    <img 
                      src={getImageUrl(eduwing.icon)} 
                      alt={eduwing.title} 
                      className="h-10 w-10 object-contain mr-3" 
                    />
                  )}
                  <h4 className="text-lg font-semibold">{eduwing.title}</h4>
                </div>
                
                <p className="text-gray-600 mb-4">{eduwing.description}</p>
                
                <div className="flex space-x-2 justify-end">
                  <button
                    onClick={() => handleEduwingEdit(eduwing)}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleEduwingDelete(eduwing._id)}
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

  const renderFeatureSection = () => {
    return (
      <div className="space-y-8">
        <form onSubmit={handleFeatureSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {editingFeatureId ? 'Edit Global Step' : 'Add New Global Step'}
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
                  {editingFeatureId ? 'Update Step' : 'Add Step'}
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
          <h3 className="text-xl font-semibold">Existing Global Steps</h3>
          
          {featureLoading && (
            <div className="flex justify-center items-center p-8">
              <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            </div>
          )}
          
          {!featureLoading && features.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center text-gray-500">
              No global steps found. Create your first step above.
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

  const renderProgramSection = () => {
    return (
      <div className="space-y-8">
        <form onSubmit={handleProgramSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {editingProgramId ? 'Edit Program' : 'Add New Program'}
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={programForm.title}
              onChange={(e) => setProgramForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={programForm.description}
              onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <input
              id="programIcon"
              type="file"
              accept="image/*"
              onChange={handleProgramIconChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={!editingProgramId}
            />
          </div>
          
          {programPreview && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Icon Preview</p>
              <img 
                src={programPreview} 
                alt="Program Icon Preview" 
                className="h-16 w-auto object-contain rounded border border-gray-300" 
              />
            </div>
          )}
          
          {programMessage.text && (
            <div className={`mb-4 p-3 rounded ${programMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {programMessage.text}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              disabled={programLoading}
            >
              {programLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {editingProgramId ? 'Update Program' : 'Add Program'}
                </>
              )}
            </button>
            
            {editingProgramId && (
              <button
                type="button"
                onClick={() => {
                  setProgramForm({ title: '', description: '', icon: null });
                  setEditingProgramId(null);
                  setProgramPreview(null);
                  document.getElementById('programIcon').value = '';
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Existing Programs</h3>
          
          {programLoading && (
            <div className="flex justify-center items-center p-8">
              <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            </div>
          )}
          
          {!programLoading && programs.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center text-gray-500">
              No programs found. Create your first program above.
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!programLoading && programs.map((program) => (
              <div key={program._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center mb-3">
                  {program.icon && (
                    <img 
                      src={getImageUrl(program.icon)} 
                      alt={program.title} 
                      className="h-12 w-12 object-contain mr-3" 
                    />
                  )}
                  <h4 className="text-lg font-semibold">{program.title}</h4>
                </div>
                
                <p className="text-gray-600 mb-4">{program.description}</p>
                
                <div className="flex space-x-2 justify-end">
                  <button
                    onClick={() => handleProgramEdit(program)}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleProgramDelete(program._id)}
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

  return (
    <div className="p-5 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Study Abroad Management</h1>
        <p className="text-lg opacity-90">Manage all study abroad related content sections</p>
      </div>

      <div className="flex bg-white rounded-xl p-2 mb-8 shadow-md overflow-x-auto gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex-1 min-w-[150px] px-5 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform -translate-y-0.5'
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
        {activeTab === 'eduwings' && renderEduwingSection()}
        {activeTab === 'features' && renderFeatureSection()}
        {activeTab === 'programs' && renderProgramSection()}
      </div>
    </div>
  );
};

export default StudyAbroad;
