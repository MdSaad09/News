// src/pages/PeopleListPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiRefreshCw, FiFilter } from 'react-icons/fi';
import { Helmet } from 'react-helmet';
import PersonCard from '../components/common/PersonCard';

// Assuming you'll create this service function later
import personService from '../services/personService';

const PeopleListPage = () => {
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');
  const [availableProfessions, setAvailableProfessions] = useState([]);
  
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        const data = await personService.getPeople();
        setPeople(data);
        setFilteredPeople(data);
        
        // Extract unique professions for filter
        const professions = [...new Set(data.map(person => person.profession).filter(Boolean))];
        setAvailableProfessions(professions);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching people:', err);
        setError('Failed to load people. Please try again.');
        setLoading(false);
      }
    };
    
    fetchPeople();
  }, []);
  
  useEffect(() => {
    // Filter people based on search term and profession
    let results = people;
    
    if (searchTerm) {
      results = results.filter(person => 
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (professionFilter) {
      results = results.filter(person => 
        person.profession === professionFilter
      );
    }
    
    setFilteredPeople(results);
  }, [searchTerm, professionFilter, people]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleProfessionChange = (e) => {
    setProfessionFilter(e.target.value);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setProfessionFilter('');
  };
  
  const handleRetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await personService.getPeople();
      setPeople(data);
      setFilteredPeople(data);
      
      // Extract unique professions for filter
      const professions = [...new Set(data.map(person => person.profession).filter(Boolean))];
      setAvailableProfessions(professions);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching people:', err);
      setError('Failed to load people. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>People & Celebrities | Breaking News</title>
        <meta name="description" content="Browse all people and celebrities featured in our news articles." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-montserrat">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">People & Celebrities</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Browse all the people featured in our news articles
            </p>
          </div>
          
          <Link 
            to="/"
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to News
          </Link>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            {/* Profession filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
              </div>
              <select
                value={professionFilter}
                onChange={handleProfessionChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Professions</option>
                {availableProfessions.map((profession, index) => (
                  <option key={index} value={profession}>{profession}</option>
                ))}
              </select>
            </div>
            
            {/* Clear filters button */}
            <button
              onClick={handleClearFilters}
              disabled={!searchTerm && !professionFilter}
              className={`px-4 py-2 rounded-md ${
                !searchTerm && !professionFilter
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              Clear Filters
            </button>
          </div>
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
            {/* Results count */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'} found
              {(searchTerm || professionFilter) && ' matching your filters'}
            </p>
            
            {/* People grid */}
            {filteredPeople.length === 0 ? (
              <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-300">No people found matching your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredPeople.map(person => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PeopleListPage;