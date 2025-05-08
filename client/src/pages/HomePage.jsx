import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowRight, FiTrendingUp, FiEye } from 'react-icons/fi';
import NewsCard from '../components/common/NewsCard';

const HomePage = () => {
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/news');

        if (response.data.news && response.data.news.length > 0) {
          // Set featured news (most recent)
          setFeaturedNews(response.data.news[0]);

          // Set trending news (most viewed, up to 4)
          const sortedByViews = [...response.data.news].sort((a, b) => b.views - a.views).slice(0, 4);
          setTrendingNews(sortedByViews);

          // Set remaining news
          setNews(response.data.news.slice(1));
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch news');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-montserrat">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-montserrat" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // If no news articles are available yet
  if (!featuredNews && news.length === 0) {
    return (
      <div className="text-center py-20 font-montserrat">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Breaking News</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">No news articles available yet. Check back later for the latest updates from around the world.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 font-montserrat">
      {/* Hero Section with Featured News */}
      {featuredNews && (
        <div className="relative h-[500px] rounded-2xl overflow-hidden">
          <img 
            src={featuredNews.coverImage} 
            alt={featuredNews.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white mb-4">
              {featuredNews.category}
            </span>
            <h1 className="text-4xl font-bold text-white mb-4">{featuredNews.title}</h1>
            <p className="text-gray-200 mb-6 max-w-3xl">{featuredNews.summary}</p>
            <Link 
              to={`/news/${featuredNews._id}`} 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Read Full Story
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      )}
      
      {/* Trending News Section */}
      {trendingNews.length > 0 && (
        <div>
          <div className="flex items-center mb-6">
            <FiTrendingUp className="text-orange-500 text-2xl mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingNews.map((article) => (
              <div key={article._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                <Link to={`/news/${article._id}`} className="block">
                  <img 
                    src={article.coverImage} 
                    alt={article.title} 
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">{article.title}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="flex items-center">
                        <FiEye className="mr-1" />
                        {article.views} views
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Latest News Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article) => (
            <NewsCard key={article._id} article={article} />
          ))}
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Browse News by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['politics', 'technology', 'sports', 'entertainment', 'business', 'health', 'science', 'other'].map((category) => (
            <Link 
              key={category} 
              to={`/category/${category}`}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg p-6 text-center transform hover:-translate-y-1 transition-all duration-300"
            >
              <h3 className="text-xl font-bold capitalize">{category}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;