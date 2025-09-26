import React, { useState, useEffect } from 'react';
import { 
  FaGlobe, 
  FaPlus, 
  FaMinus, 
  FaSpinner, 
  FaEdit, 
  FaTrash, 
  FaSave,
  FaMapMarkerAlt,
  FaBox,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaTimes
} from 'react-icons/fa';

// API service functions
const API_BASE_URL = 'http://globe.ridealmobility.com';
const GROUP_PACKAGES_API = `${API_BASE_URL}/api/group-packages`;

const groupTourAPI = {
  getAll: async () => {
    const response = await fetch(GROUP_PACKAGES_API);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  },
  getById: async (id) => {
    const response = await fetch(`${GROUP_PACKAGES_API}/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  },
  create: async (packageData) => {
    try {
      const formData = new FormData();
      // Hero Data
      const heroData = {
        title: packageData.hero.title || '',
        subtitle: packageData.hero.subtitle || '',
        description: packageData.hero.description || ''
      };
      formData.append('hero', JSON.stringify(heroData));
      // Regions Data
      const regionsData = packageData.regions.map(region => ({
        region: region.region || '',
        packages: region.packages.map(pkg => ({
          title: pkg.title || '',
          days: pkg.days || '',
          departures: pkg.departures || [],
          price: pkg.price || '',
          image: pkg.image || ''
        }))
      }));
      formData.append('regions', JSON.stringify(regionsData));
      // Hero Images
      if (packageData.heroBackgrounds && packageData.heroBackgrounds.length > 0) {
        packageData.heroBackgrounds.forEach(image => {
          if (image instanceof File) {
            formData.append('heroBackgrounds', image);
          }
        });
      }
      // Package Images
      if (packageData.packagesImages && packageData.packagesImages.length > 0) {
        packageData.packagesImages.forEach(image => {
          if (image instanceof File) {
            formData.append('packagesImages', image);
          }
        });
      }
      const response = await fetch(GROUP_PACKAGES_API, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating group package:', error);
      throw error;
    }
  },
  update: async (id, packageData) => {
    try {
      const formData = new FormData();
      // Hero Data
      const heroData = {
        title: packageData.hero.title || '',
        subtitle: packageData.hero.subtitle || '',
        description: packageData.hero.description || ''
      };
      formData.append('hero', JSON.stringify(heroData));
      // Regions Data
      const regionsData = packageData.regions.map(region => ({
        region: region.region || '',
        packages: region.packages.map(pkg => ({
          title: pkg.title || '',
          days: pkg.days || '',
          departures: pkg.departures || [],
          price: pkg.price || '',
          image: pkg.image || ''
        }))
      }));
      formData.append('regions', JSON.stringify(regionsData));
      // Hero Images
      if (packageData.heroBackgrounds && packageData.heroBackgrounds.length > 0) {
        packageData.heroBackgrounds.forEach(image => {
          if (image instanceof File) {
            formData.append('heroBackgrounds', image);
          }
        });
      }
      // Package Images
      if (packageData.packagesImages && packageData.packagesImages.length > 0) {
        packageData.packagesImages.forEach(image => {
          if (image instanceof File) {
            formData.append('packagesImages', image);
          }
        });
      }
      const response = await fetch(`${GROUP_PACKAGES_API}/${id}`, {
        method: 'PUT',
        body: formData
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating group package:', error);
      throw error;
    }
  },
  delete: async (id) => {
    const response = await fetch(`${GROUP_PACKAGES_API}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  }
};

const GroupTour = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    hero: {
      title: '',
      subtitle: '',
      description: '',
      backgroundImages: []
    },
    regions: [],
    heroBackgrounds: [],
    packagesImages: []
  });
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    fetchPackages();
  }, []);
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await groupTourAPI.getAll();
      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setMessage({ type: 'error', text: 'Failed to fetch group tour packages' });
    } finally {
      setLoading(false);
    }
  };

  // --- Hero Section Handlers ---
  const handleHeroInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [name]: value
      }
    }));
  };
  const handleHeroImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      heroBackgrounds: [...prev.heroBackgrounds, ...files]
    }));
  };
  const removeHeroImage = (index) => {
    setFormData(prev => ({
      ...prev,
      heroBackgrounds: prev.heroBackgrounds.filter((_, i) => i !== index)
    }));
  };

  // --- Region Handlers ---
  const addRegion = () => {
    setFormData(prev => ({
      ...prev,
      regions: [
        ...prev.regions,
        {
          region: '',
          packages: []
        }
      ]
    }));
  };
  const removeRegion = (index) => {
    // Calculate which package images to remove
    const packageCountToRemove = formData.regions[index].packages.length;
    let imageIndexStart = 0;
    for (let i = 0; i < index; i++) {
      imageIndexStart += formData.regions[i].packages.length;
    }
    setFormData(prev => {
      const newPackagesImages = [...prev.packagesImages];
      newPackagesImages.splice(imageIndexStart, packageCountToRemove);
      return {
        ...prev,
        regions: prev.regions.filter((_, i) => i !== index),
        packagesImages: newPackagesImages
      };
    });
  };
  const handleRegionInputChange = (regionIndex, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.map((region, i) =>
        i === regionIndex
          ? { ...region, [name]: value }
          : region
      )
    }));
  };

  // --- Package Handlers ---
  const addPackage = (regionIndex) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.map((region, i) =>
        i === regionIndex
          ? {
              ...region,
              packages: [
                ...region.packages,
                {
                  title: '',
                  days: '',
                  departures: [],
                  price: '',
                  image: null
                }
              ]
            }
          : region
      )
    }));
  };
  const removePackage = (regionIndex, packageIndex) => {
    let absoluteImageIndex = 0;
    for (let r = 0; r < regionIndex; r++) {
      absoluteImageIndex += formData.regions[r].packages.length;
    }
    absoluteImageIndex += packageIndex;
    setFormData(prev => {
      const newPackagesImages = [...prev.packagesImages];
      if (absoluteImageIndex < newPackagesImages.length) {
        newPackagesImages.splice(absoluteImageIndex, 1);
      }
      return {
        ...prev,
        regions: prev.regions.map((region, r) =>
          r === regionIndex
            ? {
                ...region,
                packages: region.packages.filter((_, p) => p !== packageIndex)
              }
            : region
        ),
        packagesImages: newPackagesImages
      };
    });
  };
  const handlePackageInputChange = (regionIndex, packageIndex, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.map((region, r) =>
        r === regionIndex
          ? {
              ...region,
              packages: region.packages.map((pkg, p) =>
                p === packageIndex
                  ? { ...pkg, [name]: value }
                  : pkg
              )
            }
          : region
      )
    }));
  };
  const handlePackageImageUpload = (regionIndex, packageIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;
    let absoluteImageIndex = 0;
    for (let r = 0; r < regionIndex; r++) {
      absoluteImageIndex += formData.regions[r].packages.length;
    }
    absoluteImageIndex += packageIndex;
    setFormData(prev => {
      const newPackagesImages = [...prev.packagesImages];
      newPackagesImages[absoluteImageIndex] = file;
      return {
        ...prev,
        packagesImages: newPackagesImages
      };
    });
  };

  // --- Departures Handlers ---
  const addDeparture = (regionIndex, packageIndex) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.map((region, r) =>
        r === regionIndex
          ? {
              ...region,
              packages: region.packages.map((pkg, p) =>
                p === packageIndex
                  ? { ...pkg, departures: [...(pkg.departures || []), ''] }
                  : pkg
              )
            }
          : region
      )
    }));
  };
  const removeDeparture = (regionIndex, packageIndex, depIndex) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.map((region, r) =>
        r === regionIndex
          ? {
              ...region,
              packages: region.packages.map((pkg, p) =>
                p === packageIndex
                  ? { ...pkg, departures: pkg.departures.filter((_, i) => i !== depIndex) }
                  : pkg
              )
            }
          : region
      )
    }));
  };
  const handleDepartureChange = (regionIndex, packageIndex, depIndex, value) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.map((region, r) =>
        r === regionIndex
          ? {
              ...region,
              packages: region.packages.map((pkg, p) =>
                p === packageIndex
                  ? {
                      ...pkg,
                      departures: pkg.departures.map((dep, i) => i === depIndex ? value : dep)
                    }
                  : pkg
              )
            }
          : region
      )
    }));
  };

  // --- Form Submission and Editing ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let response;
      if (editingId) {
        response = await groupTourAPI.update(editingId, formData);
      } else {
        response = await groupTourAPI.create(formData);
      }
      if (response.message) {
        setMessage({ type: 'success', text: response.message });
        setShowForm(false);
        resetForm();
        fetchPackages();
      } else {
        throw new Error('Operation failed: No message received from server');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage({ type: 'error', text: error.message || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const pkg = await groupTourAPI.getById(id);
      if (!pkg) {
        throw new Error('Package not found');
      }
      setFormData({
        hero: {
          title: pkg.hero?.title || '',
          subtitle: pkg.hero?.subtitle || '',
          description: pkg.hero?.description || '',
          backgroundImages: pkg.hero?.backgroundImages || []
        },
        regions: pkg.regions?.map(region => ({
          region: region.region || '',
          packages: region.packages?.map(pkg => ({
            title: pkg.title || '',
            days: pkg.days || '',
            departures: pkg.departures || [],
            price: pkg.price || '',
            image: pkg.image || null
          })) || []
        })) || [],
        heroBackgrounds: [],
        packagesImages: []
      });
      setEditingId(id);
      setShowForm(true);
      setActiveSection('hero');
      setMessage({ type: '', text: '' });
    } catch (error) {
      console.error('Error fetching package for edit:', error);
      setMessage({ type: 'error', text: 'Failed to load package for editing' });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this group package? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await groupTourAPI.delete(id);
        if (response.message) {
          setMessage({ type: 'success', text: response.message });
          fetchPackages();
        } else {
          throw new Error('Failed to delete package: No message received from server');
        }
      } catch (error) {
        console.error('Error deleting package:', error);
        setMessage({ type: 'error', text: error.message || 'Failed to delete package' });
      } finally {
        setLoading(false);
      }
    }
  };
  const resetForm = () => {
    setFormData({
      hero: {
        title: '',
        subtitle: '',
        description: '',
        backgroundImages: []
      },
      regions: [],
      heroBackgrounds: [],
      packagesImages: []
    });
    setEditingId(null);
    setActiveSection('hero');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  // --- Form Section Rendering ---
  const renderFormSection = () => {
    switch (activeSection) {
      case 'hero':
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hero Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.hero.title}
                  onChange={handleHeroInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hero title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.hero.subtitle}
                  onChange={handleHeroInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hero subtitle"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.hero.description}
                onChange={handleHeroInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Enter hero description"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Images (Multiple)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleHeroImagesUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            {formData.heroBackgrounds.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Images:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {formData.heroBackgrounds.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Hero background ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeHeroImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {formData.hero.backgroundImages && formData.hero.backgroundImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Images:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {formData.hero.backgroundImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`${API_BASE_URL}/${image}`}
                        alt={`Hero background ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'regions':
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Regions & Packages</h3>
              <button
                type="button"
                onClick={addRegion}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-1"
              >
                <FaPlus size={12} /> Add Region
              </button>
            </div>
            {formData.regions.length === 0 && (
              <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FaGlobe className="mx-auto text-gray-400 text-4xl mb-3" />
                <p className="text-gray-500">No regions added yet. Click "Add Region" to get started.</p>
              </div>
            )}
            {formData.regions.map((region, regionIndex) => (
              <div key={regionIndex} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Region {regionIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeRegion(regionIndex)}
                    className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <FaMinus size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region Name</label>
                    <input
                      type="text"
                      name="region"
                      value={region.region}
                      onChange={(e) => handleRegionInputChange(regionIndex, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="E.g., Europe, Asia, etc."
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium text-gray-700">Packages</h5>
                    <button
                      type="button"
                      onClick={() => addPackage(regionIndex)}
                      className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 text-xs flex items-center gap-1"
                    >
                      <FaPlus size={10} /> Add Package
                    </button>
                  </div>
                  {(!region.packages || region.packages.length === 0) && (
                    <div className="text-center p-4 bg-white rounded-lg border border-dashed border-gray-300">
                      <FaBox className="mx-auto text-gray-400 text-2xl mb-2" />
                      <p className="text-gray-500 text-sm">No packages added for this region yet.</p>
                    </div>
                  )}
                  {region.packages && region.packages.map((pkg, packageIndex) => (
                    <div key={packageIndex} className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="text-sm font-medium text-gray-700">Package {packageIndex + 1}</h6>
                        <button
                          type="button"
                          onClick={() => removePackage(regionIndex, packageIndex)}
                          className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          <FaMinus size={10} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Package Title</label>
                          <input
                            type="text"
                            name="title"
                            value={pkg.title}
                            onChange={(e) => handlePackageInputChange(regionIndex, packageIndex, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="E.g., Paris Explorer"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePackageImageUpload(regionIndex, packageIndex, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          {pkg.image && (
                            <div className="mt-2">
                              <img
                                src={`${API_BASE_URL}/${pkg.image}`}
                                alt={pkg.title}
                                className="h-16 w-auto object-cover rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                          <input
                            type="number"
                            name="price"
                            value={pkg.price}
                            onChange={(e) => handlePackageInputChange(regionIndex, packageIndex, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="E.g., 1999"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Days</label>
                          <input
                            type="text"
                            name="days"
                            value={pkg.days}
                            onChange={(e) => handlePackageInputChange(regionIndex, packageIndex, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="E.g., 7 Days / 6 Nights"
                          />
                        </div>
                      </div>
                      {/* Departures */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Departures (months, e.g. Oct, Nov, Dec)
                        </label>
                        {pkg.departures && pkg.departures.map((dep, depIndex) => (
                          <div key={depIndex} className="flex items-center gap-2 mb-1">
                            <input
                              type="text"
                              value={dep}
                              onChange={e => handleDepartureChange(regionIndex, packageIndex, depIndex, e.target.value)}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Enter a month"
                            />
                            <button
                              type="button"
                              onClick={() => removeDeparture(regionIndex, packageIndex, depIndex)}
                              className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                            >
                              <FaTimes size={10} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addDeparture(regionIndex, packageIndex)}
                          className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs flex items-center gap-1 mt-2"
                        >
                          <FaPlus size={8} /> Add Departure
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-5 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Group Tour Management</h1>
        <p className="text-lg opacity-90">Manage group tour packages and destinations</p>
      </div>
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
          message.type === 'error' 
            ? 'bg-red-50 border-red-500 text-red-700' 
            : 'bg-green-50 border-green-500 text-green-700'
        }`}>
          {message.text}
        </div>
      )}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              resetForm();
            }
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 shadow-lg"
        >
          <FaPlus />
          {showForm ? 'Cancel' : 'Add New Group Tour Package'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingId ? 'Edit Group Tour Package' : 'Add New Group Tour Package'}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <div className="flex items-center gap-1">
                    <FaSave />
                    {editingId ? 'Update Package' : 'Create Package'}
                  </div>
                )}
              </button>
            </div>
          </div>
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm ${
                activeSection === 'hero'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveSection('hero')}
            >
              Hero Section
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm ${
                activeSection === 'regions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveSection('regions')}
            >
              Regions & Packages
            </button>
          </div>
          {renderFormSection()}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <div className="flex items-center gap-1">
                  <FaSave />
                  {editingId ? 'Update Package' : 'Create Package'}
                </div>
              )}
            </button>
          </div>
        </form>
      )}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3">
          Group Tour Packages ({packages.length})
        </h2>
        {packages.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
            <FaGlobe className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No group tour packages found. Create your first package above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <div key={pkg._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 truncate">
                    {pkg.hero?.title || 'Unnamed Package'}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(pkg._id)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">{pkg.hero?.subtitle}</p>
                {pkg.hero?.backgroundImages && pkg.hero.backgroundImages.length > 0 && (
                  <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={`${API_BASE_URL}/${pkg.hero.backgroundImages[0]}`}
                      alt={pkg.hero?.title}
                      className="w-full h-full object-cover"
                    />
                    {pkg.hero.backgroundImages.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                        +{pkg.hero.backgroundImages.length - 1} more
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-3">
                  {pkg.regions && pkg.regions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-blue-500" />
                        Regions ({pkg.regions.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {pkg.regions.map((region, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {region.region}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <FaBox className="text-purple-500" />
                      Packages
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pkg.regions && pkg.regions.flatMap((region, rIndex) =>
                        region.packages && region.packages.map((p, pIndex) => (
                          <div key={`${rIndex}-${pIndex}`} className="p-2 bg-gray-50 rounded border text-sm">
                            <div className="font-medium">{p.title}</div>
                            {p.price && (
                              <div className="text-xs flex items-center gap-1 text-green-700">
                                <FaMoneyBillWave size={10} /> {p.price}
                              </div>
                            )}
                            {p.days && (
                              <div className="text-xs flex items-center gap-1 text-gray-600">
                                <FaCalendarAlt size={10} /> {p.days}
                              </div>
                            )}
                            {p.departures && p.departures.length > 0 && (
                              <div className="text-xs text-blue-700 flex flex-wrap gap-1 mt-1">
                                Departures: {p.departures.map((dep, i) => (
                                  <span key={i} className="bg-blue-50 px-1 rounded">{dep}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created: {new Date(pkg.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto mb-3" />
            <p className="text-gray-700">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupTour;