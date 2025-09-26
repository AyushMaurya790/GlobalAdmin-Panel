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
  FaThList,
  FaCheckCircle,
  FaWindowClose,
  FaSearch,
  FaInfoCircle,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaListUl,
  FaPlane
} from 'react-icons/fa';
import { curatedAPI, countryAPI, continentAPI, getImageUrl } from '../../services/itenaryAPI';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Curated = () => {
  // State for curated sections
  const [curatedSections, setCuratedSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State for form data
  const [formData, setFormData] = useState({
    country: '',
    mainHeading: '',
    cards: [{
      title: '',
      duration: '',
      subDuration: '',
      image: null,
      features: [''],
      price: '',
      emi: '',
      totalPrice: ''
    }]
  });
  
  // State for form visuals
  const [cardPreviews, setCardPreviews] = useState([null]);
  const [editingId, setEditingId] = useState(null);
  
  // State for view details
  const [selectedSection, setSelectedSection] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // State for countries/continents filtering
  const [countries, setCountries] = useState([]);
  const [continents, setContinents] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch curated sections
  const fetchCuratedSections = async () => {
    setLoading(true);
    try {
      const data = await curatedAPI.getAll();
      setCuratedSections(data);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch curated sections' });
      toast.error('Failed to fetch curated sections');
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
    fetchCuratedSections();
    fetchContinents();
    fetchCountries();
    
    // Cleanup function for previews
    return () => {
      cardPreviews.forEach(preview => {
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
  
  // Handle card input changes
  const handleCardChange = (index, field, value) => {
    const updatedCards = [...formData.cards];
    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      cards: updatedCards
    }));
  };
  
  // Handle card feature changes
  const handleFeatureChange = (cardIndex, featureIndex, value) => {
    const updatedCards = [...formData.cards];
    const features = [...updatedCards[cardIndex].features];
    features[featureIndex] = value;
    
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      features
    };
    
    setFormData(prev => ({
      ...prev,
      cards: updatedCards
    }));
  };
  
  // Add feature to card
  const addFeature = (cardIndex) => {
    const updatedCards = [...formData.cards];
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      features: [...updatedCards[cardIndex].features, '']
    };
    
    setFormData(prev => ({
      ...prev,
      cards: updatedCards
    }));
  };
  
  // Remove feature from card
  const removeFeature = (cardIndex, featureIndex) => {
    if (formData.cards[cardIndex].features.length <= 1) {
      toast.warning('At least one feature is required');
      return;
    }
    
    const updatedCards = [...formData.cards];
    const features = updatedCards[cardIndex].features.filter((_, i) => i !== featureIndex);
    
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      features
    };
    
    setFormData(prev => ({
      ...prev,
      cards: updatedCards
    }));
  };
  
  // Handle card image changes
  const handleCardImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedCards = [...formData.cards];
      updatedCards[index] = {
        ...updatedCards[index],
        image: file
      };
      
      setFormData(prev => ({
        ...prev,
        cards: updatedCards
      }));
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      const updatedPreviews = [...cardPreviews];
      
      // Revoke old preview URL if exists
      if (updatedPreviews[index] && updatedPreviews[index].startsWith('blob:')) {
        URL.revokeObjectURL(updatedPreviews[index]);
      }
      
      updatedPreviews[index] = previewUrl;
      setCardPreviews(updatedPreviews);
    }
  };
  
  // Handle viewing section details
  const handleViewDetails = (section) => {
    setSelectedSection(section);
    setShowDetailsModal(true);
  };
  
  // Add new card
  const addCard = () => {
    setFormData(prev => ({
      ...prev,
      cards: [...prev.cards, { 
        title: '', 
        duration: '',
        subDuration: '',
        image: null,
        features: [''],
        price: '',
        emi: '',
        totalPrice: ''
      }]
    }));
    setCardPreviews(prev => [...prev, null]);
  };
  
  // Remove card
  const removeCard = (index) => {
    if (formData.cards.length <= 1) {
      toast.warning('At least one card is required');
      return;
    }
    
    const updatedCards = formData.cards.filter((_, i) => i !== index);
    const updatedPreviews = cardPreviews.filter((_, i) => i !== index);
    
    // Revoke the preview URL being removed
    if (cardPreviews[index] && cardPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(cardPreviews[index]);
    }
    
    setFormData(prev => ({
      ...prev,
      cards: updatedCards
    }));
    setCardPreviews(updatedPreviews);
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
      
      // Validate all cards have required fields
      const invalidCards = formData.cards.some(card => 
        !card.title || !card.duration || !card.features.some(f => f.trim())
      );
      
      if (invalidCards) {
        throw new Error('All cards must have a title, duration, and at least one feature');
      }
      
      // Check if all new cards have images when creating new section
      if (!editingId) {
        const missingImages = formData.cards.some(card => !card.image);
        if (missingImages) {
          throw new Error('All cards must have an image');
        }
      }
      
      let response;
      if (editingId) {
        // Update existing section
        response = await curatedAPI.update(editingId, formData);
        toast.success('Curated section updated successfully');
      } else {
        // Create new section
        response = await curatedAPI.create(formData);
        toast.success('Curated section created successfully');
      }
      
      // Reset form and refresh sections
      resetForm();
      fetchCuratedSections();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to save curated section';
      setMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Edit curated section
  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const section = await curatedAPI.getById(id);
      
      setEditingId(id);
      setFormData({
        country: section.country._id,
        mainHeading: section.mainHeading,
        cards: section.cards.map(card => ({
          ...card,
          // Keep image path as string for existing images
          image: card.image
        }))
      });
      
      // Set card previews from existing images
      setCardPreviews(section.cards.map(card => 
        card.image ? getImageUrl(card.image) : null
      ));
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      toast.error('Failed to load curated section for editing');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete curated section
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this curated section?')) {
      return;
    }
    
    setLoading(true);
    try {
      await curatedAPI.delete(id);
      toast.success('Curated section deleted successfully');
      fetchCuratedSections();
    } catch (error) {
      toast.error('Failed to delete curated section');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      country: '',
      mainHeading: '',
      cards: [{
        title: '',
        duration: '',
        subDuration: '',
        image: null,
        features: [''],
        price: '',
        emi: '',
        totalPrice: ''
      }]
    });
    
    // Clear previews
    cardPreviews.forEach(preview => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    setCardPreviews([null]);
  };
  
  // Filter curated sections by search term
  const filteredCurated = curatedSections.filter(section => {
    const searchLower = searchTerm.toLowerCase();
    return (
      section.mainHeading.toLowerCase().includes(searchLower) ||
      section.country.name.toLowerCase().includes(searchLower) ||
      (section.country.continent && section.country.continent.name.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-blue-800">
        <FaThList className="inline-block mr-2 mb-1" />
        Curated Itinerary Sections
      </h1>
      
      {/* Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? 'Edit Curated Section' : 'Add New Curated Section'}
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
          
          {/* Main Heading */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="mainHeading">
              Main Heading <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="mainHeading" 
              name="mainHeading" 
              value={formData.mainHeading} 
              onChange={handleInputChange} 
              className="w-full p-2 border rounded" 
              required 
            />
          </div>
          
          {/* Cards Section */}
          <div className="mb-4 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                <FaThList className="inline-block mr-2 mb-1" />
                Curated Cards
              </h3>
              <button 
                type="button" 
                onClick={addCard} 
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                <FaPlus className="inline-block mr-1" /> Add Card
              </button>
            </div>
            
            {formData.cards.map((card, index) => (
              <div key={index} className="p-4 border rounded mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Card #{index + 1}</h4>
                  {formData.cards.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeCard(index)} 
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash className="inline-block" />
                    </button>
                  )}
                </div>
                
                {/* Card Title */}
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1" htmlFor={`card-title-${index}`}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id={`card-title-${index}`}
                    value={card.title} 
                    onChange={(e) => handleCardChange(index, 'title', e.target.value)} 
                    className="w-full p-2 border rounded" 
                    required 
                  />
                </div>
                
                {/* Duration Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-gray-700 mb-1" htmlFor={`card-duration-${index}`}>
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id={`card-duration-${index}`}
                      value={card.duration} 
                      onChange={(e) => handleCardChange(index, 'duration', e.target.value)} 
                      className="w-full p-2 border rounded" 
                      placeholder="E.g. 5N/6D"
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1" htmlFor={`card-subduration-${index}`}>
                      Sub Duration
                    </label>
                    <input 
                      type="text" 
                      id={`card-subduration-${index}`}
                      value={card.subDuration} 
                      onChange={(e) => handleCardChange(index, 'subDuration', e.target.value)} 
                      className="w-full p-2 border rounded" 
                      placeholder="E.g. 2N City A · 3N City B"
                    />
                  </div>
                </div>
                
                {/* Price Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-gray-700 mb-1" htmlFor={`card-price-${index}`}>
                      Price
                    </label>
                    <input 
                      type="text" 
                      id={`card-price-${index}`}
                      value={card.price} 
                      onChange={(e) => handleCardChange(index, 'price', e.target.value)} 
                      className="w-full p-2 border rounded" 
                      placeholder="E.g. ₹42,500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1" htmlFor={`card-emi-${index}`}>
                      EMI
                    </label>
                    <input 
                      type="text" 
                      id={`card-emi-${index}`}
                      value={card.emi} 
                      onChange={(e) => handleCardChange(index, 'emi', e.target.value)} 
                      className="w-full p-2 border rounded" 
                      placeholder="E.g. ₹14,167/month"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1" htmlFor={`card-totalprice-${index}`}>
                      Total Price
                    </label>
                    <input 
                      type="text" 
                      id={`card-totalprice-${index}`}
                      value={card.totalPrice} 
                      onChange={(e) => handleCardChange(index, 'totalPrice', e.target.value)} 
                      className="w-full p-2 border rounded" 
                      placeholder="E.g. ₹85,000"
                    />
                  </div>
                </div>
                
                {/* Features */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-gray-700">
                      Features <span className="text-red-500">*</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => addFeature(index)} 
                      className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      <FaPlus className="inline-block mr-1" /> Add Feature
                    </button>
                  </div>
                  
                  {card.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center mb-2">
                      <input 
                        type="text" 
                        value={feature} 
                        onChange={(e) => handleFeatureChange(index, featureIndex, e.target.value)} 
                        className="flex-grow p-2 border rounded" 
                        placeholder="E.g. Daily Breakfast"
                        required 
                      />
                      {card.features.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeFeature(index, featureIndex)} 
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Card Image */}
                <div>
                  <label className="block text-gray-700 mb-1" htmlFor={`card-image-${index}`}>
                    Image {editingId && '(Leave empty to keep current image)'} {!editingId && <span className="text-red-500">*</span>}
                  </label>
                  <input 
                    type="file" 
                    id={`card-image-${index}`}
                    onChange={(e) => handleCardImageChange(index, e)} 
                    className="w-full p-2 border rounded" 
                    accept="image/*" 
                    required={!editingId && !cardPreviews[index]} 
                  />
                  
                  {cardPreviews[index] && (
                    <div className="mt-2">
                      <img 
                        src={cardPreviews[index]} 
                        alt={`Card ${index + 1}`} 
                        className="w-40 h-auto object-cover border rounded" 
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
              {editingId ? 'Update Section' : 'Save Section'}
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
      
      {/* Curated Sections Listing */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            <FaThList className="inline-block mr-2 mb-1" />
            Curated Sections
          </h2>
          
          {/* Search & Filter */}
          <div className="flex">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 pr-8 border rounded"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Curated Sections Table */}
        {loading && !editingId ? (
          <div className="flex justify-center my-8">
            <FaSpinner className="animate-spin text-blue-500 text-4xl" />
          </div>
        ) : filteredCurated.length === 0 ? (
          <p className="text-gray-500 my-4">No curated sections found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Country</th>
                  <th className="py-2 px-4 border-b text-left">Continent</th>
                  <th className="py-2 px-4 border-b text-left">Main Heading</th>
                  <th className="py-2 px-4 border-b text-left">Cards</th>
                  <th className="py-2 px-4 border-b text-left">Preview</th>
                  <th className="py-2 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCurated.map(section => (
                  <tr key={section._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{section.country.name}</td>
                    <td className="py-2 px-4 border-b">
                      {section.country.continent ? section.country.continent.name : 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b">{section.mainHeading}</td>
                    <td className="py-2 px-4 border-b">{section.cards.length} cards</td>
                    <td className="py-2 px-4 border-b">
                      {section.cards[0]?.image && (
                        <img
                          src={getImageUrl(section.cards[0].image)}
                          alt={section.cards[0].title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        onClick={() => handleViewDetails(section)}
                        className="text-green-500 hover:text-green-700 mr-2"
                        title="View Details"
                      >
                        <FaInfoCircle />
                      </button>
                      <button
                        onClick={() => handleEdit(section._id)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(section._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <FaTrash />
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
      {showDetailsModal && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Package Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaWindowClose className="text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Main Heading */}
              <div className="mb-6 text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-blue-800 mb-2">{selectedSection.mainHeading}</h3>
                <div className="mb-3 text-sm text-gray-600 flex justify-center items-center">
                  <FaGlobe className="mr-2" />
                  <span>{selectedSection.country.name}, {selectedSection.country.continent?.name}</span>
                </div>
              </div>
              
              {/* Cards Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedSection.cards.map((card, index) => (
                  <div key={index} className="bg-white border rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden">
                      {card.image && (
                        <img 
                          src={getImageUrl(card.image)} 
                          alt={card.title}
                          className="w-full h-full object-cover" 
                        />
                      )}
                      <div className="absolute top-0 right-0 bg-blue-500 text-white py-1 px-3 rounded-bl-lg font-semibold">
                        {card.duration}
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-4">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h4>
                      
                      {card.subDuration && (
                        <div className="flex items-center text-gray-600 mb-3">
                          <FaCalendarAlt className="mr-2 text-blue-500" />
                          <span>{card.subDuration}</span>
                        </div>
                      )}
                      
                      {/* Features */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                          <FaListUl className="mr-2 text-blue-500" />
                          Inclusions
                        </h5>
                        <ul className="space-y-1">
                          {card.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Price Section */}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-sm text-gray-500">Starting from</span>
                            <div className="text-2xl font-bold text-blue-600">{card.price}</div>
                            {card.emi && (
                              <div className="text-xs text-gray-500">EMI: {card.emi}</div>
                            )}
                          </div>
                          
                          {card.totalPrice && (
                            <div className="text-right">
                              <span className="text-sm text-gray-500">Total</span>
                              <div className="font-semibold">{card.totalPrice}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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

export default Curated;
