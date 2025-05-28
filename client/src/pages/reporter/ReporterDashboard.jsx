import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiHome, FiFileText, FiPlusCircle, FiBarChart2, 
  FiEdit, FiEye, FiTrash2, FiSearch, FiFilter
} from 'react-icons/fi';

// Import reporter sub-pages (to be created  if needed)

import CreateNews from './CreateNews';
import EditNews from './EditNews';

// Add this import at the top of the file
import { getImageUrl } from '../../utils/imageUtils';

const ReporterDashboard = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Redirect if not reporter or admin
  if (!user || (user.role !== 'reporter' && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }
  
  useEffect(() => {
    const fetchReporterNews = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        
        const response = await axios.get('http://localhost:5000/api/news/reporter/mynews', config);
      setNews(response.data);
      
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch your news articles');
      setLoading(false);
    }
  };
    fetchReporterNews();
  }, [user]);

  const handleDeleteArticle = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      await axios.delete(`http://localhost:5000/api/news/${selectedArticle.id}`, config);

      // Update the local state
      setNews(news.filter(article => article.id !== selectedArticle.id));
      setShowDeleteModal(false);
      setSelectedArticle(null);
      
      toast.success('Article deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const filteredNews = news.filter(article => {
    // Apply search filter
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    let matchesStatus = true;
    if (statusFilter === 'published') {
      matchesStatus = article.isPublished;
    } else if (statusFilter === 'draft') {
      matchesStatus = !article.isPublished;
    }
    
    return matchesSearch && matchesStatus;
  });

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    { path: '/reporter', icon: <FiHome size={20} />, label: 'Dashboard' },
    { path: '/reporter/create', icon: <FiPlusCircle size={20} />, label: 'Create Article' },
    { path: '/reporter/stats', icon: <FiBarChart2 size={20} />, label: 'My Stats' },
  ];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-montserrat">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Reporter Dashboard</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
      
      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-64 bg-gray-800 text-white`}>
        <div className="p-4 hidden md:block">
          <h1 className="text-xl font-bold">Reporter Dashboard</h1>
        </div>
        <nav className="mt-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-1">
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 ${isActive(item.path) ? 'bg-blue-600' : 'hover:bg-gray-700'} transition-colors`}
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
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold mb-6">My Articles</h2>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div className="relative mb-4 md:mb-0 md:w-1/3">
              <input
                type="text"
                placeholder="Search articles..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex space-x-4">
              <div className="relative">
                <select
                  className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <Link
                to="/reporter/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <FiPlusCircle className="mr-2" />
                New Article
              </Link>
            </div>
          </div>
          
          {/* Articles List */}
          {filteredNews.length === 0 ? (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
              No articles found. {searchTerm && 'Try a different search term or'} <Link to="/reporter/create" className="text-blue-600 hover:underline">create a new article</Link>.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredNews.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0">
                      <img 
                        src={getImageUrl(article.coverImage)} 
                        alt={article.title} 
                        className="h-48 w-full md:w-48 object-cover"
                      />
                    </div>
                    <div className="p-6 w-full">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${article.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} mr-2`}>
                              {article.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-sm text-gray-500">{article.category}</span>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{article.title}</h3>
                          <p className="text-gray-600 mb-4">{article.summary}</p>
                          <div className="text-sm text-gray-500">
                            {article.isPublished ? (
                              <div className="flex items-center space-x-4">
                                <span>Published: {new Date(article.publishedAt).toLocaleDateString()}</span>
                                <span className="flex items-center">
                                  <FiEye className="mr-1" />
                                  {article.views} views
                                </span>
                              </div>
                            ) : (
                              <span>Created: {new Date(article.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4 md:mt-0">
                          <Link 
                            to={`/news/${article.id}`} 
                            
                            className="p-2 text-indigo-600 hover:text-indigo-900"
                          >
                            <FiEye size={20} />
                          </Link>
                          <Link 
                            to={`/reporter/edit/${article.id}`}
                            className="p-2 text-blue-600 hover:text-blue-900"
                          >
                            <FiEdit size={20} />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedArticle(article);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                <p className="mb-6">Are you sure you want to delete the article "{selectedArticle.title}"? This action cannot be undone.</p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteArticle}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporterDashboard;