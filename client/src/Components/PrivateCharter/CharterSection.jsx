import React, { useState, useEffect } from 'react';
import { charterAPI, createFormData, getFullImageUrl } from '../../services/privateCharterAPI';

const CharterSection = () => {
  const [charterData, setCharterData] = useState([]);
  const [selectedCharter, setSelectedCharter] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    sectionTitle: '',
    items: [{ title: '', description: '', image: null }]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  // Fetch charter data
  useEffect(() => {
    const fetchCharterData = async () => {
      try {
        setLoading(true);
        const response = await charterAPI.getAll();
        setCharterData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching charter data:', err);
        setError('Failed to load charter section data');
        setLoading(false);
      }
    };

    fetchCharterData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleImageChange = (index, e) => {
    const updatedItems = [...formData.items];
    updatedItems[index].image = e.target.files[0];
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { title: '', description: '', image: null }]
    });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for submission
      const submissionData = {
        sectionTitle: formData.sectionTitle,
        items: formData.items.map(item => ({
          title: item.title,
          description: item.description
        }))
      };

      // Only add images if there are new files to upload
      const newImages = formData.items.map(item => item.image).filter(image => image !== null);
      if (newImages.length > 0) {
        submissionData.images = newImages;
      }

      // Use the createFormData helper function
      const formDataObj = createFormData(submissionData, 'images');
      
      if (isEditing && selectedCharter) {
        await charterAPI.update(selectedCharter._id, formDataObj);
      } else {
        await charterAPI.create(formDataObj);
      }
      
      // Refresh data
      const response = await charterAPI.getAll();
      setCharterData(response.data);
      
      // Reset form
      resetForm();
    } catch (err) {
      console.error('Error saving charter data:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to save data: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await charterAPI.delete(id);
        setCharterData(charterData.filter(item => item._id !== id));
      } catch (err) {
        console.error('Error deleting charter data:', err);
        setError('Failed to delete data');
      }
    }
  };

  const handleEdit = (charter) => {
    setSelectedCharter(charter);
    // Map the existing items to our form structure and store existing images
    const mappedItems = charter.items.map(item => ({
      title: item.title || '',
      description: item.description || '',
      image: null // Cannot set files directly, user needs to reupload
    }));
    
    // Store existing images for preview
    const existingImageUrls = charter.items.map(item => item.image || null);
    setExistingImages(existingImageUrls);
    
    const newFormData = {
      sectionTitle: charter.sectionTitle || '',
      items: mappedItems.length > 0 ? mappedItems : [{ title: '', description: '', image: null }]
    };
    setFormData(newFormData);
    setIsEditing(true);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      sectionTitle: '',
      items: [{ title: '', description: '', image: null }]
    });
    setIsEditing(false);
    setIsAdding(false);
    setSelectedCharter(null);
    setExistingImages([]);
  };

  if (loading && charterData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const charter = charterData.length > 0 ? charterData[0] : null;

  return (
    <section className="py-16 bg-gray-50">
      {/* Display Charter Section */}
      {charter && (
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">{charter.sectionTitle || 'Globenzel Charters'}</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {charter.items && charter.items.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Controls */}
      <div className="container mx-auto mt-16 p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Globenzel Charters Management</h2>
          <button 
            onClick={() => {
              if (charterData.length > 0 && !isAdding) {
                // If there's data and form is not open, edit the first item
                handleEdit(charterData[0]);
              } else {
                // Toggle add form or cancel
                setIsAdding(!isAdding);
                if (isAdding) {
                  resetForm();
                }
              }
              setError(null); // Clear any existing errors
            }} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isAdding ? 'Cancel' : (charterData.length === 0 ? 'Add Charter Section' : 'Edit Charter Section')}
          </button>
        </div>

        {/* Form for adding/editing */}
        {isAdding && (
          <div>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sectionTitle">
                Section Title
              </label>
              <input
                type="text"
                id="sectionTitle"
                name="sectionTitle"
                value={formData.sectionTitle}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Charter Items
              </label>
              {formData.items.map((item, index) => (
                <div key={index} className="p-4 border rounded mb-4 bg-gray-50">
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Image{isEditing ? ' (Reupload to change)' : ''}
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleImageChange(index, e)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      accept="image/*"
                      required={!isEditing}
                    />
                    {isEditing && existingImages[index] && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Current Image:</p>
                        <div className="relative inline-block">
                          <img
                            src={existingImages[index]}
                            alt={`Current image ${index + 1}`}
                            className="h-32 w-auto object-cover rounded border-2 border-green-300"
                            onError={(e) => {
                              console.log('Image failed to load:', existingImages[index]);
                              e.target.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', existingImages[index]);
                            }}
                          />
                          <div className="absolute top-1 right-1 bg-green-100 text-green-700 text-xs px-1 rounded">
                            Current
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Upload new image only if you want to replace this one</p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                    disabled={formData.items.length <= 1}
                  >
                    Remove Item
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
              >
                Add Item
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {isEditing ? 'Update' : 'Save'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          </div>
        )}

        {/* List of existing items */}
        {charterData.length > 0 && (
          <div className="bg-white shadow-md rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {charterData.map((charter) => (
                  <tr key={charter._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{charter.sectionTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{charter.items?.length || 0} items</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(charter)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(charter._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default CharterSection;