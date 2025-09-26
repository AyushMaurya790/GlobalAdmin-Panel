import React, { useState } from 'react';
import { 
  FaGlobe, 
  FaMap, 
  FaQuestion, 
  FaLightbulb, 
  FaRoute, 
  FaThumbtack,
  FaBookOpen,
  FaPlane
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import all components from ItenaryPage folder
import Overview from './ItenaryPage/Overview';
import Curated from './ItenaryPage/Curated';
import MapCard from './ItenaryPage/MapCard';
import Question from './ItenaryPage/Question';
import TravelTip from './ItenaryPage/TravelTip';
import ItenaryTour from './ItenaryPage/ItenaryTour';
import InspiredSimpleSection from './ItenaryPage/InspiredSimpleSection';

const Itenary = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');

  // Tabs configuration with icons and labels
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaBookOpen className="mr-2" /> },
    { id: 'curated', label: 'Curated Itineraries', icon: <FaRoute className="mr-2" /> },
    { id: 'itenaryTour', label: 'Itinerary Tours', icon: <FaPlane className="mr-2" /> },
    { id: 'mapCard', label: 'Map Cards', icon: <FaMap className="mr-2" /> },
    { id: 'travelTip', label: 'Travel Tips', icon: <FaThumbtack className="mr-2" /> },
    { id: 'inspiredSection', label: 'Inspired Sections', icon: <FaLightbulb className="mr-2" /> },
    { id: 'questions', label: 'Questions', icon: <FaQuestion className="mr-2" /> }
  ];

  // Render active component based on selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'curated':
        return <Curated />;
      case 'itenaryTour':
        return <ItenaryTour />;
      case 'mapCard':
        return <MapCard />;
      case 'travelTip':
        return <TravelTip />;
      case 'inspiredSection':
        return <InspiredSimpleSection />;
      case 'questions':
        return <Question />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold flex items-center">
            <FaGlobe className="mr-3 text-4xl" /> 
            Itinerary Management
          </h1>
          <p className="mt-2 opacity-80">
            Manage your travel itineraries, tours, maps and more
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto mt-6 px-4">
        {/* Tabs */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="flex flex-wrap border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-3 font-medium flex items-center transition-colors duration-200 ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Active Component */}
        <div className="bg-transparent">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default Itenary;
