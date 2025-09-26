import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://globe.ridealmobility.com/api/sport/football-tournament";

const initialTournament = {
  cardId: "",
  name: "",
  hostCountries: [],
  startDate: "",
  endDate: "",
  stages: [],
  groups: [],
  bannerImage: null,
  matches: []
};

const initialMatch = {
  matchName: "",
  date: "",
  teams: [
    { name: "", flag: null, score: 0 },
    { name: "", flag: null, score: 0 }
  ],
  venue: "",
  stage: "",
  group: "",
  homeTeam: "",
  awayTeam: "",
  status: "Scheduled"
};

const initialStage = {
  name: "",
  startDate: "",
  endDate: "",
  description: ""
};

const initialGroup = {
  name: "",
  teams: []
};

export default function FootballTournament() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [formMode, setFormMode] = useState("list"); // list | create | edit | details
  const [formData, setFormData] = useState(initialTournament);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchForm, setMatchForm] = useState(initialMatch);
  const [teamFlags, setTeamFlags] = useState([null, null]); // For storing team flag files
  const [teamFlagPreviews, setTeamFlagPreviews] = useState([null, null]); // For previewing flag images
  const [matchEditId, setMatchEditId] = useState(null);
  const [activeTab, setActiveTab] = useState("basic"); // basic | stages | groups | matches
  const [cardSections, setCardSections] = useState([]); // For cardId dropdown

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

  // Fetch tournaments by cardId
  const fetchTournamentsByCardId = async (cardId) => {
    if (!cardId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/card/${cardId}`);
      setTournaments(res.data);
    } catch (err) {
      setError("Failed to fetch tournaments for this card");
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

  // Handle array field changes
  const handleArrayChange = (field, index, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData({ ...formData, [field]: updatedArray });
  };

  // Add item to array field
  const addArrayItem = (field, item = "") => {
    setFormData({ ...formData, [field]: [...formData[field], item] });
  };

  // Remove item from array field
  const removeArrayItem = (field, index) => {
    const updatedArray = [...formData[field]];
    updatedArray.splice(index, 1);
    setFormData({ ...formData, [field]: updatedArray });
  };

  // Add stage
  const addStage = () => {
    setFormData({ ...formData, stages: [...formData.stages, { ...initialStage }] });
  };

  // Add group
  const addGroup = () => {
    setFormData({ ...formData, groups: [...formData.groups, { ...initialGroup }] });
  };

  // Create or update tournament
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("cardId", formData.cardId);
      data.append("hostCountries", JSON.stringify(formData.hostCountries));
      data.append("startDate", formData.startDate);
      data.append("endDate", formData.endDate);
      
      // Process groups and team flags
      if (formData.groups && formData.groups.length > 0) {
        // Create a deep copy to process without changing state
        const processedGroups = JSON.parse(JSON.stringify(formData.groups));
        
        // Process each group's teams
        processedGroups.forEach((group, groupIndex) => {
          if (group.teams && Array.isArray(group.teams)) {
            group.teams.forEach((team, teamIndex) => {
              // If team is an object with a flag that's a File object
              if (typeof team === 'object' && team.flag && typeof team.flag === 'object') {
                // Add the file to FormData with a unique identifier
                const flagFieldName = `groupTeamFlags_${groupIndex}_${teamIndex}`;
                data.append(flagFieldName, team.flag);
                
                // Replace the File object with the field name for the backend to process
                team.flagField = flagFieldName;
                
                // Remove the actual file object and preview
                delete team.flag;
                if (team.flagPreview) {
                  delete team.flagPreview;
                }
              }
            });
          }
        });
        
        data.append('groups', JSON.stringify(processedGroups));
      } else {
        data.append("groups", JSON.stringify(formData.groups));
      }
      
      // Process stages
      data.append("stages", JSON.stringify(formData.stages));
      
      // Add banner if it exists
      if (formData.bannerImage) data.append("bannerImage", formData.bannerImage);

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
      setError("Failed to save tournament");
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
    setFormData({
      ...tournament,
      cardId: tournament.cardId?._id || tournament.cardId || ""
    });
    setBannerPreview(tournament.bannerImage ? `http://globe.ridealmobility.com/${tournament.bannerImage}` : null);
  };

  // Edit tournament
  const handleEdit = (tournament) => {
    setSelectedTournament(tournament);
    setFormMode("edit");
    setFormData({ 
      ...tournament, 
      cardId: tournament.cardId?._id || tournament.cardId || "",
      bannerImage: null 
    });
    setBannerPreview(tournament.bannerImage ? `http://globe.ridealmobility.com/${tournament.bannerImage}` : null);
  };

  // Add match
  const addMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formMode === "details" && selectedTournament) {
        // Create new FormData for file upload
        const formData = new FormData();
        
        // Add match details
        formData.append("matchName", matchForm.matchName);
        formData.append("date", matchForm.date);
        formData.append("venue", matchForm.venue);
        formData.append("stage", matchForm.stage);
        formData.append("group", matchForm.group);
        formData.append("status", matchForm.status);
        
        // Prepare teams array with legacy fields for backward compatibility
        const teamsArray = [
          { name: matchForm.homeTeam || matchForm.teams[0].name, score: matchForm.teams[0].score || 0 },
          { name: matchForm.awayTeam || matchForm.teams[1].name, score: matchForm.teams[1].score || 0 }
        ];
        
        // Add teams as JSON
        formData.append("teams", JSON.stringify(teamsArray));
        
        // Add team flags if available
        if (teamFlags[0]) formData.append("teamFlags", teamFlags[0]);
        if (teamFlags[1]) formData.append("teamFlags", teamFlags[1]);
        
        await axios.post(`${API_BASE}/${selectedTournament._id}/matches`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        fetchTournaments();
        const updatedTournament = await axios.get(`${API_BASE}/${selectedTournament._id}`);
        showDetails(updatedTournament.data);
        setMatchForm(initialMatch);
        setTeamFlags([null, null]);
        setTeamFlagPreviews([null, null]);
      }
    } catch (err) {
      setError("Failed to add match");
      console.error(err);
    }
    setLoading(false);
  };

  // Edit match
  const editMatch = (match) => {
    setMatchEditId(match._id);
    
    // Initialize teamFlags and previews
    setTeamFlags([null, null]);
    setTeamFlagPreviews([null, null]);
    
    // Handle teams array or home/away fields
    let teams = match.teams || [];
    if (!teams.length && (match.homeTeam || match.awayTeam)) {
      teams = [
        { name: match.homeTeam || "", score: 0, flag: null },
        { name: match.awayTeam || "", score: 0, flag: null }
      ];
    }
    
    // Set previews for team flags if they exist
    if (teams[0] && teams[0].flag) {
      setTeamFlagPreviews([
        `http://globe.ridealmobility.com/${teams[0].flag}`,
        teams[1] && teams[1].flag ? `http://globe.ridealmobility.com/${teams[1].flag}` : null
      ]);
    }
    
    // Set match form
    setMatchForm({
      ...match,
      teams,
      homeTeam: teams[0]?.name || match.homeTeam || "",
      awayTeam: teams[1]?.name || match.awayTeam || ""
    });
  };

  // Update match
  const updateMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create new FormData for file upload
      const formData = new FormData();
      
      // Add match details
      formData.append("matchName", matchForm.matchName);
      formData.append("date", matchForm.date);
      formData.append("venue", matchForm.venue);
      formData.append("stage", matchForm.stage);
      formData.append("group", matchForm.group);
      formData.append("status", matchForm.status);
      
      // Prepare teams array with legacy fields for backward compatibility
      const teamsArray = [
        { name: matchForm.homeTeam || matchForm.teams[0].name, score: matchForm.teams[0].score || 0 },
        { name: matchForm.awayTeam || matchForm.teams[1].name, score: matchForm.teams[1].score || 0 }
      ];
      
      // Add teams as JSON
      formData.append("teams", JSON.stringify(teamsArray));
      
      // Add team flags if available
      if (teamFlags[0]) formData.append("teamFlags", teamFlags[0]);
      if (teamFlags[1]) formData.append("teamFlags", teamFlags[1]);
      
      await axios.put(`${API_BASE}/${selectedTournament._id}/matches/${matchEditId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      fetchTournaments();
      const updatedTournament = await axios.get(`${API_BASE}/${selectedTournament._id}`);
      showDetails(updatedTournament.data);
      setMatchEditId(null);
      setMatchForm(initialMatch);
      setTeamFlags([null, null]);
      setTeamFlagPreviews([null, null]);
    } catch (err) {
      setError("Failed to update match");
      console.error(err);
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
        <h1 className="text-4xl font-bold text-gray-800">⚽ Football Tournament Manager</h1>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      )}

      {/* Tournament List */}
      {formMode === "list" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-800">Tournaments</h2>
              
              {/* Card Filter Dropdown */}
              <div className="relative">
                <select 
                  className="bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  onChange={(e) => {
                    if (e.target.value === "all") {
                      fetchTournaments();
                    } else {
                      fetchTournamentsByCardId(e.target.value);
                    }
                  }}
                >
                  <option value="all">All Cards</option>
                  {cardSections.map(card => (
                    <option key={card._id} value={card._id}>{card.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
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
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new football tournament.</p>
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">⚽ {tournament.name}</h3>
                        <div className="space-y-2 mb-3">
                          {tournament.hostCountries && tournament.hostCountries.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {tournament.hostCountries.map((country, index) => (
                                <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                  {country}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            {tournament.startDate && tournament.endDate && (
                              <div>📅 {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}</div>
                            )}
                            <div>🏆 {tournament.stages?.length || 0} stages • 👥 {tournament.groups?.length || 0} groups</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button 
                        className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition duration-200"
                        onClick={() => showDetails(tournament)}
                      >
                        View Details
                      </button>
                      <button 
                        className="flex-1 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-100 transition duration-200"
                        onClick={() => handleEdit(tournament)}
                      >
                        Edit
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {formMode === "create" ? "Create New Football Tournament" : "Edit Tournament"}
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

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: "basic", label: "Basic Info", icon: "📋" },
                  { id: "stages", label: "Stages", icon: "🏟️" },
                  { id: "groups", label: "Groups", icon: "👥" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tournament Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter tournament name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Card
                    </label>
                    <select
                      name="cardId"
                      value={formData.cardId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a card</option>
                      {cardSections.map((card) => (
                        <option key={card._id} value={card._id}>
                          {card.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Host Countries
                    </label>
                    <div className="space-y-2">
                      {formData.hostCountries.map((country, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={country}
                            onChange={(e) => handleArrayChange("hostCountries", index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter country name"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem("hostCountries", index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem("hostCountries", "")}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        + Add Host Country
                      </button>
                    </div>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {bannerPreview && (
                      <div className="mt-4">
                        <img src={bannerPreview} alt="Banner Preview" className="h-32 w-full object-cover rounded-lg" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stages Tab */}
              {activeTab === "stages" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Tournament Stages</h3>
                    <button
                      type="button"
                      onClick={addStage}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200"
                    >
                      + Add Stage
                    </button>
                  </div>
                  
                  {formData.stages.map((stage, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-800">Stage {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeArrayItem("stages", index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stage Name</label>
                          <input
                            type="text"
                            value={stage.name || ""}
                            onChange={(e) => {
                              const updatedStages = [...formData.stages];
                              updatedStages[index] = { ...updatedStages[index], name: e.target.value };
                              setFormData({ ...formData, stages: updatedStages });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., Group Stage, Quarter-finals"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={stage.description || ""}
                            onChange={(e) => {
                              const updatedStages = [...formData.stages];
                              updatedStages[index] = { ...updatedStages[index], description: e.target.value };
                              setFormData({ ...formData, stages: updatedStages });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Stage description"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={stage.startDate || ""}
                            onChange={(e) => {
                              const updatedStages = [...formData.stages];
                              updatedStages[index] = { ...updatedStages[index], startDate: e.target.value };
                              setFormData({ ...formData, stages: updatedStages });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            value={stage.endDate || ""}
                            onChange={(e) => {
                              const updatedStages = [...formData.stages];
                              updatedStages[index] = { ...updatedStages[index], endDate: e.target.value };
                              setFormData({ ...formData, stages: updatedStages });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Groups Tab */}
              {activeTab === "groups" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Tournament Groups</h3>
                    <button
                      type="button"
                      onClick={addGroup}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200"
                    >
                      + Add Group
                    </button>
                  </div>
                  
                  {formData.groups.map((group, groupIndex) => (
                    <div key={groupIndex} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-800">Group {groupIndex + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeArrayItem("groups", groupIndex)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                          <input
                            type="text"
                            value={group.name || ""}
                            onChange={(e) => {
                              const updatedGroups = [...formData.groups];
                              updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], name: e.target.value };
                              setFormData({ ...formData, groups: updatedGroups });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., Group A, Group B"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Teams</label>
                          <div className="space-y-4">
                            {(group.teams || []).map((team, teamIndex) => (
                              <div key={teamIndex} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-start space-x-2">
                                  <div className="flex-1 space-y-3">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                                      <input
                                        type="text"
                                        value={typeof team === 'object' ? team.name || '' : team}
                                        onChange={(e) => {
                                          const updatedGroups = [...formData.groups];
                                          const updatedTeams = [...(updatedGroups[groupIndex].teams || [])];
                                          
                                          // Handle if team is string or object
                                          if (typeof team === 'object') {
                                            updatedTeams[teamIndex] = { ...updatedTeams[teamIndex], name: e.target.value };
                                          } else {
                                            // Convert from string to object
                                            updatedTeams[teamIndex] = { name: e.target.value, flag: null };
                                          }
                                          
                                          updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], teams: updatedTeams };
                                          setFormData({ ...formData, groups: updatedGroups });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Enter team name"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Flag</label>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files[0]) {
                                            const updatedGroups = [...formData.groups];
                                            const updatedTeams = [...(updatedGroups[groupIndex].teams || [])];
                                            
                                            // Ensure team is an object
                                            if (typeof updatedTeams[teamIndex] !== 'object') {
                                              updatedTeams[teamIndex] = { name: updatedTeams[teamIndex], flag: null };
                                            }
                                            
                                            // Store file in form data
                                            updatedTeams[teamIndex] = { 
                                              ...updatedTeams[teamIndex], 
                                              flag: e.target.files[0],
                                              flagPreview: URL.createObjectURL(e.target.files[0])
                                            };
                                            
                                            updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], teams: updatedTeams };
                                            setFormData({ ...formData, groups: updatedGroups });
                                          }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                      />
                                      
                                      {/* Preview flag if available */}
                                      {typeof team === 'object' && team.flagPreview && (
                                        <div className="mt-2">
                                          <img 
                                            src={team.flagPreview} 
                                            alt={`${team.name || 'Team'} Flag`} 
                                            className="h-8 w-auto object-contain" 
                                          />
                                        </div>
                                      )}
                                      
                                      {/* Show existing flag if available */}
                                      {typeof team === 'object' && team.flag && !team.flagPreview && (
                                        <div className="mt-2">
                                          <img 
                                            src={`http://globe.ridealmobility.com/${team.flag}`} 
                                            alt={`${team.name || 'Team'} Flag`} 
                                            className="h-8 w-auto object-contain" 
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedGroups = [...formData.groups];
                                      const updatedTeams = [...(updatedGroups[groupIndex].teams || [])];
                                      updatedTeams.splice(teamIndex, 1);
                                      updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], teams: updatedTeams };
                                      setFormData({ ...formData, groups: updatedGroups });
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedGroups = [...formData.groups];
                                const currentTeams = updatedGroups[groupIndex].teams || [];
                                updatedGroups[groupIndex] = { 
                                  ...updatedGroups[groupIndex], 
                                  teams: [...currentTeams, { name: "", flag: null }] 
                                };
                                setFormData({ ...formData, groups: updatedGroups });
                              }}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              + Add Team
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex space-x-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
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
        <div className="max-w-6xl mx-auto">
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">⚽ {selectedTournament.name}</h2>
                    <div className="flex items-center space-x-4 mb-4">
                      {selectedTournament.hostCountries && selectedTournament.hostCountries.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedTournament.hostCountries.map((country, index) => (
                            <span key={index} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                              🏴 {country}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-gray-600">
                      📅 {new Date(selectedTournament.startDate).toLocaleDateString()} - {new Date(selectedTournament.endDate).toLocaleDateString()}
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

            {/* Tournament Details Tabs */}
            <div className="border-t border-gray-200">
              <div className="flex">
                {[
                  { id: "stages", label: "Stages", icon: "🏟️" },
                  { id: "groups", label: "Groups", icon: "👥" },
                  { id: "matches", label: "Matches", icon: "⚽" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {/* Stages Tab */}
                {activeTab === "stages" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Tournament Stages</h3>
                    {selectedTournament.stages && selectedTournament.stages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTournament.stages.map((stage, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                            <h4 className="font-semibold text-gray-800 mb-2">🏟️ {stage.name}</h4>
                            {stage.description && <p className="text-gray-600 mb-2">{stage.description}</p>}
                            {stage.startDate && stage.endDate && (
                              <p className="text-sm text-gray-500">
                                📅 {new Date(stage.startDate).toLocaleDateString()} - {new Date(stage.endDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No stages defined for this tournament.</p>
                    )}
                  </div>
                )}

                {/* Groups Tab */}
                {activeTab === "groups" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Tournament Groups</h3>
                    {selectedTournament.groups && selectedTournament.groups.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedTournament.groups.map((group, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                            <h4 className="font-semibold text-gray-800 mb-3">👥 {group.name}</h4>
                            {group.teams && group.teams.length > 0 ? (
                              <div className="space-y-1">
                                {group.teams.map((team, teamIndex) => (
                                  <div key={teamIndex} className="bg-white px-3 py-1 rounded text-sm flex items-center">
                                    {typeof team === 'object' ? (
                                      <>
                                        {team.flag && (
                                          <img 
                                            src={`http://globe.ridealmobility.com/${team.flag}`} 
                                            alt="Team Flag" 
                                            className="h-6 w-auto object-contain mr-2" 
                                          />
                                        )}
                                        <span>⚽ {team.name}</span>
                                      </>
                                    ) : (
                                      <span>⚽ {team}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No teams assigned</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No groups defined for this tournament.</p>
                    )}
                  </div>
                )}

                {/* Matches Tab */}
                {activeTab === "matches" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Matches</h3>
                    
                    {/* Matches List */}
                    {selectedTournament.matches && selectedTournament.matches.length > 0 ? (
                      <div className="space-y-4 mb-8">
                        {selectedTournament.matches.map(match => (
                          <div key={match._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="text-lg font-medium text-gray-900 mb-2">⚽ {match.matchName || "Football Match"}</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                    {match.date && (
                                      <div className="flex items-center">
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(match.date).toLocaleDateString()}
                                      </div>
                                    )}
                                    {match.venue && (
                                      <div className="flex items-center">
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {match.venue}
                                      </div>
                                    )}
                                    {match.stage && (
                                      <div className="flex items-center">
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                          {match.stage}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Teams Display */}
                                  <div className="mt-3 flex items-center justify-center space-x-4">
                                    {/* Team 1 */}
                                    {(match.teams && match.teams.length > 0) ? (
                                      <div className="flex items-center space-x-2">
                                        {match.teams[0].flag && (
                                          <img 
                                            src={`http://globe.ridealmobility.com/${match.teams[0].flag}`} 
                                            alt="Team 1 Flag" 
                                            className="h-8 w-auto object-contain"
                                          />
                                        )}
                                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-medium">
                                          {match.teams[0].name || match.homeTeam}
                                          {match.teams[0].score !== undefined && ` (${match.teams[0].score})`}
                                        </div>
                                      </div>
                                    ) : match.homeTeam && (
                                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-medium">
                                        {match.homeTeam}
                                      </div>
                                    )}
                                    
                                    <span className="text-lg font-bold text-gray-400">VS</span>
                                    
                                    {/* Team 2 */}
                                    {(match.teams && match.teams.length > 1) ? (
                                      <div className="flex items-center space-x-2">
                                        <div className="bg-red-100 text-red-800 px-3 py-1 rounded font-medium">
                                          {match.teams[1].name || match.awayTeam}
                                          {match.teams[1].score !== undefined && ` (${match.teams[1].score})`}
                                        </div>
                                        {match.teams[1].flag && (
                                          <img 
                                            src={`http://globe.ridealmobility.com/${match.teams[1].flag}`} 
                                            alt="Team 2 Flag" 
                                            className="h-8 w-auto object-contain"
                                          />
                                        )}
                                      </div>
                                    ) : match.awayTeam && (
                                      <div className="bg-red-100 text-red-800 px-3 py-1 rounded font-medium">
                                        {match.awayTeam}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                              type="datetime-local"
                              value={matchForm.date}
                              onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              required
                            />
                          </div>
                          
                          {/* Team 1 */}
                          <div className="md:col-span-2 bg-white p-4 rounded-lg border border-gray-200 mb-2">
                            <h5 className="font-medium text-gray-800 mb-3">Team 1 (Home)</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                                <input
                                  type="text"
                                  value={matchForm.homeTeam || (matchForm.teams[0] ? matchForm.teams[0].name : "")}
                                  onChange={(e) => {
                                    const teams = [...matchForm.teams];
                                    teams[0] = { ...teams[0], name: e.target.value };
                                    setMatchForm({ 
                                      ...matchForm, 
                                      homeTeam: e.target.value,
                                      teams: teams
                                    });
                                  }}
                                  placeholder="e.g., Brazil"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team Flag</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const newFlags = [...teamFlags];
                                      newFlags[0] = e.target.files[0];
                                      setTeamFlags(newFlags);
                                      
                                      const newPreviews = [...teamFlagPreviews];
                                      newPreviews[0] = URL.createObjectURL(e.target.files[0]);
                                      setTeamFlagPreviews(newPreviews);
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                {teamFlagPreviews[0] && (
                                  <div className="mt-2">
                                    <img 
                                      src={teamFlagPreviews[0]} 
                                      alt="Team 1 Flag" 
                                      className="h-12 w-auto object-contain border rounded"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Team 2 */}
                          <div className="md:col-span-2 bg-white p-4 rounded-lg border border-gray-200 mb-2">
                            <h5 className="font-medium text-gray-800 mb-3">Team 2 (Away)</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                                <input
                                  type="text"
                                  value={matchForm.awayTeam || (matchForm.teams[1] ? matchForm.teams[1].name : "")}
                                  onChange={(e) => {
                                    const teams = [...matchForm.teams];
                                    teams[1] = { ...teams[1], name: e.target.value };
                                    setMatchForm({ 
                                      ...matchForm, 
                                      awayTeam: e.target.value,
                                      teams: teams
                                    });
                                  }}
                                  placeholder="e.g., Argentina"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team Flag</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const newFlags = [...teamFlags];
                                      newFlags[1] = e.target.files[0];
                                      setTeamFlags(newFlags);
                                      
                                      const newPreviews = [...teamFlagPreviews];
                                      newPreviews[1] = URL.createObjectURL(e.target.files[0]);
                                      setTeamFlagPreviews(newPreviews);
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                {teamFlagPreviews[1] && (
                                  <div className="mt-2">
                                    <img 
                                      src={teamFlagPreviews[1]} 
                                      alt="Team 2 Flag" 
                                      className="h-12 w-auto object-contain border rounded"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                            <input
                              type="text"
                              value={matchForm.venue}
                              onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                              placeholder="e.g., Wembley Stadium"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                            <input
                              type="text"
                              value={matchForm.stage}
                              onChange={(e) => setMatchForm({ ...matchForm, stage: e.target.value })}
                              placeholder="e.g., Group Stage, Final"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                            <input
                              type="text"
                              value={matchForm.group}
                              onChange={(e) => setMatchForm({ ...matchForm, group: e.target.value })}
                              placeholder="e.g., Group A"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              value={matchForm.status}
                              onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="Live">Live</option>
                              <option value="Finished">Finished</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="Postponed">Postponed</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition duration-200"
                          >
                            {loading ? "Saving..." : (matchEditId ? "Update Match" : "Add Match")}
                          </button>
                          {matchEditId && (
                            <button
                              type="button"
                              onClick={() => {
                                setMatchEditId(null);
                                setMatchForm(initialMatch);
                                setTeamFlags([null, null]);
                                setTeamFlagPreviews([null, null]);
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}