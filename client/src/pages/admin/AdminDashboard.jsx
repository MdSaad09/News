import { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FiHome, FiUsers, FiFileText, FiSettings, FiTag, 
  FiGrid, FiUserCheck, FiAlertTriangle, FiBarChart2 
} from 'react-icons/fi';

// Import admin sub-pages
import AdminHome from './AdminHome';
import UserManagement from './UserManagement';
import ReporterManagement from './ReporterManagement';
import ReporterApplications from './ReporterApplications';
import NewsManagement from './NewsManagement';
import CategoryManagement from './CategoryManagement';
import SiteSettings from './SiteSettings';
import PageManagement from './PageManagement';

const AdminDashboard = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    { path: '/admin', icon: <FiHome size={20} />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FiUsers size={20} />, label: 'User Management' },
    { path: '/admin/reporters', icon: <FiUserCheck size={20} />, label: 'Reporter Management' },
    { path: '/admin/applications', icon: <FiAlertTriangle size={20} />, label: 'Reporter Applications' },
    { path: '/admin/news', icon: <FiFileText size={20} />, label: 'News Management' },
    { path: '/admin/categories', icon: <FiTag size={20} />, label: 'Categories' },
    { path: '/admin/pages', icon: <FiGrid size={20} />, label: 'Page Management' },
    { path: '/admin/settings', icon: <FiSettings size={20} />, label: 'Site Settings' },
  ];
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-montserrat">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden bg-indigo-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md hover:bg-indigo-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
      
      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-64 bg-indigo-800 text-white shadow-lg`}>
        <div className="p-6 border-b border-indigo-700 hidden md:block">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="mt-4">
          <ul className="px-2">
            {navItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg ${isActive(item.path) ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'} transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
        <div className="container mx-auto px-6 py-8">
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="users/*" element={<UserManagement />} />
            <Route path="reporters/*" element={<ReporterManagement />} />
            <Route path="applications/*" element={<ReporterApplications />} />
            <Route path="news/*" element={<NewsManagement />} />
            <Route path="categories/*" element={<CategoryManagement />} />
            <Route path="pages/*" element={<PageManagement />} />
            <Route path="settings/*" element={<SiteSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;