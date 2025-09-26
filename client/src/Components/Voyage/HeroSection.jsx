import React, { useState, useEffect } from 'react';
import { heroAPI } from '../../services/voyageAPI';

const HeroSection = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    mainHeading: '',
    styleHeading: '',
    subheading: '',
    videoFile: null
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const response = await heroAPI.getAll();
      setHeroes(response.heroes || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch heroes' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      videoFile: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (!formData.videoFile && !editingId) {
        setMessage({ type: 'error', text: 'Video file is required' });
        return;
      }

      let response;
      if (editingId) {
        response = await heroAPI.update(editingId, formData);
      } else {
        response = await heroAPI.create(formData);
      }

      if (response.message) {
        setMessage({ type: 'success', text: response.message });
        setFormData({
          mainHeading: '',
          styleHeading: '',
          subheading: '',
          videoFile: null
        });
        setEditingId(null);
        fetchHeroes();
        // Reset file input
        document.getElementById('videoFile').value = '';
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hero) => {
    setFormData({
      mainHeading: hero.mainHeading,
      styleHeading: hero.styleHeading,
      subheading: hero.subheading,
      videoFile: null
    });
    setEditingId(hero._id);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hero?')) {
      try {
        setLoading(true);
        const response = await heroAPI.delete(id);
        setMessage({ type: 'success', text: response.message });
        fetchHeroes();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete hero' });
      } finally {
        setLoading(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      mainHeading: '',
      styleHeading: '',
      subheading: '',
      videoFile: null
    });
    document.getElementById('videoFile').value = '';
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Hero Section Management</h2>
      
      {message.text && (
        <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="card-header">
          <h3 className="card-title">
            {editingId ? 'Edit Hero' : 'Add New Hero'}
          </h3>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Main Heading</label>
            <input
              type="text"
              name="mainHeading"
              value={formData.mainHeading}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter main heading"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Style Heading</label>
            <input
              type="text"
              name="styleHeading"
              value={formData.styleHeading}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter style heading"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Subheading</label>
          <textarea
            name="subheading"
            value={formData.subheading}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Enter subheading"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Video File</label>
          <div className="file-input-group">
            <input
              type="file"
              id="videoFile"
              accept="video/*"
              onChange={handleFileChange}
              className="file-input"
              required={!editingId}
            />
            <label htmlFor="videoFile" className="file-input-label">
              {formData.videoFile ? formData.videoFile.name : 'Choose Video File'}
            </label>
            {formData.videoFile && (
              <div className="file-preview">
                Selected: {formData.videoFile.name}
              </div>
            )}
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              editingId ? 'Update Hero' : 'Create Hero'
            )}
          </button>
        </div>
      </form>

      <div className="grid grid-2">
        {heroes.map((hero) => (
          <div key={hero._id} className="card">
            <div className="card-header">
              <h4 className="card-title">{hero.mainHeading}</h4>
              <div className="button-group">
                <button
                  className="btn-secondary"
                  onClick={() => handleEdit(hero)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(hero._id)}
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <strong>Style Heading:</strong> {hero.styleHeading}
            </div>
            
            <div className="form-group">
              <strong>Subheading:</strong> {hero.subheading}
            </div>
            
            {hero.videoFile && (
              <div className="form-group">
                <strong>Video:</strong>
                <video 
                  controls 
                  className="video-preview"
                  src={`http://localhost:5000/${hero.videoFile.replace(/\\/g, '/')}`}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {heroes.length === 0 && !loading && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            No heroes found. Create your first hero above.
          </p>
        </div>
      )}
    </div>
  );
};

export default HeroSection;