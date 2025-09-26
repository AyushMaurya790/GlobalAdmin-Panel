import React, { useState, useEffect } from 'react';
import { journeyAPI } from '../../services/voyageAPI';

const JourneySection = () => {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    mainHeading: '',
    styleHeading: '',
    firstParagraph: '',
    secondParagraph: '',
    journeysImage: null
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const response = await journeyAPI.getAll();
      setJourneys(response.journeys || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch journeys' });
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
      journeysImage: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let response;
      if (editingId) {
        response = await journeyAPI.update(editingId, formData);
      } else {
        response = await journeyAPI.create(formData);
      }

      if (response.message) {
        setMessage({ type: 'success', text: response.message });
        setFormData({
          mainHeading: '',
          styleHeading: '',
          firstParagraph: '',
          secondParagraph: '',
          journeysImage: null
        });
        setEditingId(null);
        fetchJourneys();
        // Reset file input
        document.getElementById('journeysImage').value = '';
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (journey) => {
    setFormData({
      mainHeading: journey.mainHeading,
      styleHeading: journey.styleHeading,
      firstParagraph: journey.firstParagraph,
      secondParagraph: journey.secondParagraph,
      journeysImage: null
    });
    setEditingId(journey._id);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this journey?')) {
      try {
        setLoading(true);
        const response = await journeyAPI.delete(id);
        setMessage({ type: 'success', text: response.message });
        fetchJourneys();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete journey' });
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
      firstParagraph: '',
      secondParagraph: '',
      journeysImage: null
    });
    document.getElementById('journeysImage').value = '';
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Journey Content Management</h2>
      
      {message.text && (
        <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="card-header">
          <h3 className="card-title">
            {editingId ? 'Edit Journey' : 'Add New Journey'}
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
          <label className="form-label">First Paragraph</label>
          <textarea
            name="firstParagraph"
            value={formData.firstParagraph}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Enter first paragraph"
            required
            rows={4}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Second Paragraph</label>
          <textarea
            name="secondParagraph"
            value={formData.secondParagraph}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Enter second paragraph"
            required
            rows={4}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Journey Image</label>
          <div className="file-input-group">
            <input
              type="file"
              id="journeysImage"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="journeysImage" className="file-input-label">
              {formData.journeysImage ? formData.journeysImage.name : 'Choose Journey Image'}
            </label>
            {formData.journeysImage && (
              <div className="file-preview">
                Selected: {formData.journeysImage.name}
              </div>
            )}
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              editingId ? 'Update Journey' : 'Create Journey'
            )}
          </button>
        </div>
      </form>

      <div className="grid grid-2">
        {journeys.map((journey) => (
          <div key={journey._id} className="card">
            <div className="card-header">
              <h4 className="card-title">{journey.mainHeading}</h4>
              <div className="button-group">
                <button
                  className="btn-secondary"
                  onClick={() => handleEdit(journey)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(journey._id)}
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <strong>Style Heading:</strong> {journey.styleHeading}
            </div>
            
            <div className="form-group">
              <strong>First Paragraph:</strong>
              <p style={{ marginTop: '5px', color: '#64748b', fontSize: '0.9rem' }}>
                {journey.firstParagraph}
              </p>
            </div>
            
            <div className="form-group">
              <strong>Second Paragraph:</strong>
              <p style={{ marginTop: '5px', color: '#64748b', fontSize: '0.9rem' }}>
                {journey.secondParagraph}
              </p>
            </div>
            
            {journey.image && (
              <div className="form-group">
                <strong>Journey Image:</strong>
                <img 
                  src={`http://localhost:5000/${journey.image.replace(/\\/g, '/')}`}
                  alt="Journey"
                  className="image-preview"
                  style={{ marginTop: '10px' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {journeys.length === 0 && !loading && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            No journeys found. Create your first journey above.
          </p>
        </div>
      )}
    </div>
  );
};

export default JourneySection;