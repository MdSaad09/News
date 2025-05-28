import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FiFileText, FiEye, FiBarChart2, FiTrendingUp, FiCalendar } from 'react-icons/fi';

const ReporterStats = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        
        // Fetch real data from the API
        const response = await axios.get(`http://localhost:5000/api/news/reporter/stats?timeRange=${timeRange}`, config);
        
        // Process the API response
        const apiData = response.data;
        
        // Create a more complete stats object by combining API data with additional calculated fields
        const enhancedStats = {
          totalArticles: apiData.totalArticles || 0,
          publishedArticles: apiData.publishedArticles || 0,
          pendingArticles: apiData.pendingArticles || 0,
          totalViews: apiData.totalViews || 0,
          avgViewsPerArticle: apiData.totalArticles > 0 ? Math.round(apiData.totalViews / apiData.totalArticles) : 0,
          mostViewedArticle: apiData.topArticles && apiData.topArticles.length > 0 ? apiData.topArticles[0] : null,
          
          // Generate category breakdown from top articles if available
          categoryBreakdown: generateCategoryBreakdown(apiData.topArticles || []),
          
          // Generate monthly data (this would ideally come from the API)
          monthlyArticles: generateMonthlyData(apiData.topArticles || []),
          
          // Use top articles as recent articles
          recentArticles: apiData.topArticles || []
        };
        
        setStats(enhancedStats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to fetch statistics. Please try again later.');
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, timeRange]);
  
  // Helper function to generate category breakdown from articles
  const generateCategoryBreakdown = (articles) => {
    const categories = {};
    
    articles.forEach(article => {
      if (article.category) {
        if (categories[article.category]) {
          categories[article.category]++;
        } else {
          categories[article.category] = 1;
        }
      }
    });
    
    return Object.entries(categories).map(([category, count]) => ({
      category,
      count
    }));
  };
  
  // Helper function to generate monthly data
  const generateMonthlyData = (articles) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthCounts = months.map(month => ({ month, count: 0 }));
    
    articles.forEach(article => {
      if (article.createdAt || article.publishedAt) {
        const date = new Date(article.publishedAt || article.createdAt);
        const monthIndex = date.getMonth();
        monthCounts[monthIndex].count++;
      }
    });
    
    return monthCounts;
  };
  
  const StatCard = ({ icon, title, value, bgColor }) => (
    <div className={`${bgColor} rounded-lg shadow-md p-6`}>
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-white bg-opacity-30 mr-4 text-white">
          {icon}
        </div>
        <div>
          <p className="text-white text-sm">{title}</p>
          <h3 className="text-white text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
  
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
  
  // If no stats are available yet
  if (!stats) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">No statistics available yet. Start creating news articles to see your stats!</span>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">My Statistics</h2>
        
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${timeRange === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setTimeRange('year')}
          >
            This Year
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setTimeRange('month')}
          >
            This Month
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setTimeRange('week')}
          >
            This Week
          </button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<FiFileText size={24} />}
          title="Total Articles"
          value={stats.totalArticles}
          bgColor="bg-blue-600"
        />
        
        <StatCard 
          icon={<FiFileText size={24} />}
          title="Published Articles"
          value={stats.publishedArticles}
          bgColor="bg-green-600"
        />
        
        <StatCard 
          icon={<FiFileText size={24} />}
          title="Pending Articles"
          value={stats.pendingArticles}
          bgColor="bg-yellow-600"
        />
        
        <StatCard 
          icon={<FiEye size={24} />}
          title="Total Views"
          value={stats.totalViews}
          bgColor="bg-purple-600"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Most Viewed Article */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiTrendingUp className="mr-2 text-blue-600" />
            Most Viewed Article
          </h3>
          
          {stats.mostViewedArticle ? (
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-medium text-lg">{stats.mostViewedArticle.title}</h4>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <span className="flex items-center mr-4">
                  <FiEye className="mr-1" />
                  {stats.mostViewedArticle.views || 0} views
                </span>
                <span className="flex items-center">
                  <FiCalendar className="mr-1" />
                  Published: {new Date(stats.mostViewedArticle.publishedAt || stats.mostViewedArticle.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No published articles yet.</p>
          )}
        </div>
        
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiBarChart2 className="mr-2 text-blue-600" />
            Category Breakdown
          </h3>
          
          {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
            <div className="space-y-4">
              {stats.categoryBreakdown.map((item) => (
                <div key={item.category} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{item.category}</span>
                    <span className="text-sm font-medium text-gray-700">{item.count} articles</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(item.count / stats.totalArticles) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No category data available.</p>
          )}
        </div>
      </div>
      
      {/* Monthly Articles Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <FiBarChart2 className="mr-2 text-blue-600" />
          Monthly Articles
        </h3>
        
        <div className="h-64 flex items-end justify-between">
          {stats.monthlyArticles && stats.monthlyArticles.map((item) => {
            const maxCount = Math.max(...stats.monthlyArticles.map(i => i.count));
            return (
              <div key={item.month} className="flex flex-col items-center">
                <div 
                  className="bg-blue-600 w-8 rounded-t-md" 
                  style={{ 
                    height: `${item.count && maxCount > 0 ? (item.count / maxCount * 180) : 0}px`,
                    minHeight: item.count ? '20px' : '0'
                  }}
                ></div>
                <span className="text-xs mt-2">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiFileText className="mr-2 text-blue-600" />
          Recent Articles
        </h3>
        
        {stats.recentArticles && stats.recentArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentArticles.map((article) => (
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{article.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${article.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {article.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.views || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No articles available.</p>
        )}
      </div>
    </div>
  );
};

export default ReporterStats;