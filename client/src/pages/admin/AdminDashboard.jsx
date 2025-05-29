import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiHome, FiUsers, FiFileText, FiSettings, FiTag, 
  FiGrid, FiUserCheck, FiAlertTriangle, FiBarChart2,
  FiLogOut, FiUser, FiChevronDown, FiChevronRight, FiClock, FiTarget 
} from 'react-icons/fi';
import { logout } from '../../redux/thunks/authThunk';

// Import admin sub-pages
import AdminHome from './AdminHome';
import UserManagement from './UserManagement';
import ReporterManagement from './ReporterManagement';
import ReporterApplications from './ReporterApplications';
import NewsManagement from './NewsManagement';
import CategoryManagement from './CategoryManagement';
import SiteSettings from './SiteSettings';
import PageManagement from './PageManagement';
import PeopleManagement from './PeopleManagement';
import PersonEditor from './PersonEditor';
// Advertisement management imports
import AdvertisementManagement from './AdvertisementManagement';
import AdvertisementEditor from './AdvertisementEditor';
import AdvertisementAnalytics from './AdvertisementAnalytics';

// SidebarItem Component
const SidebarItem = ({ path, icon, label, isActive, onClick }) => (
  <li className="mb-2">
    <Link
      to={path}
      className={`flex items-center px-4 py-3 rounded-lg ${
        isActive
          ? 'bg-indigo-700 text-white'
          : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
      } transition-colors`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="mr-3" aria-hidden="true">{icon}</span>
      {label}
    </Link>
  </li>
);

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const inactivityTimeout = 30 * 60 * 1000; // 30 minutes
  
  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  const isActive = useCallback((path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }, [location.pathname]);
  
  const navItems = [
    { path: '/admin', icon: <FiHome size={20} />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FiUsers size={20} />, label: 'User Management' },
    { path: '/admin/reporters', icon: <FiUserCheck size={20} />, label: 'Reporter Management' },
    { path: '/admin/applications', icon: <FiAlertTriangle size={20} />, label: 'Reporter Applications' },
    { path: '/admin/news', icon: <FiFileText size={20} />, label: 'News Management' },
    { path: '/admin/categories', icon: <FiTag size={20} />, label: 'Categories' },
    { path: '/admin/people', icon: <FiUser size={20} />, label: 'People Management' },
    { path: '/admin/advertisements', icon: <FiTarget size={20} />, label: 'Advertisement Management' }, // New item
    { path: '/admin/pages', icon: <FiGrid size={20} />, label: 'Page Management' },
    { path: '/admin/settings', icon: <FiSettings size={20} />, label: 'Site Settings' },
  ];
  
  // Handle session timeout
  useEffect(() => {
    const resetTimer = () => {
      setLastActivity(Date.now());
      setShowTimeoutWarning(false);
    };
    
    const checkInactivity = () => {
      const now = Date.now();
      const timeElapsed = now - lastActivity;
      
      if (timeElapsed > inactivityTimeout - 60000) { // Show warning 1 minute before timeout
        setShowTimeoutWarning(true);
      }
      
      if (timeElapsed > inactivityTimeout) {
        // Log out user after timeout
        handleLogout();
      }
    };
    
    // Add event listeners to reset timer on user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    
    // Check for inactivity every minute
    const interval = setInterval(checkInactivity, 60000);
    
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearInterval(interval);
    };
  }, [lastActivity, inactivityTimeout]);
  
  // Track page views
  useEffect(() => {
    // Track page views in admin area (replace with your analytics service)
    const currentPath = location.pathname;
    console.log(`Admin page view: ${currentPath}`);
    
    // Optional: Track which admin viewed the page
    if (user) {
      console.log(`Admin user: ${user.name} (${user.email})`);
    }
  }, [location.pathname, user]);
  
  // Simulate loading dashboard data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Short timeout for demo purposes
    
    return () => clearTimeout(timer);
  }, []);
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  // Get current page title
  const getCurrentPageTitle = () => {
    const currentNavItem = navItems.find(item => isActive(item.path));
    return currentNavItem ? currentNavItem.label : 'Dashboard';
  };
  
  // Get breadcrumb path segments
  const getBreadcrumbSegments = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return []; // Just /admin
    
    return segments.slice(1); // Remove 'admin' from the path
  };
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-montserrat">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden bg-indigo-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md hover:bg-indigo-700"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
      
      {/* Sidebar */}
      <div 
        id="mobile-menu"
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-64 bg-indigo-800 text-white shadow-lg flex flex-col h-screen`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-6 border-b border-indigo-700 hidden md:block">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        
        <nav className="mt-4 flex-1 overflow-y-auto">
          <ul className="px-2">
            {navItems.map((item) => (
              <SidebarItem
                key={item.path}
                path={item.path}
                icon={item.icon}
                label={item.label}
                isActive={isActive(item.path)}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </ul>
        </nav>
        
        {/* Environment Indicator */}
        <div className="p-4 border-t border-indigo-700">
          <div className="flex items-center">
            <span className={`h-3 w-3 rounded-full ${
              process.env.NODE_ENV === 'production' 
                ? 'bg-green-500' 
                : 'bg-yellow-500'
            }`}></span>
            <span className="ml-2 text-sm text-indigo-200">
              {process.env.NODE_ENV === 'production' 
                ? 'Production' 
                : 'Development'} Environment
            </span>
          </div>
        </div>
        
        {/* User Info in Sidebar (mobile only) */}
        <div className="p-4 border-t border-indigo-700 md:hidden">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-2">
              {user.name.charAt(0)}
            </div>
            <span className="text-indigo-100">{user.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-2 w-full flex items-center text-indigo-100 hover:text-white"
          >
            <FiLogOut className="mr-2" />
            Sign out
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
        <div className="container mx-auto px-6 py-8">
          {/* Header with User Menu */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {getCurrentPageTitle()}
              </h1>
              
              {/* Breadcrumbs */}
              <nav className="text-sm mt-1" aria-label="Breadcrumb">
                <ol className="list-none p-0 inline-flex">
                  <li className="flex items-center">
                    <Link to="/admin" className="text-indigo-600 hover:text-indigo-800">
                      Dashboard
                    </Link>
                    
                    {getBreadcrumbSegments().map((segment, index) => (
                      <li key={segment} className="flex items-center">
                        <span className="mx-2 text-gray-400">/</span>
                        {index === getBreadcrumbSegments().length - 1 ? (
                          <span className="text-gray-700 capitalize">
                            {segment.replace(/-/g, ' ')}
                          </span>
                        ) : (
                          <Link 
                            to={`/admin/${getBreadcrumbSegments().slice(0, index + 1).join('/')}`}
                            className="text-indigo-600 hover:text-indigo-800 capitalize"
                          >
                            {segment.replace(/-/g, ' ')}
                          </Link>
                        )}
                      </li>
                    ))}
                  </li>
                </ol>
              </nav>
            </div>
            
            {/* User Menu - Desktop */}
            <div className="hidden md:block relative user-menu-container">
              <button 
                className="flex items-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <span className="mr-2">{user.name}</span>
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <FiChevronDown className="ml-1" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                  >
                    <FiUser className="mr-2" />
                    Your Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                  >
                    <FiLogOut className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content Area */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64" aria-live="polite">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" role="status">
                <span className="sr-only">Loading dashboard...</span>
              </div>
            </div>
          ) : (
            <Routes>
              <Route index element={<AdminHome />} />
              <Route path="users/*" element={<UserManagement />} />
              <Route path="reporters/*" element={<ReporterManagement />} />
              <Route path="applications/*" element={<ReporterApplications />} />
              <Route path="news/*" element={<NewsManagement />} />
              <Route path="categories/*" element={<CategoryManagement />} />
              <Route path="pages/*" element={<PageManagement />} />
              <Route path="settings/*" element={<SiteSettings />} />
              <Route path="people/*" element={<PeopleManagement />} />
              {/* Advertisement Management Routes */}
              <Route path="advertisements" element={<AdvertisementManagement />} />
              <Route path="advertisements/create" element={<AdvertisementEditor />} />
              <Route path="advertisements/edit/:id" element={<AdvertisementEditor />} />
              <Route path="advertisements/analytics/:id" element={<AdvertisementAnalytics />} />
            </Routes>
          )}
        </div>
      </div>
      
      {/* Session Timeout Warning Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-modal="true" role="dialog">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
            <div className="flex items-center text-amber-500 mb-4">
              <FiClock className="h-6 w-6 mr-2" aria-hidden="true" />
              <h2 className="text-xl font-bold">Session Timeout Warning</h2>
            </div>
            <p className="mb-6 text-gray-600">
              Your session is about to expire due to inactivity. You will be automatically logged out in less than a minute.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
              >
                Logout Now
              </button>
              <button 
                onClick={() => setShowTimeoutWarning(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                autoFocus
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;