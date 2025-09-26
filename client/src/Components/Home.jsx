import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSpinner,
  FaSave,
  FaCalendarAlt,
  FaHome,
  FaStar,
  FaImage,
  FaImages,
  FaVideo,
  FaGlobe,
  FaPlane,
  FaMapMarkedAlt,
  FaUsers,
  FaShieldAlt,
  FaRocket,
  FaUserTie,
  FaFlag,
  FaInfoCircle,
  FaEye,
  FaEdit
} from 'react-icons/fa';

const Home = () => {
  // State for different sections
  const [beyondData, setBeyondData] = useState([]);
  const [departureData, setDepartureData] = useState([]);
  const [dreamData, setDreamData] = useState([]);
  const [escapeData, setEscapeData] = useState([]);
  const [expertData, setExpertData] = useState([]);
  const [globeData, setGlobeData] = useState([]);
  const [trustedData, setTrustedData] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({});
  
  // Modal states
  const [modals, setModals] = useState({
    beyond: false,
    departure: false,
    dream: false,
    escape: false,
    expert: false,
    globe: false,
    trusted: false
  });

  // Edit states
  const [editMode, setEditMode] = useState({});
  const [editingId, setEditingId] = useState({});

  // Form states
  const [forms, setForms] = useState({
    beyond: { heading: '', subheading: '', cards: [{ title: '', description: '', price: '' }] },
    departure: { heading: '', subheading: '', cards: [{ title: '', description: '', price: '' }] },
    dream: { heading: '', subheading: '' },
    escape: { heading: '', subheading: '', cards: [{ title: '', description: '', price: '' }] },
    expert: { heading: '', subheading: '', countries: [''] },
    globe: { title: '', description: '' },
    trusted: { heading: '', subheading: '', cards: [{ title: '', description: '', rating: '' }] }
  });

  // File states
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});

  // Messages
  const [messages, setMessages] = useState({ success: '', error: '' });
  const [searchTerms, setSearchTerms] = useState({});

  const baseURL = 'http://globe.ridealmobility.com';

  // API endpoints mapping
  const endpoints = {
    beyond: '/api/home/beyond',
    departure: '/api/home/departure', 
    dream: '/api/home/dreams',
    escape: '/api/home/escape',
    expert: '/api/home/experts',
    globe: '/api/home/globes',
    trusted: '/api/home/trusted'
  };

  // Generic fetch function
  const fetchData = async (section) => {
    setLoading(prev => ({ ...prev, [section]: true }));
    try {
      const response = await fetch(`${baseURL}${endpoints[section]}`);
      if (!response.ok) throw new Error(`Failed to fetch ${section} data`);
      const data = await response.json();
      
      // Handle different response structures
      const items = data[section] || data.dreams || data.experts || data.globes || data;
      
      switch(section) {
        case 'beyond': setBeyondData(items); break;
        case 'departure': setDepartureData(items); break;
        case 'dream': setDreamData(items); break;
        case 'escape': setEscapeData(items); break;
        case 'expert': setExpertData(items); break;
        case 'globe': setGlobeData(items); break;
        case 'trusted': setTrustedData(items); break;
      }
    } catch (err) {
      setMessages({ ...messages, error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  // Generic submit function
  const handleSubmit = async (section, e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, [section]: true }));
    
    try {
      const formData = new FormData();
      const formValues = forms[section];
      
      // Add form fields
      Object.keys(formValues).forEach(key => {
        if (key === 'cards' || key === 'countries') {
          formData.append(key, JSON.stringify(formValues[key].filter(item => 
            typeof item === 'string' ? item.trim() : Object.values(item).some(v => v.trim())
          )));
        } else {
          formData.append(key, formValues[key]);
        }
      });

      // Add files
      const sectionFiles = files[section];
      if (sectionFiles) {
        if (Array.isArray(sectionFiles)) {
          sectionFiles.forEach(file => {
            const fieldName = section === 'expert' ? 'images' : 'img';
            formData.append(fieldName, file);
          });
        } else {
          const fieldName = section === 'dream' ? 'backgroundVideo' : section === 'globe' ? 'image' : 'img';
          formData.append(fieldName, sectionFiles);
        }
      }

      const isEditing = editMode[section];
      const url = isEditing 
        ? `${baseURL}${endpoints[section]}/${editingId[section]}`
        : `${baseURL}${endpoints[section]}`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'create'} ${section}`);

      setMessages({ success: result.message || `${section} ${isEditing ? 'updated' : 'created'} successfully`, error: '' });
      resetForm(section);
      fetchData(section);
    } catch (err) {
      setMessages({ error: err.message, success: '' });
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  // Handle edit
  const handleEdit = (section, item) => {
    // Set form data with existing values
    const formData = { ...getInitialForm(section) };
    
    // Map item data to form structure
    if (section === 'globe') {
      formData.title = item.title || '';
      formData.description = item.description || '';
    } else {
      formData.heading = item.heading || '';
      formData.subheading = item.subheading || '';
    }

    if (item.cards) {
      formData.cards = item.cards;
    }
    if (item.countries) {
      formData.countries = item.countries;
    }

    setForms(prev => ({ ...prev, [section]: formData }));
    setEditMode(prev => ({ ...prev, [section]: true }));
    setEditingId(prev => ({ ...prev, [section]: item._id }));
    setModals(prev => ({ ...prev, [section]: true }));
  };

  // Generic delete function
  const handleDelete = async (section, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${section} item?`)) return;
    
    setLoading(prev => ({ ...prev, [section]: true }));
    try {
      const response = await fetch(`${baseURL}${endpoints[section]}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error(`Failed to delete ${section} item`);
      
      setMessages({ success: 'Item deleted successfully', error: '' });
      fetchData(section);
    } catch (err) {
      setMessages({ error: err.message, success: '' });
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  // File handling
  const handleFileSelect = (section, files, isMultiple = false) => {
    if (isMultiple) {
      const fileArray = Array.from(files);
      setFiles(prev => ({ ...prev, [section]: fileArray }));
      
      const previewUrls = fileArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => ({ ...prev, [section]: previewUrls }));
    } else {
      const file = files[0];
      setFiles(prev => ({ ...prev, [section]: file }));
      
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [section]: previewUrl }));
      }
    }
  };

  // Form management
  const resetForm = (section) => {
    setForms(prev => ({ ...prev, [section]: getInitialForm(section) }));
    setFiles(prev => ({ ...prev, [section]: null }));
    setPreviews(prev => ({ ...prev, [section]: null }));
    setModals(prev => ({ ...prev, [section]: false }));
    setEditMode(prev => ({ ...prev, [section]: false }));
    setEditingId(prev => ({ ...prev, [section]: null }));
  };

  const getInitialForm = (section) => {
    switch(section) {
      case 'beyond':
      case 'departure':
      case 'escape':
        return { heading: '', subheading: '', cards: [{ title: '', description: '', price: '' }] };
      case 'dream':
        return { heading: '', subheading: '' };
      case 'expert':
        return { heading: '', subheading: '', countries: [''] };
      case 'globe':
        return { title: '', description: '' };
      case 'trusted':
        return { heading: '', subheading: '', cards: [{ title: '', description: '', rating: '' }] };
      default:
        return {};
    }
  };

  // Card management for sections with cards
  const addCard = (section) => {
    const newCard = section === 'trusted' 
      ? { title: '', description: '', rating: '' }
      : { title: '', description: '', price: '' };
    
    setForms(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        cards: [...prev[section].cards, newCard]
      }
    }));
  };

  const removeCard = (section, index) => {
    setForms(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        cards: prev[section].cards.filter((_, i) => i !== index)
      }
    }));
  };

  const updateCard = (section, index, field, value) => {
    setForms(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        cards: prev[section].cards.map((card, i) => 
          i === index ? { ...card, [field]: value } : card
        )
      }
    }));
  };

  // Country management for expert section
  const addCountry = () => {
    setForms(prev => ({
      ...prev,
      expert: {
        ...prev.expert,
        countries: [...prev.expert.countries, '']
      }
    }));
  };

  const removeCountry = (index) => {
    setForms(prev => ({
      ...prev,
      expert: {
        ...prev.expert,
        countries: prev.expert.countries.filter((_, i) => i !== index)
      }
    }));
  };

  const updateCountry = (index, value) => {
    setForms(prev => ({
      ...prev,
      expert: {
        ...prev.expert,
        countries: prev.expert.countries.map((country, i) => 
          i === index ? value : country
        )
      }
    }));
  };

  // Initial data fetch
  useEffect(() => {
    Object.keys(endpoints).forEach(section => fetchData(section));
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (messages.error || messages.success) {
      const timer = setTimeout(() => {
        setMessages({ success: '', error: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      Object.values(previews).forEach(preview => {
        if (typeof preview === 'string' && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        } else if (Array.isArray(preview)) {
          preview.forEach(url => {
            if (url && url.startsWith('blob:')) {
              URL.revokeObjectURL(url);
            }
          });
        }
      });
    };
  }, [previews]);

  // Section configurations
  const sectionConfigs = {
    beyond: {
      title: 'Beyond Holidays',
      icon: FaRocket,
      color: 'from-purple-600 to-pink-600',
      data: beyondData,
      hasCards: true
    },
    departure: {
      title: 'Departure Management', 
      icon: FaPlane,
      color: 'from-blue-600 to-cyan-600',
      data: departureData,
      hasCards: true
    },
    dream: {
      title: 'Dream Section',
      icon: FaStar,
      color: 'from-yellow-500 to-orange-500',
      data: dreamData,
      hasCards: false,
      hasVideo: true
    },
    escape: {
      title: 'Escape Destinations',
      icon: FaMapMarkedAlt,
      color: 'from-green-600 to-teal-600',
      data: escapeData,
      hasCards: true
    },
    expert: {
      title: 'Expert Advisors',
      icon: FaUserTie,
      color: 'from-indigo-600 to-purple-600',
      data: expertData,
      hasCards: false,
      hasCountries: true
    },
    globe: {
      title: 'Globe Content',
      icon: FaGlobe,
      color: 'from-red-500 to-pink-500',
      data: globeData,
      hasCards: false
    },
    trusted: {
      title: 'Trusted Partners',
      icon: FaShieldAlt,
      color: 'from-gray-600 to-gray-800',
      data: trustedData,
      hasCards: true,
      hasRating: true
    }
  };

  const SectionHeader = ({ section, config }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent flex items-center gap-2`}>
            <config.icon className="text-gray-600" />
            {config.title}
          </h2>
          <p className="text-gray-600 mt-2">Manage {config.title.toLowerCase()} content and settings</p>
        </div>
        <button
          onClick={() => setModals(prev => ({ ...prev, [section]: true }))}
          className={`bg-gradient-to-r ${config.color} hover:opacity-90 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg`}
        >
          <FaPlus />
          Add {config.title}
        </button>
      </div>
    </div>
  );

  const SearchBar = ({ section }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="relative max-w-md">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${sectionConfigs[section].title.toLowerCase()}...`}
          value={searchTerms[section] || ''}
          onChange={(e) => setSearchTerms(prev => ({ ...prev, [section]: e.target.value }))}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
        />
      </div>
    </div>
  );

  const ContentCard = ({ section, item, config }) => (
    <div key={item._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Card Header */}
      <div className={`bg-gradient-to-r ${config.color} text-white p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <config.icon className="text-white opacity-80" />
            <span className="text-sm font-medium opacity-90">{config.title}</span>
          </div>
          <h3 className="text-xl font-bold truncate">
            {item.heading || item.title || 'Untitled'}
          </h3>
          {item.subheading && (
            <p className="text-white opacity-80 text-sm mt-1 line-clamp-2">{item.subheading}</p>
          )}
          {item.description && !item.subheading && (
            <p className="text-white opacity-80 text-sm mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-4">
        {/* Media Display */}
        {(item.backgroundVideo || item.image || item.images) && (
          <div className="space-y-3">
            {item.backgroundVideo && (
              <div className="relative">
                <video 
                  className="w-full h-32 object-cover rounded-lg bg-gray-100"
                  controls
                >
                  <source 
                    src={item.backgroundVideo.startsWith('http') 
                      ? item.backgroundVideo 
                      : `${baseURL}/${item.backgroundVideo}`
                    } 
                  />
                </video>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    <FaVideo className="inline mr-1" />
                    Background Video
                  </span>
                </div>
              </div>
            )}
            
            {item.image && (
              <div className="relative">
                <img
                  src={item.image.startsWith('http') ? item.image : `${baseURL}/${item.image}`}
                  alt="Content"
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-32 bg-gray-100 rounded-lg items-center justify-center">
                  <FaImage className="text-gray-400 text-xl" />
                </div>
              </div>
            )}

            {item.images && item.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {item.images.slice(0, 3).map((img, idx) => (
                  <img
                    key={idx}
                    src={img.startsWith('http') ? img : `${baseURL}/${img}`}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
                {item.images.length > 3 && (
                  <div className="bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                    +{item.images.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cards Display */}
        {item.cards && item.cards.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              Cards ({item.cards.length})
            </h5>
            <div className="space-y-2">
              {item.cards.slice(0, 2).map((card, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h6 className="font-medium text-sm text-gray-900 line-clamp-1">{card.title}</h6>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{card.description}</p>
                    </div>
                    {card.price && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">
                        ${card.price}
                      </span>
                    )}
                    {card.rating && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2">
                        ⭐ {card.rating}
                      </span>
                    )}
                  </div>
                  {card.img && (
                    <img
                      src={card.img.startsWith('http') ? card.img : `${baseURL}/${card.img}`}
                      alt={card.title}
                      className="w-full h-16 object-cover rounded mt-2"
                    />
                  )}
                </div>
              ))}
              {item.cards.length > 2 && (
                <p className="text-xs text-gray-500">+{item.cards.length - 2} more cards</p>
              )}
            </div>
          </div>
        )}

        {/* Countries Display (for expert section) */}
        {item.countries && item.countries.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <FaFlag className="text-blue-500" />
              Countries ({item.countries.length})
            </h5>
            <div className="flex flex-wrap gap-1">
              {item.countries.slice(0, 5).map((country, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {country}
                </span>
              ))}
              {item.countries.length > 5 && (
                <span className="text-xs text-gray-500">+{item.countries.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {/* Created Date */}
        {item.createdAt && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FaCalendarAlt />
            <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(section, item)}
            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors font-medium"
          >
            <FaEdit />
            Edit
          </button>
          <button
            onClick={() => handleDelete(section, item._id)}
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors font-medium"
          >
            <FaTrash />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-100">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <FaHome className="text-blue-500" />
              Home Content Management
            </h1>
            <p className="text-gray-600 mt-3 text-lg">Manage all home page sections and content</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {messages.success && (
          <div className="bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
            <FaInfoCircle />
            {messages.success}
          </div>
        )}
        
        {messages.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
            <FaInfoCircle />
            {messages.error}
          </div>
        )}

        {/* Render each section */}
        {Object.entries(sectionConfigs).map(([section, config]) => {
          const filteredData = config.data.filter(item => {
            const searchTerm = searchTerms[section] || '';
            return (
              item.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.subheading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          });

          return (
            <div key={section} className="mb-12">
              <SectionHeader section={section} config={config} />
              <SearchBar section={section} />

              {/* Content Grid */}
              {loading[section] ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading {config.title.toLowerCase()}...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {filteredData.map(item => (
                    <ContentCard key={item._id} section={section} item={item} config={config} />
                  ))}
                </div>
              )}

              {filteredData.length === 0 && !loading[section] && (
                <div className="text-center py-16">
                  <config.icon className="text-8xl text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl text-gray-600 mb-3">No {config.title.toLowerCase()} found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerms[section] ? 'Try adjusting your search terms' : `Start by creating your first ${config.title.toLowerCase()}`}
                  </p>
                  {!searchTerms[section] && (
                    <button
                      onClick={() => setModals(prev => ({ ...prev, [section]: true }))}
                      className={`bg-gradient-to-r ${config.color} hover:opacity-90 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto transition-all transform hover:scale-105 shadow-lg`}
                    >
                      <FaPlus />
                      Create {config.title}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Modals for each section */}
        {Object.entries(sectionConfigs).map(([section, config]) => (
          modals[section] && (
            <div key={section} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <config.icon className="text-gray-600" />
                      {editMode[section] ? `Edit ${config.title}` : `Add ${config.title}`}
                    </h2>
                    <button
                      onClick={() => resetForm(section)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>
                </div>

                <form onSubmit={(e) => handleSubmit(section, e)} className="p-6 space-y-6">
                  {/* Common Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {section === 'globe' ? 'Title' : 'Heading'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={forms[section][section === 'globe' ? 'title' : 'heading']}
                        onChange={(e) => setForms(prev => ({
                          ...prev,
                          [section]: {
                            ...prev[section],
                            [section === 'globe' ? 'title' : 'heading']: e.target.value
                          }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Enter ${section === 'globe' ? 'title' : 'heading'}`}
                      />
                    </div>

                    {(config.title !== 'Globe Content') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {section === 'globe' ? 'Description' : 'Subheading'} *
                        </label>
                        <input
                          type="text"
                          required
                          value={forms[section][section === 'globe' ? 'description' : 'subheading']}
                          onChange={(e) => setForms(prev => ({
                            ...prev,
                            [section]: {
                              ...prev[section],
                              [section === 'globe' ? 'description' : 'subheading']: e.target.value
                            }
                          }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter ${section === 'globe' ? 'description' : 'subheading'}`}
                        />
                      </div>
                    )}

                    {section === 'globe' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          required
                          value={forms[section].description}
                          onChange={(e) => setForms(prev => ({
                            ...prev,
                            [section]: { ...prev[section], description: e.target.value }
                          }))}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter description"
                        />
                      </div>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {config.hasVideo ? 'Background Video' : 
                       section === 'expert' ? 'Images (Multiple)' :
                       section === 'globe' ? 'Image' : 'Card Images (Multiple)'}
                    </label>
                    <input
                      type="file"
                      accept={config.hasVideo ? 'video/*' : 'image/*'}
                      multiple={section === 'expert' || (config.hasCards && section !== 'globe')}
                      onChange={(e) => handleFileSelect(section, e.target.files, 
                        section === 'expert' || (config.hasCards && section !== 'globe'))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    {/* File Previews */}
                    {previews[section] && (
                      <div className="mt-3">
                        {Array.isArray(previews[section]) ? (
                          <div className="grid grid-cols-4 gap-2">
                            {previews[section].map((preview, index) => (
                              <img
                                key={index}
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                            ))}
                          </div>
                        ) : config.hasVideo ? (
                          <video
                            controls
                            className="w-full h-32 object-cover rounded-lg"
                            src={previews[section]}
                          />
                        ) : (
                          <img
                            src={previews[section]}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cards Section */}
                  {config.hasCards && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        Cards
                      </h3>
                      <div className="space-y-4">
                        {forms[section].cards.map((card, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-700">Card {index + 1}</h4>
                              {forms[section].cards.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeCard(section, index)}
                                  className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
                                >
                                  <FaTimes />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Title *
                                </label>
                                <input
                                  type="text"
                                  value={card.title}
                                  onChange={(e) => updateCard(section, index, 'title', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  placeholder="Enter card title"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Description *
                                </label>
                                <input
                                  type="text"
                                  value={card.description}
                                  onChange={(e) => updateCard(section, index, 'description', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  placeholder="Enter description"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {config.hasRating ? 'Rating *' : 'Price *'}
                                </label>
                                <input
                                  type={config.hasRating ? 'number' : 'text'}
                                  value={config.hasRating ? card.rating : card.price}
                                  onChange={(e) => updateCard(section, index, config.hasRating ? 'rating' : 'price', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  placeholder={config.hasRating ? 'Enter rating' : 'Enter price'}
                                  {...(config.hasRating && { min: '1', max: '5', step: '0.1' })}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addCard(section)}
                          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaPlus />
                          Add Card
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Countries Section (for expert) */}
                  {config.hasCountries && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaFlag className="text-blue-500" />
                        Countries
                      </h3>
                      <div className="space-y-3">
                        {forms[section].countries.map((country, index) => (
                          <div key={index} className="flex gap-3">
                            <input
                              type="text"
                              value={country}
                              onChange={(e) => updateCountry(index, e.target.value)}
                              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Country ${index + 1}`}
                            />
                            {forms[section].countries.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCountry(index)}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addCountry}
                          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaPlus />
                          Add Country
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading[section]}
                      className={`flex-1 bg-gradient-to-r ${config.color} hover:opacity-90 disabled:opacity-50 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all font-medium shadow-lg`}
                    >
                      {loading[section] ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      {loading[section] 
                        ? (editMode[section] ? 'Updating...' : 'Creating...') 
                        : (editMode[section] ? `Update ${config.title}` : `Create ${config.title}`)
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() => resetForm(section)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Home;
