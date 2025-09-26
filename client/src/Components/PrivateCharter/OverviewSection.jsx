import React, { useState, useEffect } from 'react';
import { overviewAPI, createFormData, getFullImageUrl } from '../../services/privateCharterAPI';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OverviewSection = () => {
  const [overviewData, setOverviewData] = useState([]);
  const [selectedOverview, setSelectedOverview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    mainHeading: '',
    companyIntro: '',
    description: '',
    sectionTitle: '',
    services: [''],
    rightImage: null
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingImage, setExistingImage] = useState(null);

  // Fetch overview data
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        const response = await overviewAPI.getAll();
        setOverviewData(response.data);
      } catch (err) {
        console.error('Error fetching overview data:', err);
        toast.error('Failed to load overview section data');
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServiceChange = (index, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = value;
    setFormData({ ...formData, services: updatedServices });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, '']
    });
  };

  const removeService = (index) => {
    const updatedServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: updatedServices });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, rightImage: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = { ...formData };
      const formDataObj = createFormData(data, 'rightImage');

      if (isEditing && selectedOverview) {
        await overviewAPI.update(selectedOverview._id, formDataObj);
        toast.success('Overview updated successfully');
      } else {
        await overviewAPI.create(formDataObj);
        toast.success('Overview created successfully');
      }

      const response = await overviewAPI.getAll();
      setOverviewData(response.data);
      resetForm();
    } catch (err) {
      console.error('Error saving overview data:', err);
      toast.error('Failed to save data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await overviewAPI.delete(id);
      setOverviewData(overviewData.filter(item => item._id !== id));
      toast.success('Deleted successfully');
    } catch (err) {
      console.error('Error deleting overview data:', err);
      toast.error('Failed to delete data');
    }
  };

  const handleEdit = (overview) => {
    let transformedServices = overview.services || [''];
    if (transformedServices.length > 0 && typeof transformedServices[0] === 'object') {
      transformedServices = transformedServices.map(service => service.name || '');
    }
    if (transformedServices.length === 0) transformedServices = [''];

    setFormData({
      title: overview.title || '',
      mainHeading: overview.mainHeading || '',
      companyIntro: overview.companyIntro || '',
      description: overview.description || '',
      sectionTitle: overview.sectionTitle || '',
      services: transformedServices,
      rightImage: null // This will be null for edit mode, file input is optional
    });

    // Store the existing image URL for display purposes
    setExistingImage(overview.rightImage || null);
    setSelectedOverview(overview);
    setIsEditing(true);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      mainHeading: '',
      companyIntro: '',
      description: '',
      sectionTitle: '',
      services: [''],
      rightImage: null
    });
    setIsEditing(false);
    setIsAdding(false);
    setSelectedOverview(null);
    setExistingImage(null);
  };

  if (loading && overviewData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const overview = overviewData.length > 0 ? overviewData[0] : null;

  return (
    <section className="py-16 bg-gray-50">
      <ToastContainer />
      {overview && (
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">{overview.title || 'Company Overview'}</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 mb-6"></div>
          </div>
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="w-full md:w-1/2">
              <h3 className="text-2xl font-bold mb-4">{overview.mainHeading || 'About Our Charter Services'}</h3>
              <p className="text-lg font-semibold text-blue-600 mb-4">{overview.companyIntro || 'Premium Private Charter Experience'}</p>
              <p className="text-gray-700 mb-6">{overview.description || 'Our private charter services offer luxury travel experiences tailored to your specific needs.'}</p>

              {overview.services && overview.services.length > 0 && (
                <div>
                  <h4 className="text-xl font-bold mb-4">{overview.sectionTitle || 'Our Services'}</h4>
                  <ul className="space-y-4">
                    {overview.services.map((service, index) => {
                      const serviceText = typeof service === 'string' ? service : (service.name || '');
                      return (
                        <li key={index} className="flex items-start">
                          <div className="mr-3 text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div><h5 className="font-bold">{serviceText}</h5></div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2">
              {overview.rightImage && (
                <img 
                  src={overview.rightImage} 
                  alt="Private Charter" 
                  className="rounded-lg shadow-xl w-full h-auto object-cover"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Controls */}
      <div className="container mx-auto mt-16 p-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Overview Section Management</h2>
          <button 
            onClick={() => {
              if (overviewData.length > 0 && !isAdding) {
                // If there's data and form is not open, edit the first item
                handleEdit(overviewData[0]);
              } else {
                // Toggle add form or cancel
                setIsAdding(!isAdding);
                if (isAdding) {
                  resetForm();
                }
              }
            }} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isAdding ? 'Cancel' : (overviewData.length === 0 ? 'Add Overview Section' : 'Edit Overview Section')}
          </button>
        </div>

        {/* Form */}
        {isAdding && (
          <div>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Section Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Main Heading</label>
                  <input type="text" name="mainHeading" value={formData.mainHeading} onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Company Intro</label>
                <input type="text" name="companyIntro" value={formData.companyIntro} onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="4" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Services Section Title</label>
                <input type="text" name="sectionTitle" value={formData.sectionTitle} onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Services</label>
                {formData.services.map((service, index) => (
                  <div key={index} className="p-4 border rounded mb-4 bg-gray-50">
                    <input type="text" value={service} onChange={(e) => handleServiceChange(index, e.target.value)} required placeholder="Enter service" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-2" />
                    <button type="button" onClick={() => removeService(index)} disabled={formData.services.length <= 1} className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addService} className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded mt-2">Add Service</button>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Right Image {isEditing ? '(Reupload to change)' : ''}</label>
                <input type="file" name="rightImage" onChange={handleFileChange} accept="image/*" required={!isEditing} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>

              {isEditing && existingImage && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
                  <img src={existingImage} alt="Current" className="h-40 object-cover rounded border-2 border-green-300" />
                  <p className="text-sm text-gray-600 mt-2">Upload new image only if you want to replace this one</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button type="submit" disabled={submitting} className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">
                  {isEditing ? 'Update' : 'Save'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded">Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Overview table */}
        {overviewData.length > 0 && (
          <div className="bg-white shadow-md rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Main Heading</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overviewData.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.mainHeading}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.services?.length || 0} services</td>
                    <td className="px-6 py-4">
                      {item.rightImage && <img src={item.rightImage} alt="Overview" className="h-12 w-20 object-cover rounded" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                      <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900">Delete</button>
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

export default OverviewSection;
