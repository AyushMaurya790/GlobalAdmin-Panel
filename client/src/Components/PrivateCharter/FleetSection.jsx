import React, { useState, useEffect } from 'react';
import { fleetAPI, createFormData } from '../../services/privateCharterAPI';

const FleetSection = () => {
  const [fleetData, setFleetData] = useState([]);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [formData, setFormData] = useState({
    mainHeading: '',
    items: [{ 
      title: '', 
      subtitle: '', 
      imageUrl: null 
    }]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch fleet data
  useEffect(() => {
    const fetchFleetData = async () => {
      try {
        setLoading(true);
        const response = await fleetAPI.getAll();
        setFleetData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching fleet data:', err);
        setError('Failed to load fleet section data');
        setLoading(false);
      }
    };

    fetchFleetData();
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
    updatedItems[index].imageUrl = e.target.files[0];
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { 
        title: '', 
        subtitle: '', 
        imageUrl: null 
      }]
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
        mainHeading: formData.mainHeading,
        items: formData.items.map(item => ({
          title: item.title,
          subtitle: item.subtitle
        }))
      };

      // Only add images if there are new files to upload
      const newImages = formData.items.map(item => item.imageUrl).filter(image => image !== null);
      if (newImages.length > 0) {
        submissionData.images = newImages;
      }

      // Use the createFormData helper function
      const formDataObj = createFormData(submissionData, 'images');
      
      if (isEditing && selectedFleet) {
        await fleetAPI.update(selectedFleet._id, formDataObj);
      } else {
        await fleetAPI.create(formDataObj);
      }
      
      // Refresh data
      const response = await fleetAPI.getAll();
      setFleetData(response.data);
      
      // Reset form
      resetForm();
    } catch (err) {
      console.error('Error saving fleet data:', err);
      setError('Failed to save data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await fleetAPI.delete(id);
        setFleetData(fleetData.filter(item => item._id !== id));
      } catch (err) {
        console.error('Error deleting fleet data:', err);
        setError('Failed to delete data');
      }
    }
  };

  const handleEdit = (fleet) => {
    setSelectedFleet(fleet);
    // Map the existing items to our form structure
    const mappedItems = fleet.items.map(item => ({
      title: item.title || '',
      subtitle: item.subtitle || '',
      imageUrl: null // Cannot set files directly, user needs to reupload
    }));
    
    // Store existing images for preview
    setExistingImages(fleet.items.map(item => item.imageUrl || null));
    
    setFormData({
      mainHeading: fleet.mainHeading || '',
      items: mappedItems.length > 0 
        ? mappedItems 
        : [{ title: '', subtitle: '', imageUrl: null }]
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      mainHeading: '',
      items: [{ 
        title: '', 
        subtitle: '', 
        imageUrl: null 
      }]
    });
    setIsEditing(false);
    setIsAdding(false);
    setSelectedFleet(null);
    setExistingImages([]);
  };

  if (loading && fleetData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const fleet = fleetData.length > 0 ? fleetData[0] : null;

  return (
    <section className="py-16 bg-gray-50">
      {/* Display Fleet Section */}
      {fleet && (
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">{fleet.mainHeading || 'Fleet & Specifications'}</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 mb-6"></div>
          </div>
          
          <div className="space-y-12">
            {fleet.items && fleet.items.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col lg:flex-row">
                  {item.imageUrl && (
                    <div className="lg:w-1/3">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="lg:w-2/3 p-6">
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-gray-700 mb-6">{item.subtitle}</p>
                  </div>
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
          <h2 className="text-2xl font-bold">Fleet & Travel Highlights Management</h2>
          <button 
            onClick={() => {
              if (fleetData.length > 0 && !isAdding) {
                // If there's data and form is not open, edit the first item
                handleEdit(fleetData[0]);
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
            {isAdding ? 'Cancel' : (fleetData.length === 0 ? 'Add Fleet Section' : 'Edit Fleet Section')}
          </button>
        </div>

        {/* Form for adding/editing */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mainHeading">
                Main Heading
              </label>
              <input
                type="text"
                id="mainHeading"
                name="mainHeading"
                value={formData.mainHeading}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Fleet Items
              </label>
              {formData.items.map((item, itemIndex) => (
                <div key={itemIndex} className="p-4 border rounded mb-4 bg-gray-50">
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleItemChange(itemIndex, 'title', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={item.subtitle}
                      onChange={(e) => handleItemChange(itemIndex, 'subtitle', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Image{isEditing ? ' (Reupload to change)' : ''}
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleImageChange(itemIndex, e)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      accept="image/*"
                      required={!isEditing}
                    />
                    {isEditing && existingImages[itemIndex] && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Current Image:</p>
                        <div className="relative inline-block">
                          <img
                            src={existingImages[itemIndex]}
                            alt={`Current image ${itemIndex + 1}`}
                            className="h-32 w-auto object-cover rounded border-2 border-green-300"
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
                    onClick={() => removeItem(itemIndex)}
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
                Add Aircraft
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
        )}

        {/* List of existing items */}
        {fleetData.length > 0 && (
          <div className="bg-white shadow-md rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Main Heading</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aircraft Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fleetData.map((fleet) => (
                  <tr key={fleet._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{fleet.mainHeading}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{fleet.items?.length || 0} aircraft</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(fleet)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(fleet._id)}
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

export default FleetSection;