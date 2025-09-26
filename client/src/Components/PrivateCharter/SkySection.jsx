import React, { useState, useEffect } from 'react';
import { skyAPI, createFormData, getFullImageUrl } from '../../services/privateCharterAPI';
import { FaImage, FaEdit, FaTrash, FaPlus, FaTimes, FaSpinner } from 'react-icons/fa';

const SkySection = () => {
  const [skyData, setSkyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    heading: '',
    subheading: '',
    backgroundImage: []
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  // Fetch sky data
  useEffect(() => {
    fetchSkyData();
  }, []);

  const fetchSkyData = async () => {
    try {
      setLoading(true);
      const response = await skyAPI.getAll();
      setSkyData(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sky data:', err);
      setMessage({ type: 'error', text: 'Failed to load hero section data' });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, backgroundImage: files });
    
    // Create preview URL for the first image
    if (files.length > 0) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = createFormData(formData, 'backgroundImage');
      
      if (editingId) {
        await skyAPI.update(editingId, data);
        setMessage({ type: 'success', text: 'Hero section updated successfully!' });
      } else {
        await skyAPI.create(data);
        setMessage({ type: 'success', text: 'Hero section created successfully!' });
      }
      
      // Refresh data
      fetchSkyData();
      
      // Reset form
      resetForm();
    } catch (err) {
      console.error('Error saving sky data:', err);
      setMessage({ type: 'error', text: 'Failed to save data. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setLoading(true);
        await skyAPI.delete(id);
        setMessage({ type: 'success', text: 'Hero section deleted successfully!' });
        fetchSkyData();
      } catch (err) {
        console.error('Error deleting sky data:', err);
        setMessage({ type: 'error', text: 'Failed to delete data. Please try again.' });
        setLoading(false);
      }
    }
  };

  const handleEdit = (sky) => {
    setFormData({
      heading: sky.heading,
      subheading: sky.subheading,
      backgroundImage: [] // Cannot set files directly, user needs to reupload
    });
    
    // Set existing images for preview
    if (sky.backgroundImage && sky.backgroundImage.length > 0) {
      setExistingImages(sky.backgroundImage);
      setPreviewUrl(null); // Clear new file preview since we're showing existing
    } else {
      setExistingImages([]);
      setPreviewUrl(null);
    }
    
    setEditingId(sky._id);
    setMessage({ type: '', text: '' });
  };

  const resetForm = () => {
    setFormData({
      heading: '',
      subheading: '',
      backgroundImage: []
    });
    setEditingId(null);
    setPreviewUrl(null);
    setExistingImages([]);
    document.getElementById('backgroundImage').value = '';
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Sky Section' : 'Add New Sky Section'}
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
          <input
            type="text"
            name="heading"
            value={formData.heading}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subheading</label>
          <textarea
            name="subheading"
            value={formData.subheading}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Images</label>
          <input
            id="backgroundImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            multiple
            required={!editingId}
          />
        </div>

        {editingId && existingImages.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.map((img, index) => (
                <div key={index} className="relative">
                  <img 
                    src={getFullImageUrl(img)} 
                    alt={`Current ${index + 1}`} 
                    className="w-full h-32 object-cover rounded border-2 border-green-300"
                  />
                  <div className="absolute top-1 right-1 bg-green-100 text-green-700 text-xs px-1 rounded">
                    Current
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">Upload new images only if you want to replace existing ones</p>
          </div>
        )}
        
        {previewUrl && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Image Preview</p>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="h-32 w-auto object-cover rounded border border-gray-300"
            />
          </div>
        )}
        
        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                {editingId ? 'Update Hero' : 'Add Hero'}
              </>
            )}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Existing Sky Sections</h3>
        
        {loading && (
          <div className="flex justify-center items-center p-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
          </div>
        )}
        
        {!loading && skyData.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center text-gray-500">
            No sky sections found. Create your first sky section above.
          </div>
        )}
        
        {!loading && skyData.map((sky) => (
          <div key={sky._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold mb-1">{sky.heading}</h4>
                <p className="text-gray-600">{sky.subheading}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(sky)}
                  className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(sky._id)}
                  className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            {sky.backgroundImage && sky.backgroundImage.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Background Images:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(sky.backgroundImage) ? (
                    sky.backgroundImage.map((img, index) => (
                      <img 
                        key={index} 
                        src={img} 
                        alt={`Background ${index + 1}`} 
                        className="h-24 w-auto object-cover rounded border border-gray-300" 
                      />
                    ))
                  ) : (
                    <img 
                      src={sky.backgroundImage} 
                      alt="Background" 
                      className="h-24 w-auto object-cover rounded border border-gray-300" 
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkySection;