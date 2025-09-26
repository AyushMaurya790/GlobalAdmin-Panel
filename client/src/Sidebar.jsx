import {
  FaBook,
  FaBookOpen,
  FaBullhorn,
  FaChalkboardTeacher,
  FaChartBar,
  FaClipboardList,
  FaQuestionCircle as FaDoubt,
  FaFileAlt,
  FaHome,
  FaImages,
  FaLayerGroup,
  FaQuestionCircle,
  FaSignOutAlt,
  FaStar,
  FaTrophy,
  FaUniversity,
  FaUpload,
  FaUserGraduate,
  FaVideo,
  FaTasks,
  FaPlus, // ➕ Added for Add menu
  FaPhone, // ➕ Added for Contact
  FaCrown, // ➕ Added for Privilege
  FaBriefcase, // ➕ Added for Business Travel
  FaGlassCheers, // ➕ Added for Celebration
  FaPlane, // ➕ Added for Private Charter
  FaFutbol, // ➕ Added for Sport Travel
  FaMapMarkedAlt, // ➕ Added for Itinerary Tour
  FaCar, // ➕ Added for F1 Racing
  FaMotorcycle, // ➕ Added for MotoGP Racing
  FaPlaneArrival // ➕ Added for Departure City
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    // { icon: FaHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FaTasks, label: 'Home Management', path: '/home' },
    { icon: FaLayerGroup, label: 'Continent', path: '/continent' },
    { icon: FaUniversity, label: 'Country', path: '/country' },
    { icon: FaStar, label: 'Luxury City', path: '/luxury-city' },
    { icon: FaImages, label: 'Footer Logo', path: '/footer-logo' },
    { icon: FaFileAlt, label: 'About', path: '/about' },
    { icon: FaTrophy, label: 'Luxury Option', path: '/luxury-option' },
    { icon: FaCrown, label: 'Privilege', path: '/privilege' },
    { icon: FaVideo, label: 'Voyage', path: '/voyage' },
    { icon: FaUserGraduate, label: 'Group Tour', path: '/group-tour' },
    { icon: FaBriefcase, label: 'Business Travel', path: '/business-travel' },
    { icon: FaUserGraduate, label: 'Study Abroad', path: '/eduwings' },
    { icon: FaGlassCheers, label: 'Destination Celebration', path: '/destination-celebration' },
    { icon: FaPlane, label: 'Private Charter', path: '/private-charter' },
    { icon: FaFutbol, label: 'Sport Travel', path: '/sport-travel' },
    { icon: FaTrophy, label: 'Cricket Tournament', path: '/cricket-tournament' },
    { icon: FaFutbol, label: 'Football Tournament', path: '/football-tournament' },
    { icon: FaCar, label: 'F1 Racing', path: '/f1-racing' },
    { icon: FaMotorcycle, label: 'MotoGP Racing', path: '/motogp-racing' },
    { icon: FaPlaneArrival, label: 'Departure Cities', path: '/departure-cities' },
    { icon: FaBook, label: 'Itinerary', path: '/itinerary' },
    { icon: FaPhone, label: 'Contact', path: '/contact' }
  ];

  // This menu item is commented out because it requires dynamic parameters
  // Users should navigate to this page from the Itinerary page
  // { icon: FaMapMarkedAlt, label: 'Itinerary Tour Details', path: '/particular-itenary-tour/:itenaryTourId/:cardId' },

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl z-50 animate-slideIn flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-center">
          <img
            src="/GLOBENGEL.png"
            alt="Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
        <h2 className="text-center text-lg font-semibold text-slate-200 mt-2">
          Travel Portal
        </h2>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar min-h-0">
        <ul className="space-y-1 px-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`text-lg transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Logout Section */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <Link
          to="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200 group"
        >
          <FaSignOutAlt className="text-lg transition-transform duration-200 group-hover:scale-110" />
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </nav>
  );
};

export default Sidebar;