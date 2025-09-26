import React, { useState, useEffect } from 'react';
import { partnersAPI } from '../../services/voyageAPI';

const PartnersSection = () => {
  const [partners, setPartners] = useState({ images: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedImages, setSelectedImages] = useState([]);
  const [updateIndex, setUpdateIndex] = useState(null);
  const [updateImage, setUpdateImage] = useState(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await partnersAPI.getAll();
      setPartners(response.partners || { images: [] });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch partners' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const handleAddImages = async (e) => {
    e.preventDefault();
    if (selectedImages.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one image' });
      return;
    }

    try {
      setLoading(true);
      const response = await partnersAPI.create(selectedImages);
      
      if (response.message) {
        setMessage({ type: 'success', text: response.message });
        setSelectedImages([]);
        document.getElementById('partnerImages').value = '';
        fetchPartners();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add partner images' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateImageSelect = (e) => {
    const file = e.target.files[0];
    setUpdateImage(file);
  };

  const handleUpdateImage = async (index) => {
    if (!updateImage) {
      setMessage({ type: 'error', text: 'Please select an image to update' });
      return;
    }

    try {
      setLoading(true);
      const response = await partnersAPI.update(index, updateImage);
      
      if (response.message) {
        setMessage({ type: 'success', text: response.message });
        setUpdateIndex(null);
        setUpdateImage(null);
        document.getElementById('updateImage').value = '';
        fetchPartners();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update partner image' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (index) => {
    if (window.confirm('Are you sure you want to delete this partner image?')) {
      try {
        setLoading(true);
        const response = await partnersAPI.delete(index);
        setMessage({ type: 'success', text: response.message });
        fetchPartners();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete partner image' });
      } finally {
        setLoading(false);
      }
    }
  };

  const cancelUpdate = () => {
    setUpdateIndex(null);
    setUpdateImage(null);
    document.getElementById('updateImage').value = '';
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Partners Logo Management</h2>
      
      {message.text && (
        <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleAddImages} className="card">
        <div className="card-header">
          <h3 className="card-title">Add Partner Images</h3>
        </div>

        <div className="form-group">
          <label className="form-label">Partner Logo Images (Multiple Selection)</label>
          <div className="file-input-group">
            <input
              type="file"
              id="partnerImages"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="file-input"
              required
            />
            <label htmlFor="partnerImages" className="file-input-label">
              Choose Partner Logo Images
            </label>
            {selectedImages.length > 0 && (
              <div className="file-preview">
                Selected {selectedImages.length} image(s): {selectedImages.map(img => img.name).join(', ')}
              </div>
            )}
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Add Partner Images'
            )}
          </button>
        </div>
      </form>

      {/* Update Image Form */}
      {updateIndex !== null && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Update Partner Image #{updateIndex + 1}</h3>
            <button className="btn-secondary" onClick={cancelUpdate}>
              Cancel Update
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">New Image</label>
            <div className="file-input-group">
              <input
                type="file"
                id="updateImage"
                accept="image/*"
                onChange={handleUpdateImageSelect}
                className="file-input"
                required
              />
              <label htmlFor="updateImage" className="file-input-label">
                {updateImage ? updateImage.name : 'Choose New Image'}
              </label>
              {updateImage && (
                <div className="file-preview">
                  Selected: {updateImage.name}
                </div>
              )}
            </div>
          </div>

          <div className="button-group">
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleUpdateImage(updateIndex)}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Update Image'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Partner Images Gallery */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Current Partner Images ({partners.images?.length || 0})
          </h3>
        </div>

        {partners.images && partners.images.length > 0 ? (
          <div className="grid grid-4">
            {partners.images.map((image, index) => (
              <div key={index} className="card" style={{ padding: '15px' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <strong>Partner #{index + 1}</strong>
                </div>
                
                <img 
                  src={`http://localhost:5000/${image.replace(/\\/g, '/')}`}
                  alt={`Partner ${index + 1}`}
                  className="image-preview"
                  style={{ width: '100%', height: '120px', objectFit: 'contain' }}
                />
                
                <div className="button-group" style={{ marginTop: '10px' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setUpdateIndex(index)}
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    Update
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteImage(index)}
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
            No partner images found. Add your first partner logo above.
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnersSection;