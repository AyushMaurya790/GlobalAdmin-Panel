import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaTrophy, FaFlag, FaClock, FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaMedal, FaUpload } from 'react-icons/fa';

const MotoGPRacing = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [activeTab, setActiveTab] = useState('tournaments');
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showRaceModal, setShowRaceModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [editingRace, setEditingRace] = useState(null);
  const [editingResult, setEditingResult] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://globe.ridealmobility.com/api/sport/motogp-tournament';
  const IMAGE_BASE_URL = 'http://globe.ridealmobility.com';

  // Helper function to construct image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      console.log('getImageUrl: No imagePath provided');
      return null;
    }
    if (imagePath.startsWith('http')) {
      console.log('getImageUrl: Using absolute URL:', imagePath);
      return imagePath;
    }
    const fullUrl = `${IMAGE_BASE_URL}/${imagePath}`;
    console.log('getImageUrl: Constructed URL:', fullUrl);
    return fullUrl;
  };

  // Test function to check API endpoints
  const testApiEndpoints = async () => {
    if (!selectedTournament) {
      alert('Please select a tournament first');
      return;
    }
    
    console.log('Testing API endpoints...');
    console.log('Base URL:', API_BASE_URL);
    console.log('Tournament ID:', selectedTournament._id);
    
    try {
      // Test if tournament exists
      const tournamentResponse = await axios.get(`${API_BASE_URL}/${selectedTournament._id}`);
      console.log('Tournament fetch successful:', tournamentResponse.data);
      
      if (selectedTournament.races && selectedTournament.races.length > 0) {
        const firstRaceId = selectedTournament.races[0]._id;
        console.log('Testing with race ID:', firstRaceId);
        
        // Test race endpoints URLs
        const updateUrl = `${API_BASE_URL}/${selectedTournament._id}/races/${firstRaceId}`;
        const deleteUrl = `${API_BASE_URL}/${selectedTournament._id}/races/${firstRaceId}`;
        
        console.log('Race update URL would be:', updateUrl);
        console.log('Race delete URL would be:', deleteUrl);
      }
    } catch (error) {
      console.error('API test failed:', error);
    }
  };

  // Test function for image URLs
  const testImageUrls = () => {
    console.log('=== IMAGE URL TEST ===');
    console.log('IMAGE_BASE_URL:', IMAGE_BASE_URL);
    
    if (selectedTournament && selectedTournament.races) {
      selectedTournament.races.forEach((race, raceIndex) => {
        console.log(`Race ${raceIndex + 1}:`, race.grandPrix);
        if (race.flag) {
          console.log('  Flag URL:', getImageUrl(race.flag));
        }
        if (race.results) {
          race.results.forEach((result, resultIndex) => {
            if (result.riderImage) {
              console.log(`  Result ${resultIndex + 1} (${result.riderName}) Image URL:`, getImageUrl(result.riderImage));
            }
          });
        }
      });
    } else {
      console.log('No tournament selected or no races available');
    }
  };

  // Additional state for card sections
  const [cardSections, setCardSections] = useState([]);

  // Tournament form state
  const [tournamentForm, setTournamentForm] = useState({
    cardId: '',
    title: '',
    races: []
  });

  // Race form state
  const [raceForm, setRaceForm] = useState({
    round: '',
    country: '',
    flag: null,
    grandPrix: '',
    startDate: '',
    endDate: '',
    results: []
  });

  // Result form state
  const [resultForm, setResultForm] = useState({
    position: '',
    riderName: '',
    riderImage: null,
    team: '',
    time: '',
  });

  useEffect(() => {
    fetchTournaments();
    fetchCardSections();
  }, []);

  const fetchCardSections = async () => {
    try {
      const res = await axios.get('http://globe.ridealmobility.com/api/sport/card');
      setCardSections(res.data);
    } catch (error) {
      console.error('Error fetching card sections:', error);
    }
  };

  // Tournament CRUD Operations
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setTournaments(response.data.success ? response.data.data : response.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async () => {
    try {
      const formData = new FormData();
      formData.append('cardId', tournamentForm.cardId);
      formData.append('title', tournamentForm.title);
      formData.append('races', JSON.stringify(tournamentForm.races));

      // Prepare flags and rider images arrays
      const flagsToUpload = [];
      const riderImagesToUpload = [];

      tournamentForm.races.forEach((race, raceIndex) => {
        if (race.flag && race.flag instanceof File) {
          flagsToUpload.push(race.flag);
        }
        if (race.results) {
          race.results.forEach((result) => {
            if (result.riderImage && result.riderImage instanceof File) {
              riderImagesToUpload.push(result.riderImage);
            }
          });
        }
      });

      // Append flag files
      flagsToUpload.forEach((flag) => {
        formData.append('flags', flag);
      });

      // Append rider image files
      riderImagesToUpload.forEach((image) => {
        formData.append('riderImages', image);
      });

      const response = await axios.post(API_BASE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newTournament = response.data.success ? response.data.data : response.data;
      setTournaments([...tournaments, newTournament]);
      setShowTournamentModal(false);
      setTournamentForm({ cardId: '', title: '', races: [] });
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  const updateTournament = async () => {
    try {
      const formData = new FormData();
      formData.append('cardId', tournamentForm.cardId);
      formData.append('title', tournamentForm.title);
      formData.append('races', JSON.stringify(tournamentForm.races));

      // Prepare flags and rider images arrays
      const flagsToUpload = [];
      const riderImagesToUpload = [];

      tournamentForm.races.forEach((race) => {
        if (race.flag && race.flag instanceof File) {
          flagsToUpload.push(race.flag);
        }
        if (race.results) {
          race.results.forEach((result) => {
            if (result.riderImage && result.riderImage instanceof File) {
              riderImagesToUpload.push(result.riderImage);
            }
          });
        }
      });

      // Append flag files
      flagsToUpload.forEach((flag) => {
        formData.append('flags', flag);
      });

      // Append rider image files
      riderImagesToUpload.forEach((image) => {
        formData.append('riderImages', image);
      });

      const response = await axios.put(`${API_BASE_URL}/${editingTournament._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedTournament = response.data.success ? response.data.data : response.data;
      setTournaments(tournaments.map((t) => (t._id === editingTournament._id ? updatedTournament : t)));
      setSelectedTournament(updatedTournament._id === selectedTournament?._id ? updatedTournament : selectedTournament);
      setShowTournamentModal(false);
      setEditingTournament(null);
      setTournamentForm({ cardId: '', title: '', races: [] });
    } catch (error) {
      console.error('Error updating tournament:', error);
    }
  };

  const deleteTournament = async (id) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        setTournaments(tournaments.filter((t) => t._id !== id));
        if (selectedTournament?._id === id) {
          setSelectedTournament(null);
          setSelectedRace(null);
          setActiveTab('tournaments');
        }
      } catch (error) {
        console.error('Error deleting tournament:', error);
      }
    }
  };

  // Form handlers
  const handleTournamentChange = (e) => {
    const { name, value } = e.target;
    setTournamentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRaceChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'flag') {
      setRaceForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
    } else {
      setRaceForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleResultChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'riderImage') {
      setResultForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
    } else {
      setResultForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Helper functions for managing races and results
  const addRaceToTournament = (race) => {
    setTournamentForm(prev => ({
      ...prev,
      races: [...prev.races, { ...race, _id: Date.now().toString() }]
    }));
  };

  const addResultToRace = (result) => {
    setRaceForm(prev => ({
      ...prev,
      results: [...prev.results, { ...result, _id: Date.now().toString() }]
    }));
    resetResultForm();
  };

  const removeResultFromRace = (resultIdOrIndex) => {
    setRaceForm(prev => ({
      ...prev,
      results: prev.results.filter((result, index) => {
        // If resultIdOrIndex is a number, treat it as an index
        if (typeof resultIdOrIndex === 'number') {
          return index !== resultIdOrIndex;
        }
        // Otherwise, treat it as an _id
        return result._id !== resultIdOrIndex;
      })
    }));
  };

  const editTournamentDetails = (tournament) => {
    setEditingTournament(tournament);
    
    // Ensure races have proper structure with results array
    const racesWithResults = (tournament.races || []).map(race => ({
      ...race,
      results: race.results || []
    }));
    
    setTournamentForm({
      cardId: tournament.cardId || '',
      title: tournament.title || '',
      races: racesWithResults
    });
    setShowTournamentModal(true);
  };

  const editRaceDetails = (race) => {
    console.log('=== EDIT RACE DETAILS DEBUG ===');
    console.log('Race to edit:', race);
    console.log('Race ID:', race?._id);
    console.log('Race results:', race.results);
    
    setEditingRace(race);
    
    // Format dates for datetime-local input (YYYY-MM-DDTHH:MM)
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // Get YYYY-MM-DDTHH:MM format
    };
    
    setRaceForm({
      round: race.round?.toString() || '',
      country: race.country || '',
      flag: null, // Reset file input
      grandPrix: race.grandPrix || '',
      startDate: formatDateForInput(race.startDate),
      endDate: formatDateForInput(race.endDate),
      results: race.results || []
    });
    setShowRaceModal(true);
    
    console.log('Editing race set to:', race);
    console.log('Race form populated with results:', race.results);
  };

  // Race CRUD Operations using dedicated race endpoints
  const createRace = async () => {
    try {
      console.log('=== CREATE RACE DEBUG ===');
      console.log('Race Form Data:', raceForm);
      console.log('Selected Tournament:', selectedTournament);
      
      if (!selectedTournament) {
        alert('Please select a tournament first');
        return;
      }

      // Frontend validation to match backend requirements
      if (!raceForm.round || !raceForm.country || !raceForm.grandPrix || !raceForm.startDate || !raceForm.endDate) {
        alert('Please fill in all required race fields: Round, Country, Grand Prix, Start Date, and End Date');
        return;
      }

      // Validate results if any exist
      for (const [index, result] of raceForm.results.entries()) {
        if (!result.position || !result.riderName || !result.time) {
          alert(`Result ${index + 1} is missing required fields: Position, Rider Name, or Time`);
          return;
        }
      }

      // Use the dedicated add race endpoint
      const createRaceUrl = `${API_BASE_URL}/${selectedTournament._id}/races`;
      console.log('Create race URL:', createRaceUrl);

      // Prepare FormData for the new race
      const formData = new FormData();
      
      // Add race basic info
      formData.append('round', parseInt(raceForm.round) || 0);
      formData.append('country', raceForm.country || '');
      formData.append('grandPrix', raceForm.grandPrix || '');
      formData.append('startDate', raceForm.startDate || '');
      formData.append('endDate', raceForm.endDate || '');

      // Prepare clean results data
      const cleanResults = raceForm.results.map(result => ({
        position: parseInt(result.position) || 0,
        riderName: result.riderName || '',
        team: result.team || '',
        time: result.time || ''
        // riderImage paths will be added by backend after file upload
      }));

      formData.append('results', JSON.stringify(cleanResults));
      console.log('Clean results:', cleanResults);

      // Add flag file if provided
      if (raceForm.flag && raceForm.flag instanceof File) {
        formData.append('flags', raceForm.flag);
        console.log('Added flag file');
      }

      // Add rider images
      raceForm.results.forEach((result, index) => {
        if (result.riderImage && result.riderImage instanceof File) {
          formData.append('riderImages', result.riderImage);
          console.log(`Added rider image for result ${index}`);
        }
      });

      console.log('Making API call to create race...');
      
      // Make API call to create race using dedicated endpoint
      const response = await axios.post(createRaceUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Create race response:', response.data);

      if (response.data.success) {
        // Refresh the tournament data to get the updated races
        const tournamentResponse = await axios.get(`${API_BASE_URL}/${selectedTournament._id}`);
        const updatedTournament = tournamentResponse.data.success ? 
                                tournamentResponse.data.data : tournamentResponse.data;
        
        setTournaments(tournaments.map((t) => (t._id === selectedTournament._id ? updatedTournament : t)));
        setSelectedTournament(updatedTournament);
        setShowRaceModal(false);
        resetRaceForm();
        
        console.log('Race created successfully');
        alert('Race created successfully!');
      } else {
        console.error('Create race failed:', response.data);
        alert('Failed to create race: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating race:', error);
      console.error('Error response:', error.response?.data);
      console.error('Full error:', error);
      
      // More specific error handling based on backend responses
      if (error.response?.status === 400) {
        // Handle validation errors from backend
        alert('Validation Error: ' + (error.response?.data?.message || 'Invalid data provided'));
      } else if (error.response?.status === 404) {
        alert('Tournament not found. Please refresh the page and try again.');
      } else if (error.response?.data?.message?.includes('Cast to embedded failed')) {
        alert('Data format error. Please check that all fields are filled correctly and try again.');
      } else {
        alert('Failed to create race: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const updateRace = async () => {
    try {
      console.log('=== UPDATE RACE DEBUG ===');
      console.log('Selected Tournament ID:', selectedTournament?._id);
      console.log('Editing Race ID:', editingRace?._id);
      console.log('Race Form Data:', raceForm);

      if (!selectedTournament || !editingRace) {
        console.error('Missing selectedTournament or editingRace');
        alert('Error: Missing tournament or race information');
        return;
      }

      // Frontend validation to match backend requirements
      if (!raceForm.round || !raceForm.country || !raceForm.grandPrix || !raceForm.startDate || !raceForm.endDate) {
        alert('Please fill in all required race fields: Round, Country, Grand Prix, Start Date, and End Date');
        return;
      }

      // Validate results if any exist
      for (const [index, result] of raceForm.results.entries()) {
        if (!result.position || !result.riderName || !result.time) {
          alert(`Result ${index + 1} is missing required fields: Position, Rider Name, or Time`);
          return;
        }
      }

      const updateUrl = `${API_BASE_URL}/${selectedTournament._id}/races/${editingRace._id}`;
      console.log('Update URL:', updateUrl);

      // Check if we have file uploads
      const hasFileUploads = (raceForm.flag && raceForm.flag instanceof File) || 
                           (raceForm.results && raceForm.results.some(result => 
                             result.riderImage && result.riderImage instanceof File));

      let response;

      if (hasFileUploads) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('round', raceForm.round);
        formData.append('country', raceForm.country);
        formData.append('grandPrix', raceForm.grandPrix);
        formData.append('startDate', raceForm.startDate);
        formData.append('endDate', raceForm.endDate);
        formData.append('results', JSON.stringify(raceForm.results));

        // Add flag file if uploaded
        if (raceForm.flag && raceForm.flag instanceof File) {
          formData.append('flags', raceForm.flag);
        }

        // Add rider images if any
        const riderImagesToUpload = [];
        if (raceForm.results) {
          raceForm.results.forEach((result) => {
            if (result.riderImage && result.riderImage instanceof File) {
              riderImagesToUpload.push(result.riderImage);
            }
          });
        }

        riderImagesToUpload.forEach((image) => {
          formData.append('riderImages', image);
        });

        response = await axios.put(updateUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Use regular JSON for text-only updates
        const updateData = {
          round: raceForm.round,
          country: raceForm.country,
          grandPrix: raceForm.grandPrix,
          startDate: raceForm.startDate,
          endDate: raceForm.endDate,
          results: raceForm.results
        };

        console.log('Sending JSON data:', updateData);

        response = await axios.put(updateUrl, updateData, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log('Update Response:', response.data);

      if (response.data.success) {
        // Fetch the updated tournament to get the latest data
        const tournamentResponse = await axios.get(`${API_BASE_URL}/${selectedTournament._id}`);
        const updatedTournament = tournamentResponse.data.success ? 
                                tournamentResponse.data.data : tournamentResponse.data;
        
        setTournaments(tournaments.map((t) => 
          (t._id === selectedTournament._id ? updatedTournament : t)
        ));
        setSelectedTournament(updatedTournament);
        
        setShowRaceModal(false);
        setEditingRace(null);
        resetRaceForm();
        
        console.log('Race updated successfully');
        alert('Race updated successfully!');
      } else {
        console.error('Update failed:', response.data);
        alert('Failed to update race: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating race:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 400) {
        alert('Validation Error: ' + (error.response?.data?.message || 'Invalid data provided'));
      } else if (error.response?.status === 404) {
        alert('Race or Tournament not found. Please refresh the page and try again.');
      } else {
        alert('Failed to update race: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const deleteRace = async (raceId) => {
    if (window.confirm('Are you sure you want to delete this race?')) {
      try {
        console.log('=== DELETE RACE DEBUG ===');
        console.log('Selected Tournament ID:', selectedTournament?._id);
        console.log('Race ID to delete:', raceId);

        if (!selectedTournament) {
          console.error('Missing selectedTournament');
          alert('Error: Missing tournament information');
          return;
        }

        const deleteUrl = `${API_BASE_URL}/${selectedTournament._id}/races/${raceId}`;
        console.log('Delete URL:', deleteUrl);

        // Use the specific race delete endpoint
        const response = await axios.delete(deleteUrl);

        console.log('Delete Response:', response.data);

        if (response.data.success) {
          // Fetch the updated tournament to get the latest data
          const tournamentResponse = await axios.get(`${API_BASE_URL}/${selectedTournament._id}`);
          const updatedTournament = tournamentResponse.data.success ? 
                                  tournamentResponse.data.data : tournamentResponse.data;
          
          setTournaments(tournaments.map((t) => 
            (t._id === selectedTournament._id ? updatedTournament : t)
          ));
          setSelectedTournament(updatedTournament);
          
          if (selectedRace?._id === raceId) setSelectedRace(null);
          
          console.log('Race deleted successfully');
          alert('Race deleted successfully!');
        } else {
          console.error('Delete failed:', response.data);
          alert('Failed to delete race: ' + (response.data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting race:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        if (error.response?.status === 400) {
          alert('Invalid ID provided: ' + (error.response?.data?.message || 'Invalid tournament or race ID'));
        } else if (error.response?.status === 404) {
          alert('Race or Tournament not found. Please refresh the page and try again.');  
        } else {
          alert('Failed to delete race: ' + (error.response?.data?.message || error.message));
        }
      }
    }
  };

  // Result CRUD Operations
  const createResult = () => {
    try {
      const newResult = {
        position: resultForm.position || '',
        riderName: resultForm.riderName || '',
        team: resultForm.team || '',
        time: resultForm.time || '',
        riderImage: resultForm.riderImage, // Keep the File object for now, will be cleaned during race creation
        _id: Date.now().toString()
      };

      console.log('Creating result:', newResult);
      addResultToRace(newResult);
      setShowResultModal(false);
      resetResultForm();
    } catch (error) {
      console.error('Error creating result:', error);
    }
  };

  const updateResult = () => {
    try {
      console.log('=== UPDATE RESULT DEBUG ===');
      console.log('Editing result:', editingResult);
      console.log('Result form:', resultForm);
      console.log('Current race results:', raceForm.results);
      
      const updatedResults = raceForm.results.map(result => 
        result._id === editingResult._id ? {
          ...result,
          position: resultForm.position,
          riderName: resultForm.riderName,
          team: resultForm.team,
          time: resultForm.time,
          riderImage: resultForm.riderImage || result.riderImage // Keep existing image if no new one
        } : result
      );

      console.log('Updated results:', updatedResults);
      
      setRaceForm(prev => ({ ...prev, results: updatedResults }));
      setShowResultModal(false);
      setEditingResult(null);
      resetResultForm();
      
      console.log('Result updated successfully in local state');
    } catch (error) {
      console.error('Error updating result:', error);
    }
  };

  const deleteResult = async (resultId) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/${selectedTournament._id}/races/${selectedRace._id}/results/${resultId}`
        );
        setTournaments(tournaments.map((t) => (t._id === selectedTournament._id ? response.data : t)));
        setSelectedTournament(response.data);
        setSelectedRace(response.data.races.find((r) => r._id === selectedRace._id));
      } catch (error) {
        console.error('Error deleting result:', error);
      }
    }
  };

  // Helper functions
  const resetRaceForm = () => {
    setRaceForm({
      round: '',
      country: '',
      flag: null,
      grandPrix: '',
      startDate: '',
      endDate: '',
      results: []
    });
  };

  const resetResultForm = () => {
    setResultForm({
      position: '',
      riderName: '',
      riderImage: null,
      team: '',
      time: '',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FaTrophy className="text-red-600 text-3xl" />
              <h1 className="text-3xl font-bold text-gray-800">MotoGP Racing Management</h1>
            </div>
            {/* <button
              onClick={() => {
                setEditingTournament(null);
                setTournamentForm({ title: '', bannerImage: null });
                setShowTournamentModal(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaPlus />
              <span>New Tournament</span>
            </button> */}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tournaments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tournaments'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tournaments
              </button>
              <button
                onClick={() => setActiveTab('races')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'races'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Race Management
              </button>
             
            </nav>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          )}

          {/* Tournaments Tab */}
          {!loading && activeTab === 'tournaments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">MotoGP Tournaments</h2>
                <div className="flex space-x-2">
              
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament) => (
                  <div
                    key={tournament._id}
                    className="bg-gradient-to-br from-red-50 to-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{tournament.title}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editTournamentDetails(tournament)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteTournament(tournament._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FaFlag className="text-red-600" />
                        <span className="text-gray-600">{tournament.races?.length || 0} Races</span>
                      </div>
                      {tournament.bannerImage && (
                        <img
                          src={`${API_BASE_URL}/${tournament.bannerImage}`}
                          alt={tournament.title}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      <button
                        onClick={() => {
                          setSelectedTournament(tournament);
                          setActiveTab('races');
                        }}
                        className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Manage Races
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Races Tab */}
          {!loading && activeTab === 'races' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedTournament ? `${selectedTournament.title} Races` : 'Select a Tournament First'}
                  </h2>
                  {selectedTournament && (
                    <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                      {selectedTournament.races?.length || 0} races
                    </span>
                  )}
                </div>
                {selectedTournament && (
                  <>
                    <button
                      onClick={() => {
                        setEditingRace(null);
                        resetRaceForm();
                        setShowRaceModal(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <FaPlus />
                      <span>Add Race</span>
                    </button>
                 
                  </>
                )}
              </div>

              {!selectedTournament ? (
                <div className="text-center py-12">
                  <FaFlag className="mx-auto text-gray-400 text-4xl mb-4" />
                  <p className="text-gray-500">Please select a tournament from the Tournaments tab to manage races.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedTournament.races?.map((race) => (
                    <div
                      key={race._id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-800">{race.grandPrix}</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editRaceDetails(race)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Edit Race"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteRace(race._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <FaMapMarkerAlt className="text-red-600" />
                            <span>{race.country}</span>
                          </div>
                          {race.flag && (
                            <div className="flex items-center space-x-2">
                              <FaFlag className="text-blue-600" />
                              <img
                                src={getImageUrl(race.flag)}
                                alt={race.country}
                                className="w-6 h-4 object-cover"
                                onError={(e) => {
                                  console.log('Flag image failed to load:', getImageUrl(race.flag));
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-green-600" />
                            <span>
                              {new Date(race.startDate).toLocaleDateString()} -{' '}
                              {new Date(race.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaClock className="text-purple-600" />
                            <span>Round: {race.round}</span>
                          </div>
                        </div>
                        
                        {/* Race Results Section */}
                        {race.results && race.results.length > 0 && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                              <div className="flex items-center">
                                <FaMedal className="mr-2 text-yellow-500" />
                                Race Results ({race.results.length})
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <FaEdit className="mr-1" />
                                Click edit to modify
                              </div>
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {race.results.slice(0, 5).map((result) => (
                                <div key={result._id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                                  <div className="flex items-center space-x-2 flex-1">
                                    <div className="flex items-center">
                                      {result.position <= 3 && (
                                        <FaMedal
                                          className={`mr-1 text-xs ${
                                            result.position === 1
                                              ? 'text-yellow-500'
                                              : result.position === 2
                                              ? 'text-gray-400'
                                              : 'text-orange-600'
                                          }`}
                                        />
                                      )}
                                      <span className="font-medium text-gray-900 min-w-[20px]">P{result.position}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-1">
                                      {result.riderImage && (
                                        <img
                                          src={getImageUrl(result.riderImage)}
                                          alt={result.riderName}
                                          className="h-6 w-6 rounded-full object-cover"
                                          onError={(e) => {
                                            console.log('Rider image failed to load:', getImageUrl(result.riderImage));
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 truncate">{result.riderName}</div>
                                        {result.team && (
                                          <div className="text-gray-500 truncate">{result.team}</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-gray-600 font-mono text-right ml-2">
                                    {result.time}
                                  </div>
                                </div>
                              ))}
                              {race.results.length > 5 && (
                                <div className="text-center text-gray-500 text-xs py-1">
                                  +{race.results.length - 5} more results...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* No Results Message */}
                        {(!race.results || race.results.length === 0) && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <div className="text-center text-gray-500 text-sm py-3">
                              <FaMedal className="mx-auto text-gray-400 text-lg mb-2" />
                              <p className="mb-2">No results available yet</p>
                              <p className="text-xs flex items-center justify-center">
                                <FaEdit className="mr-1" />
                                Click edit above to add race results
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {!loading && activeTab === 'results' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedRace ? `${selectedRace.grandPrix} Results` : 'Select a Race First'}
                  </h2>
                  {selectedRace && (
                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                      {selectedRace.results?.length || 0} results
                    </span>
                  )}
                </div>
                {selectedRace && (
                  <button
                    onClick={() => {
                      setEditingResult(null);
                      resetResultForm();
                      setShowResultModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <FaPlus />
                    <span>Add Result</span>
                  </button>
                )}
              </div>

              {!selectedRace ? (
                <div className="text-center py-12">
                  <FaMedal className="mx-auto text-gray-400 text-4xl mb-4" />
                  <p className="text-gray-500">Please select a race from the Race Management tab to view results.</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rider
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Team
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRace.results?.map((result) => (
                          <tr key={result._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {result.position <= 3 && (
                                  <FaMedal
                                    className={`mr-2 ${
                                      result.position === 1
                                        ? 'text-yellow-500'
                                        : result.position === 2
                                        ? 'text-gray-400'
                                        : 'text-orange-600'
                                    }`}
                                  />
                                )}
                                <span className="text-sm font-medium text-gray-900">{result.position}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                {result.riderImage && (
                                  <img
                                    src={getImageUrl(result.riderImage)}
                                    alt={result.riderName}
                                    className="h-8 w-8 rounded-full object-cover mr-3"
                                    onError={(e) => {
                                      console.log('Rider image failed to load:', getImageUrl(result.riderImage));
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                {result.riderName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.team}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.time}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingResult(result);
                                    setResultForm({
                                      position: result.position.toString(),
                                      riderName: result.riderName || '',
                                      riderImage: null,
                                      team: result.team || '',
                                      time: result.time || '',
                                    });
                                    setShowResultModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => deleteResult(result._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tournament Modal */}
          {showTournamentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingTournament ? 'Edit Tournament' : 'Create New Tournament'}
                  </h3>
                  <button onClick={() => setShowTournamentModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Championship Card</label>
                    <select
                      name="cardId"
                      value={tournamentForm.cardId}
                      onChange={handleTournamentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select Championship Card</option>
                      {cardSections.map((card) => (
                        <option key={card._id} value={card._id}>
                          {card.cardTitle} - {card.location}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Title</label>
                    <input
                      type="text"
                      name="title"
                      value={tournamentForm.title}
                      onChange={handleTournamentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="MotoGP Racing Calendar 2025"
                      required
                    />
                  </div>

                  {/* Races Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Races</label>
                    <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                      {tournamentForm.races && tournamentForm.races.length > 0 ? (
                        <div className="space-y-2">
                          {tournamentForm.races.map((race, index) => (
                            <div key={race._id || index} className="bg-white p-3 rounded border">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">Round {race.round}: {race.grandPrix}</div>
                                  <div className="text-xs text-gray-600">{race.country} • {race.startDate} - {race.endDate}</div>
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => editRaceDetails(race)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Edit Race"
                                  >
                                    <FaEdit className="text-xs" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updatedRaces = tournamentForm.races.filter((_, i) => i !== index);
                                      setTournamentForm(prev => ({ ...prev, races: updatedRaces }));
                                    }}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Delete Race"
                                  >
                                    <FaTrash className="text-xs" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Show Results */}
                              {race.results && race.results.length > 0 && (
                                <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                  <div className="text-xs font-medium text-gray-700 mb-1">Results ({race.results.length})</div>
                                  <div className="space-y-1">
                                    {race.results.slice(0, 3).map((result, resultIndex) => (
                                      <div key={result._id || resultIndex} className="text-xs text-gray-600 bg-gray-50 p-1 rounded">
                                        <span className="font-medium">P{result.position}</span> - {result.riderName} ({result.team}) - {result.time}
                                      </div>
                                    ))}
                                    {race.results.length > 3 && (
                                      <div className="text-xs text-gray-500">
                                        +{race.results.length - 3} more results...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {(!race.results || race.results.length === 0) && (
                                <div className="mt-2 text-xs text-gray-500 italic">No results added yet</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No races added yet</p>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => {
                          resetRaceForm();
                          setShowRaceModal(true);
                        }}
                        className="w-full mt-3 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm flex items-center justify-center space-x-1"
                      >
                        <FaPlus className="text-xs" />
                        <span>Add Race</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowTournamentModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingTournament ? updateTournament : createTournament}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                    >
                      {editingTournament ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Race Modal */}
          {showRaceModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{editingRace ? 'Edit Race' : 'Add New Race'}</h3>
                  <button onClick={() => setShowRaceModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Round</label>
                    <input
                      type="number"
                      value={raceForm.round}
                      onChange={(e) => setRaceForm({ ...raceForm, round: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={raceForm.country}
                      onChange={(e) => setRaceForm({ ...raceForm, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Thailand"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flag Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setRaceForm({ ...raceForm, flag: e.target.files[0] || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grand Prix</label>
                    <input
                      type="text"
                      value={raceForm.grandPrix}
                      onChange={(e) => setRaceForm({ ...raceForm, grandPrix: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="PT Grand Prix of Thailand"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      value={raceForm.startDate}
                      onChange={(e) => setRaceForm({ ...raceForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      value={raceForm.endDate}
                      onChange={(e) => setRaceForm({ ...raceForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                {/* Results Section */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Race Results</label>
                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                    {raceForm.results && raceForm.results.length > 0 ? (
                      <div className="space-y-2">
                        {raceForm.results.map((result, index) => (
                          <div key={result._id || index} className="flex items-center justify-between bg-white p-2 rounded border">
                            <div className="flex-1 grid grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="font-semibold">P{result.position}</span>
                              </div>
                              <div className="flex items-center">
                                {result.riderImage && (
                                  <img
                                    src={getImageUrl(result.riderImage)}
                                    alt={result.riderName}
                                    className="h-4 w-4 rounded-full object-cover mr-1"
                                    onError={(e) => {
                                      console.log('Image failed to load:', getImageUrl(result.riderImage));
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                <span className="font-medium">{result.riderName}</span>
                              </div>
                              <div>
                                <span className="truncate">{result.team}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">{result.time}</span>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setEditingResult(result);
                                  setResultForm({
                                    position: result.position || '',
                                    riderName: result.riderName || '',
                                    riderImage: null, // Reset file input
                                    team: result.team || '',
                                    time: result.time || ''
                                  });
                                  setShowResultModal(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit Result"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                              <button
                                onClick={() => removeResultFromRace(result._id || index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Delete Result"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">No results added yet</p>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setEditingResult(null);
                        resetResultForm();
                        setShowResultModal(true);
                      }}
                      className="w-full mt-3 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center justify-center space-x-1"
                    >
                      <FaPlus className="text-xs" />
                      <span>Add Result</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowRaceModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingRace ? updateRace : createRace}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    {editingRace ? 'Update' : 'Add Race'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Result Modal */}
          {showResultModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{editingResult ? 'Edit Result' : 'Add Race Result'}</h3>
                  <button onClick={() => setShowResultModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input
                      type="number"
                      value={resultForm.position}
                      onChange={(e) => setResultForm({ ...resultForm, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rider Name</label>
                    <input
                      type="text"
                      value={resultForm.riderName}
                      onChange={(e) => setResultForm({ ...resultForm, riderName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Marc Marquez"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rider Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setResultForm({ ...resultForm, riderImage: e.target.files[0] || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                    <input
                      type="text"
                      value={resultForm.team}
                      onChange={(e) => setResultForm({ ...resultForm, team: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Honda"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="text"
                      value={resultForm.time}
                      onChange={(e) => setResultForm({ ...resultForm, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1:31:47.828 or +0.895"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingResult ? updateResult : createResult}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    {editingResult ? 'Update' : 'Add Result'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotoGPRacing;

