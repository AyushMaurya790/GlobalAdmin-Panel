import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://globe.ridealmobility.com/api/sport/cricket-tournament";

const initialTournament = {
  cardId: "",
  tournamentName: "",
  format: "Men's T20",
  bannerImage: null,
  matches: [],
};

const initialMatch = {
  matchName: "",
  matchNumber: "",
  group: "",
  date: "",
  teams: [
    { name: "", flag: "", flagFile: null },
    { name: "", flag: "", flagFile: null }
  ],
  venue: "",
  localTime: "",
  gmtTime: "",
  status: "Match yet to begin"
};

export default function CricketTournament() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [formMode, setFormMode] = useState("list"); // list | create | edit | details
  const [formData, setFormData] = useState(initialTournament);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchForm, setMatchForm] = useState(initialMatch);
  const [matchEditId, setMatchEditId] = useState(null);
  const [cardSections, setCardSections] = useState([]); // For cardId dropdown
  const [flagPreviews, setFlagPreviews] = useState([null, null]); // For team flag previews

  // Fetch tournaments and card sections
  useEffect(() => {
    fetchTournaments();
    fetchCardSections();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setTournaments(res.data);
    } catch (err) {
      setError("Failed to fetch tournaments");
    }
    setLoading(false);
  };

  const fetchCardSections = async () => {
    try {
      const res = await axios.get("http://globe.ridealmobility.com/api/sport/card");
      setCardSections(res.data);
    } catch (err) {
      console.error("Failed to fetch card sections:", err);
    }
  };

  // Handle tournament form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "bannerImage" && files.length > 0) {
      setFormData({ ...formData, bannerImage: files[0] });
      setBannerPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Create or update tournament
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("cardId", formData.cardId);
      data.append("tournamentName", formData.tournamentName);
      data.append("format", formData.format);
      if (formData.bannerImage) data.append("bannerImage", formData.bannerImage);
      if (formData.matches && formData.matches.length > 0) {
        data.append("matches", JSON.stringify(formData.matches));
      }

      if (formMode === "create") {
        await axios.post(API_BASE, data);
      } else if (formMode === "edit" && selectedTournament) {
        await axios.put(`${API_BASE}/${selectedTournament._id}`, data);
      }
      setFormMode("list");
      setFormData(initialTournament);
      setBannerPreview(null);
      fetchTournaments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save tournament");
    }
    setLoading(false);
  };

  // Delete tournament
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tournament?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchTournaments();
    } catch (err) {
      setError("Failed to delete tournament");
    }
    setLoading(false);
  };

  // Show details
  const showDetails = async (tournament) => {
    setSelectedTournament(tournament);
    setFormMode("details");
    setFormData(tournament);
    setBannerPreview(tournament.bannerImage ? `http://globe.ridealmobility.com/${tournament.bannerImage}` : null);
  };

  // Edit tournament
  const handleEdit = (tournament) => {
    setSelectedTournament(tournament);
    setFormMode("edit");
    setFormData({ 
      cardId: tournament.cardId?._id || tournament.cardId || "",
      tournamentName: tournament.tournamentName || "",
      format: tournament.format || "Men's T20",
      bannerImage: null,
      matches: tournament.matches || []
    });
    setBannerPreview(tournament.bannerImage ? `http://globe.ridealmobility.com/${tournament.bannerImage}` : null);
  };

  // Add match
  const addMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formMode === "details" && selectedTournament) {
        const formData = new FormData();
        
        // Add match fields
        Object.keys(matchForm).forEach(key => {
          if (key === 'teams') {
            // Send teams data - backend will update flag paths from uploaded files
            const teamsData = matchForm[key].map(team => ({
              name: team.name,
              flag: team.flag || '' // Backend will override this with uploaded file paths
            }));
            formData.append('teams', JSON.stringify(teamsData));
          } else if (matchForm[key] !== '') {
            formData.append(key, matchForm[key]);
          }
        });

        // Add team flag files with correct backend field name
        matchForm.teams.forEach((team, index) => {
          if (team.flagFile) {
            formData.append(`teamFlags`, team.flagFile); // Backend expects 'teamFlags'
          }
        });

        await axios.post(`${API_BASE}/${selectedTournament._id}/matches`, formData);
        fetchTournaments();
        const updatedTournament = await axios.get(`${API_BASE}/${selectedTournament._id}`);
        showDetails(updatedTournament.data);
        resetMatchForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add match");
    }
    setLoading(false);
  };

  // Edit match
  const editMatch = (match) => {
    setMatchEditId(match._id);
    
    // Ensure teams array has the correct structure
    let teams = match.teams || [];
    if (typeof teams === 'string') {
      // Convert string to array format
      const teamNames = teams.split(',').map(name => name.trim());
      teams = teamNames.map(name => ({ name, flag: '', flagFile: null }));
    } else if (!Array.isArray(teams)) {
      teams = [];
    } else {
      // Ensure each team has flagFile property
      teams = teams.map(team => ({ ...team, flagFile: null }));
    }
    
    // Ensure we have at least 2 team slots
    while (teams.length < 2) {
      teams.push({ name: '', flag: '', flagFile: null });
    }
    
    setMatchForm({ ...match, teams });
    
    // Set flag previews for existing flags
    const previews = teams.map(team => 
      team.flag && team.flag.includes('uploads/') 
        ? `https://globe.ridealmobility.com/${team.flag}` 
        : null
    );
    setFlagPreviews(previews);
  };

  // Handle flag file upload
  const handleFlagUpload = (teamIndex, file) => {
    if (!file) return;
    
    const newTeams = [...matchForm.teams];
    newTeams[teamIndex] = { ...newTeams[teamIndex], flagFile: file };
    setMatchForm({ ...matchForm, teams: newTeams });
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...flagPreviews];
      newPreviews[teamIndex] = e.target.result;
      setFlagPreviews(newPreviews);
    };
    reader.readAsDataURL(file);
  };

  // Clear flag preview
  const clearFlagPreview = (teamIndex) => {
    const newTeams = [...matchForm.teams];
    newTeams[teamIndex] = { ...newTeams[teamIndex], flagFile: null, flag: '' };
    setMatchForm({ ...matchForm, teams: newTeams });
    
    const newPreviews = [...flagPreviews];
    newPreviews[teamIndex] = null;
    setFlagPreviews(newPreviews);
  };

  // Reset match form and previews
  const resetMatchForm = () => {
    setMatchForm(initialMatch);
    setMatchEditId(null);
    setFlagPreviews([null, null]);
  };

  // Update match
  const updateMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add match fields
      Object.keys(matchForm).forEach(key => {
        if (key === 'teams') {
          // Send teams data - backend will update flag paths from uploaded files
          const teamsData = matchForm[key].map(team => ({
            name: team.name,
            flag: team.flag || '' // Backend will override this with uploaded file paths
          }));
          formData.append('teams', JSON.stringify(teamsData));
        } else if (matchForm[key] !== '') {
          formData.append(key, matchForm[key]);
        }
      });

      // Add team flag files with correct backend field name  
      matchForm.teams.forEach((team, index) => {
        if (team.flagFile) {
          formData.append(`teamFlags`, team.flagFile); // Backend expects 'teamFlags'
        }
      });

      await axios.put(`${API_BASE}/${selectedTournament._id}/matches/${matchEditId}`, formData);
      fetchTournaments();
      const updatedTournament = await axios.get(`${API_BASE}/${selectedTournament._id}`);
      showDetails(updatedTournament.data);
      setMatchEditId(null);
      resetMatchForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update match");
    }
    setLoading(false);
  };

  // Delete match
  const deleteMatch = async (matchId) => {
    if (!window.confirm("Delete this match?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${selectedTournament._id}/matches/${matchId}`);
      fetchTournaments();
      const updatedTournament = await axios.get(`${API_BASE}/${selectedTournament._id}`);
      showDetails(updatedTournament.data);
    } catch (err) {
      setError("Failed to delete match");
    }
    setLoading(false);
  };

  // UI
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Cricket Tournament Landing Page</h1>
        <div className="text-sm text-gray-500">
          {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      )}

      {/* Tournament List */}
      {formMode === "list" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Tournaments</h2>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
              onClick={() => setFormMode("create")}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Tournament</span>
            </button>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tournaments</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new tournament.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map(tournament => (
                <div key={tournament._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200">
                  {tournament.bannerImage && (
                    <div className="h-48 w-full overflow-hidden">
                      <img 
                        src={`http://globe.ridealmobility.com/${tournament.bannerImage}`} 
                        alt="Tournament Banner" 
                        className="h-full w-full object-cover hover:scale-105 transition duration-300" 
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{tournament.tournamentName}</h3>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {tournament.format}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {tournament.matches?.length || 0} matches
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button 
                        className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition duration-200"
                        onClick={() => showDetails(tournament)}
                      >
                        View Details/Add Matches
                      </button>
                    
                      <button 
                        className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition duration-200"
                        onClick={() => handleDelete(tournament._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tournament Form */}
      {(formMode === "create" || formMode === "edit") && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {formMode === "create" ? "Create New Tournament" : "Edit Tournament"}
              </h2>
              <button
                onClick={() => {
                  setFormMode("list");
                  setFormData(initialTournament);
                  setBannerPreview(null);
                  setError("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card ID <span className="text-red-500">*</span>
                </label>
                <select
                  name="cardId"
                  value={formData.cardId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a card</option>
                  {cardSections.map(section => 
                    section.cards.map(card => (
                      <option key={card._id} value={card._id}>
                        {card.title} ({card.location})
                      </option>
                    ))
                  )}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Select the sports event card this tournament is associated with
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name
                </label>
                <input
                  type="text"
                  name="tournamentName"
                  value={formData.tournamentName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tournament name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Men's T20">Men's T20</option>
                  <option value="Women's T20">Women's T20</option>
                  <option value="Men's ODI">Men's ODI</option>
                  <option value="Women's ODI">Women's ODI</option>
                  <option value="Men's Test">Men's Test</option>
                  <option value="Women's Test">Women's Test</option>
                  <option value="T10">T10</option>
                  <option value="Youth">Youth</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <input
                  type="file"
                  name="bannerImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {bannerPreview && (
                  <div className="mt-4">
                    <img src={bannerPreview} alt="Banner Preview" className="h-32 w-full object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {loading ? "Saving..." : (formMode === "create" ? "Create Tournament" : "Update Tournament")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormMode("list");
                    setFormData(initialTournament);
                    setBannerPreview(null);
                    setError("");
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tournament Details & Match Management */}
      {formMode === "details" && selectedTournament && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tournament Header */}
            <div className="relative">
              {bannerPreview && (
                <div className="h-64 w-full overflow-hidden">
                  <img src={bannerPreview} alt="Tournament Banner" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setFormMode("list")}
                      className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition duration-200"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Tournaments
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedTournament.tournamentName}</h2>
                    <div className="flex items-center space-x-4">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {selectedTournament.format}
                      </span>
                      <span className="text-gray-600">
                        {selectedTournament.matches?.length || 0} matches scheduled
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(selectedTournament)}
                    className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg font-medium hover:bg-yellow-100 transition duration-200"
                  >
                    Edit Tournament
                  </button>
                </div>
              </div>
            </div>

            {/* Matches Section */}
            <div className="border-t border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Matches</h3>
              
              {/* Matches List */}
              {selectedTournament.matches && selectedTournament.matches.length > 0 ? (
                <div className="space-y-4 mb-8">
                  {selectedTournament.matches.map(match => (
                    <div key={match._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Match Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                              {match.matchNumber ? `Match ${match.matchNumber}` : match.matchName || 'Match'}
                            </div>
                            {match.group && (
                              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                {match.group}
                              </div>
                            )}
                            {match.status && (
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                match.status === "Match yet to begin" 
                                  ? "bg-yellow-100 text-yellow-800" 
                                  : match.status === "Live"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {match.status}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editMatch(match)}
                              className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-100 transition duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteMatch(match._id)}
                              className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Match Details */}
                      <div className="p-6">
                        {/* Teams Section */}
                        {match.teams && Array.isArray(match.teams) && match.teams.length > 0 ? (
                          <div className="mb-6">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">Teams</h5>
                            <div className="flex items-center justify-center space-x-8">
                              {match.teams.map((team, index) => (
                                <div key={team._id || index} className="text-center">
                                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-lg flex items-center space-x-2">
                                    {team.flag && (
                                      <span className="text-2xl">
                                        {team.flag.includes('uploads/') ? (
                                          <img 
                                            src={`https://globe.ridealmobility.com/${team.flag}`} 
                                            alt={`${team.name} flag`}
                                            className="w-6 h-4 object-cover rounded"
                                          />
                                        ) : (
                                          team.flag
                                        )}
                                      </span>
                                    )}
                                    <span>{team.name || team}</span>
                                  </div>
                                </div>
                              ))}
                              {match.teams.length === 2 && (
                                <div className="text-2xl font-bold text-gray-400">VS</div>
                              )}
                            </div>
                          </div>
                        ) : match.teams && typeof match.teams === 'string' ? (
                          <div className="mb-6">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">Teams</h5>
                            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-center">
                              {match.teams}
                            </div>
                          </div>
                        ) : null}

                        {/* Match Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          {match.date && (
                            <div className="flex items-center space-x-2">
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div>
                                <div className="font-medium text-gray-900">Date</div>
                                <div className="text-gray-600">{new Date(match.date).toLocaleDateString()}</div>
                              </div>
                            </div>
                          )}

                          {match.venue && (
                            <div className="flex items-center space-x-2">
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div>
                                <div className="font-medium text-gray-900">Venue</div>
                                <div className="text-gray-600">{match.venue}</div>
                              </div>
                            </div>
                          )}

                          {match.localTime && (
                            <div className="flex items-center space-x-2">
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <div className="font-medium text-gray-900">Local Time</div>
                                <div className="text-gray-600">{match.localTime}</div>
                              </div>
                            </div>
                          )}

                          {match.gmtTime && (
                            <div className="flex items-center space-x-2">
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <div className="font-medium text-gray-900">GMT Time</div>
                                <div className="text-gray-600">{match.gmtTime}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No matches scheduled</h3>
                  <p className="mt-1 text-sm text-gray-500">Add the first match to get started.</p>
                </div>
              )}

              {/* Add/Edit Match Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  {matchEditId ? "Edit Match" : "Add New Match"}
                </h4>
                <form onSubmit={matchEditId ? updateMatch : addMatch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Match Name</label>
                      <input
                        type="text"
                        value={matchForm.matchName}
                        onChange={(e) => setMatchForm({ ...matchForm, matchName: e.target.value })}
                        placeholder="e.g., Semi-Final 1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Match Number</label>
                      <input
                        type="number"
                        value={matchForm.matchNumber}
                        onChange={(e) => setMatchForm({ ...matchForm, matchNumber: e.target.value })}
                        placeholder="e.g., 1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                      <input
                        type="text"
                        value={matchForm.group}
                        onChange={(e) => setMatchForm({ ...matchForm, group: e.target.value })}
                        placeholder="e.g., Group A"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="datetime-local"
                        value={matchForm.date}
                        onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teams</label>
                      <div className="space-y-4">
                        {/* Team 1 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Team 1 Name</label>
                            <input
                              type="text"
                              value={matchForm.teams[0]?.name || ''}
                              onChange={(e) => {
                                const newTeams = [...matchForm.teams];
                                newTeams[0] = { ...newTeams[0], name: e.target.value };
                                setMatchForm({ ...matchForm, teams: newTeams });
                              }}
                              placeholder="e.g., India"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Team 1 Flag</label>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFlagUpload(0, e.target.files[0])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {flagPreviews[0] && (
                                <div className="relative inline-block">
                                  <img 
                                    src={flagPreviews[0]} 
                                    alt="Team 1 Flag Preview"
                                    className="w-12 h-8 object-cover rounded border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => clearFlagPreview(0)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                              <input
                                type="text"
                                value={matchForm.teams[0]?.flag || ''}
                                onChange={(e) => {
                                  const newTeams = [...matchForm.teams];
                                  newTeams[0] = { ...newTeams[0], flag: e.target.value };
                                  setMatchForm({ ...matchForm, teams: newTeams });
                                }}
                                placeholder="Or enter emoji/URL: 🇮🇳"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Team 2 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Team 2 Name</label>
                            <input
                              type="text"
                              value={matchForm.teams[1]?.name || ''}
                              onChange={(e) => {
                                const newTeams = [...matchForm.teams];
                                newTeams[1] = { ...newTeams[1], name: e.target.value };
                                setMatchForm({ ...matchForm, teams: newTeams });
                              }}
                              placeholder="e.g., Pakistan"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Team 2 Flag</label>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFlagUpload(1, e.target.files[0])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {flagPreviews[1] && (
                                <div className="relative inline-block">
                                  <img 
                                    src={flagPreviews[1]} 
                                    alt="Team 2 Flag Preview"
                                    className="w-12 h-8 object-cover rounded border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => clearFlagPreview(1)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                              <input
                                type="text"
                                value={matchForm.teams[1]?.flag || ''}
                                onChange={(e) => {
                                  const newTeams = [...matchForm.teams];
                                  newTeams[1] = { ...newTeams[1], flag: e.target.value };
                                  setMatchForm({ ...matchForm, teams: newTeams });
                                }}
                                placeholder="Or enter emoji/URL: 🇵🇰"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                      <input
                        type="text"
                        value={matchForm.venue}
                        onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                        placeholder="e.g., Dubai, Wankhede Stadium"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Local Time</label>
                      <input
                        type="text"
                        value={matchForm.localTime}
                        onChange={(e) => setMatchForm({ ...matchForm, localTime: e.target.value })}
                        placeholder="e.g., 6:30 pm Local"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GMT Time</label>
                      <input
                        type="text"
                        value={matchForm.gmtTime}
                        onChange={(e) => setMatchForm({ ...matchForm, gmtTime: e.target.value })}
                        placeholder="e.g., 2:30 pm GMT"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={matchForm.status}
                        onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Match yet to begin">Match yet to begin</option>
                        <option value="Live">Live</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Postponed">Postponed</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition duration-200"
                    >
                      {loading ? "Saving..." : (matchEditId ? "Update Match" : "Add Match")}
                    </button>
                    {matchEditId && (
                      <button
                        type="button"
                        onClick={() => {
                          setMatchEditId(null);
                          resetMatchForm();
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}