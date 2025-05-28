import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTrendingUp, FiEye, FiRefreshCw } from 'react-icons/fi';
import NewsCard from '../components/common/NewsCard';
import newsService from '../services/newsService';
import { getImageUrl } from '../utils/imageUtils'; // Add this import

const HomePage = () => {
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to extract category name
  const getCategoryName = (category) => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    if (typeof category === 'object') return category.name || category.slug || 'Uncategorized';
    return 'Uncategorized';
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use your news service instead of direct axios call
      const data = await newsService.getAllNews();
      
      if (data.news && data.news.length > 0) {
        // Set featured news (most recent)
        setFeaturedNews(data.news[0]);

        // Set trending news (most viewed, up to 4)
        const sortedByViews = [...data.news]
          .sort((a, b) => b.views - a.views)
          .slice(0, 4);
        setTrendingNews(sortedByViews);

        // Set remaining news
        setNews(data.news.slice(1));
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Optional: Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchNews();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  return (
    <div className="space-y-12 font-montserrat">
      {/* Page header with refresh button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Breaking News</h1>
        <button 
          onClick={handleRefresh} 
          disabled={loading || refreshing}
          className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none"
          aria-label="Refresh news"
        >
          <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div 
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" 
          role="alert"
          aria-live="assertive"
        >
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={handleRefresh}
            className="ml-4 text-red-700 font-semibold hover:text-red-900"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No news available message */}
      {!loading && !error && !featuredNews && news.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Breaking News</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">No news articles available yet. Check back later for the latest updates from around the world.</p>
        </div>
      )}

      {/* Hero Section with Featured News */}
      {!loading && featuredNews && (
        <div className="relative h-[500px] rounded-2xl overflow-hidden">
          {/* Accessible image with fallback */}
          <img 
            src={getImageUrl(featuredNews.coverImage)} 
            alt={featuredNews.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/news-placeholder.jpg"; // Add a placeholder image
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white mb-4">
               {featuredNews.category?.name || featuredNews.category || 'Uncategorized'}
            </span>
            <h2 className="text-4xl font-bold text-white mb-4">{featuredNews.title}</h2>
            <p className="text-gray-200 mb-6 max-w-3xl">{featuredNews.summary}</p>
            <Link 
              to={`/news/${featuredNews.id}`} 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              aria-label={`Read full story: ${featuredNews.title}`}
            >
              Read Full Story
              <FiArrowRight className="ml-2" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
      
      {/* Trending News Section */}
      {!loading && trendingNews.length > 0 && (
        <section aria-labelledby="trending-heading">
          <div className="flex items-center mb-6">
            <FiTrendingUp className="text-orange-500 text-2xl mr-2" aria-hidden="true" />
            <h2 id="trending-heading" className="text-2xl font-bold text-gray-800">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingNews.map((article) => (
              <article key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                <Link 
                  to={`/news/${article.id}`} 
                  className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                >
                  <img 
                    src={article.coverImage} 
                    alt="" // Decorative image, title is in heading
                    className="w-full h-40 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/news-placeholder.jpg";
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">{article.title}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="flex items-center">
                        <FiEye className="mr-1" aria-hidden="true" />
                        <span aria-label={`${article.views} views`}>{article.views} views</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
      
      {/* Latest News Section */}
      {!loading && news.length > 0 && (
        <section aria-labelledby="latest-heading">
          <h2 id="latest-heading" className="text-2xl font-bold text-gray-800 mb-6">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
            {/* Categories Section */}
            <section aria-labelledby="categories-heading" className="py-12">
        <h2 id="categories-heading" className="text-2xl font-bold text-gray-800 mb-8 text-center">Browse News by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['politics', 'technology', 'sports', 'entertainment', 'business', 'health', 'science', 'other'].map((category) => (
            <Link 
              key={category} 
              to={`/category/${category}`}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg p-6 text-center transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Browse ${category} news`}
            >
              <h3 className="text-xl font-bold capitalize">{category}</h3>
            </Link>
          ))}
        </div>
      </section>
      
    </div>
  );
};

export default HomePage;