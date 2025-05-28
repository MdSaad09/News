// src/pages/VideoNewsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiVideo, FiRefreshCw } from 'react-icons/fi';
import { Helmet } from 'react-helmet';
import NewsCard from '../components/common/NewsCard';

// Assuming you'll create this service function later
import newsService from '../services/newsService';

const VideoNewsPage = () => {
  const [videoNews, setVideoNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const fetchVideoNews = async () => {
      try {
        setLoading(true);
        const data = await newsService.getVideoNews(page);
        setVideoNews(data.items || data);
        setTotalPages(data.pagination?.totalPages || 1);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching video news:', err);
        setError('Failed to load video news. Please try again.');
        setLoading(false);
      }
    };
    
    fetchVideoNews();
    window.scrollTo(0, 0);
  }, [page]);
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  const handleRetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await newsService.getVideoNews(page);
      setVideoNews(data.items || data);
      setTotalPages(data.pagination?.totalPages || 1);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching video news:', err);
      setError('Failed to load video news. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Video News | Breaking News</title>
        <meta name="description" content="Browse all news articles with video content." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-montserrat">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center">
            <FiVideo className="text-red-600 text-3xl mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Video News</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Browse all news articles with video content
              </p>
            </div>
          </div>
          
          <Link 
            to="/"
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to All News
          </Link>
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
              <span className="sr-only">Loading video news...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Video News Grid */}
            {videoNews.length === 0 ? (
              <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-300">No video news articles found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoNews.map(article => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
                
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
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default VideoNewsPage;