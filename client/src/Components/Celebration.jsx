import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaImages, FaSave } from 'react-icons/fa';
import * as celebrationAPI from '../services/celebrationAPI';

// Base URL for API and images
const BASE_URL = "http://globe.ridealmobility.com";

// Helper function to format image URLs
const formatImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}/${imagePath}`;
};

const Celebration = () => {
  const [activeTab, setActiveTab] = useState('hero');
  
  // Common states for all sections
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Hero Section States
  const [heroSections, setHeroSections] = useState([]);
  const [selectedHero, setSelectedHero] = useState(null);
  const [heroForm, setHeroForm] = useState({
    heading: '',
    subheading: '',
    images: []
  });
  const [heroImagePreviews, setHeroImagePreviews] = useState([]);
  const [isEditingHero, setIsEditingHero] = useState(false);

  // Feature Section States (Destination Weddings)
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [featureForm, setFeatureForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: null
  });
  const [featureImagePreview, setFeatureImagePreview] = useState(null);
  const [isEditingFeature, setIsEditingFeature] = useState(false);

  // Event Section States (Why Choose Us)
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    introText: '',
    backgroundImage: null,
    features: [{ title: '', description: '', imageUrl: '' }]
  });
  const [eventBackgroundPreview, setEventBackgroundPreview] = useState(null);
  const [eventFeatureImagePreviews, setEventFeatureImagePreviews] = useState([null]);
  const [isEditingEvent, setIsEditingEvent] = useState(false);

  // Clear success/error messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'hero') {
      fetchHeroSections();
    } else if (activeTab === 'feature') {
      fetchFeatures();
    } else if (activeTab === 'event') {
      fetchEvents();
    }
  }, [activeTab]);

  // ********** HERO SECTION FUNCTIONS **********
  const fetchHeroSections = async () => {
    setIsLoading(true);
    try {
      const data = await celebrationAPI.fetchHeroSections();
      setHeroSections(data);
    } catch (err) {
      setError('Failed to fetch hero sections');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeroFormChange = (e) => {
    const { name, value } = e.target;
    setHeroForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeroImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create image previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setHeroImagePreviews(newPreviews);
    
    // Update form
    setHeroForm((prev) => ({ ...prev, images: files }));
  };

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('heading', heroForm.heading);
      formData.append('subheading', heroForm.subheading);
      
      if (heroForm.images && heroForm.images.length > 0) {
        heroForm.images.forEach(image => {
          formData.append('images', image);
        });
      }

      if (isEditingHero && selectedHero) {
        await celebrationAPI.updateHeroSection(selectedHero._id, formData);
        setSuccessMessage('Hero section updated successfully');
      } else {
        await celebrationAPI.createHeroSection(formData);
        setSuccessMessage('Hero section created successfully');
      }

      // Reset form and reload data
      resetHeroForm();
      fetchHeroSections();
    } catch (err) {
      setError(isEditingHero ? 'Failed to update hero section' : 'Failed to create hero section');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditHero = (hero) => {
    setSelectedHero(hero);
    setHeroForm({
      heading: hero.heading,
      subheading: hero.subheading,
      images: []
    });
    
    // Set image previews if available
    if (hero.images && hero.images.length > 0) {
      setHeroImagePreviews(hero.images.map(img => formatImageUrl(img)));
    } else {
      setHeroImagePreviews([]);
    }
    
    setIsEditingHero(true);
  };

  const handleDeleteHero = async (id) => {
    if (window.confirm('Are you sure you want to delete this hero section?')) {
      setIsLoading(true);
      try {
        await celebrationAPI.deleteHeroSection(id);
        setSuccessMessage('Hero section deleted successfully');
        fetchHeroSections();
      } catch (err) {
        setError('Failed to delete hero section');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetHeroForm = () => {
    setHeroForm({
      heading: '',
      subheading: '',
      images: []
    });
    setHeroImagePreviews([]);
    setSelectedHero(null);
    setIsEditingHero(false);
  };

  // ********** FEATURE SECTION FUNCTIONS (DESTINATION WEDDINGS) **********
  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      const data = await celebrationAPI.fetchFeatures();
      setFeatures(data);
    } catch (err) {
      setError('Failed to fetch features');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureFormChange = (e) => {
    const { name, value } = e.target;
    setFeatureForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeatureImagePreview(URL.createObjectURL(file));
      setFeatureForm((prev) => ({ ...prev, image: file }));
    }
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', featureForm.title);
      formData.append('subtitle', featureForm.subtitle);
      formData.append('description', featureForm.description);
      
      if (featureForm.image) {
        formData.append('image', featureForm.image);
      }

      if (isEditingFeature && selectedFeature) {
        await celebrationAPI.updateFeature(selectedFeature._id, formData);
        setSuccessMessage('Feature updated successfully');
      } else {
        await celebrationAPI.createFeature(formData);
        setSuccessMessage('Feature created successfully');
      }

      // Reset form and reload data
      resetFeatureForm();
      fetchFeatures();
    } catch (err) {
      setError(isEditingFeature ? 'Failed to update feature' : 'Failed to create feature');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFeature = (feature) => {
    setSelectedFeature(feature);
    setFeatureForm({
      title: feature.title,
      subtitle: feature.subtitle,
      description: feature.description,
      image: null
    });
    
    // Set image preview if available
    if (feature.imageUrl) {
      setFeatureImagePreview(formatImageUrl(feature.imageUrl));
    } else {
      setFeatureImagePreview(null);
    }
    
    setIsEditingFeature(true);
  };

  const handleDeleteFeature = async (id) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      setIsLoading(true);
      try {
        await celebrationAPI.deleteFeature(id);
        setSuccessMessage('Feature deleted successfully');
        fetchFeatures();
      } catch (err) {
        setError('Failed to delete feature');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetFeatureForm = () => {
    setFeatureForm({
      title: '',
      subtitle: '',
      description: '',
      image: null
    });
    setFeatureImagePreview(null);
    setSelectedFeature(null);
    setIsEditingFeature(false);
  };

  // ********** EVENT SECTION FUNCTIONS (WHY CHOOSE US) **********
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await celebrationAPI.fetchEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEventFeatureChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFeatures = [...eventForm.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [name]: value };
    setEventForm((prev) => ({ ...prev, features: updatedFeatures }));
  };

  const handleEventBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventBackgroundPreview(URL.createObjectURL(file));
      setEventForm((prev) => ({ ...prev, backgroundImage: file }));
    }
  };

  const handleEventFeatureImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedPreviews = [...eventFeatureImagePreviews];
      updatedPreviews[index] = URL.createObjectURL(file);
      setEventFeatureImagePreviews(updatedPreviews);
      
      const updatedFeatures = [...eventForm.features];
      updatedFeatures[index] = { ...updatedFeatures[index], newImage: file };
      setEventForm((prev) => ({ ...prev, features: updatedFeatures }));
    }
  };

  const addEventFeature = () => {
    setEventForm((prev) => ({
      ...prev,
      features: [...prev.features, { title: '', description: '', imageUrl: '' }]
    }));
    setEventFeatureImagePreviews((prev) => [...prev, null]);
  };

  const removeEventFeature = (index) => {
    if (eventForm.features.length > 1) {
      const updatedFeatures = [...eventForm.features];
      updatedFeatures.splice(index, 1);
      setEventForm((prev) => ({ ...prev, features: updatedFeatures }));
      
      const updatedPreviews = [...eventFeatureImagePreviews];
      updatedPreviews.splice(index, 1);
      setEventFeatureImagePreviews(updatedPreviews);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('introText', eventForm.introText);
      
      if (eventForm.backgroundImage) {
        formData.append('backgroundImage', eventForm.backgroundImage);
      }
      
      // Convert features to JSON and append
      const featuresForSubmit = eventForm.features.map(feature => ({
        title: feature.title,
        description: feature.description,
        imageUrl: feature.imageUrl
      }));
      formData.append('features', JSON.stringify(featuresForSubmit));
      
      // Append feature images
      eventForm.features.forEach((feature, index) => {
        if (feature.newImage) {
          formData.append('images', feature.newImage);
        }
      });

      if (isEditingEvent && selectedEvent) {
        await celebrationAPI.updateEvent(selectedEvent._id, formData);
        setSuccessMessage('Event updated successfully');
      } else {
        await celebrationAPI.createEvent(formData);
        setSuccessMessage('Event created successfully');
      }

      // Reset form and reload data
      resetEventForm();
      fetchEvents();
    } catch (err) {
      setError(isEditingEvent ? 'Failed to update event' : 'Failed to create event');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    
    setEventForm({
      introText: event.introText,
      backgroundImage: null,
      features: event.features.map(feature => ({
        title: feature.title,
        description: feature.description,
        imageUrl: feature.imageUrl
      }))
    });
    
    // Set background image preview if available
    if (event.backgroundImage) {
      setEventBackgroundPreview(formatImageUrl(event.backgroundImage));
    } else {
      setEventBackgroundPreview(null);
    }
    
    // Set feature image previews if available
    setEventFeatureImagePreviews(
      event.features.map(feature => 
        feature.imageUrl ? formatImageUrl(feature.imageUrl) : null
      )
    );
    
    setIsEditingEvent(true);
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setIsLoading(true);
      try {
        await celebrationAPI.deleteEvent(id);
        setSuccessMessage('Event deleted successfully');
        fetchEvents();
      } catch (err) {
        setError('Failed to delete event');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetEventForm = () => {
    setEventForm({
      introText: '',
      backgroundImage: null,
      features: [{ title: '', description: '', imageUrl: '' }]
    });
    setEventBackgroundPreview(null);
    setEventFeatureImagePreviews([null]);
    setSelectedEvent(null);
    setIsEditingEvent(false);
  };

  // Render tabs navigation
  const renderTabNavigation = () => (
    <div className="mb-4 border-b border-gray-200">
      <ul className="flex flex-wrap -mb-px">
        <li className="mr-2">
          <button 
            className={`inline-block p-4 ${activeTab === 'hero' ? 'text-blue-600 border-b-2 border-blue-600 rounded-t-lg' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
            onClick={() => setActiveTab('hero')}
          >
            Hero Section
          </button>
        </li>
        <li className="mr-2">
          <button 
            className={`inline-block p-4 ${activeTab === 'feature' ? 'text-blue-600 border-b-2 border-blue-600 rounded-t-lg' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
            onClick={() => setActiveTab('feature')}
          >
            Destination Weddings
          </button>
        </li>
        <li className="mr-2">
          <button 
            className={`inline-block p-4 ${activeTab === 'event' ? 'text-blue-600 border-b-2 border-blue-600 rounded-t-lg' : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'}`}
            onClick={() => setActiveTab('event')}
          >
            Why Choose Us
          </button>
        </li>
      </ul>
    </div>
  );

  // ********** RENDER HERO SECTION CONTENT **********
  const renderHeroSection = () => (
    <div className="mt-4">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditingHero ? 'Edit Hero Section' : 'Add New Hero Section'}
        </h2>
        <form onSubmit={handleHeroSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
              <input
                type="text"
                name="heading"
                value={heroForm.heading}
                onChange={handleHeroFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subheading</label>
              <input
                type="text"
                name="subheading"
                value={heroForm.subheading}
                onChange={handleHeroFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images (Upload multiple)
            </label>
            <input
              type="file"
              name="images"
              onChange={handleHeroImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              multiple
              accept="image/*"
              required={!isEditingHero}
            />
          </div>
          
          {heroImagePreviews.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {isEditingHero ? 'Current Images:' : 'Image Previews:'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {heroImagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`${isEditingHero ? 'Current' : 'Preview'} ${index + 1}`}
                      className={`w-full h-32 object-cover rounded-md ${isEditingHero ? 'border-2 border-green-300' : ''}`}
                    />
                    {isEditingHero && (
                      <div className="absolute top-1 right-1 bg-green-100 text-green-700 text-xs px-1 rounded">
                        Current
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {isEditingHero && (
                <p className="text-sm text-gray-600 mt-2">Upload new images only if you want to replace existing ones</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            {isEditingHero && (
              <button
                type="button"
                onClick={resetHeroForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (
                <>
                  <FaSave className="mr-2" />
                  {isEditingHero ? 'Update Section' : 'Add Section'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* List of Hero Sections */}
      <h2 className="text-xl font-semibold mb-4">Hero Sections</h2>
      {isLoading && heroSections.length === 0 ? (
        <p>Loading hero sections...</p>
      ) : heroSections.length === 0 ? (
        <p>No hero sections found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {heroSections.map((section) => (
            <div key={section._id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">{section.heading}</h3>
              <p className="text-gray-600 mb-3">{section.subheading}</p>
              
              {section.images && section.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {section.images.slice(0, 4).map((img, idx) => (
                    <img
                      key={idx}
                      src={formatImageUrl(img)}
                      alt={`Hero image ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  ))}
                  {section.images.length > 4 && (
                    <div className="col-span-2 text-center text-sm text-gray-500">
                      +{section.images.length - 4} more images
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEditHero(section)}
                  className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteHero(section._id)}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ********** RENDER FEATURE SECTION CONTENT (DESTINATION WEDDINGS) **********
  const renderFeatureSection = () => (
    <div className="mt-4">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditingFeature ? 'Edit Destination Wedding' : 'Add New Destination Wedding'}
        </h2>
        <form onSubmit={handleFeatureSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={featureForm.title}
                onChange={handleFeatureFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={featureForm.subtitle}
                onChange={handleFeatureFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={featureForm.description}
              onChange={handleFeatureFormChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              name="image"
              onChange={handleFeatureImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept="image/*"
              required={!isEditingFeature}
            />
          </div>
          
          {featureImagePreview && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {isEditingFeature ? 'Current Image:' : 'Image Preview:'}
              </p>
              <div className="relative inline-block">
                <img
                  src={featureImagePreview}
                  alt={isEditingFeature ? 'Current feature' : 'Feature preview'}
                  className={`h-40 object-cover rounded-md ${isEditingFeature ? 'border-2 border-green-300' : ''}`}
                />
                {isEditingFeature && (
                  <div className="absolute top-1 right-1 bg-green-100 text-green-700 text-xs px-1 rounded">
                    Current
                  </div>
                )}
              </div>
              {isEditingFeature && (
                <p className="text-sm text-gray-600 mt-2">Upload new image only if you want to replace this one</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            {isEditingFeature && (
              <button
                type="button"
                onClick={resetFeatureForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (
                <>
                  <FaSave className="mr-2" />
                  {isEditingFeature ? 'Update Destination Wedding' : 'Add Destination Wedding'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* List of Features */}
      <h2 className="text-xl font-semibold mb-4">Destination Weddings</h2>
      {isLoading && features.length === 0 ? (
        <p>Loading destination weddings...</p>
      ) : features.length === 0 ? (
        <p>No destination weddings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div key={feature._id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                {feature.imageUrl && (
                  <img
                    src={formatImageUrl(feature.imageUrl)}
                    alt={feature.title}
                    className="w-20 h-20 object-cover rounded-md mr-4"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-gray-500">{feature.subtitle}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-3 line-clamp-3">{feature.description}</p>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEditFeature(feature)}
                  className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteFeature(feature._id)}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ********** RENDER EVENT SECTION CONTENT (WHY CHOOSE US) **********
  const renderEventSection = () => (
    <div className="mt-4">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditingEvent ? 'Edit Why Choose Us Section' : 'Add Why Choose Us Section'}
        </h2>
        <form onSubmit={handleEventSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Introduction Text
            </label>
            <textarea
              name="introText"
              value={eventForm.introText}
              onChange={handleEventFormChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Image
            </label>
            <input
              type="file"
              name="backgroundImage"
              onChange={handleEventBackgroundChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept="image/*"
              required={!isEditingEvent}
            />
          </div>
          
          {eventBackgroundPreview && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {isEditingEvent ? 'Current Background Image:' : 'Background Image Preview:'}
              </p>
              <div className="relative inline-block">
                <img
                  src={eventBackgroundPreview}
                  alt={isEditingEvent ? 'Current background' : 'Background preview'}
                  className={`h-40 object-cover rounded-md ${isEditingEvent ? 'border-2 border-green-300' : ''}`}
                />
                {isEditingEvent && (
                  <div className="absolute top-1 right-1 bg-green-100 text-green-700 text-xs px-1 rounded">
                    Current
                  </div>
                )}
              </div>
              {isEditingEvent && (
                <p className="text-sm text-gray-600 mt-2">Upload new image only if you want to replace this one</p>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Features</h3>
              <button
                type="button"
                onClick={addEventFeature}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                <FaPlus className="mr-1" /> Add Feature
              </button>
            </div>
            
            {eventForm.features.map((feature, index) => (
              <div key={index} className="p-3 border border-gray-300 rounded-md mb-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Feature {index + 1}</h4>
                  {eventForm.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEventFeature(index)}
                      className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={feature.title}
                      onChange={(e) => handleEventFeatureChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feature Image
                    </label>
                    <input
                      type="file"
                      name="featureImage"
                      onChange={(e) => handleEventFeatureImageChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept="image/*"
                      required={!isEditingEvent || !eventFeatureImagePreviews[index]}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={feature.description}
                    onChange={(e) => handleEventFeatureChange(index, e)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
                
                {eventFeatureImagePreviews[index] && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {isEditingEvent ? 'Current Image:' : 'Image Preview:'}
                    </p>
                    <div className="relative inline-block">
                      <img
                        src={eventFeatureImagePreviews[index]}
                        alt={`Feature ${index + 1} ${isEditingEvent ? 'current' : 'preview'}`}
                        className={`h-24 object-cover rounded-md ${isEditingEvent ? 'border-2 border-green-300' : ''}`}
                      />
                      {isEditingEvent && (
                        <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-xs px-1 rounded">
                          Current
                        </div>
                      )}
                    </div>
                    {isEditingEvent && (
                      <p className="text-xs text-gray-600 mt-1">Upload new image only if you want to replace this one</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2">
            {isEditingEvent && (
              <button
                type="button"
                onClick={resetEventForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (
                <>
                  <FaSave className="mr-2" />
                  {isEditingEvent ? 'Update Section' : 'Add Section'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* List of Events */}
      <h2 className="text-xl font-semibold mb-4">Why Choose Us Sections</h2>
      {isLoading && events.length === 0 ? (
        <p>Loading sections...</p>
      ) : events.length === 0 ? (
        <p>No sections found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                {event.backgroundImage && (
                  <img
                    src={formatImageUrl(event.backgroundImage)}
                    alt="Background"
                    className="w-full md:w-1/3 h-40 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Introduction</h3>
                  <p className="text-gray-600 mb-3">{event.introText}</p>
                  
                  <h3 className="text-lg font-semibold mb-2">Features ({event.features.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {event.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        {feature.imageUrl && (
                          <img
                            src={formatImageUrl(feature.imageUrl)}
                            alt={feature.title}
                            className="w-12 h-12 object-cover rounded-md mr-2"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{feature.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                    {event.features.length > 4 && (
                      <div className="text-center text-sm text-gray-500">
                        +{event.features.length - 4} more features
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEditEvent(event)}
                  className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteEvent(event._id)}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="content-card">
      <h1 className="page-title">Celebration Management</h1>
      
      {/* Success and Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
          <p>{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {renderTabNavigation()}
      
      {activeTab === 'hero' && renderHeroSection()}
      {activeTab === 'feature' && renderFeatureSection()}
      {activeTab === 'event' && renderEventSection()}
    </div>
  );
};

export default Celebration;
