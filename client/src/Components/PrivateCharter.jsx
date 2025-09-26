import React, { useState } from 'react';
import SkySection from './PrivateCharter/SkySection';
import OverviewSection from './PrivateCharter/OverviewSection';
import FlySection from './PrivateCharter/FlySection';
import CharterSection from './PrivateCharter/CharterSection';
import MissionSection from './PrivateCharter/MissionSection';
import FleetSection from './PrivateCharter/FleetSection';
import { FaPlane, FaInfo, FaUserFriends, FaBuilding, FaHistory, FaShip } from 'react-icons/fa';

const PrivateCharter = () => {
  const [activeTab, setActiveTab] = useState('sky');
  
  // Tabs configuration
  const tabs = [
    { id: 'sky', name: 'Sky Section', icon: <FaPlane /> },
    { id: 'overview', name: 'Overview', icon: <FaInfo /> },
    { id: 'fly', name: 'Who We Fly', icon: <FaUserFriends /> },
    { id: 'charter', name: 'Globenzel Charters', icon: <FaBuilding /> },
    { id: 'mission', name: 'Past Mission', icon: <FaHistory /> },
    { id: 'fleet', name: 'Fleet & Specification', icon: <FaShip /> }
  ];

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Private Charter Management</h1>
        <p className="text-gray-600">
          Manage all sections of the Private Charter page. Select a tab below to edit specific content.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 mr-2 mb-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>
      
      {/* Content Sections */}
      <div className="bg-white rounded-lg">
        {activeTab === 'sky' && <SkySection />}
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'fly' && <FlySection />}
        {activeTab === 'charter' && <CharterSection />}
        {activeTab === 'mission' && <MissionSection />}
        {activeTab === 'fleet' && <FleetSection />}
      </div>
    </div>
  );
};

export default PrivateCharter;
