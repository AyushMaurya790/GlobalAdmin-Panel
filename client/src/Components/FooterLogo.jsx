import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaTrash, 
  FaImages, 
  FaUpload,
  FaSearch, 
  FaTimes,
  FaSpinner,
  FaInfoCircle,
  FaCalendarAlt,
  FaImage,
  FaCloudUploadAlt,
  FaEye,
  FaDownload
} from 'react-icons/fa';

const FooterLogo = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const baseURL = 'http://globe.ridealmobility.com';

  // Fetch logos
  const fetchLogos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/home/logo`);
      if (!response.ok) throw new Error('Failed to fetch logos');
      
      const data = await response.json();
      setLogos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 20) {
      setError('Maximum 20 images allowed');
      return;
    }

    setSelectedFiles(files);
    
    // Create preview URLs
    const previews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setPreviewImages(previews);
  };

  // Upload logos
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`${baseURL}/api/home/logo`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload logos');
      }

      setSuccess(result.message);
      resetForm();
      fetchLogos();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete logo entry
  const handleDelete = async (logoId) => {
    if (!window.confirm('Are you sure you want to delete this logo entry?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/home/logo/${logoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete logo entry');

      const result = await response.json();
      setSuccess(result.message);
      fetchLogos();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedFiles([]);
    setPreviewImages([]);
    setIsModalOpen(false);
    
    // Clean up preview URLs
    previewImages.forEach(preview => {
      URL.revokeObjectURL(preview.url);
    });
  };

  // Remove selected file
  const removeSelectedFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    
    // Clean up the removed preview URL
    URL.revokeObjectURL(previewImages[index].url);
    
    setSelectedFiles(newFiles);
    setPreviewImages(newPreviews);
  };

  // Filter logos by search term
  const filteredLogos = logos.filter(logo =>
    logo._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (logo.createdAt && new Date(logo.createdAt).toLocaleDateString().includes(searchTerm))
  );

  useEffect(() => {
    fetchLogos();
    
    // Cleanup function
    return () => {
      previewImages.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-indigo-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <FaImages className="text-indigo-500" />
                Footer Logo Management
              </h1>
              <p className="text-gray-600 mt-2">Upload and manage footer logos for your website</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <FaPlus />
              Upload Logos
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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-indigo-100">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search logo entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Logo Entries Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <FaSpinner className="animate-spin text-6xl text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading logo entries...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredLogos.flatMap(logo => 
              logo.images && logo.images.length > 0 
                ? logo.images.map((imagePath, index) => (
                    <div key={`${logo._id}-${index}`} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-indigo-100">
                      {/* Logo Header */}
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <FaImage className="text-indigo-200 text-sm" />
                          <span className="text-xs font-medium opacity-90">Logo</span>
                        </div>
                        <h3 className="text-sm font-bold">#{(index + 1).toString().padStart(3, '0')}</h3>
                      </div>

                      {/* Logo Image */}
                      <div className="p-4">
                        <div className="aspect-square bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          <img
                            src={imagePath.startsWith('http') ? imagePath : `${baseURL}/${imagePath}`}
                            alt={`Logo ${index + 1}`}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                              e.target.parentElement.innerHTML = '<div class="text-center"><svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-xs text-gray-500">Image not found</p></div>';
                            }}
                          />
                        </div>
                      </div>

                      {/* Logo Details */}
                      <div className="px-4 pb-4 space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <FaCalendarAlt className="text-indigo-500" />
                          <span>{logo.createdAt ? new Date(logo.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="p-3 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={() => handleDelete(logo._id)}
                          className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors font-medium"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                : []
            )}
          </div>
        )}

        {filteredLogos.length === 0 && !loading && (
          <div className="text-center py-16">
            <FaImages className="text-8xl text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl text-gray-600 mb-3">No logo entries found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by uploading your first logo collection'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto transition-all transform hover:scale-105 shadow-lg"
              >
                <FaPlus />
                Upload First Logo Collection
              </button>
            )}
          </div>
        )}

        {/* Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaCloudUploadAlt className="text-indigo-500" />
                    Upload Footer Logos
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
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Logo Images (Max 20 files) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="logo-upload"
                      required
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-600 mb-2">
                        Click to select logo images
                      </p>
                      <p className="text-sm text-gray-500">
                        Support: JPG, PNG, GIF, WebP (Max 20 files)
                      </p>
                    </label>
                  </div>
                </div>

                {/* Preview Images */}
                {previewImages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Selected Images ({previewImages.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview.url}
                            alt={preview.name}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                            {preview.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading || selectedFiles.length === 0}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all font-medium shadow-lg"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                    {loading ? 'Uploading...' : 'Upload Logos'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium"
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

export default FooterLogo;