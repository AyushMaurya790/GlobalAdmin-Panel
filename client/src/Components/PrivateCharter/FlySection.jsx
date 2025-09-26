import React, { useState, useEffect } from 'react';
import { flyAPI, createFormData, getFullImageUrl } from '../../services/privateCharterAPI';

const FlySection = () => {
  const [flyData, setFlyData] = useState([]);
  const [selectedFly, setSelectedFly] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    mainHeading: '',
    items: [{ title: '', description: '', icon: null }]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingIcons, setExistingIcons] = useState([]);

  // Fetch fly data
  useEffect(() => {
    const fetchFlyData = async () => {
      try {
        setLoading(true);
        const response = await flyAPI.getAll();
        setFlyData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching fly data:', err);
        setError('Failed to load who we fly section data');
        setLoading(false);
      }
    };

    fetchFlyData();
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

  const handleIconChange = (index, e) => {
    const updatedItems = [...formData.items];
    updatedItems[index].icon = e.target.files[0];
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { title: '', description: '', icon: null }]
    });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();
      formDataObj.append('mainHeading', formData.mainHeading);
      
      // Append each item's icon file
      formData.items.forEach((item, index) => {
        if (item.icon) {
          formDataObj.append('icons', item.icon);
        }
      });
      
      // Convert items to JSON string (excluding the icon files which are handled separately)
      const itemsWithoutIcons = formData.items.map(item => ({
        title: item.title,
        description: item.description
      }));
      formDataObj.append('items', JSON.stringify(itemsWithoutIcons));
      
      if (isEditing && selectedFly) {
        await flyAPI.update(selectedFly._id, formDataObj);
      } else {
        await flyAPI.create(formDataObj);
      }
      
      // Refresh data
      const response = await flyAPI.getAll();
      setFlyData(response.data);
      
      // Reset form
      resetForm();
    } catch (err) {
      console.error('Error saving fly data:', err);
      setError('Failed to save data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await flyAPI.delete(id);
        setFlyData(flyData.filter(item => item._id !== id));
      } catch (err) {
        console.error('Error deleting fly data:', err);
        setError('Failed to delete data');
      }
    }
  };

  const handleEdit = (fly) => {
    setSelectedFly(fly);
    // Map the existing items to our form structure and store existing icons
    const mappedItems = fly.items.map(item => ({
      title: item.title || '',
      description: item.description || '',
      icon: null // Cannot set files directly, user needs to reupload
    }));
    
    // Store existing icons for preview
    setExistingIcons(fly.items.map(item => item.icon || null));
    
    setFormData({
      mainHeading: fly.mainHeading || '',
      items: mappedItems.length > 0 ? mappedItems : [{ title: '', description: '', icon: null }]
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      mainHeading: '',
      items: [{ title: '', description: '', icon: null }]
    });
    setIsEditing(false);
    setIsAdding(false);
    setSelectedFly(null);
    setExistingIcons([]);
  };

  if (loading && flyData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const fly = flyData.length > 0 ? flyData[0] : null;

  return (
    <section className="py-16 bg-white">
      {/* Display Fly Section */}
      {fly && (
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">{fly.mainHeading || 'Who We Fly'}</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fly.items && fly.items.map((item, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {item.icon && (
                    <img 
                      src={item.icon} 
                      alt={item.title} 
                      className="w-12 h-12 mr-4 object-contain"
                    />
                  )}
                  <h3 className="text-xl font-bold">{item.title}</h3>
                </div>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Controls */}
      <div className="container mx-auto mt-16 p-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Who We Fly Section Management</h2>
          {/* <button 
            onClick={() => setIsAdding(!isAdding)} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isAdding ? 'Cancel' : (flyData.length === 0 ? 'Add Who We Fly Section' : 'Edit Who We Fly Section')}
          </button> */}
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
                Service Items
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
                      rows="2"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Icon{isEditing ? ' (Reupload to change)' : ''}
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleIconChange(index, e)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      accept="image/*"
                      required={!isEditing}
                    />
                    {isEditing && existingIcons[index] && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Current Icon:</p>
                        <div className="relative inline-block">
                          <img
                            src={getFullImageUrl(existingIcons[index])}
                            alt={`Current icon ${index + 1}`}
                            className="h-16 w-16 object-cover rounded border-2 border-green-300"
                          />
                          <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-xs px-1 rounded">
                            Current
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Upload new icon only if you want to replace this one</p>
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
        )}

        {/* List of existing items */}
        {flyData.length > 0 && (
          <div className="bg-white shadow-md rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Main Heading</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flyData.map((fly) => (
                  <tr key={fly._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{fly.mainHeading}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{fly.items?.length || 0} items</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(fly)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(fly._id)}
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

export default FlySection;