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
  FaInfoCircle,
  FaCheckCircle,
  FaWindowClose,
  FaSearch,
  FaFileAlt,
  FaCaretDown,
  FaCaretUp,
  FaLightbulb
} from 'react-icons/fa';
import { simpleSectionAPI, getImageUrl } from '../../services/simpleSectionAPI';
import { countryAPI, continentAPI } from '../../services/itenaryAPI';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InspiredSimpleSection = () => {
  // State for sections
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State for form data
  const [formData, setFormData] = useState({
    country: '',
    mainHeading: '',
    cards: [{ title: '', description: '', image: null }]
  });
  
  // State for form visuals
  const [cardPreviews, setCardPreviews] = useState([null]);
  const [editingId, setEditingId] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  
  // State for countries/continents filtering
  const [countries, setCountries] = useState([]);
  const [continents, setContinents] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch simple sections
  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await simpleSectionAPI.getAll();
      setSections(data);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch simple sections' });
      toast.error('Failed to fetch simple sections');
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
    fetchSections();
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
  
  // Add new card
  const addCard = () => {
    setFormData(prev => ({
      ...prev,
      cards: [...prev.cards, { title: '', description: '', image: null }]
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
    const updatedPreviews = [...cardPreviews];
    
    // Revoke the preview URL being removed
    if (cardPreviews[index] && cardPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(cardPreviews[index]);
    }
    
    // Remove the preview at the index
    updatedPreviews.splice(index, 1);
    
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
      const invalidCards = formData.cards.some(card => !card.title || !card.description);
      if (invalidCards) {
        throw new Error('All cards must have a title and description');
      }
      
      // Check if all new cards have images when creating new section
      if (!editingId) {
        const missingImages = formData.cards.some(card => !card.image);
        if (missingImages) {
          throw new Error('All cards must have an image');
        }
      }
      
      // Create or update section
      let response;
      if (editingId) {
        response = await simpleSectionAPI.update(editingId, formData);
        toast.success('Simple section updated successfully');
      } else {
        response = await simpleSectionAPI.create(formData);
        toast.success('Simple section created successfully');
      }
      
      // Reset form
      resetForm();
      
      // Refresh sections list
      fetchSections();
      
    } catch (error) {
      toast.error(error.message || 'Failed to save simple section');
      setMessage({ type: 'error', text: error.message || 'Failed to save simple section' });
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      country: '',
      mainHeading: '',
      cards: [{ title: '', description: '', image: null }]
    });
    
    // Clear previews
    cardPreviews.forEach(preview => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    setCardPreviews([null]);
    
    // Clear editing state
    setEditingId(null);
  };
  
  // Handle edit section
  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const section = await simpleSectionAPI.getById(id);
      
      // Prepare card data
      const cards = section.cards.map(card => ({
        title: card.title || '',
        description: card.description || '',
        image: null,
        existingImage: card.image || ''  // Store existing image path
      }));
      
      setFormData({
        country: section.country._id || section.country,
        mainHeading: section.mainHeading || '',
        cards: cards.length > 0 ? cards : [{ title: '', description: '', image: null }]
      });
      
      // Set image previews
      const previews = section.cards.map(card => 
        card.image ? getImageUrl(card.image) : null
      );
      setCardPreviews(previews.length > 0 ? previews : [null]);
      
      setEditingId(id);
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      toast.error('Failed to load section for editing');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete section
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this simple section?')) {
      setLoading(true);
      try {
        await simpleSectionAPI.delete(id);
        toast.success('Simple section deleted successfully');
        fetchSections();
      } catch (error) {
        toast.error('Failed to delete simple section');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Toggle expanded section
  const toggleExpanded = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };
  
  // Filter countries by search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h1 className="text-2xl font-bold mb-6">
        <FaLightbulb className="inline mr-2 text-yellow-500" /> 
        Inspired Simple Section Management
      </h1>
      
      {/* Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Simple Section' : 'Add New Simple Section'}
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
          
          {/* Cards */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700">
                <FaFileAlt className="inline mr-2" /> Cards
              </label>
              <button
                type="button"
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center"
                onClick={addCard}
              >
                <FaPlus className="mr-1" /> Add Card
              </button>
            </div>
            
            {formData.cards.map((card, index) => (
              <div key={index} className="border rounded p-4 mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Card #{index + 1}</h3>
                  <button
                    type="button"
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    onClick={() => removeCard(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Card Title */}
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={card.title}
                      onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                      placeholder="Enter card title"
                      required
                    />
                  </div>
                  
                  {/* Card Image */}
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Image
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        id={`card-image-${index}`}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCardImageChange(index, e)}
                      />
                      <label
                        htmlFor={`card-image-${index}`}
                        className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-600 flex items-center text-sm"
                      >
                        <FaImage className="mr-1" /> Choose Image
                      </label>
                      <span className="text-gray-500 text-sm truncate max-w-xs">
                        {card.image ? card.image.name : (card.existingImage ? 'Current image will be kept' : 'No image selected')}
                      </span>
                    </div>
                    
                    {/* Image Preview */}
                    {cardPreviews[index] && (
                      <div className="mt-2 border rounded p-1 inline-block">
                        <img
                          src={cardPreviews[index]}
                          alt="Preview"
                          className="h-24 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Card Description */}
                <div>
                  <label className="block text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full p-2 border rounded"
                    value={card.description}
                    onChange={(e) => handleCardChange(index, 'description', e.target.value)}
                    placeholder="Enter card description"
                    rows="3"
                    required
                  />
                </div>
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
      
      {/* Simple Sections List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Simple Sections List</h2>
        
        {loading && !editingId ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-3xl text-blue-500" />
          </div>
        ) : sections.length === 0 ? (
          <div className="bg-gray-100 p-4 text-center rounded">
            No simple sections found. Add your first one!
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map(section => (
              <div key={section._id} className="border rounded-lg shadow-sm overflow-hidden">
                <div 
                  className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpanded(section._id)}
                >
                  <div>
                    <h3 className="font-bold">{section.mainHeading}</h3>
                    <p className="text-sm text-gray-600">
                      <FaGlobe className="inline mr-1" /> {section.country?.name || 'Unknown Country'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {section.cards?.length || 0} cards
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(section._id);
                      }}
                      className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(section._id);
                      }}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                    {expandedSection === section._id ? <FaCaretUp /> : <FaCaretDown />}
                  </div>
                </div>
                
                {/* Expanded content */}
                {expandedSection === section._id && (
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.cards && section.cards.map((card, idx) => (
                        <div key={idx} className="border rounded p-3 bg-gray-50">
                          {card.image && (
                            <div className="mb-2">
                              <img
                                src={getImageUrl(card.image)}
                                alt={card.title}
                                className="w-full h-40 object-cover rounded"
                              />
                            </div>
                          )}
                          <h5 className="font-semibold">{card.title}</h5>
                          <p className="text-sm mt-1">{card.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InspiredSimpleSection;
