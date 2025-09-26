import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit,
  FaInfoCircle, 
  FaVideo,
  FaImage,
  FaImages,
  FaSearch, 
  FaTimes,
  FaSpinner,
  FaSave,
  FaCalendarAlt,
  FaFileAlt,
  FaStar,
  FaQuoteLeft,
  FaPlay,
  FaTasks
} from 'react-icons/fa';

const About = () => {
  const [aboutList, setAboutList] = useState([]);
  const [aboutFooterList, setAboutFooterList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [footerSearchTerm, setFooterSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFooterModalOpen, setIsFooterModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingFooterId, setEditingFooterId] = useState(null);
  const [existingFooterData, setExistingFooterData] = useState({
    logos: [],
    img: null
  });
  const [existingAboutData, setExistingAboutData] = useState({
    backgroundVideo: null,
    img: null
  });
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    title: '',
    description: '',
    footerHeading: '',
    highlights: [{ heading: '', paragraph: '' }]
  });
  const [footerFormData, setFooterFormData] = useState({
    mainHeading: '',
    description: '',
    items: [{ title: '', subtitle: '' }],
    footerHeading: '',
    paragraph: ''
  });
  const [selectedFiles, setSelectedFiles] = useState({
    backgroundVideo: null,
    img: null
  });
  const [footerSelectedFiles, setFooterSelectedFiles] = useState({
    logos: [],
    img: null
  });
  const [previewFiles, setPreviewFiles] = useState({
    backgroundVideo: null,
    img: null
  });
  const [footerPreviewFiles, setFooterPreviewFiles] = useState({
    logos: [],
    img: null
  });

  const baseURL = 'http://globe.ridealmobility.com';

  // Fetch about content
  const fetchAboutContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/about`);
      if (!response.ok) throw new Error('Failed to fetch about content');
      
      const data = await response.json();
      setAboutList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    // Create preview URL
    if (fileType === 'img' || (fileType === 'backgroundVideo' && file.type.startsWith('video/'))) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewFiles(prev => ({
        ...prev,
        [fileType]: previewUrl
      }));
    }
  };

  // Add highlight
  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, { heading: '', paragraph: '' }]
    }));
  };

  // Remove highlight
  const removeHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  // Update highlight
  const updateHighlight = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.map((highlight, i) => 
        i === index ? { ...highlight, [field]: value } : highlight
      )
    }));
  };

  // Create or Update about content
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      // If we're editing, use the update function
      await handleUpdate(e);
    } else {
      // If we're creating new content
      setLoading(true);
      
      try {
        const formDataToSend = new FormData();
        
        // Append text fields
        Object.keys(formData).forEach(key => {
          if (key === 'highlights') {
            const validHighlights = formData.highlights.filter(h => h.heading.trim() || h.paragraph.trim());
            formDataToSend.append('highlights', JSON.stringify(validHighlights));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        });

        // Append files
        if (selectedFiles.backgroundVideo) {
          formDataToSend.append('backgroundVideo', selectedFiles.backgroundVideo);
        }
        if (selectedFiles.img) {
          formDataToSend.append('img', selectedFiles.img);
        }

        const response = await fetch(`${baseURL}/api/about`, {
          method: 'POST',
          body: formDataToSend
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to create about content');
        }

        setSuccess(result.message);
        resetForm();
        fetchAboutContent();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete about content
  const handleDelete = async (aboutId) => {
    if (!window.confirm('Are you sure you want to delete this about content?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/about/${aboutId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete about content');

      const result = await response.json();
      setSuccess(result.message);
      fetchAboutContent();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      heroTitle: '',
      heroSubtitle: '',
      title: '',
      description: '',
      footerHeading: '',
      highlights: [{ heading: '', paragraph: '' }]
    });
    setSelectedFiles({
      backgroundVideo: null,
      img: null
    });
    setPreviewFiles({
      backgroundVideo: null,
      img: null
    });
    setExistingAboutData({
      backgroundVideo: null,
      img: null
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  // Handle edit about content
  const handleEdit = (about) => {
    setEditingId(about._id);
    setFormData({
      heroTitle: about.heroTitle || '',
      heroSubtitle: about.heroSubtitle || '',
      title: about.title || '',
      description: about.description || '',
      footerHeading: about.footerHeading || '',
      highlights: about.highlights && about.highlights.length > 0 
        ? about.highlights 
        : [{ heading: '', paragraph: '' }]
    });
    setSelectedFiles({
      backgroundVideo: null,
      img: null
    });
    // Store existing files data
    setExistingAboutData({
      backgroundVideo: about.backgroundVideo || null,
      img: about.img || null
    });
    setPreviewFiles({
      backgroundVideo: about.backgroundVideo ? `${baseURL}/${about.backgroundVideo}` : null,
      img: about.img ? `${baseURL}/${about.img}` : null
    });
    setIsModalOpen(true);
  };

  // Fetch about footer content
  const fetchAboutFooterContent = async () => {
    setFooterLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/about-footer`);
      if (!response.ok) throw new Error('Failed to fetch about footer content');
      
      const data = await response.json();
      setAboutFooterList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setFooterLoading(false);
    }
  };

  // Handle footer file selection
  const handleFooterFileSelect = (e, fileType) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (fileType === 'logos') {
      const logoFiles = Array.from(files);
      setFooterSelectedFiles(prev => ({
        ...prev,
        logos: logoFiles
      }));

      // Create preview URLs
      const previewUrls = logoFiles.map(file => URL.createObjectURL(file));
      setFooterPreviewFiles(prev => ({
        ...prev,
        logos: previewUrls
      }));
    } else {
      const file = files[0];
      setFooterSelectedFiles(prev => ({
        ...prev,
        [fileType]: file
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFooterPreviewFiles(prev => ({
        ...prev,
        [fileType]: previewUrl
      }));
    }
  };

  // Add footer item
  const addFooterItem = () => {
    setFooterFormData(prev => ({
      ...prev,
      items: [...prev.items, { title: '', subtitle: '' }]
    }));
  };

  // Remove footer item
  const removeFooterItem = (index) => {
    setFooterFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update footer item
  const updateFooterItem = (index, field, value) => {
    setFooterFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Create or Update about footer content
  const handleFooterSubmit = async (e) => {
    e.preventDefault();
    
    if (editingFooterId) {
      // If we're editing, use the update function
      await handleFooterUpdate(e);
    } else {
      // If we're creating new content
      setFooterLoading(true);
      
      try {
        // Validation: Check if we have enough logos for items
        const validItems = footerFormData.items.filter(item => item.title.trim() && item.subtitle.trim());
        if (validItems.length === 0) {
          throw new Error('Please add at least one item with title and subtitle');
        }
        
        // For creation, we need new files
        if (!footerSelectedFiles.logos || footerSelectedFiles.logos.length < validItems.length) {
          throw new Error(`Please upload at least ${validItems.length} logo(s) for your items`);
        }

        if (!footerSelectedFiles.img) {
          throw new Error('Please upload a main image');
        }

        const formDataToSend = new FormData();
        
        // Append text fields
        Object.keys(footerFormData).forEach(key => {
          if (key === 'items') {
            formDataToSend.append('items', JSON.stringify(validItems));
          } else {
            formDataToSend.append(key, footerFormData[key]);
          }
        });

        // Append logo files
        footerSelectedFiles.logos.forEach(file => {
          formDataToSend.append('logos', file);
        });

        // Append main image
        formDataToSend.append('img', footerSelectedFiles.img);

        const response = await fetch(`${baseURL}/api/about-footer`, {
          method: 'POST',
          body: formDataToSend
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to create about footer content');
        }

        setSuccess(result.message);
        resetFooterForm();
        fetchAboutFooterContent();
      } catch (err) {
        setError(err.message);
      } finally {
        setFooterLoading(false);
      }
    }
  };

  // Delete about footer content
  const handleFooterDelete = async (footerId) => {
    if (!window.confirm('Are you sure you want to delete this about footer content?')) {
      return;
    }

    setFooterLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/about-footer/${footerId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete about footer content');

      const result = await response.json();
      setSuccess(result.message);
      fetchAboutFooterContent();
    } catch (err) {
      setError(err.message);
    } finally {
      setFooterLoading(false);
    }
  };

  // Reset footer form
  const resetFooterForm = () => {
    setFooterFormData({
      mainHeading: '',
      description: '',
      items: [{ title: '', subtitle: '' }],
      footerHeading: '',
      paragraph: ''
    });
    setFooterSelectedFiles({
      logos: [],
      img: null
    });
    setFooterPreviewFiles({
      logos: [],
      img: null
    });
    setExistingFooterData({
      logos: [],
      img: null
    });
    setEditingFooterId(null);
    setIsFooterModalOpen(false);
  };

  // Handle edit footer content
  const handleFooterEdit = (footer) => {
    setEditingFooterId(footer._id);
    setFooterFormData({
      mainHeading: footer.mainHeading || '',
      description: footer.description || '',
      items: footer.items && footer.items.length > 0 
        ? footer.items 
        : [{ title: '', subtitle: '' }],
      footerHeading: footer.footerHeading || '',
      paragraph: footer.paragraph || ''
    });
    setFooterSelectedFiles({
      logos: [],
      img: null
    });
    // Store existing files data
    const existingLogos = footer.logos || [];
    setExistingFooterData({
      logos: existingLogos,
      img: footer.img || null
    });
    // Set preview files for existing content
    const existingLogosPreview = footer.logos ? footer.logos.map(logo => `${baseURL}/${logo}`) : [];
    setFooterPreviewFiles({
      logos: existingLogosPreview,
      img: footer.img ? `${baseURL}/${footer.img}` : null
    });
    setIsFooterModalOpen(true);
  };

  // Update about content
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key === 'highlights') {
          const validHighlights = formData.highlights.filter(h => h.heading.trim() || h.paragraph.trim());
          formDataToSend.append('highlights', JSON.stringify(validHighlights));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append files only if new ones are selected
      if (selectedFiles.backgroundVideo) {
        formDataToSend.append('backgroundVideo', selectedFiles.backgroundVideo);
      }
      if (selectedFiles.img) {
        formDataToSend.append('img', selectedFiles.img);
      }

      const response = await fetch(`${baseURL}/api/about/${editingId}`, {
        method: 'PUT',
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update about content');
      }

      setSuccess(result.message || 'About content updated successfully');
      resetForm();
      fetchAboutContent();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update footer content
  const handleFooterUpdate = async (e) => {
    e.preventDefault();
    setFooterLoading(true);
    
    try {
      const validItems = footerFormData.items.filter(item => item.title.trim() && item.subtitle.trim());
      if (validItems.length === 0) {
        throw new Error('Please add at least one item with title and subtitle');
      }

      // For updates, check if we have enough logos (either existing or new)
      const hasEnoughLogos = (existingFooterData.logos.length >= validItems.length) || 
                            (footerSelectedFiles.logos && footerSelectedFiles.logos.length >= validItems.length);
      
      if (!hasEnoughLogos) {
        throw new Error(`You need at least ${validItems.length} logo(s) for your items. Upload new logos or keep existing ones.`);
      }

      // Check if we have a main image (either existing or new)
      const hasMainImage = existingFooterData.img || footerSelectedFiles.img;
      if (!hasMainImage) {
        throw new Error('Please upload a main image or keep the existing one.');
      }

      const formDataToSend = new FormData();
      
      // Append text fields
      Object.keys(footerFormData).forEach(key => {
        if (key === 'items') {
          formDataToSend.append('items', JSON.stringify(validItems));
        } else {
          formDataToSend.append(key, footerFormData[key]);
        }
      });

      // Append logo files only if new ones are selected
      if (footerSelectedFiles.logos && footerSelectedFiles.logos.length > 0) {
        footerSelectedFiles.logos.forEach(file => {
          formDataToSend.append('logos', file);
        });
      }

      // Append main image only if new one is selected
      if (footerSelectedFiles.img) {
        formDataToSend.append('img', footerSelectedFiles.img);
      }

      const response = await fetch(`${baseURL}/api/about-footer/${editingFooterId}`, {
        method: 'PUT',
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update footer content');
      }

      setSuccess(result.message || 'Footer content updated successfully');
      resetFooterForm();
      fetchAboutFooterContent();
    } catch (err) {
      setError(err.message);
    } finally {
      setFooterLoading(false);
    }
  };

  // Filter content by search term
  const filteredContent = aboutList.filter(about =>
    about.heroTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    about.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    about.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter footer content by search term
  const filteredFooterContent = aboutFooterList.filter(footer =>
    footer.mainHeading?.toLowerCase().includes(footerSearchTerm.toLowerCase()) ||
    footer.description?.toLowerCase().includes(footerSearchTerm.toLowerCase()) ||
    footer.footerHeading?.toLowerCase().includes(footerSearchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchAboutContent();
    fetchAboutFooterContent();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      Object.values(previewFiles).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      footerPreviewFiles.logos.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      if (footerPreviewFiles.img && footerPreviewFiles.img.startsWith('blob:')) {
        URL.revokeObjectURL(footerPreviewFiles.img);
      }
    };
  }, [previewFiles, footerPreviewFiles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                About Us Management
              </h1>
              <p className="text-gray-600 mt-2">Manage about us page content, hero sections, and highlights</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <FaPlus />
              Add About Content
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
            <FaInfoCircle />
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
            <FaInfoCircle />
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search about content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading about content...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContent.map(about => (
              <div key={about._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-blue-100">
                {/* Content Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <FaFileAlt className="text-blue-200" />
                      <span className="text-sm font-medium opacity-90">About Content</span>
                    </div>
                    <h3 className="text-xl font-bold truncate">{about.heroTitle || 'Untitled'}</h3>
                    <p className="text-blue-100 text-sm mt-1 truncate">{about.heroSubtitle}</p>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-4">
                  {/* Main Title & Description */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{about.title}</h4>
                    <p className="text-gray-600 text-sm line-clamp-3">{about.description}</p>
                  </div>

                  {/* Media Files */}
                  <div className="grid grid-cols-2 gap-4">
                    {about.backgroundVideo && (
                      <div className="relative">
                        <video 
                          className="w-full h-24 object-cover rounded-lg bg-gray-100"
                          poster=""
                        >
                          <source 
                            src={about.backgroundVideo.startsWith('http') 
                              ? about.backgroundVideo 
                              : `${baseURL}/${about.backgroundVideo}`
                            } 
                          />
                        </video>
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
                          <FaPlay className="text-white text-xl" />
                        </div>
                        <div className="absolute bottom-1 left-1">
                          <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            <FaVideo className="inline mr-1" />
                            Video
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {about.img && (
                      <div className="relative">
                        <img
                          src={about.img.startsWith('http') ? about.img : `${baseURL}/${about.img}`}
                          alt="About"
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-24 bg-gray-100 rounded-lg items-center justify-center">
                          <FaImage className="text-gray-400 text-xl" />
                        </div>
                        <div className="absolute bottom-1 left-1">
                          <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            <FaImage className="inline mr-1" />
                            Image
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Highlights */}
                  {about.highlights && about.highlights.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        Highlights ({about.highlights.length})
                      </h5>
                      <div className="space-y-2">
                        {about.highlights.slice(0, 2).map((highlight, index) => (
                          <div key={index} className="bg-blue-50 p-2 rounded-lg">
                            <div className="flex items-start gap-2 text-sm">
                              <FaStar className="text-yellow-500 mt-1 flex-shrink-0" />
                              <div>
                                <h6 className="font-medium text-gray-900 line-clamp-1">{highlight.heading}</h6>
                                <p className="text-gray-600 text-xs line-clamp-2 mt-1">{highlight.paragraph}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {about.highlights.length > 2 && (
                          <p className="text-xs text-gray-500">+{about.highlights.length - 2} more highlights</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer Heading */}
                  {about.footerHeading && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium italic">"{about.footerHeading}"</p>
                    </div>
                  )}

                  {/* Created Date */}
                  {about.createdAt && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaCalendarAlt />
                      <span>Created: {new Date(about.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(about)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors font-medium"
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(about._id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors font-medium"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredContent.length === 0 && !loading && (
          <div className="text-center py-16">
            <FaInfoCircle className="text-8xl text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl text-gray-600 mb-3">No about content found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first about content'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto transition-all transform hover:scale-105 shadow-lg"
              >
                <FaPlus />
                Create About Content
              </button>
            )}
          </div>
        )}

        {/* About Footer Section */}
        <div className="mt-12 pt-8 border-t-2 border-gray-200">
          {/* Footer Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-purple-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <FaImages className="text-purple-500" />
                  About Footer Management
                </h1>
                <p className="text-gray-600 mt-2">Manage footer content, logos, and item descriptions</p>
              </div>
              <button
                onClick={() => setIsFooterModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
              >
                <FaPlus />
                Add Footer Content
              </button>
            </div>
          </div>

          {/* Footer Search Bar */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-purple-100">
            <div className="relative max-w-md">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search footer content..."
                value={footerSearchTerm}
                onChange={(e) => setFooterSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
              />
            </div>
          </div>

          {/* Footer Content Grid */}
          {footerLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading footer content...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFooterContent.map(footer => (
                <div key={footer._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-purple-100">
                  {/* Footer Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <FaImages className="text-purple-200" />
                        <span className="text-sm font-medium opacity-90">Footer Content</span>
                      </div>
                      <h3 className="text-xl font-bold truncate">{footer.mainHeading || 'Untitled'}</h3>
                      <p className="text-purple-100 text-sm mt-1 line-clamp-2">{footer.description}</p>
                    </div>
                  </div>

                  {/* Footer Body */}
                  <div className="p-6 space-y-4">
                    {/* Main Image */}
                    {footer.img && (
                      <div className="relative">
                        <img
                          src={footer.img.startsWith('http') ? footer.img : `${baseURL}/${footer.img}`}
                          alt="Footer"
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

                    {/* Items with Logos */}
                    {footer.items && footer.items.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <FaTasks className="text-purple-500" />
                          Items ({footer.items.length})
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          {footer.items.slice(0, 4).map((item, index) => (
                            <div key={index} className="bg-purple-50 p-3 rounded-lg">
                              {item.logo && (
                                <div className="mb-2">
                                  <img
                                    src={item.logo.startsWith('http') ? item.logo : `${baseURL}/${item.logo}`}
                                    alt={item.title}
                                    className="w-8 h-8 object-contain rounded"
                                  />
                                </div>
                              )}
                              <h6 className="font-medium text-sm text-gray-900 line-clamp-1">{item.title}</h6>
                              <p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.subtitle}</p>
                            </div>
                          ))}
                          {footer.items.length > 4 && (
                            <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center">
                              <p className="text-xs text-gray-500">+{footer.items.length - 4} more</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer Section */}
                    {(footer.footerHeading || footer.paragraph) && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                        {footer.footerHeading && (
                          <h6 className="font-semibold text-gray-900 mb-2">{footer.footerHeading}</h6>
                        )}
                        {footer.paragraph && (
                          <p className="text-sm text-gray-700 line-clamp-3">{footer.paragraph}</p>
                        )}
                      </div>
                    )}

                    {/* Created Date */}
                    {footer.createdAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaCalendarAlt />
                        <span>Created: {new Date(footer.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFooterEdit(footer)}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors font-medium"
                      >
                        <FaEdit />
                        Edit
                      </button>
                      <button
                        onClick={() => handleFooterDelete(footer._id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors font-medium"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredFooterContent.length === 0 && !footerLoading && (
            <div className="text-center py-16">
              <FaImages className="text-8xl text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl text-gray-600 mb-3">No footer content found</h3>
              <p className="text-gray-500 mb-6">
                {footerSearchTerm ? 'Try adjusting your search terms' : 'Start by creating your first footer content'}
              </p>
              {!footerSearchTerm && (
                <button
                  onClick={() => setIsFooterModalOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto transition-all transform hover:scale-105 shadow-lg"
                >
                  <FaPlus />
                  Create Footer Content
                </button>
              )}
            </div>
          )}
        </div>

        {/* Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaInfoCircle className="text-blue-500" />
                    {editingId ? 'Edit About Content' : 'Add About Content'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hero Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hero Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.heroTitle}
                          onChange={(e) => setFormData({...formData, heroTitle: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter hero title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hero Subtitle *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.heroSubtitle}
                          onChange={(e) => setFormData({...formData, heroSubtitle: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter hero subtitle"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Main Content</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter main title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Footer Heading *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.footerHeading}
                          onChange={(e) => setFormData({...formData, footerHeading: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter footer heading"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      Highlights
                    </h3>
                    <div className="space-y-4">
                      {formData.highlights.map((highlight, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <FaStar className="text-yellow-500" />
                              Highlight {index + 1}
                            </h4>
                            {formData.highlights.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeHighlight(index)}
                                className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Heading *
                              </label>
                              <input
                                type="text"
                                value={highlight.heading}
                                onChange={(e) => updateHighlight(index, 'heading', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Enter highlight heading"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Paragraph *
                              </label>
                              <textarea
                                value={highlight.paragraph}
                                onChange={(e) => updateHighlight(index, 'paragraph', e.target.value)}
                                rows={2}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Enter highlight description"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addHighlight}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaPlus />
                        Add Highlight
                      </button>
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Files</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Background Video */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Video {editingId ? '' : '*'}
                        </label>
                        {editingId && existingAboutData.backgroundVideo && (
                          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                            <span className="font-medium">📁 Existing video will be kept</span>
                            {!selectedFiles.backgroundVideo && ' (Upload new file only if you want to replace it)'}
                          </div>
                        )}
                        <input
                          type="file"
                          accept="video/*"
                          required={!editingId}
                          onChange={(e) => handleFileSelect(e, 'backgroundVideo')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {previewFiles.backgroundVideo && (
                          <div className="mt-3">
                            <video
                              controls
                              className="w-full h-32 object-cover rounded-lg"
                              src={previewFiles.backgroundVideo}
                            />
                          </div>
                        )}
                      </div>

                      {/* Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image {editingId ? '' : '*'}
                        </label>
                        {editingId && existingAboutData.img && (
                          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                            <span className="font-medium">📁 Existing image will be kept</span>
                            {!selectedFiles.img && ' (Upload new file only if you want to replace it)'}
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          required={!editingId}
                          onChange={(e) => handleFileSelect(e, 'img')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {previewFiles.img && (
                          <div className="mt-3">
                            <img
                              src={previewFiles.img}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all font-medium shadow-lg"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {loading 
                      ? (editingId ? 'Updating...' : 'Creating...') 
                      : (editingId ? 'Update Content' : 'Create Content')
                    }
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer Add Modal */}
        {isFooterModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaImages className="text-purple-500" />
                    {editingFooterId ? 'Edit Footer Content' : 'Add Footer Content'}
                  </h2>
                  <button
                    onClick={resetFooterForm}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleFooterSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Main Content</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Main Heading *
                        </label>
                        <input
                          type="text"
                          required
                          value={footerFormData.mainHeading}
                          onChange={(e) => setFooterFormData({...footerFormData, mainHeading: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter main heading"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Main Image {editingFooterId ? '' : '*'}
                        </label>
                        {editingFooterId && existingFooterData.img && (
                          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                            <span className="font-medium">📁 Existing image will be kept</span>
                            {!footerSelectedFiles.img && ' (Upload new file only if you want to replace it)'}
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          required={!editingFooterId}
                          onChange={(e) => handleFooterFileSelect(e, 'img')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {footerPreviewFiles.img && (
                          <div className="mt-3">
                            <img
                              src={footerPreviewFiles.img}
                              alt="Preview"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        required
                        value={footerFormData.description}
                        onChange={(e) => setFooterFormData({...footerFormData, description: e.target.value})}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter description"
                      />
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaTasks className="text-purple-500" />
                      Items with Logos
                    </h3>
                    
                    {/* Logo Upload */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Logos (Multiple files) {editingFooterId ? '' : '*'}
                      </label>
                      {editingFooterId && existingFooterData.logos.length > 0 && (
                        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                          <span className="font-medium">📁 {existingFooterData.logos.length} existing logo(s) will be kept</span>
                          {footerSelectedFiles.logos.length === 0 && ' (Upload new files only if you want to replace them)'}
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        required={!editingFooterId}
                        onChange={(e) => handleFooterFileSelect(e, 'logos')}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {editingFooterId 
                          ? 'Upload new logos only if you want to replace existing ones. Each item needs a logo.'
                          : 'Upload logos that will be assigned to items below. Each item needs a logo.'
                        }
                      </p>
                      {footerPreviewFiles.logos.length > 0 && (
                        <div className="mt-3">
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            {footerPreviewFiles.logos.map((logo, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={logo}
                                  alt={`Logo ${index + 1}`}
                                  className="w-full h-16 object-contain rounded border"
                                />
                                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-green-600">
                            ✅ {footerPreviewFiles.logos.length} logo(s) uploaded
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Validation Info */}
                    {footerFormData.items.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <FaInfoCircle className="text-blue-500" />
                          <span className="font-medium text-blue-700">
                            You have {footerFormData.items.length} item(s). 
                            {footerSelectedFiles.logos.length > 0 ? (
                              <span className={footerSelectedFiles.logos.length >= footerFormData.items.length ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                                {footerSelectedFiles.logos.length >= footerFormData.items.length ? '✅' : '⚠️'} 
                                {footerSelectedFiles.logos.length} logo(s) uploaded
                              </span>
                            ) : (
                              <span className="text-red-600 ml-1">⚠️ No logos uploaded</span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {footerFormData.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <FaTasks className="text-purple-500" />
                              Item {index + 1}
                            </h4>
                            {footerFormData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFooterItem(index)}
                                className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Title *
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateFooterItem(index, 'title', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                placeholder="Enter item title"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Subtitle *
                              </label>
                              <input
                                type="text"
                                value={item.subtitle}
                                onChange={(e) => updateFooterItem(index, 'subtitle', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                placeholder="Enter item subtitle"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFooterItem}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaPlus />
                        Add Item
                      </button>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Footer Section</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Footer Heading *
                        </label>
                        <input
                          type="text"
                          required
                          value={footerFormData.footerHeading}
                          onChange={(e) => setFooterFormData({...footerFormData, footerHeading: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter footer heading"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Paragraph *
                        </label>
                        <textarea
                          required
                          value={footerFormData.paragraph}
                          onChange={(e) => setFooterFormData({...footerFormData, paragraph: e.target.value})}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter footer paragraph"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={footerLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all font-medium shadow-lg"
                  >
                    {footerLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {footerLoading 
                      ? (editingFooterId ? 'Updating...' : 'Creating...') 
                      : (editingFooterId ? 'Update Footer Content' : 'Create Footer Content')
                    }
                  </button>
                  <button
                    type="button"
                    onClick={resetFooterForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;