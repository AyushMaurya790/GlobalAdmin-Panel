//===================================
// Curated Journeys & Departure Cities Manager

//================++++++++++++++++++=======


import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Plus, Trash2, Edit, Eye, RefreshCw, Save } from "lucide-react";

// API Endpoints
const API_BASE = "http://localhost:5858/api/departurecities1";
const ITENARY_TOUR_API = "http://globe.ridealmobility.com/api/itenary-tour";

// Helper Functions
const getTodayDate = () => new Date().toISOString().split("T")[0];
const getTomorrowDate = () => new Date(Date.now() + 86400000).toISOString().split("T")[0];

const getInitialForm = () => ({
  itenaryTourId: "",
  cardId: "",
  cities: [
    {
      name: "",
      description: "",
      dates: [
        {
          date: getTodayDate(),
          basePrice: 1000,
          availability: true,
          packages: [
            { category: "Standard", rate: 1000 },
            { category: "Deluxe", rate: 1500 },
            { category: "Premium", rate: 2000 },
          ],
        },
      ],
      hotels: [
        {
          city: "",
          name: "",
          checkIn: getTodayDate(),
          checkOut: getTomorrowDate(),
        },
      ],
      itinerary: [
        {
          day: 1,
          date: getTodayDate(),
          name: "Day 1",
          description: "Arrival and check-in",
          sightseeing: ["City Tour"],
          meals: ["Breakfast", "Dinner"],
        },
      ],
      tourPrices: [
        { occupancyType: "Single", price: 1500 },
        { occupancyType: "Twin", price: 1200 },
        { occupancyType: "Triple", price: 1000 },
      ],
      cancellationPolicy: [{ daysBeforeDeparture: "30", percentage: 10, amount: 100 }],
      extraNotes: "",
    },
  ],
});

const sanitizeFormData = (data) => {
  const sanitized = JSON.parse(JSON.stringify(data));
  if (sanitized.itenaryTourId === "") delete sanitized.itenaryTourId;
  if (sanitized.cardId === "") delete sanitized.cardId;
  return sanitized;
};

const validateForm = (form) => {
  const errors = [];
  if (!form.itenaryTourId) errors.push("Itinerary Tour is required");

  form.cities.forEach((city, cityIndex) => {
    if (!city.name) errors.push(`City ${cityIndex + 1}: Name is required`);
    if (!city.description) errors.push(`City ${cityIndex + 1}: Description is required`);

    city.dates.forEach((date, dateIndex) => {
      if (!date.date) errors.push(`City ${cityIndex + 1}, Date ${dateIndex + 1}: Date is required`);
      if (!date.basePrice) errors.push(`City ${cityIndex + 1}, Date ${dateIndex + 1}: Base Price is required`);

      date.packages.forEach((pkg, pkgIndex) => {
        if (!pkg.category) errors.push(`City ${cityIndex + 1}, Date ${dateIndex + 1}, Package ${pkgIndex + 1}: Category is required`);
        if (!pkg.rate) errors.push(`City ${cityIndex + 1}, Date ${dateIndex + 1}, Package ${pkgIndex + 1}: Rate is required`);
      });
    });

    city.hotels.forEach((hotel, hotelIndex) => {
      if (!hotel.city) errors.push(`City ${cityIndex + 1}, Hotel ${hotelIndex + 1}: City is required`);
      if (!hotel.name) errors.push(`City ${cityIndex + 1}, Hotel ${hotelIndex + 1}: Name is required`);
      if (!hotel.checkIn) errors.push(`City ${cityIndex + 1}, Hotel ${hotelIndex + 1}: Check-in date is required`);
      if (!hotel.checkOut) errors.push(`City ${cityIndex + 1}, Hotel ${hotelIndex + 1}: Check-out date is required`);
    });

    city.itinerary.forEach((day, dayIndex) => {
      if (!day.date) errors.push(`City ${cityIndex + 1}, Day ${dayIndex + 1}: Date is required`);
      if (!day.name) errors.push(`City ${cityIndex + 1}, Day ${dayIndex + 1}: Name is required`);
      if (!day.description) errors.push(`City ${cityIndex + 1}, Day ${dayIndex + 1}: Description is required`);
    });

    city.cancellationPolicy.forEach((policy, policyIndex) => {
      if (!policy.daysBeforeDeparture)
        errors.push(`City ${cityIndex + 1}, Cancellation Policy ${policyIndex + 1}: Days before departure is required`);
    });
  });

  return errors;
};

// Custom Select Component
const Select = ({ value, onChange, options, placeholder, isClearable, isSearchable, isLoading, isDisabled, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm("");
  };

  if (isLoading) {
    return <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">Loading...</div>;
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center ${
          isDisabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
        }`}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>{value ? value.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>
      {isOpen && !isDisabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isSearchable && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-200"
              placeholder="Search..."
              autoFocus
            />
          )}
          {isClearable && value && (
            <button
              onClick={handleClear}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 text-gray-500"
            >
              Clear selection
            </button>
          )}
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100"
            >
              {option.label}
            </button>
          ))}
          {filteredOptions.length === 0 && <div className="px-3 py-2 text-gray-500">No options found</div>}
        </div>
      )}
    </div>
  );
};

const DepartureCityManager = () => {
  const [departureCities, setDepartureCities] = useState([]);
  const [form, setForm] = useState(getInitialForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [activeTab, setActiveTab] = useState("list");
  const [selectedCity, setSelectedCity] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [expandedCities, setExpandedCities] = useState({});
  const [itenaryTours, setItenaryTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [cardOptions, setCardOptions] = useState([]);
  const [loadingTours, setLoadingTours] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const fetchDepartureCities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE);
      setDepartureCities(response.data);
      showMessage(`Loaded ${response.data.length} departure cities`, "info");
    } catch (err) {
      showMessage("Error loading departure cities", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchItenaryTours = async () => {
    setLoadingTours(true);
    try {
      const response = await axios.get(ITENARY_TOUR_API);
      setItenaryTours(response.data);
    } catch (err) {
      setItenaryTours([]);
      showMessage("Error loading tours", "error");
    } finally {
      setLoadingTours(false);
    }
  };

  useEffect(() => {
    fetchDepartureCities();
    fetchItenaryTours();
  }, []);

  const handleTourChange = (selectedOption) => {
    setSelectedTour(selectedOption);
    setForm((prev) => ({
      ...prev,
      itenaryTourId: selectedOption?.value || "",
      cardId: ""
    }));
    if (selectedOption?.value) {
      const tour = itenaryTours.find((t) => t._id === selectedOption.value);
      if (tour && Array.isArray(tour.cards)) {
        setCardOptions(
          tour.cards.map((card) => ({
            value: card._id,
            label: card.title || `Card - ${card.days || "N/A"} days`,
          }))
        );
      } else {
        setCardOptions([]);
      }
    } else {
      setCardOptions([]);
    }
  };

  const handleCardChange = (selectedOption) => {
    setForm((prev) => ({
      ...prev,
      cardId: selectedOption?.value || ""
    }));
  };

  const handleInputChange = (path, value) => {
    setForm((prev) => {
      const newForm = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let current = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newForm;
    });
  };

  const handleArrayChange = (arrayPath, index, field, value) => {
    setForm((prev) => {
      const newForm = JSON.parse(JSON.stringify(prev));
      const keys = arrayPath.split(".");
      let current = newForm;
      for (const key of keys) {
        current = current[key];
      }
      if (current[index] !== undefined) {
        if (field) {
          current[index][field] = value;
        } else {
          current[index] = value;
        }
      }
      return newForm;
    });
  };

  const addArrayItem = (arrayPath, template) => {
    setForm((prev) => {
      const newForm = JSON.parse(JSON.stringify(prev));
      const keys = arrayPath.split(".");
      let current = newForm;
      for (const key of keys) {
        current = current[key];
      }
      current.push(template);
      return newForm;
    });
  };

  const removeArrayItem = (arrayPath, index) => {
    setForm((prev) => {
      const newForm = JSON.parse(JSON.stringify(prev));
      const keys = arrayPath.split(".");
      let current = newForm;
      for (const key of keys) {
        current = current[key];
      }
      current.splice(index, 1);
      return newForm;
    });
  };

  const addNewCity = () => {
    setForm((prev) => ({
      ...prev,
      cities: [
        ...prev.cities,
        {
          name: "",
          description: "",
          dates: [
            {
              date: getTodayDate(),
              basePrice: 1000,
              availability: true,
              packages: [
                { category: "Standard", rate: 1000 },
                { category: "Deluxe", rate: 1500 },
                { category: "Premium", rate: 2000 },
              ],
            },
          ],
          hotels: [
            {
              city: "",
              name: "",
              checkIn: getTodayDate(),
              checkOut: getTomorrowDate(),
            },
          ],
          itinerary: [
            {
              day: prev.cities.length + 1,
              date: getTodayDate(),
              name: `Day ${prev.cities.length + 1}`,
              description: "Activity description",
              sightseeing: ["Sightseeing spot"],
              meals: ["Breakfast", "Dinner"],
            },
          ],
          tourPrices: [
            { occupancyType: "Single", price: 1500 },
            { occupancyType: "Twin", price: 1200 },
            { occupancyType: "Triple", price: 1000 },
          ],
          cancellationPolicy: [{ daysBeforeDeparture: "30", percentage: 10, amount: 100 }],
          extraNotes: "",
        },
      ],
    }));
  };

  const removeCity = (index) => {
    setForm((prev) => ({
      ...prev,
      cities: prev.cities.filter((_, i) => i !== index)
    }));
  };

  const toggleCityExpansion = (index) => {
    setExpandedCities((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(form);
    if (errors.length > 0) {
      setValidationErrors(errors);
      showMessage("Please fix the validation errors below", "error");
      return;
    }
    
    setValidationErrors([]);
    setLoading(true);

    try {
      const sanitizedData = sanitizeFormData(form);
      
      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, sanitizedData);
        showMessage("Departure city updated successfully", "success");
      } else {
        await axios.post(API_BASE, sanitizedData);
        showMessage("Departure city created successfully", "success");
      }

      setForm(getInitialForm());
      setSelectedTour(null);
      setCardOptions([]);
      setEditingId(null);
      setActiveTab("list");
      fetchDepartureCities();
    } catch (err) {
      showMessage("Error saving departure city", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    if (itenaryTours.length > 0) {
      const firstTour = itenaryTours[0];
      const firstCard = firstTour.cards?.[0];
      
      const sampleData = {
        itenaryTourId: firstTour._id,
        cardId: firstCard?._id || "",
        cities: [
          {
            name: "Sample City",
            description: "Beautiful mountain city with great attractions",
            dates: [
              {
                date: getTodayDate(),
                basePrice: 10000,
                availability: true,
                packages: [
                  { category: "Standard", rate: 9500 },
                  { category: "Deluxe", rate: 12000 },
                  { category: "Premium", rate: 15000 }
                ]
              }
            ],
            hotels: [
              {
                city: "Sample City",
                name: "Luxury Hotel",
                checkIn: getTodayDate(),
                checkOut: getTomorrowDate()
              }
            ],
            itinerary: [
              {
                day: 1,
                date: getTodayDate(),
                name: "Arrival Day",
                description: "Welcome and check-in at hotel",
                sightseeing: ["City Tour", "Local Market"],
                meals: ["Dinner"]
              }
            ],
            tourPrices: [
              { occupancyType: "Single", price: 12000 },
              { occupancyType: "Twin", price: 10000 },
              { occupancyType: "Triple", price: 9000 }
            ],
            cancellationPolicy: [
              { daysBeforeDeparture: "30", percentage: 10, amount: 1000 }
            ],
            extraNotes: "5% GST applicable. Includes breakfast."
          }
        ]
      };
      
      setForm(sampleData);
      
      // Set selected tour and card in dropdowns
      if (firstTour) {
        setSelectedTour({
          value: firstTour._id,
          label: firstTour.mainHeading || firstTour.country || firstTour._id
        });
        
        if (firstCard) {
          setCardOptions([{
            value: firstCard._id,
            label: firstCard.title || `Card - ${firstCard.days || 'N/A'} days`
          }]);
        }
      }
      
      setValidationErrors([]);
      showMessage("Sample data loaded. Modify and save it.", "info");
    } else {
      showMessage("No itinerary tours available for sample data", "error");
    }
  };

  // Edit departure city
  const handleEdit = (departureCity) => {
    setForm(departureCity);
    setEditingId(departureCity._id);
    
    // Set selected tour and card in dropdowns
    if (departureCity.itenaryTourId) {
      const tour = itenaryTours.find(t => t._id === departureCity.itenaryTourId);
      if (tour) {
        setSelectedTour({
          value: tour._id,
          label: tour.mainHeading || tour.country || tour._id
        });
        
        // Set card options and selected card
        if (tour.cards) {
          const options = tour.cards.map(card => ({
            value: card._id,
            label: card.title || `Card - ${card.days || 'N/A'} days`
          }));
          setCardOptions(options);
        }
      }
    }
    
    setActiveTab("form");
    setValidationErrors([]);
  };

  // Delete departure city
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this departure city?")) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      showMessage("Departure city deleted successfully", "success");
      fetchDepartureCities();
    } catch (err) {
      showMessage("Error deleting departure city", "error");
    } finally {
      setLoading(false);
    }
  };

  // View details
  const viewDetails = (departureCity) => {
    setSelectedCity(departureCity);
    setActiveTab("details");
  };

  // Reset form
  const resetForm = () => {
    setForm(getInitialForm());
    setSelectedTour(null);
    setCardOptions([]);
    setEditingId(null);
    setValidationErrors([]);
    setExpandedCities({});
  };

  // Get tour title by ID
  const getTourTitle = (tourId) => {
    const tour = itenaryTours.find(t => t._id === tourId);
    return tour ? (tour.mainHeading || tour.country || tour._id) : tourId;
  };

  // Get card title by ID
  const getCardTitle = (tourId, cardId) => {
    const tour = itenaryTours.find(t => t._id === tourId);
    if (tour && tour.cards) {
      const card = tour.cards.find(c => c._id === cardId);
      return card ? (card.title || `Card - ${card.days || 'N/A'} days`) : cardId;
    }
    return cardId;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Curated Journeys & Departure Cities Manager</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage tour departure cities with complete package details
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === "error" ? "bg-red-50 text-red-800 border border-red-200" :
            messageType === "success" ? "bg-green-50 text-green-800 border border-green-200" :
            "bg-blue-50 text-blue-800 border border-blue-200"
          }`}>
            {message}
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-medium mb-2">Please fix the following errors:</h3>
            <ul className="list-disc list-inside text-red-700 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("list")}
              className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "list"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              All Departure Cities
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveTab("form");
              }}
              className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "form"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Add New
            </button>
            {activeTab === "details" && selectedCity && (
              <button
                className="py-2 px-4 font-medium text-sm border-b-2 border-blue-500 text-blue-600"
              >
                Details
              </button>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
          </div>
        )}

        {/* List View */}
        {activeTab === "list" && !loading && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Departure Cities ({departureCities.length})
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={fetchItenaryTours}
                    disabled={loadingTours}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingTours ? 'animate-spin' : ''}`} />
                    {loadingTours ? "Loading..." : "Refresh Tours"}
                  </button>
                  <button
                    onClick={fetchDepartureCities}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {departureCities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏙️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No departure cities found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get started by creating your first departure city package
                  </p>
                  <button
                    onClick={() => setActiveTab("form")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Departure City
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {departureCities.map((departureCity) => (
                    <div key={departureCity._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getTourTitle(departureCity.itenaryTourId)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Card: {getCardTitle(departureCity.itenaryTourId, departureCity.cardId)}
                          </p>
                          <p className="text-sm text-blue-600 mt-1">
                            {departureCity.cities.length} cities in package
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(departureCity)}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => viewDetails(departureCity)}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(departureCity._id)}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-medium text-gray-900">Cities</div>
                          <div className="text-gray-600">
                            {departureCity.cities.map(city => city.name).join(', ')}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-medium text-gray-900">Total Dates</div>
                          <div className="text-gray-600">
                            {departureCity.cities.reduce((total, city) => total + city.dates.length, 0)} dates
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-medium text-gray-900">Hotels</div>
                          <div className="text-gray-600">
                            {departureCity.cities.reduce((total, city) => total + city.hotels.length, 0)} properties
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form View */}
        {activeTab === "form" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit Departure City" : "Create New Departure City"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder={loadingTours ? "Loading tours..." : "Select Itinerary Tour"}
                      isClearable
                      isSearchable
                      isLoading={loadingTours}
                      className="react-select-container"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tour Card *
                    </label>
                    <Select
                      value={cardOptions.find(option => option.value === form.cardId) || null}
                      onChange={handleCardChange}
                      options={cardOptions}
                      placeholder={selectedTour ? "Select Tour Card" : "First select a tour"}
                      isClearable
                      isSearchable
                      isDisabled={!selectedTour}
                      className="react-select-container"
                    />
                  </div>
                </div>
              </div>

              {/* Cities Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Cities ({form.cities.length})</h3>
                  <button
                    type="button"
                    onClick={addNewCity}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add City
                  </button>
                </div>

                {form.cities.map((city, cityIndex) => (
                  <div key={cityIndex} className="border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-semibold text-gray-800">
                        City {cityIndex + 1}: {city.name || "Unnamed City"}
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCityExpansion(cityIndex)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedCities[cityIndex] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {form.cities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCity(cityIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Basic City Info - Always Visible */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={city.name}
                          onChange={(e) => handleArrayChange("cities", cityIndex, "name", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter city name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <input
                          type="text"
                          required
                          value={city.description}
                          onChange={(e) => handleArrayChange("cities", cityIndex, "description", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter city description"
                        />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedCities[cityIndex] && (
                      <div className="space-y-6">
                        {/* Dates Section */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-sm font-medium text-gray-900">Available Dates *</h5>
                            <button
                              type="button"
                              onClick={() => addArrayItem(`cities.${cityIndex}.dates`, {
                                date: getTodayDate(),
                                basePrice: 1000,
                                availability: true,
                                packages: [
                                  { category: "Standard", rate: 1000 },
                                  { category: "Deluxe", rate: 1500 },
                                  { category: "Premium", rate: 2000 },
                                ],
                              })}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Date
                            </button>
                          </div>

                          {city.dates.map((dateItem, dateIndex) => (
                            <div key={dateIndex} className="border border-gray-100 rounded-lg p-4 mb-4">
                              <div className="flex justify-between items-center mb-4">
                                <h6 className="text-sm font-medium text-gray-700">Date {dateIndex + 1}</h6>
                                {city.dates.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem(`cities.${cityIndex}.dates`, dateIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                                  <input
                                    type="date"
                                    required
                                    value={dateItem.date}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.dates`, dateIndex, "date", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Price *</label>
                                  <input
                                    type="number"
                                    required
                                    value={dateItem.basePrice}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.dates`, dateIndex, "basePrice", parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter base price"
                                  />
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                  <input
                                    type="checkbox"
                                    checked={dateItem.availability}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.dates`, dateIndex, "availability", e.target.checked)}
                                    className="h-4 w-4"
                                  />
                                  <label className="text-sm font-medium text-gray-700">Available</label>
                                </div>
                              </div>

                              {/* Packages for this date */}
                              <div>
                                <div className="flex justify-between items-center mb-3">
                                  <h6 className="text-xs font-medium text-gray-900">Packages *</h6>
                                  <button
                                    type="button"
                                    onClick={() => addArrayItem(`cities.${cityIndex}.dates.${dateIndex}.packages`, { category: "Standard", rate: 1000 })}
                                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add Package
                                  </button>
                                </div>

                                {dateItem.packages.map((pkg, pkgIndex) => (
                                  <div key={pkgIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                                      <select
                                        required
                                        value={pkg.category}
                                        onChange={(e) => handleArrayChange(`cities.${cityIndex}.dates.${dateIndex}.packages`, pkgIndex, "category", e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      >
                                        <option value="Standard">Standard</option>
                                        <option value="Deluxe">Deluxe</option>
                                        <option value="Premium">Premium</option>
                                      </select>
                                    </div>
                                    <div className="flex items-end gap-2">
                                      <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Rate *</label>
                                        <input
                                          type="number"
                                          required
                                          value={pkg.rate}
                                          onChange={(e) => handleArrayChange(`cities.${cityIndex}.dates.${dateIndex}.packages`, pkgIndex, "rate", parseInt(e.target.value) || 0)}
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                          placeholder="Enter rate"
                                        />
                                      </div>
                                      {dateItem.packages.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeArrayItem(`cities.${cityIndex}.dates.${dateIndex}.packages`, pkgIndex)}
                                          className="text-red-600 hover:text-red-800 mb-1"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Hotels Section */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-sm font-medium text-gray-900">Hotels *</h5>
                            <button
                              type="button"
                              onClick={() => addArrayItem(`cities.${cityIndex}.hotels`, {
                                city: "",
                                name: "",
                                checkIn: getTodayDate(),
                                checkOut: getTomorrowDate()
                              })}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Hotel
                            </button>
                          </div>

                          {city.hotels.map((hotel, hotelIndex) => (
                            <div key={hotelIndex} className="border border-gray-100 rounded-lg p-4 mb-4">
                              <div className="flex justify-between items-center mb-4">
                                <h6 className="text-sm font-medium text-gray-700">Hotel {hotelIndex + 1}</h6>
                                {city.hotels.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem(`cities.${cityIndex}.hotels`, hotelIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel City *</label>
                                  <input
                                    type="text"
                                    required
                                    value={hotel.city}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.hotels`, hotelIndex, "city", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter hotel city"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name *</label>
                                  <input
                                    type="text"
                                    required
                                    value={hotel.name}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.hotels`, hotelIndex, "name", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter hotel name"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date *</label>
                                  <input
                                    type="date"
                                    required
                                    value={hotel.checkIn}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.hotels`, hotelIndex, "checkIn", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
                                  <input
                                    type="date"
                                    required
                                    value={hotel.checkOut}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.hotels`, hotelIndex, "checkOut", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Itinerary Section */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-sm font-medium text-gray-900">Itinerary *</h5>
                            <button
                              type="button"
                              onClick={() => addArrayItem(`cities.${cityIndex}.itinerary`, {
                                day: city.itinerary.length + 1,
                                date: getTodayDate(),
                                name: `Day ${city.itinerary.length + 1}`,
                                description: "Activity description",
                                sightseeing: ["Sightseeing spot"],
                                meals: ["Breakfast", "Dinner"]
                              })}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Day
                            </button>
                          </div>

                          {city.itinerary.map((day, dayIndex) => (
                            <div key={dayIndex} className="border border-gray-100 rounded-lg p-4 mb-4">
                              <div className="flex justify-between items-center mb-4">
                                <h6 className="text-sm font-medium text-gray-700">Day {day.day}</h6>
                                {city.itinerary.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem(`cities.${cityIndex}.itinerary`, dayIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                                  <input
                                    type="date"
                                    required
                                    value={day.date}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.itinerary`, dayIndex, "date", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Day Name *</label>
                                  <input
                                    type="text"
                                    required
                                    value={day.name}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.itinerary`, dayIndex, "name", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter day name"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                <textarea
                                  required
                                  value={day.description}
                                  onChange={(e) => handleArrayChange(`cities.${cityIndex}.itinerary`, dayIndex, "description", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  rows="3"
                                  placeholder="Enter day description"
                                />
                              </div>
                              {/* Sightseeing */}
                              <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-sm font-medium text-gray-700">Sightseeing</label>
                                  <button
                                    type="button"
                                    onClick={() => addArrayItem(`cities.${cityIndex}.itinerary.${dayIndex}.sightseeing`, "New Sightseeing")}
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add Sightseeing
                                  </button>
                                </div>
                                {day.sightseeing.map((sight, sightIndex) => (
                                  <div key={sightIndex} className="flex items-center gap-2 mb-2">
                                    <input
                                      type="text"
                                      value={sight}
                                      onChange={(e) => handleArrayChange(`cities.${cityIndex}.itinerary.${dayIndex}.sightseeing`, sightIndex, null, e.target.value)}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder="Enter sightseeing"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeArrayItem(`cities.${cityIndex}.itinerary.${dayIndex}.sightseeing`, sightIndex)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              {/* Meals */}
                              <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-sm font-medium text-gray-700">Meals</label>
                                  <button
                                    type="button"
                                    onClick={() => addArrayItem(`cities.${cityIndex}.itinerary.${dayIndex}.meals`, "New Meal")}
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add Meal
                                  </button>
                                </div>
                                {day.meals.map((meal, mealIndex) => (
                                  <div key={mealIndex} className="flex items-center gap-2 mb-2">
                                    <input
                                      type="text"
                                      value={meal}
                                      onChange={(e) => handleArrayChange(`cities.${cityIndex}.itinerary.${dayIndex}.meals`, mealIndex, null, e.target.value)}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder="Enter meal"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeArrayItem(`cities.${cityIndex}.itinerary.${dayIndex}.meals`, mealIndex)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tour Prices Section */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-sm font-medium text-gray-900">Tour Prices</h5>
                            <button
                              type="button"
                              onClick={() => addArrayItem(`cities.${cityIndex}.tourPrices`, {
                                occupancyType: "Single",
                                price: 1000
                              })}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Price
                            </button>
                          </div>

                          {city.tourPrices.map((price, priceIndex) => (
                            <div key={priceIndex} className="border border-gray-100 rounded-lg p-4 mb-4">
                              <div className="flex justify-between items-center mb-4">
                                <h6 className="text-sm font-medium text-gray-700">Price {priceIndex + 1}</h6>
                                {city.tourPrices.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem(`cities.${cityIndex}.tourPrices`, priceIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Occupancy Type</label>
                                  <select
                                    value={price.occupancyType}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.tourPrices`, priceIndex, "occupancyType", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  >
                                    <option value="Single">Single</option>
                                    <option value="Twin">Twin</option>
                                    <option value="Triple">Triple</option>
                                    <option value="Quad">Quad</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                  <input
                                    type="number"
                                    value={price.price}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.tourPrices`, priceIndex, "price", parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter price"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Cancellation Policy Section */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-sm font-medium text-gray-900">Cancellation Policy *</h5>
                            <button
                              type="button"
                              onClick={() => addArrayItem(`cities.${cityIndex}.cancellationPolicy`, {
                                daysBeforeDeparture: "30",
                                percentage: 10,
                                amount: 100
                              })}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Policy
                            </button>
                          </div>

                          {city.cancellationPolicy.map((policy, policyIndex) => (
                            <div key={policyIndex} className="border border-gray-100 rounded-lg p-4 mb-4">
                              <div className="flex justify-between items-center mb-4">
                                <h6 className="text-sm font-medium text-gray-700">Policy {policyIndex + 1}</h6>
                                {city.cancellationPolicy.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem(`cities.${cityIndex}.cancellationPolicy`, policyIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Days Before Departure *</label>
                                  <input
                                    type="text"
                                    required
                                    value={policy.daysBeforeDeparture}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.cancellationPolicy`, policyIndex, "daysBeforeDeparture", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g., 30"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Percentage</label>
                                  <input
                                    type="number"
                                    value={policy.percentage}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.cancellationPolicy`, policyIndex, "percentage", parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                  <input
                                    type="number"
                                    value={policy.amount}
                                    onChange={(e) => handleArrayChange(`cities.${cityIndex}.cancellationPolicy`, policyIndex, "amount", parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Extra Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Extra Notes</label>
                          <textarea
                            value={city.extraNotes}
                            onChange={(e) => handleArrayChange("cities", cityIndex, "extraNotes", e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Any additional notes..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={loadSampleData}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Load Sample Data
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Form
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingId ? "Update" : "Create"} Departure City
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Details View */}
        {activeTab === "details" && selectedCity && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Departure City Details
                </h2>
                <button
                  onClick={() => handleEdit(selectedCity)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tour Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {getTourTitle(selectedCity.itenaryTourId)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Card: {getCardTitle(selectedCity.itenaryTourId, selectedCity.cardId)}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Package Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {selectedCity.cities.length} Cities
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedCity.cities.reduce((total, city) => total + city.hotels.length, 0)} Hotels, {selectedCity.cities.reduce((total, city) => total + city.dates.length, 0)} Dates
                    </p>
                  </div>
                </div>
              </div>

              {selectedCity.cities.map((city, cityIndex) => (
                <div key={cityIndex} className="border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {city.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{city.description}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Hotels */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Hotels</h4>
                      <div className="space-y-2">
                        {city.hotels.map((hotel, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <p className="font-medium text-sm">{hotel.name}</p>
                            <p className="text-xs text-gray-600">{hotel.city}</p>
                            <p className="text-xs text-gray-600">{hotel.checkIn} to {hotel.checkOut}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tour Prices */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Pricing</h4>
                      <div className="space-y-2">
                        {city.tourPrices.map((price, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded flex justify-between">
                            <span className="text-sm">{price.occupancyType}</span>
                            <span className="font-medium text-sm">₹{price.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Itinerary */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Itinerary</h4>
                    <div className="space-y-3">
                      {city.itinerary.map((day, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-sm">{day.name}</h5>
                            <span className="text-xs text-gray-500">{day.date}</span>
                          </div>
                          <p className="text-sm text-gray-600">{day.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  {city.cancellationPolicy.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Cancellation Policy</h4>
                      <div className="space-y-2">
                        {city.cancellationPolicy.map((policy, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <p className="text-sm">
                              {policy.daysBeforeDeparture} days before: {policy.percentage}% (₹{policy.amount})
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extra Notes */}
                  {city.extraNotes && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Notes</h4>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">{city.extraNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartureCityManager;