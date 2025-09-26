import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaTrophy, FaTimes, FaFlag } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const F1Racing = () => {
  const [schedules, setSchedules] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRaceModal, setShowRaceModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingRace, setEditingRace] = useState(null);
  const [editingResult, setEditingResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    season: '',
    banner: null,
    races: []
  });

  const [raceForm, setRaceForm] = useState({
    eventTitle: '',
    country: '',
    flag: '',
    dateRange: '',
    round: '',
    results: []
  });

  const [resultForm, setResultForm] = useState({
    position: '',
    driverCode: '',
    driverName: '',
    timeOrGap: '',
    driverImage: null
  });

  const API_BASE_URL = 'http://globe.ridealmobility.com/api/sport/schedule';

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleDetails = async (scheduleId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/${scheduleId}`);
      const schedule = response.data;
      setEditingSchedule(schedule);
      setScheduleForm({
        title: schedule.title || '',
        season: schedule.season.toString(),
        banner: null,
        races: schedule.races || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule details:', error);
      setLoading(false);
    }
  };

  const handleScheduleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'banner') {
      setScheduleForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
    } else {
      setScheduleForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRaceChange = (e) => {
    const { name, value } = e.target;
    setRaceForm(prev => ({ ...prev, [name]: value }));
  };

  const handleResultChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'driverImage') {
      setResultForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
    } else {
      setResultForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const createSchedule = async () => {
    try {
      const formData = new FormData();
      formData.append('title', scheduleForm.title);
      formData.append('season', scheduleForm.season);
      if (scheduleForm.banner) {
        formData.append('banner', scheduleForm.banner);
      }
      
      // Add races as JSON string (matching your CURL format)
      if (scheduleForm.races && scheduleForm.races.length > 0) {
        formData.append('races', JSON.stringify(scheduleForm.races));
      }

      const response = await axios.post(API_BASE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSchedules([...schedules, response.data]);
      setShowScheduleModal(false);
      setScheduleForm({ title: '', season: '', banner: null, races: [] });
    } catch (error) {
      console.error('Error creating schedule:', error.response?.data || error.message);
    }
  };

  // New POST API function based on your CURL request
  const createF1Schedule = async (scheduleData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Add form fields as per your CURL request
      formData.append('title', scheduleData.title);
      formData.append('season', scheduleData.season);
      
      // Add banner image
      if (scheduleData.banner) {
        formData.append('banner', scheduleData.banner);
      }
      
      // Add races as JSON string (matching your CURL format)
      const racesData = scheduleData.races || [];
      formData.append('races', JSON.stringify(racesData));
      
      // Add driver images if provided
      if (scheduleData.driverImages && scheduleData.driverImages.length > 0) {
        scheduleData.driverImages.forEach((image, index) => {
          formData.append('driverImages[]', image);
        });
      }

      const response = await axios.post(API_BASE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSchedules([...schedules, response.data]);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Error creating F1 schedule:', error.response?.data || error.message);
      setLoading(false);
      throw error;
    }
  };

  // Test function to demonstrate the API call with your CURL data
  const testF1ScheduleCreation = async () => {
    const testData = {
      title: "F1 Racing Schedule 2025",
      season: "2025",
      banner: null, // You would set this to a File object from input
      races: [
        {
          round: 1,
          country: "Australia",
          title: "Melbourne Testing",
          grandPrix: "Australian GP 2025",
          startDate: "2025-03-10",
          endDate: "2025-03-12",
          type: "Testing",
          results: []
        },
        {
          round: 2,
          country: "Bahrain",
          title: "Sakhir",
          grandPrix: "Bahrain GP 2025",
          startDate: "2025-03-21",
          endDate: "2025-03-23",
          type: "Race",
          results: [
            {position: 1, driverCode: "VER", driverName: "Max Verstappen", time: "1:34:56.789"},
            {position: 2, driverCode: "HAM", driverName: "Lewis Hamilton", time: "+1.234"}
          ]
        }
      ],
      driverImages: [] // You would set this to an array of File objects
    };

    try {
      const result = await createF1Schedule(testData);
      console.log('F1 Schedule created successfully:', result);
    } catch (error) {
      console.error('Failed to create F1 schedule:', error);
    }
  };

  const updateSchedule = async () => {
    try {
      const formData = new FormData();
      formData.append('title', scheduleForm.title);
      formData.append('season', Number(scheduleForm.season));
      formData.append('races', JSON.stringify(scheduleForm.races));
      if (scheduleForm.banner) {
        formData.append('banner', scheduleForm.banner);
      }

      const response = await axios.put(`${API_BASE_URL}/${editingSchedule._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSchedules(schedules.map(s => s._id === editingSchedule._id ? response.data : s));
      setShowScheduleModal(false);
      setEditingSchedule(null);
      setScheduleForm({ title: '', season: '', banner: null, races: [] });
    } catch (error) {
      console.error('Error updating schedule:', error.response?.data || error.message);
    }
  };

  const createRace = async () => {
    try {
      setLoading(true);
      
      // Parse dateRange to get startDate and endDate
      const dateRange = raceForm.dateRange;
      let startDate = '';
      let endDate = '';
      
      if (dateRange && dateRange.includes(' - ')) {
        const dates = dateRange.split(' - ');
        startDate = dates[0].trim();
        endDate = dates[1].trim();
      } else if (dateRange) {
        startDate = dateRange;
        endDate = dateRange;
      }

      // Map frontend fields to backend expected fields
      const raceData = {
        title: raceForm.eventTitle,
        grandPrix: raceForm.eventTitle, // Use eventTitle as grandPrix if not separate
        country: raceForm.country,
        flag: raceForm.flag,
        startDate: startDate,
        endDate: endDate,
        round: raceForm.round,
        results: raceForm.results.map(result => ({
          ...result,
          time: result.timeOrGap || result.time // Map timeOrGap to time
        }))
      };

      const response = await axios.post(
        `${API_BASE_URL}/${editingSchedule._id}/races`,
        raceData
      );

      setSchedules((prev) =>
        prev.map((s) =>
          s._id === editingSchedule._id ? response.data : s
        )
      );

      setShowRaceModal(false);
      setEditingRace(null);
      setEditingSchedule(null);
      setRaceForm({ eventTitle: '', country: '', flag: '', dateRange: '', round: '', results: [] });
      setLoading(false);
    } catch (error) {
      console.error('Error creating race:', error.response?.data || error.message);
      setLoading(false);
    }
  };

  const updateRace = async () => {
    try {
      setLoading(true);
      
      // Parse dateRange to get startDate and endDate
      const dateRange = raceForm.dateRange;
      let startDate = '';
      let endDate = '';
      
      if (dateRange && dateRange.includes(' - ')) {
        const dates = dateRange.split(' - ');
        startDate = dates[0].trim();
        endDate = dates[1].trim();
      } else if (dateRange) {
        startDate = dateRange;
        endDate = dateRange;
      }

      // Map frontend fields to backend expected fields
      const raceData = {
        title: raceForm.eventTitle,
        grandPrix: raceForm.eventTitle, // Use eventTitle as grandPrix if not separate
        country: raceForm.country,
        flag: raceForm.flag,
        startDate: startDate,
        endDate: endDate,
        round: raceForm.round,
        results: raceForm.results.map(result => ({
          ...result,
          time: result.timeOrGap || result.time // Map timeOrGap to time
        }))
      };

      const response = await axios.put(
        `${API_BASE_URL}/${editingSchedule._id}/races/${editingRace._id}`,
        raceData
      );

      setSchedules((prev) =>
        prev.map((s) =>
          s._id === editingSchedule._id ? response.data : s
        )
      );

      setShowRaceModal(false);
      setEditingRace(null);
      setRaceForm({ eventTitle: '', country: '', flag: '', dateRange: '', round: '', results: [] });
      setLoading(false);
    } catch (error) {
      console.error('Error updating race:', error.response?.data || error.message);
      setLoading(false);
    }
  };

  const createResult = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('position', resultForm.position);
      formData.append('driverCode', resultForm.driverCode);
      formData.append('driverName', resultForm.driverName);
      formData.append('time', resultForm.timeOrGap); // Map timeOrGap to time for backend
      if (resultForm.driverImage) {
        formData.append('driverImage', resultForm.driverImage);
      }

      const response = await axios.post(
        `${API_BASE_URL}/${editingSchedule._id}/races/${editingRace._id}/results`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setSchedules((prev) =>
        prev.map((s) =>
          s._id === editingSchedule._id ? response.data : s
        )
      );

      setShowResultModal(false);
      setEditingResult(null);
      setResultForm({ position: '', driverCode: '', driverName: '', timeOrGap: '', driverImage: null });
      setLoading(false);
    } catch (error) {
      console.error('Error creating result:', error.response?.data || error.message);
      setLoading(false);
    }
  };

  const updateResult = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('position', resultForm.position);
      formData.append('driverCode', resultForm.driverCode);
      formData.append('driverName', resultForm.driverName);
      formData.append('time', resultForm.timeOrGap); // Map timeOrGap to time for backend
      if (resultForm.driverImage) {
        formData.append('driverImage', resultForm.driverImage);
      }

      const response = await axios.put(
        `${API_BASE_URL}/${editingSchedule._id}/races/${editingRace._id}/results/${editingResult._id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setSchedules((prev) =>
        prev.map((s) =>
          s._id === editingSchedule._id ? response.data : s
        )
      );

      setShowResultModal(false);
      setEditingResult(null);
      setResultForm({ position: '', driverCode: '', driverName: '', timeOrGap: '', driverImage: null });
      setLoading(false);
    } catch (error) {
      console.error('Error updating result:', error.response?.data || error.message);
      setLoading(false);
    }
  };

  const deleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to delete this season?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        setSchedules(schedules.filter(s => s._id !== id));
      } catch (error) {
        console.error('Error deleting schedule:', error.response?.data || error.message);
      }
    }
  };

  const deleteRace = async (scheduleId, raceId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/${scheduleId}/races/${raceId}`);
      setSchedules((prev) =>
        prev.map((s) =>
          s._id === scheduleId ? response.data : s
        )
      );
      setShowDeleteModal(false);
      setEditingRace(null);
      setLoading(false);
    } catch (error) {
      console.error('Error deleting race:', error.response?.data || error.message);
      setShowDeleteModal(false);
      setEditingRace(null);
      setLoading(false);
    }
  };

  const deleteResult = async (scheduleId, raceId, resultId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/${scheduleId}/races/${raceId}/results/${resultId}`);
      setSchedules((prev) =>
        prev.map((s) =>
          s._id === scheduleId ? response.data : s
        )
      );
      setShowDeleteModal(false);
      setEditingResult(null);
      setLoading(false);
    } catch (error) {
      console.error('Error deleting result:', error.response?.data || error.message);
      setShowDeleteModal(false);
      setEditingResult(null);
      setLoading(false);
    }
  };

  const fetchRaceDetails = (race) => {
    // Convert backend format to frontend format
    let dateRange = '';
    if (race.startDate && race.endDate) {
      if (race.startDate === race.endDate) {
        dateRange = race.startDate;
      } else {
        dateRange = `${race.startDate} - ${race.endDate}`;
      }
    } else if (race.dateRange) {
      dateRange = race.dateRange;
    }

    // Map results to frontend format
    const results = (race.results || []).map(result => ({
      ...result,
      timeOrGap: result.time || result.timeOrGap || ''
    }));

    setRaceForm({
      eventTitle: race.title || race.eventTitle || '',
      country: race.country || '',
      flag: race.flag || '',
      dateRange: dateRange,
      round: race.round || '',
      results: results
    });
    setEditingRace(race);
    setShowRaceModal(true);
  };

  const fetchResultDetails = (result) => {
    setResultForm({
      position: result.position || '',
      driverCode: result.driverCode || '',
      driverName: result.driverName || '',
      timeOrGap: result.time || result.timeOrGap || '',
      driverImage: null
    });
    setEditingResult(result);
    setShowResultModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                    <FaTrophy className="text-white text-lg sm:text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">F1 Season Management</h1>
                    <p className="text-red-100 mt-1 text-sm sm:text-base hidden sm:block">Manage Formula 1 seasons and races</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-xs sm:text-sm font-semibold">Total Seasons</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-900">{schedules.length}</p>
                  </div>
                  <MdDashboard className="text-blue-500 text-xl sm:text-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {schedules.map((schedule) => (
                <div
                  key={schedule._id}
                  className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-200"
                >
                  <div className="relative h-36 sm:h-48 overflow-hidden">
                    {schedule.banner ? (
                      <img
                        src={schedule.banner.startsWith('http') ? schedule.banner : `http://globe.ridealmobility.com/${schedule.banner}`}
                        alt={schedule.title || 'F1 Season'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                        <FaTrophy className="text-white text-2xl sm:text-4xl" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex space-x-1 sm:space-x-2">
                      <button
                        onClick={() => {
                          fetchScheduleDetails(schedule._id);
                          setShowScheduleModal(true);
                        }}
                        className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                      >
                        <FaEdit className="text-xs sm:text-sm" />
                      </button>
                      <button
                        onClick={() => deleteSchedule(schedule._id)}
                        className="p-1.5 sm:p-2 bg-red-500/20 backdrop-blur-sm rounded-full text-white hover:bg-red-500/30 transition-colors"
                      >
                        <FaTrash className="text-xs sm:text-sm" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4">
                      <h3 className="text-lg sm:text-2xl font-bold text-white">{schedule.title} {schedule.season}</h3>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    {schedule.races && schedule.races.length > 0 && (
                      <div className="mt-3 sm:mt-4">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Races</h4>
                        <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
                          {schedule.races.map((race) => (
                            <div
                              key={race._id}
                              className="p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-3"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{race.eventTitle}</p>
                                <p className="text-xs text-gray-600 truncate">{race.country} {race.flag} • {race.dateRange} • Round {race.round}</p>
                              </div>
                              <div className="flex space-x-1 sm:space-x-2 justify-end sm:justify-start">
                                <button
                                  onClick={() => fetchRaceDetails(race)}
                                  className="p-1.5 sm:p-2 bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-600 hover:bg-blue-500/30 transition-colors"
                                >
                                  <FaEdit className="text-xs sm:text-sm" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingRace(race);
                                    setEditingSchedule(schedule);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-1.5 sm:p-2 bg-red-500/20 backdrop-blur-sm rounded-full text-red-600 hover:bg-red-500/30 transition-colors"
                                >
                                  <FaTrash className="text-xs sm:text-sm" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setEditingSchedule(schedule);
                          setEditingRace(null);
                          setRaceForm({ eventTitle: '', country: '', flag: '', dateRange: '', round: '', results: [] });
                          setShowRaceModal(true);
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm sm:text-base"
                      >
                        <FaPlus className="text-sm" />
                        <span>Add New Race</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {schedules.length === 0 && (
              <div className="text-center py-12 sm:py-20">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-12 border border-gray-100 mx-auto max-w-lg">
                  <FaTrophy className="mx-auto text-gray-300 text-4xl sm:text-6xl mb-4 sm:mb-6" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No F1 Seasons Yet</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Create your first F1 season to start managing schedules.</p>
                  <button
                    onClick={() => {
                      setEditingSchedule(null);
                      setScheduleForm({ title: '', season: '', banner: null, races: [] });
                      setShowScheduleModal(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto"
                  >
                    Create First Season
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-t-xl sm:rounded-t-2xl p-4 sm:p-6 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-1.5 sm:p-2 bg-white bg-opacity-20 rounded-lg">
                      <FaTrophy className="text-white text-sm sm:text-lg" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {editingSchedule ? 'Edit Season' : 'Create New Season'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="p-1.5 sm:p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-sm sm:text-base" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={scheduleForm.title}
                    onChange={handleScheduleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Season Year</label>
                  <input
                    type="number"
                    name="season"
                    value={scheduleForm.season}
                    onChange={handleScheduleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 text-sm sm:text-base"
                    placeholder="2025"
                    min="2020"
                    max="2030"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Banner Image</label>
                  <input
                    type="file"
                    name="banner"
                    onChange={handleScheduleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-gray-50 text-sm sm:text-base file:mr-2 file:py-1 file:px-2 file:border-0 file:rounded file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingSchedule ? updateSchedule : createSchedule}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base order-1 sm:order-2"
                  >
                    {editingSchedule ? 'Update Season' : 'Create Season'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRaceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl sm:rounded-t-2xl p-4 sm:p-6 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-1.5 sm:p-2 bg-white bg-opacity-20 rounded-lg">
                      <FaFlag className="text-white text-sm sm:text-lg" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {editingRace ? 'Edit Race' : 'Add New Race'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowRaceModal(false);
                      setEditingRace(null);
                      setEditingSchedule(null);
                      setRaceForm({ eventTitle: '', country: '', flag: '', dateRange: '', round: '', results: [] });
                    }}
                    className="p-1.5 sm:p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-sm sm:text-base" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Event Title</label>
                  <input
                    type="text"
                    name="eventTitle"
                    value={raceForm.eventTitle}
                    onChange={handleRaceChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={raceForm.country}
                    onChange={handleRaceChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Flag</label>
                  <input
                    type="text"
                    name="flag"
                    value={raceForm.flag}
                    onChange={handleRaceChange}
                    placeholder="🇨🇳 (Country flag emoji)"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Date Range</label>
                  <input
                    type="text"
                    name="dateRange"
                    value={raceForm.dateRange}
                    onChange={handleRaceChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Round</label>
                  <input
                    type="number"
                    name="round"
                    value={raceForm.round}
                    onChange={handleRaceChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-sm sm:text-base"
                    required
                  />
                </div>

                {editingRace && editingRace.results && editingRace.results.length > 0 && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Results</label>
                    <div className="max-h-48 overflow-y-auto space-y-2 sm:space-y-3">
                      {editingRace.results.map((result, index) => (
                        <div key={result._id || index} className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-4 gap-2 text-xs">
                            <span className="font-semibold">P{result.position}</span>
                            <span className="font-medium">{result.driverCode}</span>
                            <span className="truncate">{result.driverName}</span>
                            <span className="text-gray-600">{result.timeOrGap}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => fetchResultDetails(result)}
                              className="p-1.5 sm:p-2 bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-600 hover:bg-blue-500/30 transition-colors"
                            >
                              <FaEdit className="text-xs sm:text-sm" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingResult(result);
                                setEditingSchedule(schedule);
                                setEditingRace(editingRace);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 sm:p-2 bg-red-500/20 backdrop-blur-sm rounded-full text-red-600 hover:bg-red-500/30 transition-colors"
                            >
                              <FaTrash className="text-xs sm:text-sm" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setEditingResult(null);
                      setResultForm({ position: '', driverCode: '', driverName: '', timeOrGap: '', driverImage: null });
                      setShowResultModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm sm:text-base"
                  >
                    <FaPlus className="text-sm" />
                    <span>Add New Result</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowRaceModal(false);
                      setEditingRace(null);
                      setEditingSchedule(null);
                      setRaceForm({ eventTitle: '', country: '', flag: '', dateRange: '', round: '', results: [] });
                    }}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingRace ? updateRace : createRace}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base order-1 sm:order-2"
                    disabled={loading}
                  >
                    {loading ? (editingRace ? 'Updating...' : 'Creating...') : (editingRace ? 'Update Race' : 'Create Race')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showResultModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl sm:rounded-t-2xl p-4 sm:p-6 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-1.5 sm:p-2 bg-white bg-opacity-20 rounded-lg">
                      <FaTrophy className="text-white text-sm sm:text-lg" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {editingResult ? 'Edit Result' : 'Add New Result'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      setEditingResult(null);
                      setResultForm({ position: '', driverCode: '', driverName: '', timeOrGap: '', driverImage: null });
                    }}
                    className="p-1.5 sm:p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-sm sm:text-base" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Position</label>
                  <input
                    type="number"
                    name="position"
                    value={resultForm.position}
                    onChange={handleResultChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Driver Code</label>
                  <input
                    type="text"
                    name="driverCode"
                    value={resultForm.driverCode}
                    onChange={handleResultChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Driver Name</label>
                  <input
                    type="text"
                    name="driverName"
                    value={resultForm.driverName}
                    onChange={handleResultChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Time/Gap</label>
                  <input
                    type="text"
                    name="timeOrGap"
                    value={resultForm.timeOrGap}
                    onChange={handleResultChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Driver Image</label>
                  <input
                    type="file"
                    name="driverImage"
                    onChange={handleResultChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 text-sm sm:text-base file:mr-2 file:py-1 file:px-2 file:border-0 file:rounded file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      setEditingResult(null);
                      setResultForm({ position: '', driverCode: '', driverName: '', timeOrGap: '', driverImage: null });
                    }}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingResult ? updateResult : createResult}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base order-1 sm:order-2"
                    disabled={loading}
                  >
                    {loading ? (editingResult ? 'Updating...' : 'Creating...') : (editingResult ? 'Update Result' : 'Create Result')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-t-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <FaTrash className="text-white text-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-gray-700">
                  Are you sure you want to delete this {editingResult ? 'result' : 'race'}?
                </p>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (editingResult) {
                        deleteResult(editingSchedule._id, editingRace._id, editingResult._id);
                      } else {
                        deleteRace(editingSchedule._id, editingRace._id);
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default F1Racing;