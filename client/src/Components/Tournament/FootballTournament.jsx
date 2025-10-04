import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5858/api/sport/football-tournament";

const initialTournament = {
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
  matchNumber: 1,
  stage: "",
  group: "",
  date: "",
  time: "",
  venue: "",
  teams: [
    { name: "", code: "", flag: null, score: null },
    { name: "", code: "", flag: null, score: null }
  ],
  status: "Fixture"
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
  const [teamFlags, setTeamFlags] = useState([null, null]);
  const [teamFlagPreviews, setTeamFlagPreviews] = useState([null, null]);
  const [matchEditId, setMatchEditId] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setTournaments(res.data);
    } catch (err) {
      setError("Failed to fetch tournaments: " + (err.response?.data?.message || err.message));
      console.error("Fetch tournaments error:", err.response || err);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "bannerImage" && files.length > 0) {
      setFormData({ ...formData, bannerImage: files[0] });
      setBannerPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const clearBannerImage = () => {
    setFormData({ ...formData, bannerImage: null });
    setBannerPreview(null);
  };

  const addArrayItem = (field, item = "") => {
    setFormData({ ...formData, [field]: [...formData[field], item] });
  };

  const removeArrayItem = (field, index) => {
    const updatedArray = [...formData[field]];
    updatedArray.splice(index, 1);
    setFormData({ ...formData, [field]: updatedArray });
  };

  const addGroup = () => {
    setFormData({ ...formData, groups: [...formData.groups, { ...initialGroup }] });
  };

  const handleGroupChange = (groupIndex, field, value) => {
    const updatedGroups = [...formData.groups];
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], [field]: value };
    setFormData({ ...formData, groups: updatedGroups });
  };

  const addTeamToGroup = (groupIndex) => {
    const updatedGroups = [...formData.groups];
    const currentTeams = updatedGroups[groupIndex].teams || [];
    updatedGroups[groupIndex].teams = [...currentTeams, { name: "", code: "", flag: null }];
    setFormData({ ...formData, groups: updatedGroups });
  };

  const handleTeamChange = (groupIndex, teamIndex, field, value) => {
    const updatedGroups = [...formData.groups];
    const updatedTeams = [...updatedGroups[groupIndex].teams];
    updatedTeams[teamIndex] = { ...updatedTeams[teamIndex], [field]: value };
    updatedGroups[groupIndex].teams = updatedTeams;
    setFormData({ ...formData, groups: updatedGroups });
  };

  const handleGroupTeamFlag = (groupIndex, teamIndex, file) => {
    const updatedGroups = [...formData.groups];
    const updatedTeams = [...updatedGroups[groupIndex].teams];
    updatedTeams[teamIndex] = { 
      ...updatedTeams[teamIndex], 
      flag: file,
      flagPreview: URL.createObjectURL(file)
    };
    updatedGroups[groupIndex].teams = updatedTeams;
    setFormData({ ...formData, groups: updatedGroups });
  };

  const removeTeamFromGroup = (groupIndex, teamIndex) => {
    const updatedGroups = [...formData.groups];
    const updatedTeams = [...updatedGroups[groupIndex].teams];
    updatedTeams.splice(teamIndex, 1);
    updatedGroups[groupIndex].teams = updatedTeams;
    setFormData({ ...formData, groups: updatedGroups });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      setError("Please fill in all required fields (Name, Start Date, End Date).");
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("hostCountries", JSON.stringify(formData.hostCountries));
      data.append("startDate", new Date(formData.startDate).toISOString());
      data.append("endDate", new Date(formData.endDate).toISOString());
      data.append("stages", JSON.stringify(formData.stages));

      const processedGroups = JSON.parse(JSON.stringify(formData.groups));
      const teamFlagFiles = [];

      processedGroups.forEach((group) => {
        if (group.teams) {
          group.teams.forEach((team) => {
            if (team.flag && team.flag instanceof File) {
              teamFlagFiles.push(team.flag);
              delete team.flag;
              if (team.flagPreview) delete team.flagPreview;
            }
          });
        }
      });

      data.append("groups", JSON.stringify(processedGroups));

      teamFlagFiles.forEach(file => {
        data.append("teamFlags", file);
      });

      const processedMatches = JSON.parse(JSON.stringify(formData.matches));
      const matchTeamFlagFiles = [];

      processedMatches.forEach((match) => {
        if (match.teams) {
          match.teams.forEach((team) => {
            if (team.flag && team.flag instanceof File) {
              matchTeamFlagFiles.push(team.flag);
              delete team.flag;
              if (team.flagPreview) delete team.flagPreview;
            }
          });
        }
      });

      data.append("matches", JSON.stringify(processedMatches));

      matchTeamFlagFiles.forEach(file => {
        data.append("matchTeamFlags", file);
      });

      if (formData.bannerImage instanceof File) {
        data.append("bannerImage", formData.bannerImage);
      }

      let res;
      if (formMode === "create") {
        res = await axios.post(API_BASE, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else if (formMode === "edit" && selectedTournament) {
        res = await axios.put(`${API_BASE}/${selectedTournament._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setFormMode("list");
      setFormData(initialTournament);
      setBannerPreview(null);
      fetchTournaments();
    } catch (err) {
      setError("Failed to save tournament: " + (err.response?.data?.message || err.message));
      console.error("Submit error:", err.response || err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tournament?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchTournaments();
    } catch (err) {
      setError("Failed to delete tournament: " + (err.response?.data?.message || err.message));
      console.error("Delete error:", err.response || err);
    }
    setLoading(false);
  };

  const showDetails = async (tournament) => {
    setSelectedTournament(tournament);
    setFormMode("details");
    setFormData({
      ...tournament,
      startDate: new Date(tournament.startDate).toISOString().slice(0, 10),
      endDate: new Date(tournament.endDate).toISOString().slice(0, 10),
    });
    setBannerPreview(tournament.bannerImage ? `http://localhost:5858/${tournament.bannerImage}` : null);
  };

  const handleEdit = (tournament) => {
    setSelectedTournament(tournament);
    setFormMode("edit");
    setFormData({ 
      ...tournament,
      startDate: new Date(tournament.startDate).toISOString().slice(0, 10),
      endDate: new Date(tournament.endDate).toISOString().slice(0, 10),
      bannerImage: null 
    });
    setBannerPreview(tournament.bannerImage ? `http://localhost:5858/${tournament.bannerImage}` : null);
  };

  const handleMatchChange = (e) => {
    const { name, value } = e.target;
    setMatchForm({ ...matchForm, [name]: value });
  };

  const handleMatchTeamChange = (teamIndex, field, value) => {
    const updatedTeams = [...matchForm.teams];
    updatedTeams[teamIndex] = { ...updatedTeams[teamIndex], [field]: value };
    setMatchForm({ ...matchForm, teams: updatedTeams });
  };

  const handleMatchTeamFlag = (teamIndex, file) => {
    const newFlags = [...teamFlags];
    newFlags[teamIndex] = file;
    setTeamFlags(newFlags);

    const newPreviews = [...teamFlagPreviews];
    newPreviews[teamIndex] = URL.createObjectURL(file);
    setTeamFlagPreviews(newPreviews);
  };

  const saveMatch = async (e) => {
    e.preventDefault();
    if (!matchForm.matchNumber || !matchForm.date || !matchForm.time || !matchForm.venue || !matchForm.teams.every(team => team.name)) {
      setError("Please fill in all required match fields (Match Number, Date, Time, Venue, Team Names).");
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append("matchNumber", matchForm.matchNumber);
      data.append("stage", matchForm.stage);
      data.append("group", matchForm.group);
      data.append("date", new Date(matchForm.date).toISOString());
      data.append("time", matchForm.time);
      data.append("venue", matchForm.venue);
      data.append("status", matchForm.status);

      const processedTeams = JSON.parse(JSON.stringify(matchForm.teams));
      processedTeams.forEach((team) => {
        delete team.flag;
        if (team.score === null) delete team.score;
      });

      data.append("teams", JSON.stringify(processedTeams));

      teamFlags.forEach((file, index) => {
        if (file) data.append("teamFlags", file);
      });

      let res;
      if (matchEditId && matchEditId !== "new") {
        res = await axios.put(`${API_BASE}/${selectedTournament._id}/matches/${matchEditId}`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        res = await axios.post(`${API_BASE}/${selectedTournament._id}/matches`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      const updatedTournament = await axios.get(`${API_BASE}/${selectedTournament._id}`);
      showDetails(updatedTournament.data);
      setMatchForm(initialMatch);
      setTeamFlags([null, null]);
      setTeamFlagPreviews([null, null]);
      setMatchEditId(null);
    } catch (err) {
      setError("Failed to save match: " + (err.response?.data?.message || err.message));
      console.error("Save match error:", err.response || err);
    }
    setLoading(false);
  };

  const saveLocalMatch = (e) => {
    e.preventDefault();
    if (!matchForm.matchNumber || !matchForm.date || !matchForm.time || !matchForm.venue || !matchForm.teams.every(team => team.name)) {
      setError("Please fill in all required match fields (Match Number, Date, Time, Venue, Team Names).");
      return;
    }
    const newMatch = { ...matchForm };
    newMatch.teams = newMatch.teams.map((team, index) => ({
      ...team,
      flag: teamFlags[index] || team.flag || null,
      flagPreview: teamFlagPreviews[index] || null,
    }));
    let updatedMatches = [...formData.matches];
    if (matchEditId === "new") {
      updatedMatches.push(newMatch);
    } else {
      updatedMatches[matchEditId] = newMatch;
    }
    setFormData({ ...formData, matches: updatedMatches });
    setMatchForm(initialMatch);
    setTeamFlags([null, null]);
    setTeamFlagPreviews([null, null]);
    setMatchEditId(null);
  };

  const editMatch = (match, index = null) => {
    setMatchEditId(index !== null ? index : match._id);
    setTeamFlags([null, null]);
    setTeamFlagPreviews([
      match.teams[0]?.flag ? `http://localhost:5858/${match.teams[0].flag}` : null,
      match.teams[1]?.flag ? `http://localhost:5858/${match.teams[1].flag}` : null,
    ]);
    setMatchForm({
      ...match,
      date: new Date(match.date).toISOString().slice(0, 10),
      time: match.time || "",
      teams: match.teams.map(team => ({ ...team, score: team.score ?? null })),
    });
  };

  const deleteMatch = async (matchId) => {
    if (!window.confirm("Delete this match?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${selectedTournament._id}/matches/${matchId}`);
      const updatedTournament = await axios.get(`${API_BASE}/${selectedTournament._id}`);
      showDetails(updatedTournament.data);
    } catch (err) {
      setError("Failed to delete match: " + (err.response?.data?.message || err.message));
      console.error("Delete match error:", err.response || err);
    }
    setLoading(false);
  };

  const removeLocalMatch = (index) => {
    if (!window.confirm("Remove this match?")) return;
    const updatedMatches = [...formData.matches];
    updatedMatches.splice(index, 1);
    setFormData({ ...formData, matches: updatedMatches });
  };

  const renderMatchList = (matches, isLocal = false) => {
    if (!matches || matches.length === 0) {
      return <p className="text-gray-500">No matches defined for this tournament.</p>;
    }
    return (
      <div className="space-y-4">
        {matches.map((match, index) => (
          <div key={match._id || index} className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-800">
                Match {match.matchNumber}: {match.teams[0]?.name || "TBD"} vs {match.teams[1]?.name || "TBD"}
              </h4>
              <div className="space-x-2">
                <button
                  className="text-yellow-600 hover:text-yellow-800 text-sm"
                  onClick={() => editMatch(match, isLocal ? index : null)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-800 text-sm"
                  onClick={() => isLocal ? removeLocalMatch(index) : deleteMatch(match._id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p>Stage: {match.stage || "N/A"}</p>
                <p>Group: {match.group || "N/A"}</p>
                <p>Venue: {match.venue}</p>
              </div>
              <div>
                <p>Date: {new Date(match.date).toLocaleDateString()}</p>
                <p>Time: {match.time}</p>
                <p>Status: {match.status}</p>
              </div>
            </div>
            <div className="mt-2 flex space-x-4">
              {match.teams.map((team, i) => (
                <div key={i} className="flex items-center space-x-2">
                  {team.flag && (
                    <img 
                      src={isLocal && team.flagPreview ? team.flagPreview : `http://localhost:5858/${team.flag}`} 
                      alt="Team flag" 
                      className="h-6 w-auto"
                    />
                  )}
                  <span>{team.name} {team.score !== null ? `(${team.score})` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMatchForm = (onSubmit) => {
    if (matchEditId === null) return null;
    return (
      <div className="bg-white p-6 rounded-lg border mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {matchEditId === "new" ? "Add Match" : "Edit Match"}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Match Number</label>
              <input
                type="number"
                name="matchNumber"
                value={matchForm.matchNumber}
                onChange={handleMatchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Match number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <input
                type="text"
                name="stage"
                value={matchForm.stage}
                onChange={handleMatchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Group Stage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <input
                type="text"
                name="group"
                value={matchForm.group}
                onChange={handleMatchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Group A"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={matchForm.date}
                onChange={handleMatchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                name="time"
                value={matchForm.time}
                onChange={handleMatchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <input
              type="text"
              name="venue"
              value={matchForm.venue}
              onChange={handleMatchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter venue"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={matchForm.status}
              onChange={handleMatchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Fixture">Fixture</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          {matchForm.teams.map((team, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-2">Team {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => handleMatchTeamChange(index, "name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Team name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={team.code}
                    onChange={(e) => handleMatchTeamChange(index, "code", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Team code (e.g., BRA)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                  <input
                    type="number"
                    value={team.score ?? ""}
                    onChange={(e) => handleMatchTeamChange(index, "score", e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Score (optional)"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Flag (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleMatchTeamFlag(index, e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {teamFlagPreviews[index] && (
                  <img src={teamFlagPreviews[index]} alt="Team flag preview" className="mt-2 h-8 w-auto object-contain" />
                )}
              </div>
            </div>
          ))}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? "Saving..." : (matchEditId === "new" ? "Add Match" : "Update Match")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMatchForm(initialMatch);
                setTeamFlags([null, null]);
                setTeamFlagPreviews([null, null]);
                setMatchEditId(null);
              }}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

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
            <h2 className="text-2xl font-semibold text-gray-800">Tournaments</h2>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 flex items-center space-x-2"
              onClick={() => {
                setFormMode("create");
              }}
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
                        src={`http://localhost:5858/${tournament.bannerImage}`} 
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
                  { id: "groups", label: "Groups", icon: "👥" },
                  { id: "matches", label: "Matches", icon: "⚽" }
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
                          onChange={(e) => {
                            const updated = [...formData.hostCountries];
                            updated[index] = e.target.value;
                            setFormData({ ...formData, hostCountries: updated });
                          }}
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
                    Banner Image (Optional)
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
                      {formMode === "edit" && (
                        <button
                          type="button"
                          onClick={clearBannerImage}
                          className="text-red-500 hover:text-red-700 text-sm mt-2"
                        >
                          Clear Banner Image
                        </button>
                      )}
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
                    onClick={() => addArrayItem("stages", "")}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stage Name</label>
                      <input
                        type="text"
                        value={stage}
                        onChange={(e) => {
                          const updatedStages = [...formData.stages];
                          updatedStages[index] = e.target.value;
                          setFormData({ ...formData, stages: updatedStages });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Group Stage"
                      />
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
                          onChange={(e) => handleGroupChange(groupIndex, "name", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., Group A"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">Teams</label>
                          <button
                            type="button"
                            onClick={() => addTeamToGroup(groupIndex)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            + Add Team
                          </button>
                        </div>
                        {group.teams.map((team, teamIndex) => (
                          <div key={teamIndex} className="bg-white p-3 rounded-lg border mb-2">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="text-sm font-medium text-gray-700">Team {teamIndex + 1}</h5>
                              <button
                                type="button"
                                onClick={() => removeTeamFromGroup(groupIndex, teamIndex)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                  type="text"
                                  value={team.name}
                                  onChange={(e) => handleTeamChange(groupIndex, teamIndex, "name", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Team name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                <input
                                  type="text"
                                  value={team.code}
                                  onChange={(e) => handleTeamChange(groupIndex, teamIndex, "code", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Team code (e.g., BRA)"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Flag</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => e.target.files[0] && handleGroupTeamFlag(groupIndex, teamIndex, e.target.files[0])}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                {(team.flagPreview || team.flag) && (
                                  <img 
                                    src={team.flagPreview || `http://localhost:5858/${team.flag}`} 
                                    alt="Team flag" 
                                    className="mt-2 h-8 w-auto object-contain" 
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Matches Tab in Create/Edit */}
            {activeTab === "matches" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Tournament Matches</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setMatchEditId("new");
                      setMatchForm(initialMatch);
                      setTeamFlags([null, null]);
                      setTeamFlagPreviews([null, null]);
                    }}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200"
                  >
                    + Add Match
                  </button>
                </div>
                {renderMatchList(formData.matches, true)}
                {matchEditId !== null && renderMatchForm(saveLocalMatch)}
              </div>
            )}
            <div className="flex space-x-4 pt-6 border-t">
              <button
                onClick={handleSubmit}
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
          </div>
        </div>
      )}
      {/* Tournament Details & Match Management */}
      {formMode === "details" && selectedTournament && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                {activeTab === "stages" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Tournament Stages</h3>
                    {formData.stages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.stages.map((stage, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                            <h4 className="font-semibold text-gray-800 mb-2">🏟️ {stage}</h4>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No stages defined for this tournament.</p>
                    )}
                  </div>
                )}
                {activeTab === "groups" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Tournament Groups</h3>
                    {formData.groups.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {formData.groups.map((group, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                            <h4 className="font-semibold text-gray-800 mb-3">👥 {group.name}</h4>
                            {group.teams.length > 0 ? (
                              <div className="space-y-1">
                                {group.teams.map((team, teamIndex) => (
                                  <div key={teamIndex} className="bg-white px-3 py-1 rounded text-sm flex items-center space-x-2">
                                    {team.flag && (
                                      <img 
                                        src={`http://localhost:5858/${team.flag}`} 
                                        alt="Team Flag" 
                                        className="h-5 w-auto"
                                      />
                                    )}
                                    <span>{team.name} ({team.code})</span>
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
                {activeTab === "matches" && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Matches</h3>
                    <div className="flex justify-between items-center mb-4">
                      <span />
                      <button
                        type="button"
                        onClick={() => {
                          setMatchEditId("new");
                          setMatchForm(initialMatch);
                          setTeamFlags([null, null]);
                          setTeamFlagPreviews([null, null]);
                        }}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200"
                      >
                        + Add Match
                      </button>
                    </div>
                    {renderMatchList(formData.matches)}
                    {matchEditId !== null && renderMatchForm(saveMatch)}
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