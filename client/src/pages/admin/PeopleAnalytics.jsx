    // src/components/admin/PeopleAnalytics.jsx
import { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiFileText, FiEye, FiAward, FiBarChart2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import EnhancedPersonCard from '../../components/common/PersonCard';
import personService from '../../services/personService';

const PeopleAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalPeople: 0,
    totalArticles: 0,
    totalViews: 0,
    trendingPeople: [],
    topCategories: [],
    recentlyAdded: [],
    mostMentioned: []
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7d'); // 7d, 30d, 90d, all

  useEffect(() => {
    fetchAnalytics();
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch people data
      const people = await personService.getPeople();
      
      // Calculate analytics
      const totalPeople = people.length;
      const totalArticles = people.reduce((sum, person) => sum + (person.newsCount || 0), 0);
      const totalViews = people.reduce((sum, person) => sum + (person.viewCount || 0), 0);
      
      // Sort by news count for trending
      const trendingPeople = people
        .filter(person => person.newsCount > 0)
        .sort((a, b) => (b.newsCount || 0) - (a.newsCount || 0))
        .slice(0, 6);
      
      // Most mentioned (by news count)
      const mostMentioned = people
        .sort((a, b) => (b.newsCount || 0) - (a.newsCount || 0))
        .slice(0, 10);
      
      // Category distribution
      const categoryCount = {};
      people.forEach(person => {
        const cat = person.category || 'other';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      
      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
      
      // Recently added (assuming createdAt field exists)
      const recentlyAdded = people
        .filter(person => person.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setAnalytics({
        totalPeople,
        totalArticles,
        totalViews,
        trendingPeople,
        topCategories,
        recentlyAdded,
        mostMentioned
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  };

  const CategoryChart = ({ categories }) => {
    const maxCount = Math.max(...categories.map(cat => cat.count));
    
    return (
      <div className="space-y-3">
        {categories.slice(0, 8).map(({ category, count }) => (
          <div key={category} className="flex items-center">
            <div className="w-20 text-sm text-gray-600 capitalize">{category}</div>
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-8 text-sm font-medium text-gray-900">{count}</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">People Analytics</h1>
          <p className="text-gray-600">Insights into your people and celebrity content</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          
          <Link
            to="/admin/people/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add Person
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiUsers}
          title="Total People"
          value={analytics.totalPeople}
          subtitle="Registered people"
          color="blue"
        />
        <StatCard
          icon={FiFileText}
          title="Total Articles"
          value={analytics.totalArticles}
          subtitle="Articles mentioning people"
          color="green"
        />
        <StatCard
          icon={FiEye}
          title="Total Views"
          value={analytics.totalViews}
          subtitle="Profile page views"
          color="purple"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Trending People"
          value={analytics.trendingPeople.length}
          subtitle="Active in news"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending People */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trending People</h2>
            <FiTrendingUp className="text-orange-500" />
          </div>
          
          {analytics.trendingPeople.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.trendingPeople.map(person => (
                <EnhancedPersonCard
                  key={person.id}
                  person={person}
                  variant="compact"
                  showStats={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiUsers className="mx-auto text-gray-300 text-3xl mb-2" />
              <p>No trending people yet</p>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            <FiBarChart2 className="text-blue-500" />
          </div>
          
          <CategoryChart categories={analytics.topCategories} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Mentioned People */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Most Mentioned</h2>
            <FiAward className="text-yellow-500" />
          </div>
          
          <div className="space-y-3">
            {analytics.mostMentioned.slice(0, 8).map((person, index) => (
              <div key={person.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mr-3">
                  {index + 1}
                </div>
                
                <img
                  src={person.image || '/images/person-placeholder.jpg'}
                  alt={person.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/people/${person.slug || person.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {person.name}
                  </Link>
                  <p className="text-sm text-gray-500">{person.profession}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {person.newsCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">articles</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recently Added</h2>
            <FiUsers className="text-green-500" />
          </div>
          
          <div className="space-y-3">
            {analytics.recentlyAdded.length > 0 ? (
              analytics.recentlyAdded.map(person => (
                <div key={person.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                  <img
                    src={person.image || '/images/person-placeholder.jpg'}
                    alt={person.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/people/${person.slug || person.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {person.name}
                    </Link>
                    <p className="text-sm text-gray-500">{person.profession}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {person.createdAt && new Date(person.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiUsers className="mx-auto text-gray-300 text-3xl mb-2" />
                <p>No recent additions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeopleAnalytics;