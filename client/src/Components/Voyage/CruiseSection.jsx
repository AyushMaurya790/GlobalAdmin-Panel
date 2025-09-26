import React, { useState, useEffect } from 'react';
import { cruiseAPI } from '../../services/voyageAPI';

const CruiseSection = () => {
  const [cruises, setCruises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    mainHeading: '',
    cruiseLiner: '',
    shipName: '',
    sailingName: '',
    departurePort: '',
    cruiseDuration: '',
    cabinPrice: '',
    sailingDates: [],
    destinations: [],
    mapImage: null
  });

  useEffect(() => {
    fetchCruises();
  }, []);

  const fetchCruises = async () => {
    try {
      setLoading(true);
      const response = await cruiseAPI.getAll();
      setCruises(response || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch cruises' });
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

  const handleArrayInputChange = (e, field) => {
    const value = e.target.value;
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      mapImage: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await cruiseAPI.create(formData);

      if (response.message) {
        setMessage({ type: 'success', text: response.message });
        setFormData({
          mainHeading: '',
          cruiseLiner: '',
          shipName: '',
          sailingName: '',
          departurePort: '',
          cruiseDuration: '',
          cabinPrice: '',
          sailingDates: [],
          destinations: [],
          mapImage: null
        });
        fetchCruises();
        // Reset file input
        document.getElementById('mapImage').value = '';
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create cruise' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this cruise?')) {
      try {
        setLoading(true);
        const response = await cruiseAPI.delete(id);
        setMessage({ type: 'success', text: response.message });
        fetchCruises();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete cruise' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Places/Cruise Management</h2>
      
      {message.text && (
        <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="card-header">
          <h3 className="card-title">Add New Cruise</h3>
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
            <label className="form-label">Cruise Liner</label>
            <input
              type="text"
              name="cruiseLiner"
              value={formData.cruiseLiner}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter cruise liner"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ship Name</label>
            <input
              type="text"
              name="shipName"
              value={formData.shipName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter ship name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sailing Name</label>
            <input
              type="text"
              name="sailingName"
              value={formData.sailingName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter sailing name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Departure Port</label>
            <input
              type="text"
              name="departurePort"
              value={formData.departurePort}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter departure port"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cruise Duration</label>
            <input
              type="text"
              name="cruiseDuration"
              value={formData.cruiseDuration}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 7 days"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cabin Price</label>
            <input
              type="text"
              name="cabinPrice"
              value={formData.cabinPrice}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., $1,200"
              required
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Sailing Dates (comma separated)</label>
            <input
              type="text"
              value={formData.sailingDates.join(', ')}
              onChange={(e) => handleArrayInputChange(e, 'sailingDates')}
              className="form-input"
              placeholder="e.g., 2025-06-15, 2025-07-20, 2025-08-10"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Destinations (comma separated)</label>
            <input
              type="text"
              value={formData.destinations.join(', ')}
              onChange={(e) => handleArrayInputChange(e, 'destinations')}
              className="form-input"
              placeholder="e.g., Caribbean, Bahamas, Jamaica"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Map Image</label>
          <div className="file-input-group">
            <input
              type="file"
              id="mapImage"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="mapImage" className="file-input-label">
              {formData.mapImage ? formData.mapImage.name : 'Choose Map Image'}
            </label>
            {formData.mapImage && (
              <div className="file-preview">
                Selected: {formData.mapImage.name}
              </div>
            )}
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Create Cruise'
            )}
          </button>
        </div>
      </form>

      <div className="grid grid-2">
        {cruises.map((cruise) => (
          <div key={cruise._id} className="card">
            <div className="card-header">
              <h4 className="card-title">{cruise.mainHeading}</h4>
              <button
                className="btn-danger"
                onClick={() => handleDelete(cruise._id)}
              >
                Delete
              </button>
            </div>
            
            {cruise.cruises && cruise.cruises.map((cruiseDetail, index) => (
              <div key={index} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div className="form-grid">
                  <div><strong>Cruise Liner:</strong> {cruiseDetail.cruiseLiner}</div>
                  <div><strong>Ship Name:</strong> {cruiseDetail.shipName}</div>
                  <div><strong>Sailing Name:</strong> {cruiseDetail.sailingName}</div>
                  <div><strong>Departure Port:</strong> {cruiseDetail.departurePort}</div>
                  <div><strong>Duration:</strong> {cruiseDetail.cruiseDuration}</div>
                  <div><strong>Price:</strong> {cruiseDetail.cabinPrice}</div>
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  <strong>Sailing Dates:</strong> {cruiseDetail.sailingDates?.join(', ')}
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  <strong>Destinations:</strong> {cruiseDetail.destinations?.join(', ')}
                </div>
                
                {cruiseDetail.mapImage && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Map Image:</strong>
                    <img 
                      src={`http://localhost:5000/${cruiseDetail.mapImage.replace(/\\/g, '/')}`}
                      alt="Cruise Map"
                      className="image-preview"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {cruises.length === 0 && !loading && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            No cruises found. Create your first cruise above.
          </p>
        </div>
      )}
    </div>
  );
};

export default CruiseSection;