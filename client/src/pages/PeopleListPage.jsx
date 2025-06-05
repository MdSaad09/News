// src/pages/EnhancedPeopleListPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiRefreshCw, FiFilter, FiGrid, FiList, FiTrendingUp, FiUsers, FiEye } from 'react-icons/fi';
import { Helmet } from 'react-helmet';
import EnhancedPersonCard from '../components/common/PersonCard';
import personService from '../services/personService';

const PeopleListPage = () => {
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, newsCount, viewCount, recent
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [availableCategories, setAvailableCategories] = useState([]);
  const [followedPeople, setFollowedPeople] = useState(new Set());
  
  useEffect(() => {
    fetchPeople();
    loadFollowedPeople();
  }, []);
  
  useEffect(() => {
    filterAndSortPeople();
  }, [searchTerm, categoryFilter, sortBy, people]);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const data = await personService.getPeople();
      setPeople(data);
      
      // Extract unique categories
      const categories = [...new Set(data.map(person => person.category).filter(Boolean))];
      setAvailableCategories(categories);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching people:', err);
      setError('Failed to load people. Please try again.');
      setLoading(false);
    }
  };

  const loadFollowedPeople = () => {
    // Load from localStorage (in a real app, this would be from your backend)
    const followed = localStorage.getItem('followedPeople');
    if (followed) {
      setFollowedPeople(new Set(JSON.parse(followed)));
    }
  };

  const handleFollow = (person) => {
    const newFollowed = new Set(followedPeople);
    if (newFollowed.has(person.id)) {
      newFollowed.delete(person.id);
    } else {
      newFollowed.add(person.id);
    }
    setFollowedPeople(newFollowed);
    localStorage.setItem('followedPeople', JSON.stringify([...newFollowed]));
  };

  const filterAndSortPeople = () => {
    let results = people;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(person => 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.profession && person.profession.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      results = results.filter(person => person.category === categoryFilter);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'newsCount':
          return (b.newsCount || 0) - (a.newsCount || 0);
        case 'viewCount':
          return (b.viewCount || 0) - (a.viewCount || 0);
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    setFilteredPeople(results);
  };
  
  const handleRetry = () => {
    fetchPeople();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSortBy('name');
  };

  const stats = useMemo(() => {
    const totalPeople = people.length;
    const totalArticles = people.reduce((sum, person) => sum + (person.newsCount || 0), 0);
    const activePeople = people.filter(person => (person.newsCount || 0) > 0).length;
    
    return { totalPeople, totalArticles, activePeople };
  }, [people]);

  const getCategoryColor = (category) => {
    const colors = {
      politician: 'bg-red-100 text-red-800',
      celebrity: 'bg-purple-100 text-purple-800',
      athlete: 'bg-green-100 text-green-800',
      business: 'bg-blue-100 text-blue-800',
      activist: 'bg-orange-100 text-orange-800',
      journalist: 'bg-gray-100 text-gray-800',
      scientist: 'bg-indigo-100 text-indigo-800',
      artist: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  return (
    <>
      <Helmet>
        <title>People & Celebrities | Breaking News</title>
        <meta name="description" content="Browse all people and celebrities featured in our news articles. Follow your favorites and stay updated." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-montserrat">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              People & Celebrities
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Discover and follow the people making headlines
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <Link 
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Back to News
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <FiUsers size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total People</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPeople}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <FiTrendingUp size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active in News</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activePeople}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <FiEye size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalArticles}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or profession..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* Category filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
                >
                  <option value="">All Categories</option>
                  {availableCategories.map((category, index) => (
                    <option key={index} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="newsCount">Most Mentioned</option>
                <option value="viewCount">Most Viewed</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-4">
              {/* Clear filters */}
              {(searchTerm || categoryFilter || sortBy !== 'name') && (
                <button
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear Filters
                </button>
              )}
              
              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Active filters display */}
          {(searchTerm || categoryFilter) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {categoryFilter && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getCategoryColor(categoryFilter)}`}>
                  {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
                  <button
                    onClick={() => setCategoryFilter('')}
                    className="ml-2 hover:opacity-70"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Error state */}
        {error && (
          <div 
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8" 
            role="alert"
            aria-live="assertive"
          >
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={handleRetry}
              className="ml-4 text-red-700 font-semibold hover:text-red-900 focus:outline-none focus:underline"
            >
              <FiRefreshCw className="inline mr-1" />
              Try Again
            </button>
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" role="status">
              <span className="sr-only">Loading people...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Results info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                {filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'} found
                {(searchTerm || categoryFilter) && ' matching your filters'}
              </p>
              
              {followedPeople.size > 0 && (
                <p className="text-sm text-blue-600">
                  Following {followedPeople.size} {followedPeople.size === 1 ? 'person' : 'people'}
                </p>
              )}
            </div>
            
            {/* People display */}
            {filteredPeople.length === 0 ? (
              <div className="bg-gray-100 dark:bg-gray-700 p-12 rounded-lg text-center">
                <FiUsers className="mx-auto text-gray-300 text-5xl mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
                  No people found matching your search criteria.
                </p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredPeople.map(person => (
                  <EnhancedPersonCard
                    key={person.id}
                    person={person}
                    showStats={true}
                    showActions={true}
                    onFollow={handleFollow}
                    isFollowing={followedPeople.has(person.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPeople.map(person => (
                  <EnhancedPersonCard
                    key={person.id}
                    person={person}
                    variant="compact"
                    showStats={true}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Back to top button */}
        {filteredPeople.length > 20 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Back to Top
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default PeopleListPage;