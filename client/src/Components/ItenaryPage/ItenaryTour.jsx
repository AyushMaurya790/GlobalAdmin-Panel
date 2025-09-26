import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ItenaryTour = () => {
  const [formData, setFormData] = useState({
    country: "",
    mainHeading: "",
    cards: [
      {
        title: "",
        days: "",
        countries: "",
        cities: "",
        departures: "",
        price: "",
        image: null,
      },
    ],
  });

  const [tours, setTours] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [continents, setContinents] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState("");
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
    fetchContinents();
    verifyApiEndpoint();
  }, []);

  const verifyApiEndpoint = async () => {
    try {
      const response = await axios.get("http://globe.ridealmobility.com/api");
      console.log("API verification response:", response.data);
    } catch (error) {
      console.warn("API verification failed:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (selectedContinent) {
      fetchCountries(selectedContinent);
    } else {
      setCountries([]);
    }
  }, [selectedContinent]);

  const fetchTours = async () => {
    try {
      const response = await axios.get("http://globe.ridealmobility.com/api/itenary-tour");
      if (response.data) {
        let toursData;
        if (Array.isArray(response.data)) {
          toursData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          toursData = response.data.data;
        } else {
          setTours([]);
          setError("Invalid response format for tours data");
          return;
        }
        setTours(toursData);
      } else {
        setTours([]);
      }
    } catch (error) {
      setError("Failed to fetch tours: " + (error.response?.data?.message || error.message));
      setTours([]);
    }
  };

  const fetchContinents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://globe.ridealmobility.com/api/continents");
      const data = response.data;
      if (Array.isArray(data)) {
        setContinents(data);
      } else if (data.data && Array.isArray(data.data)) {
        setContinents(data.data);
      } else {
        setContinents([]);
        setError("Invalid data format for continents.");
      }
    } catch (error) {
      setContinents([]);
      setError("Failed to fetch continents: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async (continentId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://globe.ridealmobility.com/api/countries?continentId=${continentId}`);
      const data = response.data;
      if (Array.isArray(data)) {
        setCountries(data);
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        setCountries(data.data);
        return data.data;
      } else {
        setCountries([]);
        setError("Invalid data format for countries.");
        return [];
      }
    } catch (error) {
      setCountries([]);
      setError("Failed to fetch countries: " + (error.response?.data?.message || error.message));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "continent") {
      setSelectedContinent(value);
      setFormData({ ...formData, country: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCardChange = (index, field, value) => {
    const updatedCards = [...formData.cards];
    updatedCards[index][field] = value;
    setFormData({ ...formData, cards: updatedCards });
  };

  const handleImageChange = (index, file) => {
    const updatedCards = [...formData.cards];
    updatedCards[index].image = file;
    setFormData({ ...formData, cards: updatedCards });
  };

  const addCard = () => {
    setFormData({
      ...formData,
      cards: [
        ...formData.cards,
        {
          title: "",
          days: "",
          countries: "",
          cities: "",
          departures: "",
          price: "",
          image: null,
        },
      ],
    });
  };

  const removeCard = (index) => {
    const updatedCards = [...formData.cards];
    updatedCards.splice(index, 1);
    setFormData({ ...formData, cards: updatedCards });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      const invalidCards = formData.cards.some(
        (card) =>
          !card.title || !card.days || !card.price || (!editingId && !card.image)
      );
      if (!formData.country) throw new Error("Please select a country");
      if (invalidCards) throw new Error("Each card must have title, days, price, and image");

      const data = new FormData();
      data.append("country", formData.country);
      data.append("mainHeading", formData.mainHeading);

      // Prepare cards for API: departures as array, image as empty string
      const cardsForApi = formData.cards.map((card) => ({
        ...(card._id ? { _id: card._id } : {}),
        title: card.title,
        days: card.days,
        countries: card.countries,
        cities: card.cities,
        price: card.price,
        departures: card.departures
          ? card.departures.split(",").map(d => d.trim())
          : [],
        image: "", // will be replaced by backend with upload path
      }));

      data.append("cards", JSON.stringify(cardsForApi));

      // Images: only append file objects (not string URLs)
      formData.cards.forEach(card => {
        if (card.image && typeof card.image !== "string") {
          data.append("images", card.image);
        }
      });

      // Debug log
      for (let [key, value] of data.entries()) {
        console.log(key, value);
      }

      let url, method;
      if (editingId) {
        url = `http://globe.ridealmobility.com/api/itenary-tour/${editingId}`;
        method = "put";
      } else {
        url = "http://globe.ridealmobility.com/api/itenary-tour";
        method = "post";
      }

      const response = await axios[method](url, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      console.log("API response:", response.data);

      setFormData({
        country: "",
        mainHeading: "",
        cards: [
          {
            title: "",
            days: "",
            countries: "",
            cities: "",
            departures: "",
            price: "",
            image: null,
          },
        ],
      });
      setSelectedContinent("");
      setEditingId(null);
      fetchTours();
    } catch (error) {
      setError("Failed to save tour: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = async (tour) => {
    setEditingId(tour._id);
    
    // First set the continent and fetch countries if needed
    if (tour.country?.continent) {
      setSelectedContinent(tour.country.continent._id);
      // Wait for countries to be fetched
      await fetchCountries(tour.country.continent._id);
    }
    
    const processedCards = tour.cards?.map((card) => {
      let countries = "";
      let cities = "";
      
      // First check if countries and cities exist directly on the card
      if (card.countries) {
        countries = card.countries;
      }
      if (card.cities) {
        cities = card.cities;
      }
      
      // Fallback: if not found, try to extract from description
      if (!countries && !cities && card.description) {
        const parts = card.description.split(',').map(part => part.trim());
        if (parts.length > 1) {
          countries = parts[0];
          cities = parts.slice(1).join(', ');
        } else {
          countries = card.description;
        }
      }
      
      let departuresString = "";
      if (card.departures && Array.isArray(card.departures)) {
        departuresString = card.departures.join(", ");
      } else if (card.departures && typeof card.departures === 'string') {
        departuresString = card.departures;
      }
      return {
        _id: card._id,
        title: card.title || "",
        days: card.days || "",
        countries: countries,
        cities: cities,
        departures: departuresString,
        price: card.price || "",
        image: card.image || null,
      };
    }) || [];
    
    // Set form data after countries are fetched
    setFormData({
      country: tour.country?._id || "",
      mainHeading: tour.mainHeading || "",
      cards: processedCards.length > 0 ? processedCards : [
        {
          title: "",
          days: "",
          countries: "",
          cities: "",
          departures: "",
          price: "",
          image: null,
        }
      ],
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://globe.ridealmobility.com/api/itenary-tour/${id}`);
      fetchTours();
    } catch (error) {
      setError("Failed to delete tour.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        {editingId ? "Edit Itenary Tour" : "Add Itenary Tour"}
      </h2>

      {loading && <p>Loading data...</p>}
      {error && (
        <div className="text-red-500 mb-4">
          {error}
          <button
            onClick={() => fetchContinents()}
            className="ml-2 text-blue-500 underline"
          >
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Continent Selection */}
        <div>
          <label className="block mb-1">Select Continent</label>
          <select
            name="continent"
            value={selectedContinent}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading || !continents || continents.length === 0}
          >
            <option value="">Select Continent</option>
            {continents && Array.isArray(continents) && continents.map((continent) => (
              <option key={continent._id} value={continent._id}>
                {continent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Country Selection */}
        <div>
          <label className="block mb-1">Select Country</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={loading || !selectedContinent || !countries || countries.length === 0}
          >
            <option value="">Select Country</option>
            {countries && Array.isArray(countries) && countries.map((country) => (
              <option key={country._id} value={country._id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Main Heading */}
        <input
          type="text"
          name="mainHeading"
          value={formData.mainHeading}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Main Heading"
          required
        />

        {/* Cards */}
        {formData.cards.map((card, index) => (
          <div key={index} className="border p-4 rounded space-y-2">
            <input
              type="text"
              value={card.title}
              onChange={(e) => handleCardChange(index, "title", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Card Title"
              required
            />
            <input
              type="text"
              value={card.days}
              onChange={(e) => handleCardChange(index, "days", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Number of days (e.g. 10)"
              required
            />
            <input
              type="text"
              value={card.countries}
              onChange={(e) =>
                handleCardChange(index, "countries", e.target.value)
              }
              className="w-full p-2 border rounded"
              placeholder="Number of countries (e.g. 1)"
            />
            <input
              type="text"
              value={card.cities}
              onChange={(e) =>
                handleCardChange(index, "cities", e.target.value)
              }
              className="w-full p-2 border rounded"
              placeholder="Number of cities (e.g. 3)"
            />
            <input
              type="text"
              value={card.departures}
              onChange={(e) =>
                handleCardChange(index, "departures", e.target.value)
              }
              className="w-full p-2 border rounded"
              placeholder="Departures (comma-separated, e.g. Jan, Feb, Mar)"
            />
            <input
              type="text"
              value={card.price}
              onChange={(e) =>
                handleCardChange(index, "price", e.target.value)
              }
              className="w-full p-2 border rounded"
              placeholder="e.g. INR 1,19,000"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageChange(index, e.target.files[0])
              }
              className="w-full"
              required={!editingId && !card.image}
            />
            {/* Show current image preview */}
            {card.image && (
              <div className="mt-2">
                <img
                  src={
                    typeof card.image === 'string' 
                      ? `http://globe.ridealmobility.com/${card.image}`
                      : URL.createObjectURL(card.image)
                  }
                  alt={`Card ${index + 1} preview`}
                  className="w-32 h-32 object-cover rounded border"
                />
                <p className="text-sm text-gray-600 mt-1">
                  {typeof card.image === 'string' ? 'Current image' : 'New image selected'}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => removeCard(index)}
              className="text-red-500"
            >
              Remove Card
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addCard}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Card
        </button>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update Tour" : "Save Tour"}
        </button>
      </form>

      {/* Tours List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Existing Tours</h3>
        {tours && Array.isArray(tours) && tours.length > 0 ? (
          tours.map((tour) => (
            <div key={tour._id} className="border p-4 mb-4 rounded shadow-sm">
              <h4 className="font-bold text-xl mb-2">{tour.mainHeading}</h4>
              <p className="mb-2">Country: {tour.country?.name || "Unknown"}</p>
              {tour.cards && Array.isArray(tour.cards) && tour.cards.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-lg mb-2">Tour Packages:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tour.cards.map((card) => (
                      <div key={card._id} className="border rounded p-3 bg-gray-50">
                        {card.image && (
                          <div className="mb-2">
                            <img
                              src={`http://globe.ridealmobility.com/${card.image}`}
                              alt={card.title}
                              className="w-full h-40 object-cover rounded"
                            />
                          </div>
                        )}
                        <h6 className="font-bold">{card.title}</h6>
                        <div className="text-sm mt-1">
                          <p><span className="font-medium">Days:</span> {card.days} Days</p>
                          <p><span className="font-medium">Price:</span> {card.price}</p>
                          {card.countries && (
                            <p><span className="font-medium">Countries:</span> {card.countries} {parseInt(card.countries) === 1 ? 'Country' : 'Countries'}</p>
                          )}
                          {card.cities && (
                            <p><span className="font-medium">Cities:</span> {card.cities} {parseInt(card.cities) === 1 ? 'City' : 'Cities'}</p>
                          )}
                          {card.departures && card.departures.length > 0 && (
                            <p><span className="font-medium">Departures:</span> {Array.isArray(card.departures) ? card.departures.join(", ") : card.departures}</p>
                          )}
                          <div className="mt-2">
                            <Link 
                              to={`/particular-itenary-tour/${tour._id}/${card._id}`}
                              className="bg-green-500 text-white px-2 py-1 rounded text-sm inline-block hover:bg-green-600"
                            >
                              Create/Edit Landing Page
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(tour)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tour._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No tours found.</p>
        )}
      </div>
    </div>
  );
};

export default ItenaryTour;