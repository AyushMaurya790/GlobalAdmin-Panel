import React, { useState, useEffect } from 'react';
import { FaVideo, FaMap, FaUsers, FaShip, FaSpinner } from 'react-icons/fa';

// API service functions
const API_BASE_URL = 'http://globe.ridealmobility.com/api';
const BASE_URL = 'http://globe.ridealmobility.com';

const heroAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/hero`);
    return response.json();
  },
  create: async (heroData) => {
    const formData = new FormData();
    formData.append('mainHeading', heroData.mainHeading);
    formData.append('styleHeading', heroData.styleHeading);
    formData.append('subheading', heroData.subheading);
    if (heroData.videoFile) {
      formData.append('videoFile', heroData.videoFile);
    }
    const response = await fetch(`${API_BASE_URL}/hero`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  update: async (id, heroData) => {
    const formData = new FormData();
    formData.append('mainHeading', heroData.mainHeading);
    formData.append('styleHeading', heroData.styleHeading);
    formData.append('subheading', heroData.subheading);
    if (heroData.videoFile) {
      formData.append('videoFile', heroData.videoFile);
    }
    const response = await fetch(`${API_BASE_URL}/hero/${id}`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/hero/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

const journeyAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/journeys`);
    return response.json();
  },
  create: async (journeyData) => {
    const formData = new FormData();
    formData.append('mainHeading', journeyData.mainHeading);
    formData.append('styleHeading', journeyData.styleHeading);
    formData.append('firstParagraph', journeyData.firstParagraph);
    formData.append('secondParagraph', journeyData.secondParagraph);
    if (journeyData.journeysImage) {
      formData.append('journeysImage', journeyData.journeysImage);
    }
    const response = await fetch(`${API_BASE_URL}/journeys`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  update: async (id, journeyData) => {
    const formData = new FormData();
    formData.append('mainHeading', journeyData.mainHeading);
    formData.append('styleHeading', journeyData.styleHeading);
    formData.append('firstParagraph', journeyData.firstParagraph);
    formData.append('secondParagraph', journeyData.secondParagraph);
    if (journeyData.journeysImage) {
      formData.append('journeysImage', journeyData.journeysImage);
    }
    const response = await fetch(`${API_BASE_URL}/journeys/${id}`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/journeys/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

const partnersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/partners`);
    return response.json();
  },
  create: async (images) => {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });
    const response = await fetch(`${API_BASE_URL}/partners`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  update: async (index, image) => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await fetch(`${API_BASE_URL}/partners/${index}`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  },
  delete: async (index) => {
    const response = await fetch(`${API_BASE_URL}/partners/${index}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

const cruiseAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/cruise`);
    return response.json();
  },
  create: async (cruiseData) => {
    const formData = new FormData();
    formData.append('mainHeading', cruiseData.mainHeading);
    formData.append('cruiseLiner', cruiseData.cruiseLiner);
    formData.append('shipName', cruiseData.shipName);
    formData.append('sailingName', cruiseData.sailingName);
    formData.append('departurePort', cruiseData.departurePort);
    formData.append('cruiseDuration', cruiseData.cruiseDuration);
    formData.append('cabinPrice', cruiseData.cabinPrice);
    formData.append('sailingDates', cruiseData.sailingDates.join(','));
    formData.append('destinations', cruiseData.destinations.join(','));
    if (cruiseData.mapImage) {
      formData.append('mapImage', cruiseData.mapImage);
    }
    const response = await fetch(`${API_BASE_URL}/cruise`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/cruise/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

const Voyage = () => {
  const [activeTab, setActiveTab] = useState('hero');
  
  // Hero Section State
  const [heroes, setHeroes] = useState([]);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroMessage, setHeroMessage] = useState({ type: '', text: '' });
  const [heroForm, setHeroForm] = useState({
    mainHeading: '',
    styleHeading: '',
    subheading: '',
    videoFile: null
  });
  const [editingHeroId, setEditingHeroId] = useState(null);

  // Journey Section State
  const [journeys, setJourneys] = useState([]);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyMessage, setJourneyMessage] = useState({ type: '', text: '' });
  const [journeyForm, setJourneyForm] = useState({
    mainHeading: '',
    styleHeading: '',
    firstParagraph: '',
    secondParagraph: '',
    journeysImage: null
  });
  const [editingJourneyId, setEditingJourneyId] = useState(null);

  // Partners Section State
  const [partners, setPartners] = useState({ images: [] });
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersMessage, setPartnersMessage] = useState({ type: '', text: '' });
  const [selectedImages, setSelectedImages] = useState([]);

  // Cruise Section State
  const [cruises, setCruises] = useState([]);
  const [cruiseLoading, setCruiseLoading] = useState(false);
  const [cruiseMessage, setCruiseMessage] = useState({ type: '', text: '' });
  const [cruiseForm, setCruiseForm] = useState({
    mainHeading: '',
    cruiseLiner: '',
    shipName: '',
    sailingName: '',
    departurePort: '',
    cruiseDuration: '',
    cabinPrice: '',
    sailingDates: [],
    destinations: [],
    mapImage: null
  });

  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: <FaVideo /> },
    { id: 'cruise', name: 'Places/Cruise', icon: <FaShip /> },
    { id: 'partners', name: 'Partners Logo', icon: <FaUsers /> },
    { id: 'journey', name: 'Journey Content', icon: <FaMap /> }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchHeroes();
    fetchJourneys();
    fetchPartners();
    fetchCruises();
  }, []);

  // Hero Section Functions
  const fetchHeroes = async () => {
    try {
      setHeroLoading(true);
      const response = await heroAPI.getAll();
      setHeroes(response.heroes || []);
    } catch (error) {
      setHeroMessage({ type: 'error', text: 'Failed to fetch heroes' });
    } finally {
      setHeroLoading(false);
    }
  };

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    try {
      setHeroLoading(true);
      if (!heroForm.videoFile && !editingHeroId) {
        setHeroMessage({ type: 'error', text: 'Video file is required' });
        return;
      }
      let response;
      if (editingHeroId) {
        response = await heroAPI.update(editingHeroId, heroForm);
      } else {
        response = await heroAPI.create(heroForm);
      }
      if (response.message) {
        setHeroMessage({ type: 'success', text: response.message });
        setHeroForm({ mainHeading: '', styleHeading: '', subheading: '', videoFile: null });
        setEditingHeroId(null);
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
      mainHeading: hero.mainHeading,
      styleHeading: hero.styleHeading,
      subheading: hero.subheading,
      videoFile: null
    });
    setEditingHeroId(hero._id);
    setHeroMessage({ type: '', text: '' });
  };

  const handleHeroDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hero?')) {
      try {
        setHeroLoading(true);
        const response = await heroAPI.delete(id);
        setHeroMessage({ type: 'success', text: response.message });
        fetchHeroes();
      } catch (error) {
        setHeroMessage({ type: 'error', text: 'Failed to delete hero' });
      } finally {
        setHeroLoading(false);
      }
    }
  };

  // Journey Section Functions
  const fetchJourneys = async () => {
    try {
      setJourneyLoading(true);
      const response = await journeyAPI.getAll();
      setJourneys(response.journeys || []);
    } catch (error) {
      setJourneyMessage({ type: 'error', text: 'Failed to fetch journeys' });
    } finally {
      setJourneyLoading(false);
    }
  };

  const handleJourneySubmit = async (e) => {
    e.preventDefault();
    try {
      setJourneyLoading(true);
      let response;
      if (editingJourneyId) {
        response = await journeyAPI.update(editingJourneyId, journeyForm);
      } else {
        response = await journeyAPI.create(journeyForm);
      }
      if (response.message) {
        setJourneyMessage({ type: 'success', text: response.message });
        setJourneyForm({ mainHeading: '', styleHeading: '', firstParagraph: '', secondParagraph: '', journeysImage: null });
        setEditingJourneyId(null);
        fetchJourneys();
      }
    } catch (error) {
      setJourneyMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setJourneyLoading(false);
    }
  };

  const handleJourneyEdit = (journey) => {
    setJourneyForm({
      mainHeading: journey.mainHeading,
      styleHeading: journey.styleHeading,
      firstParagraph: journey.firstParagraph,
      secondParagraph: journey.secondParagraph,
      journeysImage: null
    });
    setEditingJourneyId(journey._id);
    setJourneyMessage({ type: '', text: '' });
  };

  const handleJourneyDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this journey?')) {
      try {
        setJourneyLoading(true);
        const response = await journeyAPI.delete(id);
        setJourneyMessage({ type: 'success', text: response.message });
        fetchJourneys();
      } catch (error) {
        setJourneyMessage({ type: 'error', text: 'Failed to delete journey' });
      } finally {
        setJourneyLoading(false);
      }
    }
  };

  // Partners Section Functions
  const fetchPartners = async () => {
    try {
      setPartnersLoading(true);
      const response = await partnersAPI.getAll();
      setPartners(response.partners || { images: [] });
    } catch (error) {
      setPartnersMessage({ type: 'error', text: 'Failed to fetch partners' });
    } finally {
      setPartnersLoading(false);
    }
  };

  const handleAddPartnerImages = async (e) => {
    e.preventDefault();
    if (selectedImages.length === 0) {
      setPartnersMessage({ type: 'error', text: 'Please select at least one image' });
      return;
    }
    try {
      setPartnersLoading(true);
      const response = await partnersAPI.create(selectedImages);
      if (response.message) {
        setPartnersMessage({ type: 'success', text: response.message });
        setSelectedImages([]);
        fetchPartners();
      }
    } catch (error) {
      setPartnersMessage({ type: 'error', text: 'Failed to add partner images' });
    } finally {
      setPartnersLoading(false);
    }
  };

  const handleDeletePartnerImage = async (index) => {
    if (window.confirm('Are you sure you want to delete this partner image?')) {
      try {
        setPartnersLoading(true);
        const response = await partnersAPI.delete(index);
        setPartnersMessage({ type: 'success', text: response.message });
        fetchPartners();
      } catch (error) {
        setPartnersMessage({ type: 'error', text: 'Failed to delete partner image' });
      } finally {
        setPartnersLoading(false);
      }
    }
  };

  // Cruise Section Functions
  const fetchCruises = async () => {
    try {
      setCruiseLoading(true);
      const response = await cruiseAPI.getAll();
      setCruises(response || []);
    } catch (error) {
      setCruiseMessage({ type: 'error', text: 'Failed to fetch cruises' });
    } finally {
      setCruiseLoading(false);
    }
  };

  const handleCruiseSubmit = async (e) => {
    e.preventDefault();
    try {
      setCruiseLoading(true);
      const response = await cruiseAPI.create(cruiseForm);
      if (response.message) {
        setCruiseMessage({ type: 'success', text: response.message });
        setCruiseForm({
          mainHeading: '', cruiseLiner: '', shipName: '', sailingName: '',
          departurePort: '', cruiseDuration: '', cabinPrice: '',
          sailingDates: [], destinations: [], mapImage: null
        });
        fetchCruises();
      }
    } catch (error) {
      setCruiseMessage({ type: 'error', text: 'Failed to create cruise' });
    } finally {
      setCruiseLoading(false);
    }
  };

  const handleCruiseDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this cruise?')) {
      try {
        setCruiseLoading(true);
        const response = await cruiseAPI.delete(id);
        setCruiseMessage({ type: 'success', text: response.message });
        fetchCruises();
      } catch (error) {
        setCruiseMessage({ type: 'error', text: 'Failed to delete cruise' });
      } finally {
        setCruiseLoading(false);
      }
    }
  };

  const handleArrayInputChange = (e, field, setter, form) => {
    const value = e.target.value;
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setter(prev => ({ ...prev, [field]: arrayValue }));
  };

  // Render Functions
  const renderHeroSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">Hero Section Management</h2>
      
      {heroMessage.text && (
        <div className={`p-4 rounded-lg border-l-4 ${
          heroMessage.type === 'error' 
            ? 'bg-red-50 border-red-500 text-red-700' 
            : 'bg-green-50 border-green-500 text-green-700'
        }`}>
          {heroMessage.text}
        </div>
      )}

      <form onSubmit={handleHeroSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {editingHeroId ? 'Edit Hero' : 'Add New Hero'}
          </h3>
          {editingHeroId && (
            <button
              type="button"
              onClick={() => {
                setEditingHeroId(null);
                setHeroForm({ mainHeading: '', styleHeading: '', subheading: '', videoFile: null });
                setHeroMessage({ type: '', text: '' });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
            <input
              type="text"
              value={heroForm.mainHeading}
              onChange={(e) => setHeroForm(prev => ({ ...prev, mainHeading: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter main heading"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style Heading</label>
            <input
              type="text"
              value={heroForm.styleHeading}
              onChange={(e) => setHeroForm(prev => ({ ...prev, styleHeading: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter style heading"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subheading</label>
          <textarea
            value={heroForm.subheading}
            onChange={(e) => setHeroForm(prev => ({ ...prev, subheading: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            placeholder="Enter subheading"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setHeroForm(prev => ({ ...prev, videoFile: e.target.files[0] }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={!editingHeroId}
          />
          {heroForm.videoFile && (
            <p className="mt-2 text-sm text-gray-600">Selected: {heroForm.videoFile.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={heroLoading}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {heroLoading ? <FaSpinner className="animate-spin" /> : (editingHeroId ? 'Update Hero' : 'Create Hero')}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {heroes.map((hero) => (
          <div key={hero._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">{hero.mainHeading}</h4>
              <div className="space-x-2">
                <button
                  onClick={() => handleHeroEdit(hero)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleHeroDelete(hero._id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p><strong>Style Heading:</strong> {hero.styleHeading}</p>
              <p><strong>Subheading:</strong> {hero.subheading}</p>
              {hero.videoFile && (
                <div>
                  <strong>Video:</strong>
                  <video controls className="mt-2 max-w-full h-48 rounded-lg">
                    <source src={`${BASE_URL}/${hero.videoFile.replace(/\\/g, '/')}`} type="video/mp4" />
                  </video>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {heroes.length === 0 && !heroLoading && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center text-gray-500">
          No heroes found. Create your first hero above.
        </div>
      )}
    </div>
  );

  const renderCruiseSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">Places/Cruise Management</h2>
      
      {cruiseMessage.text && (
        <div className={`p-4 rounded-lg border-l-4 ${
          cruiseMessage.type === 'error' 
            ? 'bg-red-50 border-red-500 text-red-700' 
            : 'bg-green-50 border-green-500 text-green-700'
        }`}>
          {cruiseMessage.text}
        </div>
      )}

      <form onSubmit={handleCruiseSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Add New Cruise</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
            <input
              type="text"
              value={cruiseForm.mainHeading}
              onChange={(e) => setCruiseForm(prev => ({ ...prev, mainHeading: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter main heading"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cruise Liner</label>
            <input
              type="text"
              value={cruiseForm.cruiseLiner}
              onChange={(e) => setCruiseForm(prev => ({ ...prev, cruiseLiner: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter cruise liner"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ship Name</label>
            <input
              type="text"
              value={cruiseForm.shipName}
              onChange={(e) => setCruiseForm(prev => ({ ...prev, shipName: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter ship name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sailing Name</label>
            <input
              type="text"
              value={cruiseForm.sailingName}
              onChange={(e) => setCruiseForm(prev => ({ ...prev, sailingName: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter sailing name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departure Port</label>
            <input
              type="text"
              value={cruiseForm.departurePort}
              onChange={(e) => setCruiseForm(prev => ({ ...prev, departurePort: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter departure port"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cruise Duration</label>
            <input
              type="text"
              value={cruiseForm.cruiseDuration}
              onChange={(e) => setCruiseForm(prev => ({ ...prev, cruiseDuration: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 7 days"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cabin Price</label>
            <input
              type="text"
              value={cruiseForm.cabinPrice}
              onChange={(e) => setCruiseForm(prev => ({ ...prev, cabinPrice: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., $1,200"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sailing Dates (comma separated)</label>
            <input
              type="text"
              value={cruiseForm.sailingDates.join(', ')}
              onChange={(e) => handleArrayInputChange(e, 'sailingDates', setCruiseForm)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2025-06-15, 2025-07-20, 2025-08-10"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destinations (comma separated)</label>
            <input
              type="text"
              value={cruiseForm.destinations.join(', ')}
              onChange={(e) => handleArrayInputChange(e, 'destinations', setCruiseForm)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Caribbean, Bahamas, Jamaica"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Map Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCruiseForm(prev => ({ ...prev, mapImage: e.target.files[0] }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {cruiseForm.mapImage && (
            <p className="mt-2 text-sm text-gray-600">Selected: {cruiseForm.mapImage.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={cruiseLoading}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {cruiseLoading ? <FaSpinner className="animate-spin" /> : 'Create Cruise'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cruises.map((cruise) => (
          <div key={cruise._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">{cruise.mainHeading}</h4>
              <button
                onClick={() => handleCruiseDelete(cruise._id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
            
            {cruise.cruises && cruise.cruises.map((cruiseDetail, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Cruise Liner:</strong> {cruiseDetail.cruiseLiner}</div>
                  <div><strong>Ship Name:</strong> {cruiseDetail.shipName}</div>
                  <div><strong>Sailing Name:</strong> {cruiseDetail.sailingName}</div>
                  <div><strong>Departure Port:</strong> {cruiseDetail.departurePort}</div>
                  <div><strong>Duration:</strong> {cruiseDetail.cruiseDuration}</div>
                  <div><strong>Price:</strong> {cruiseDetail.cabinPrice}</div>
                </div>
                <div className="mt-2 text-sm">
                  <strong>Sailing Dates:</strong> {cruiseDetail.sailingDates?.join(', ')}
                </div>
                <div className="mt-2 text-sm">
                  <strong>Destinations:</strong> {cruiseDetail.destinations?.join(', ')}
                </div>
                {cruiseDetail.mapImage && (
                  <div className="mt-2">
                    <strong>Map Image:</strong>
                    <img 
                      src={`${BASE_URL}/${cruiseDetail.mapImage.replace(/\\/g, '/')}`}
                      alt="Cruise Map"
                      className="mt-2 max-w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {cruises.length === 0 && !cruiseLoading && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center text-gray-500">
          No cruises found. Create your first cruise above.
        </div>
      )}
    </div>
  );

  const renderPartnersSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">Partners Logo Management</h2>
      
      {partnersMessage.text && (
        <div className={`p-4 rounded-lg border-l-4 ${
          partnersMessage.type === 'error' 
            ? 'bg-red-50 border-red-500 text-red-700' 
            : 'bg-green-50 border-green-500 text-green-700'
        }`}>
          {partnersMessage.text}
        </div>
      )}

      <form onSubmit={handleAddPartnerImages} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Add Partner Images</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Partner Logo Images (Multiple Selection)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setSelectedImages(Array.from(e.target.files))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {selectedImages.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Selected {selectedImages.length} image(s): {selectedImages.map(img => img.name).join(', ')}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={partnersLoading}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {partnersLoading ? <FaSpinner className="animate-spin" /> : 'Add Partner Images'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Current Partner Images ({partners.images?.length || 0})
        </h3>

        {partners.images && partners.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {partners.images.map((image, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="font-medium text-gray-700 mb-2">Partner #{index + 1}</div>
                <img 
                  src={`${BASE_URL}/${image.replace(/\\/g, '/')}`}
                  alt={`Partner ${index + 1}`}
                  className="w-full h-24 object-contain rounded mb-3"
                />
                <div className="space-x-2">
                  <button
                    onClick={() => handleDeletePartnerImage(index)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No partner images found. Add your first partner logo above.
          </div>
        )}
      </div>
    </div>
  );

  const renderJourneySection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">Journey Content Management</h2>
      
      {journeyMessage.text && (
        <div className={`p-4 rounded-lg border-l-4 ${
          journeyMessage.type === 'error' 
            ? 'bg-red-50 border-red-500 text-red-700' 
            : 'bg-green-50 border-green-500 text-green-700'
        }`}>
          {journeyMessage.text}
        </div>
      )}

      <form onSubmit={handleJourneySubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {editingJourneyId ? 'Edit Journey' : 'Add New Journey'}
          </h3>
          {editingJourneyId && (
            <button
              type="button"
              onClick={() => {
                setEditingJourneyId(null);
                setJourneyForm({ mainHeading: '', styleHeading: '', firstParagraph: '', secondParagraph: '', journeysImage: null });
                setJourneyMessage({ type: '', text: '' });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
            <input
              type="text"
              value={journeyForm.mainHeading}
              onChange={(e) => setJourneyForm(prev => ({ ...prev, mainHeading: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter main heading"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style Heading</label>
            <input
              type="text"
              value={journeyForm.styleHeading}
              onChange={(e) => setJourneyForm(prev => ({ ...prev, styleHeading: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter style heading"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">First Paragraph</label>
          <textarea
            value={journeyForm.firstParagraph}
            onChange={(e) => setJourneyForm(prev => ({ ...prev, firstParagraph: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            placeholder="Enter first paragraph"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Second Paragraph</label>
          <textarea
            value={journeyForm.secondParagraph}
            onChange={(e) => setJourneyForm(prev => ({ ...prev, secondParagraph: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            placeholder="Enter second paragraph"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Journey Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setJourneyForm(prev => ({ ...prev, journeysImage: e.target.files[0] }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {journeyForm.journeysImage && (
            <p className="mt-2 text-sm text-gray-600">Selected: {journeyForm.journeysImage.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={journeyLoading}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {journeyLoading ? <FaSpinner className="animate-spin" /> : (editingJourneyId ? 'Update Journey' : 'Create Journey')}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {journeys.map((journey) => (
          <div key={journey._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">{journey.mainHeading}</h4>
              <div className="space-x-2">
                <button
                  onClick={() => handleJourneyEdit(journey)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleJourneyDelete(journey._id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <p><strong>Style Heading:</strong> {journey.styleHeading}</p>
              <div>
                <strong>First Paragraph:</strong>
                <p className="mt-1 text-gray-600 text-sm">{journey.firstParagraph}</p>
              </div>
              <div>
                <strong>Second Paragraph:</strong>
                <p className="mt-1 text-gray-600 text-sm">{journey.secondParagraph}</p>
              </div>
              {journey.image && (
                <div>
                  <strong>Journey Image:</strong>
                  <img 
                    src={`${BASE_URL}/${journey.image.replace(/\\/g, '/')}`}
                    alt="Journey"
                    className="mt-2 max-w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {journeys.length === 0 && !journeyLoading && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center text-gray-500">
          No journeys found. Create your first journey above.
        </div>
      )}
    </div>
  );

  return (
    <div className="p-5 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Voyage Management</h1>
        <p className="text-lg opacity-90">Manage all voyage-related content sections</p>
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
        {activeTab === 'cruise' && renderCruiseSection()}
        {activeTab === 'partners' && renderPartnersSection()}
        {activeTab === 'journey' && renderJourneySection()}
      </div>
    </div>
  );
};

export default Voyage;
