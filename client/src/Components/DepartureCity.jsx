import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";


const API_BASE = "http://globe.ridealmobility.com/api/departure-cities";
const ITENARY_TOUR_API = "http://globe.ridealmobility.com/api/itenary-tour";

// Updated initial form based on the full API response
const initialForm = {
  name: "",
  description: "",
  itenaryTourId: "",
  cardId: "",
  dates: [
    {
      date: "",
      basePrice: 0,
      availability: true,
      packages: [
        { category: "Standard", rate: 0 },
        { category: "Deluxe", rate: 0 },
        { category: "Premium", rate: 0 }
      ]
    }
  ],
  hotels: [
    {
      city: "",
      name: "",
      checkIn: "",
      checkOut: ""
    }
  ],
  itinerary: [
    {
      day: 1,
      date: "",
      name: "",
      description: "",
      sightseeing: [""],
      meals: [""]
    }
  ],
  tourPrices: [
    { occupancyType: "Single", price: 0 },
    { occupancyType: "Twin", price: 0 },
    { occupancyType: "Triple", price: 0 }
  ],
  cancellationPolicy: [
    { daysBeforeDeparture: "", percentage: 0, amount: 0 }
  ],
  extraNotes: ""
};

export default function DepartureCity() {
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // success, error, info
  const [itenaryTours, setItenaryTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [cardOptions, setCardOptions] = useState([]);
  
  // Main UI navigation
  const [activeSection, setActiveSection] = useState("list"); // list, create, edit, details
  
  // Tab management
  const [activeTab, setActiveTab] = useState("overview"); // Tabs: overview, hotels, itinerary
  const [viewMode, setViewMode] = useState("table"); // table, grid, map
  const [formTab, setFormTab] = useState("basic"); // Form tabs: basic, dates, hotels, itinerary, pricing, cancellation
  const [formMode, setFormMode] = useState("hidden"); // hidden, create, edit

  // Show message function
  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    // Auto-clear message after 5 seconds
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  // Fetch all Departure Cities
  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setCities(res.data.data || []);
      // Default to table view when fetching all cities
      setViewMode("table");
      if (res.data.data?.length > 0) {
        showMessage(`Successfully loaded ${res.data.data.length} departure cities`, "info");
      } else {
        showMessage("No departure cities found", "info");
      }
    } catch (err) {
      showMessage(err.response?.data?.message || err.message, "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCities();
    fetchItenaryTours();
  }, []);
  
  // Fetch Itenary Tours
  const fetchItenaryTours = async () => {
    try {
      const res = await axios.get(ITENARY_TOUR_API);
      const tours = res.data.data || [];
      setItenaryTours(tours);
      console.log("Fetched tours:", tours); // For debugging
    } catch (err) {
      console.error("Error fetching itenary tours:", err);
      showMessage(err.response?.data?.message || err.message, "error");
    }
  };
  
  // Handle itenary tour selection
  const handleTourChange = (selectedOption) => {
    setSelectedTour(selectedOption);
    setForm({
      ...form,
      itenaryTourId: selectedOption?.value || "",
      cardId: ""
    });
    
    // Get cards for this tour
    if (selectedOption?.value) {
      const tour = itenaryTours.find(t => t._id === selectedOption.value);
      if (tour && tour.cards) {
        const options = tour.cards.map(card => ({
          value: card._id,
          label: `${card.title || 'Card'} - ${card.days || ''} days (${card.cities || ''})`,
          card: card // Store the full card object for reference
        }));
        console.log("Card options:", options); // For debugging
        setCardOptions(options);
      } else {
        setCardOptions([]);
      }
    } else {
      setCardOptions([]);
    }
  };
  
  // Handle card selection
  const handleCardChange = (selectedOption) => {
    setForm({
      ...form,
      cardId: selectedOption?.value || ""
    });
  };

  // Form handlers for complex nested fields
  const handleDateChange = (index, field, value) => {
    const updatedDates = [...form.dates];
    updatedDates[index][field] = value;
    setForm({ ...form, dates: updatedDates });
  };

  const handlePackageChange = (dateIndex, packageIndex, field, value) => {
    const updatedDates = [...form.dates];
    updatedDates[dateIndex].packages[packageIndex][field] = value;
    setForm({ ...form, dates: updatedDates });
  };

  const handleHotelChange = (index, field, value) => {
    const updatedHotels = [...form.hotels];
    updatedHotels[index][field] = value;
    setForm({ ...form, hotels: updatedHotels });
  };

  const handleItineraryChange = (index, field, value) => {
    const updatedItinerary = [...form.itinerary];
    updatedItinerary[index][field] = value;
    setForm({ ...form, itinerary: updatedItinerary });
  };

  const handleItineraryArrayChange = (index, field, arrayIndex, value) => {
    const updatedItinerary = [...form.itinerary];
    updatedItinerary[index][field][arrayIndex] = value;
    setForm({ ...form, itinerary: updatedItinerary });
  };

  const handlePriceChange = (index, field, value) => {
    const updatedPrices = [...form.tourPrices];
    updatedPrices[index][field] = value;
    setForm({ ...form, tourPrices: updatedPrices });
  };

  const handleCancellationChange = (index, field, value) => {
    const updatedPolicy = [...form.cancellationPolicy];
    updatedPolicy[index][field] = value;
    setForm({ ...form, cancellationPolicy: updatedPolicy });
  };

  // Add new items to arrays
  const addDate = () => {
    const newDate = {
      date: "",
      basePrice: 0,
      availability: true,
      packages: [
        { category: "Standard", rate: 0 },
        { category: "Deluxe", rate: 0 },
        { category: "Premium", rate: 0 }
      ]
    };
    setForm({ ...form, dates: [...form.dates, newDate] });
  };

  const addHotel = () => {
    const newHotel = { city: "", name: "", checkIn: "", checkOut: "" };
    setForm({ ...form, hotels: [...form.hotels, newHotel] });
  };

  const addItineraryDay = () => {
    const newDay = {
      day: form.itinerary.length + 1,
      date: "",
      name: "",
      description: "",
      sightseeing: [""],
      meals: [""]
    };
    setForm({ ...form, itinerary: [...form.itinerary, newDay] });
  };

  const addSightseeing = (dayIndex) => {
    const updatedItinerary = [...form.itinerary];
    updatedItinerary[dayIndex].sightseeing.push("");
    setForm({ ...form, itinerary: updatedItinerary });
  };

  const addMeal = (dayIndex) => {
    const updatedItinerary = [...form.itinerary];
    updatedItinerary[dayIndex].meals.push("");
    setForm({ ...form, itinerary: updatedItinerary });
  };

  const addCancellationPolicy = () => {
    const newPolicy = { daysBeforeDeparture: "", percentage: 0, amount: 0 };
    setForm({ ...form, cancellationPolicy: [...form.cancellationPolicy, newPolicy] });
  };

  // Remove items from arrays
  const removeDate = (index) => {
    const updatedDates = form.dates.filter((_, i) => i !== index);
    setForm({ ...form, dates: updatedDates });
  };

  const removeHotel = (index) => {
    const updatedHotels = form.hotels.filter((_, i) => i !== index);
    setForm({ ...form, hotels: updatedHotels });
  };

  const removeItineraryDay = (index) => {
    let updatedItinerary = form.itinerary.filter((_, i) => i !== index);
    // Renumber days
    updatedItinerary = updatedItinerary.map((day, i) => ({ ...day, day: i + 1 }));
    setForm({ ...form, itinerary: updatedItinerary });
  };

  const removeSightseeing = (dayIndex, sightIndex) => {
    const updatedItinerary = [...form.itinerary];
    updatedItinerary[dayIndex].sightseeing = updatedItinerary[dayIndex].sightseeing.filter(
      (_, i) => i !== sightIndex
    );
    setForm({ ...form, itinerary: updatedItinerary });
  };

  const removeMeal = (dayIndex, mealIndex) => {
    const updatedItinerary = [...form.itinerary];
    updatedItinerary[dayIndex].meals = updatedItinerary[dayIndex].meals.filter(
      (_, i) => i !== mealIndex
    );
    setForm({ ...form, itinerary: updatedItinerary });
  };

  const removeCancellationPolicy = (index) => {
    const updatedPolicy = form.cancellationPolicy.filter((_, i) => i !== index);
    setForm({ ...form, cancellationPolicy: updatedPolicy });
  };

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        // Update
        await axios.put(`${API_BASE}/${editingId}`, form);
        showMessage("City package updated successfully", "success");
      } else {
        // Create
        await axios.post(API_BASE, form);
        showMessage("New city package created successfully", "success");
      }
      setForm(initialForm);
      setEditingId(null);
      setFormMode("hidden");
      setActiveSection("list");
      fetchCities();
    } catch (err) {
      showMessage(err.response?.data?.message || err.message, "error");
    }
    setLoading(false);
  };

  // Edit button
  const handleEdit = (city) => {
    setEditingId(city._id);
    setFormMode("edit");
    setFormTab("basic"); // Reset to basic tab when editing
    setActiveSection("edit");
    
    // Fetch complete city data with all details
    handleGetCompleteCity(city._id, true);
    
    // Set selected tour in dropdown
    if (city.itenaryTourId) {
      const tour = itenaryTours.find(t => t._id === city.itenaryTourId);
      if (tour) {
        const tourOption = {
          value: tour._id,
          label: tour.mainHeading || tour.country || tour._id
        };
        setSelectedTour(tourOption);
        
        // Load cards for this tour
        if (tour.cards) {
          const options = tour.cards.map(card => ({
            value: card._id,
            label: `${card.title || 'Card'} - ${card.days || ''} days (${card.cities || ''})`,
            card: card // Store the full card object for reference
          }));
          setCardOptions(options);
        }
      }
    }
  };
  
  // Load sample data for testing
  const handleLoadSampleData = () => {
    const formData = convertDataForForm(sampleDepartureCityData);
    setForm(formData);
    showMessage("Sample data loaded successfully! You can now modify and save it.", "info");
  };

  // Get complete city data for editing
  const handleGetCompleteCity = async (id, isForEdit = false) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      const cityData = res.data.data || null;
      
      if (cityData && isForEdit) {
        setForm({
          name: cityData.name || "",
          description: cityData.description || "",
          itenaryTourId: cityData.itenaryTourId || "",
          cardId: cityData.cardId || "", 
          dates: cityData.dates || initialForm.dates,
          hotels: cityData.hotels || initialForm.hotels,
          itinerary: cityData.itinerary || initialForm.itinerary,
          tourPrices: cityData.tourPrices || initialForm.tourPrices,
          cancellationPolicy: cityData.cancellationPolicy || initialForm.cancellationPolicy,
          extraNotes: cityData.extraNotes || ""
        });
      }
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  // Delete button
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this departure city? This action cannot be undone.")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      showMessage("Departure city deleted successfully", "success");
      fetchCities();
    } catch (err) {
      showMessage(err.response?.data?.message || err.message, "error");
    }
    setLoading(false);
  };

  // Show details by ID
  const handleShowDetails = async (id) => {
    setLoading(true);
    setDetails(null);
    setActiveTab("overview"); // Reset to overview tab
    setActiveSection("details");
    
    try {
      const res = await axios.get(`${API_BASE}/${id}/details`);
      setDetails(res.data.data || null);
      console.log("City details:", res.data.data); // For debugging
    } catch (err) {
      showMessage(err.response?.data?.message || err.message, "error");
    }
    setLoading(false);
  };

  // Get pricing for a city
  const handleShowPricing = async (id, date, category) => {
    setLoading(true);
    setPricing(null);
    try {
      let url = `${API_BASE}/${id}/pricing`;
      const params = [];
      if (date) params.push(`date=${date}`);
      if (category) params.push(`category=${category}`);
      if (params.length > 0) url += `?${params.join("&")}`;
      const res = await axios.get(url);
      setPricing(res.data.data || []);
      
      if (res.data.data && Object.keys(res.data.data).length > 0) {
        showMessage("Pricing information retrieved successfully", "info");
      } else {
        showMessage("No pricing information available for the selected options", "info");
      }
    } catch (err) {
      showMessage(err.response?.data?.message || err.message, "error");
    }
    setLoading(false);
  };

  // Get cities by itenaryTourId and cardId
  const handleFetchByTourCard = async () => {
    setLoading(true);
    setCities([]);
    try {
      if (!form.itenaryTourId || !form.cardId) {
        showMessage("Both Itinerary Tour and Card must be selected", "error");
        setLoading(false);
        return;
      }
      
      // Get the card information to display in the message
      const tour = itenaryTours.find(t => t._id === form.itenaryTourId);
      const card = tour?.cards?.find(c => c._id === form.cardId);
      const cardTitle = card?.title || form.cardId;
      const tourTitle = tour?.mainHeading || tour?.country || form.itenaryTourId;
      
      const res = await axios.get(
        `${API_BASE}/tour/${form.itenaryTourId}/card/${form.cardId}`
      );
      setCities(res.data.data || []);
      
      // Set to grid view by default when filtering cities
      setViewMode("grid");
      
      // Set a more descriptive message
      if (res.data.data && res.data.data.length > 0) {
        showMessage(`Found ${res.data.data.length} departure cities for "${cardTitle}" in "${tourTitle}"`, "success");
      } else {
        showMessage(`No departure cities found for "${cardTitle}" in "${tourTitle}". You can add new ones.`, "info");
      }
    } catch (err) {
      showMessage(err.response?.data?.message || err.message, "error");
    }
    setLoading(false);
  };

  // Handle new city
  const handleNewCity = () => {
    setFormMode("create");
    setFormTab("basic");
    setForm(initialForm);
    setEditingId(null);
    setSelectedTour(null);
    setCardOptions([]);
    setActiveSection("create");
  };
  
  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setSelected(null);
    setDetails(null);
    setPricing(null);
    setSelectedTour(null);
    setActiveTab("overview");
    setFormMode("hidden");
    setActiveSection("list");
    fetchCities();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Departure Cities Management</h1>
              <p className="mt-1 text-sm text-gray-500">Manage departure cities and their tour packages</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveSection("list")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeSection === "list"
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                View Cities
              </button>
              <button
                onClick={handleNewCity}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                + Add New City
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg border ${
            messageType === "error" 
              ? "bg-red-50 text-red-800 border-red-200" 
              : messageType === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {messageType === "error" && <span className="text-red-400">❌</span>}
                {messageType === "success" && <span className="text-green-400">✅</span>}
                {messageType === "info" && <span className="text-blue-400">ℹ️</span>}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          </div>
        )}
        {/* LIST SECTION */}
        {activeSection === "list" && (
          <div className="bg-white rounded-lg shadow">
            {/* Filter Section */}
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Departure Cities</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-blue-400">💡</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">How to filter cities:</h4>
                    <ol className="mt-1 text-sm text-blue-700 list-decimal list-inside space-y-1">
                      <li>Select an Itinerary Tour from the dropdown</li>
                      <li>Choose a specific card to see associated departure cities</li>
                      <li>Click "Search Cities" to filter results</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Itinerary Tour</label>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder="Select Itinerary Tour"
                    isClearable={true}
                    isSearchable={true}
                    value={selectedTour}
                    onChange={handleTourChange}
                    options={itenaryTours.map(tour => ({
                      value: tour._id,
                      label: tour.mainHeading || tour.country || tour._id
                    }))}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '40px',
                        borderColor: '#d1d5db',
                        '&:hover': { borderColor: '#9ca3af' }
                      })
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tour Card</label>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder="Select Card"
                    isClearable={true}
                    isSearchable={true}
                    value={cardOptions.find(option => option.value === form.cardId) || null}
                    onChange={handleCardChange}
                    options={cardOptions}
                    isDisabled={!selectedTour}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '40px',
                        borderColor: '#d1d5db',
                        '&:hover': { borderColor: '#9ca3af' }
                      })
                    }}
                    formatOptionLabel={(option) => (
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        {option.card && (
                          <div className="text-xs text-gray-500 mt-1">
                            {option.card.price && <span className="mr-2">Price: ${option.card.price}</span>}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
                
                <div className="flex items-end space-x-2">
                  <button
                    onClick={handleFetchByTourCard}
                    disabled={loading || !form.itenaryTourId || !form.cardId}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? "Searching..." : "Search Cities"}
                  </button>
                  <button
                    onClick={fetchCities}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>

            {/* Cities List */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Departure Cities</h3>
                  <p className="text-sm text-gray-500">{cities.length} cities found</p>
                </div>
                
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === "table" 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setViewMode("table")}
                  >
                    Table
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === "grid" 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    Grid
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === "map" 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setViewMode("map")}
                  >
                    Map
                  </button>
                </div>
              </div>

              {/* Table View */}
              {viewMode === "table" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cities.map((city) => {
                        const tour = itenaryTours.find(t => t._id === city.itenaryTourId);
                        const card = tour?.cards?.find(c => c._id === city.cardId);
                        
                        return (
                          <tr key={city._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{city.city || city.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {tour ? (
                                  <span className="text-blue-600 font-medium">{tour.mainHeading || tour.country}</span>
                                ) : (
                                  <span className="text-gray-400">Not specified</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {card ? (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    {card.title}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Not specified</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(city)}
                                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleShowDetails(city._id)}
                                  className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => {
                                    const date = prompt("Date (YYYY-MM-DD):");
                                    const category = prompt("Category (optional):");
                                    handleShowPricing(city._id, date, category);
                                  }}
                                  className="text-purple-600 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded text-xs"
                                >
                                  Pricing
                                </button>
                                <button
                                  onClick={() => handleDelete(city._id)}
                                  className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cities.map((city) => {
                    const tour = itenaryTours.find(t => t._id === city.itenaryTourId);
                    const card = tour?.cards?.find(c => c._id === city.cardId);
                    
                    return (
                      <div key={city._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">{city.city || city.name}</h3>
                              {tour && (
                                <p className="text-sm text-blue-600 mb-1">
                                  🎯 {tour.mainHeading || tour.country}
                                </p>
                              )}
                              {card && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {card.title}
                                </span>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <span className="text-2xl">🏙️</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEdit(city)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleShowDetails(city._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                              👁️ Details
                            </button>
                            <button
                              onClick={() => {
                                const date = prompt("Date (YYYY-MM-DD):");
                                const category = prompt("Category (optional):");
                                handleShowPricing(city._id, date, category);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200"
                            >
                              💰 Pricing
                            </button>
                            <button
                              onClick={() => handleDelete(city._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Map View */}
              {viewMode === "map" && (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="text-center">
                    <div className="mb-4">
                      <span className="text-6xl">🗺️</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">City Map View</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Interactive map view would show departure cities locations
                      <br />
                      (Integration with mapping service required)
                    </p>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                      <div className="text-center">
                        <p className="text-gray-700 font-medium mb-3">Cities found: {cities.length}</p>
                        {cities.length > 0 && (
                          <div className="text-left">
                            <ul className="space-y-1">
                              {cities.slice(0, 5).map((city) => (
                                <li key={city._id} className="flex items-center text-sm text-gray-600">
                                  <span className="mr-2">📍</span>
                                  {city.city || city.name}
                                </li>
                              ))}
                              {cities.length > 5 && (
                                <li className="text-sm text-gray-500 mt-2">
                                  ... and {cities.length - 5} more cities
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && cities.length === 0 && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <span className="text-6xl">🏙️</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No departure cities found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or create a new departure city
                  </p>
                  <button
                    onClick={handleNewCity}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    + Add New City
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATE/EDIT SECTION */}
        {(activeSection === "create" || activeSection === "edit") && (
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeSection === "create" ? "Create New Departure City" : "Edit Departure City"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeSection === "create" 
                      ? "Add a new departure city with complete tour package details" 
                      : "Update the departure city information and tour package details"
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {activeSection === "create" && (
                    <button
                      onClick={handleLoadSampleData}
                      type="button"
                      className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      📋 Load Sample Data
                    </button>
                  )}
                  <button
                    onClick={() => setActiveSection("list")}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Form Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: "basic", name: "Basic Info", icon: "📝" },
                  { id: "dates", name: "Dates & Pricing", icon: "📅" },
                  { id: "hotels", name: "Hotels", icon: "🏨" },
                  { id: "itinerary", name: "Itinerary", icon: "🗺️" },
                  { id: "pricing", name: "Tour Prices", icon: "💰" },
                  { id: "cancellation", name: "Cancellation", icon: "❌" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFormTab(tab.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      formTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Info Tab */}
              {formTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter departure city name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Itinerary Tour *
                      </label>
                      <Select
                        value={selectedTour}
                        onChange={handleTourChange}
                        options={itenaryTours.map(tour => ({
                          value: tour._id,
                          label: tour.mainHeading || tour.country || tour._id
                        }))}
                        placeholder="Select Itinerary Tour"
                        isClearable
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tour Card *
                      </label>
                      <Select
                        value={cardOptions.find(option => option.value === form.cardId) || null}
                        onChange={handleCardChange}
                        options={cardOptions}
                        placeholder="Select Tour Card"
                        isClearable
                        isSearchable
                        isDisabled={!selectedTour}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        formatOptionLabel={(option) => (
                          <div>
                            <div className="font-medium">{option.label}</div>
                            {option.card && (
                              <div className="text-xs text-gray-500 mt-1">
                                {option.card.price && <span className="mr-2">Price: ${option.card.price}</span>}
                              </div>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter description for this departure city..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extra Notes
                    </label>
                    <textarea
                      value={form.extraNotes}
                      onChange={(e) => setForm({ ...form, extraNotes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>
              )}
              
              {/* Save/Cancel Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveSection("list")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : (editingId ? "Update City" : "Create City")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DETAILS SECTION */}
        {activeSection === "details" && details && (
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">City Details</h3>
                  <p className="mt-1 text-sm text-gray-500">Detailed information about the departure city</p>
                </div>
                <button
                  onClick={() => setActiveSection("list")}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: "overview", name: "Overview", icon: "📊" },
                  { id: "hotels", name: `Hotels ${details.hotels?.length ? `(${details.hotels.length})` : ""}`, icon: "🏨" },
                  { id: "itinerary", name: `Itinerary ${details.itinerary?.length ? `(${details.itinerary.length} days)` : ""}`, icon: "🗺️" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">City Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border">
                        <div className="text-gray-500">City ID</div>
                        <div className="font-medium text-gray-900">{details._id}</div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="text-gray-500">Hotels</div>
                        <div className="font-medium text-blue-600">{details.hotels?.length || 0} properties</div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="text-gray-500">Itinerary</div>
                        <div className="font-medium text-green-600">{details.itinerary?.length || 0} days</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">🏨</span>
                        <h5 className="text-lg font-medium text-gray-900">Hotels Summary</h5>
                      </div>
                      {details.hotels && details.hotels.length > 0 ? (
                        <div className="space-y-3">
                          {details.hotels.map((hotel, idx) => (
                            <div key={hotel._id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium text-gray-900">{hotel.name}</div>
                                <div className="text-sm text-gray-500">{hotel.city}</div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {hotel.checkIn && hotel.checkOut && (
                                  <div>
                                    {new Date(hotel.checkIn).toLocaleDateString()} - {new Date(hotel.checkOut).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <span className="text-4xl mb-2 block">🏨</span>
                          <p>No hotels available</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">🗺️</span>
                        <h5 className="text-lg font-medium text-gray-900">Itinerary Summary</h5>
                      </div>
                      {details.itinerary && details.itinerary.length > 0 ? (
                        <div className="space-y-3">
                          {details.itinerary.slice(0, 5).map((day, idx) => (
                            <div key={day._id || idx} className="flex items-center p-3 bg-gray-50 rounded">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                {day.day}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{day.name}</div>
                                <div className="text-sm text-gray-500">{day.date && new Date(day.date).toLocaleDateString()}</div>
                              </div>
                            </div>
                          ))}
                          {details.itinerary.length > 5 && (
                            <div className="text-center text-sm text-gray-500 py-2">
                              ... and {details.itinerary.length - 5} more days
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <span className="text-4xl mb-2 block">🗺️</span>
                          <p>No itinerary available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Hotels Tab */}
              {activeTab === "hotels" && (
                <div className="space-y-4">
                  {details.hotels && details.hotels.length > 0 ? (
                    <div className="grid gap-4">
                      {details.hotels.map((hotel, idx) => {
                        const checkIn = hotel.checkIn ? new Date(hotel.checkIn) : null;
                        const checkOut = hotel.checkOut ? new Date(hotel.checkOut) : null;
                        const nights = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 0;
                        
                        return (
                          <div key={hotel._id || idx} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="text-2xl mr-3">🏨</span>
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{hotel.name}</h4>
                                    <p className="text-sm text-gray-600">{hotel.city}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                  <div className="bg-gray-50 p-3 rounded">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Check In</div>
                                    <div className="font-medium text-gray-900">
                                      {checkIn ? checkIn.toLocaleDateString() : "Not specified"}
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Check Out</div>
                                    <div className="font-medium text-gray-900">
                                      {checkOut ? checkOut.toLocaleDateString() : "Not specified"}
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Duration</div>
                                    <div className="font-medium text-blue-600">
                                      {nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : "Not calculated"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <span className="text-6xl mb-4 block">🏨</span>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Hotels Available</h3>
                      <p className="text-gray-500">No hotel information has been added for this departure city.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Itinerary Tab */}
              {activeTab === "itinerary" && (
                <div className="space-y-6">
                  {details.itinerary && details.itinerary.length > 0 ? (
                    <div className="space-y-6">
                      {details.itinerary.map((day, idx) => {
                        const date = day.date ? new Date(day.date) : null;
                        
                        return (
                          <div key={day._id || idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {/* Day Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                                    {day.day}
                                  </div>
                                  <div>
                                    <h4 className="text-xl font-semibold text-gray-900">{day.name}</h4>
                                    {date && (
                                      <p className="text-sm text-gray-600">{date.toLocaleDateString()}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Day Content */}
                            <div className="p-6">
                              {day.description && (
                                <div className="mb-6">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                                  <p className="text-gray-600 leading-relaxed">{day.description}</p>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Sightseeing */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center mb-3">
                                    <span className="text-xl mr-2">🎯</span>
                                    <h5 className="text-lg font-medium text-gray-900">Sightseeing</h5>
                                  </div>
                                  {day.sightseeing && day.sightseeing.length > 0 && day.sightseeing.some(sight => sight.trim()) ? (
                                    <ul className="space-y-2">
                                      {day.sightseeing.filter(sight => sight.trim()).map((sight, i) => (
                                        <li key={i} className="flex items-start">
                                          <span className="text-blue-500 mr-2 mt-1">•</span>
                                          <span className="text-gray-700">{sight}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="text-center py-4 text-gray-500">
                                      <span className="text-2xl block mb-2">🎯</span>
                                      <p className="text-sm">No sightseeing planned</p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Meals */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center mb-3">
                                    <span className="text-xl mr-2">🍽️</span>
                                    <h5 className="text-lg font-medium text-gray-900">Meals</h5>
                                  </div>
                                  {day.meals && day.meals.length > 0 && day.meals.some(meal => meal.trim()) ? (
                                    <div className="flex flex-wrap gap-2">
                                      {day.meals.filter(meal => meal.trim()).map((meal, i) => (
                                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                          {meal}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-gray-500">
                                      <span className="text-2xl block mb-2">🍽️</span>
                                      <p className="text-sm">No meals included</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <span className="text-6xl mb-4 block">🗺️</span>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Itinerary Available</h3>
                      <p className="text-gray-500">No day-by-day itinerary has been created for this departure city.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRICING SECTION */}
        {pricing && (
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Pricing Details</h3>
              <p className="mt-1 text-sm text-gray-500">Pricing information for the selected options</p>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm overflow-x-auto text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(pricing, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}