import React, { useState, useEffect } from 'react';
import { missionAPI, createFormData } from '../../services/privateCharterAPI';
import { getFullImageUrl } from '../../services/privateCharterAPI';

const MissionSection = () => {
  const [missionData, setMissionData] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [formData, setFormData] = useState({
    mainHeading: '',
    items: [{ title: '', image: null, placeCount: 0 }]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch mission data
  useEffect(() => {
    const fetchMissionData = async () => {
      try {
        setLoading(true);
        const response = await missionAPI.getAll();
        setMissionData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching mission data:', err);
        setError('Failed to load mission section data');
        setLoading(false);
      }
    };

    fetchMissionData();
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
      items: [...formData.items, { title: '', image: null, placeCount: 0 }]
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
          placeCount: item.placeCount
        }))
      };

      // Only add images if there are new files to upload
      const newImages = formData.items.map(item => item.image).filter(image => image !== null);
      if (newImages.length > 0) {
        submissionData.images = newImages;
      }

      // Use the createFormData helper function
      const formDataObj = createFormData(submissionData, 'images');
      
      if (isEditing && selectedMission) {
        await missionAPI.update(selectedMission._id, formDataObj);
      } else {
        await missionAPI.create(formDataObj);
      }
      
      // Refresh data
      const response = await missionAPI.getAll();
      setMissionData(response.data);
      
      // Reset form
      resetForm();
    } catch (err) {
      console.error('Error saving mission data:', err);
      setError('Failed to save data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await missionAPI.delete(id);
        setMissionData(missionData.filter(item => item._id !== id));
      } catch (err) {
        console.error('Error deleting mission data:', err);
        setError('Failed to delete data');
      }
    }
  };

  const handleEdit = (mission) => {
    setSelectedMission(mission);
    // Map the existing items to our form structure
    const mappedItems = mission.items.map(item => ({
      title: item.title || '',
      placeCount: item.placeCount || 0,
      image: null // Cannot set files directly, user needs to reupload
    }));
    
    // Store existing images for preview
    setExistingImages(mission.items.map(item => item.image || null));
    
    setFormData({
      mainHeading: mission.mainHeading || '',
      items: mappedItems.length > 0 ? mappedItems : [{ title: '', image: null, placeCount: 0 }]
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      mainHeading: '',
      items: [{ title: '', image: null, placeCount: 0 }]
    });
    setIsEditing(false);
    setIsAdding(false);
    setSelectedMission(null);
    setExistingImages([]);
  };

  if (loading && missionData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const mission = missionData.length > 0 ? missionData[0] : null;

  return (
    <section className="py-16 bg-white">
      {/* Display Mission Section */}
      {mission && (
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">{mission.mainHeading || 'Past Missions'}</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mission.items && mission.items.map((item, index) => (
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
                  <div className="flex items-center text-blue-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">{item.placeCount} Places</span>
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
          <h2 className="text-2xl font-bold">Past Missions Management</h2>
          <button 
            onClick={() => {
              if (missionData.length > 0 && !isAdding) {
                // If there's data and form is not open, edit the first item
                handleEdit(missionData[0]);
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
            {isAdding ? 'Cancel' : (missionData.length === 0 ? 'Add Mission Section' : 'Edit Mission Section')}
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
                Mission Items
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
                      Place Count
                    </label>
                    <input
                      type="number"
                      value={item.placeCount}
                      onChange={(e) => handleItemChange(index, 'placeCount', parseInt(e.target.value) || 0)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                      min="0"
                      placeholder="e.g. 15"
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
        )}

        {/* List of existing items */}
        {missionData.length > 0 && (
          <div className="bg-white shadow-md rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Main Heading</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Missions Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {missionData.map((mission) => (
                  <tr key={mission._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{mission.mainHeading}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{mission.items?.length || 0} missions</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(mission)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(mission._id)}
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

export default MissionSection;