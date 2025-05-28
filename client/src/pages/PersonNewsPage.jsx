// src/pages/PersonNewsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiUser, FiRefreshCw, FiCalendar, FiLink } from 'react-icons/fi';
import { Helmet } from 'react-helmet';
import NewsCard from '../components/common/NewsCard';

// Assuming you'll create these service functions later
import personService from '../services/personService';

const PersonNewsPage = () => {
  const { slug } = useParams();
  const [person, setPerson] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const fetchPersonAndNews = async () => {
      try {
        setLoading(true);
        
        // First get the person details
        const personData = await personService.getPersonById(slug);
        setPerson(personData);
        
        // Then get their news
        const newsData = await personService.getNewsByPerson(personData.id, page);
        setNews(newsData.items || newsData);
        setTotalPages(newsData.pagination?.totalPages || 1);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching person data:', err);
        setError('Failed to load person data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchPersonAndNews();
    window.scrollTo(0, 0);
  }, [slug, page]);
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Re-fetch data
    const fetchPersonAndNews = async () => {
      try {
        // First get the person details
        const personData = await personService.getPersonById(slug);
        setPerson(personData);
        
        // Then get their news
        const newsData = await personService.getNewsByPerson(personData.id, page);
        setNews(newsData.items || newsData);
        setTotalPages(newsData.pagination?.totalPages || 1);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching person data:', err);
        setError('Failed to load person data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchPersonAndNews();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-montserrat" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" role="status">
          <span className="sr-only">Loading person profile...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div 
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-montserrat" 
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
    );
  }
  
  if (!person) {
    return (
      <div className="text-center py-10 font-montserrat">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Person Not Found</h1>
        <p className="text-gray-600 mb-6">The person you're looking for doesn't exist or has been removed.</p>
        <Link 
          to="/people" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Browse All People
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{person.name} | Breaking News</title>
        <meta name="description" content={person.description || `News related to ${person.name}`} />
        <meta property="og:title" content={`${person.name} | Breaking News`} />
        <meta property="og:description" content={person.description || `News related to ${person.name}`} />
        <meta property="og:image" content={person.image} />
        <meta property="og:type" content="profile" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-montserrat">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center">
            <li className="flex items-center">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center">
              <Link to="/people" className="hover:text-blue-600">People</Link>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-700" aria-current="page">
              {person.name}
            </li>
          </ol>
        </nav>
        
        {/* Person Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-10">
          <div className="md:flex">
            <div className="md:flex-shrink-0 md:w-1/3">
              <img 
                className="h-80 w-full object-cover md:h-full" 
                src={person.image} 
                alt={person.name}
              />
            </div>
            <div className="p-8 md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{person.name}</h1>
              
              {person.profession && (
                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                  <FiUser className="mr-2" />
                  <span className="text-lg">{person.profession}</span>
                </div>
              )}
              
              {person.birthDate && (
                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                  <FiCalendar className="mr-2" />
                  <span>Born: {new Date(person.birthDate).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}</span>
                </div>
              )}
              
              {person.website && (
                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                  <FiLink className="mr-2" />
                  <a 
                    href={person.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Official Website
                  </a>
                </div>
              )}
              
              {person.description && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">About</h2>
                  <p className="text-gray-600 dark:text-gray-300">{person.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* News Articles Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Latest News about {person.name}
          </h2>
          
          {Array.isArray(news) && news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-300">No news articles found for {person?.name}.</p>
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <nav className="flex items-center" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`mx-1 px-3 py-2 rounded-md ${
                    page === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`mx-1 px-3 py-2 rounded-md ${
                    page === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`mx-1 px-3 py-2 rounded-md ${
                  page === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  </>
);
};

export default PersonNewsPage;