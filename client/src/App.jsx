import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './Layout'
import Continent from './Components/Continent'
import Country from './Components/Country'
import LuxuryCity from './Components/LuxuryCity'
import FooterLogo from './Components/FooterLogo'
import About from './Components/About'
import Home from './Components/Home'
import Voyage from './Components/Voyage'
import Contact from './Components/Contact'
import LuxuryOption from './Components/LuxuryOption'
import Privilege from './Components/Privilege'
import GroupTour from './Components/GroupTour'
import BusinessTravel from './Components/BusinessTravel'
import StudyAbroad from './Components/StudyAbroad'
import Celebration from './Components/Celebration'
import PrivateCharter from './Components/PrivateCharter'
import Sport from './Components/Sport'
import Itenary from './Components/Itenary'
import ParticularItenaryTour from './Components/ParticularItenaryTour'
import CricketTournament from './Components/Tournament/CricketTournament'
import FootballTournament from './Components/Tournament/FootballTournament'
import F1Racing from './Components/Tournament/F1Racing'
import MotoGPRacing from './Components/Tournament/MotoGpRacing'
import DepartureCity from './Components/DepartureCity'

// Placeholder components for each route
const Dashboard = () => <div className="content-card"><h1 className="page-title">Dashboard</h1><p>Welcome to the Travel Portal Dashboard</p></div>
const Login = () => <div className="content-card"><h1 className="page-title">Login</h1><p>Please log in to access the portal</p></div>

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="home" element={<Home />} />
          <Route path="continent" element={<Continent />} />
          <Route path="country" element={<Country />} />
          <Route path="luxury-city" element={<LuxuryCity />} />
          <Route path="footer-logo" element={<FooterLogo />} />
          <Route path="about" element={<About />} />
          <Route path="luxury-option" element={<LuxuryOption />} />
          <Route path="privilege" element={<Privilege />} />
          <Route path="voyage" element={<Voyage />} />
          <Route path="group-tour" element={<GroupTour />} />
          <Route path="business-travel" element={<BusinessTravel />} />
          <Route path="eduwings" element={<StudyAbroad />} />
          <Route path="destination-celebration" element={<Celebration />} />
          <Route path="private-charter" element={<PrivateCharter />} />
          <Route path="sport-travel" element={<Sport />} />
          <Route path="cricket-tournament" element={<CricketTournament />} />
          <Route path="football-tournament" element={<FootballTournament />} />
          <Route path="f1-racing" element={<F1Racing />} />
          <Route path="motogp-racing" element={<MotoGPRacing />} />
          <Route path="departure-cities" element={<DepartureCity />} />
          <Route path="itinerary" element={<Itenary />} />
          <Route path="particular-itenary-tour/:itenaryTourId/:cardId" element={<ParticularItenaryTour />} />
          <Route path="contact" element={<Contact />} />
        </Route>
        <Route path="login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
