// src/pages/admin/AdminHome.jsx - Updated with Advertisement section
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FiUsers, FiFileText, FiUserCheck, FiAlertTriangle, 
  FiEye, FiTag, FiRefreshCw, FiActivity, FiTrendingUp, 
  FiUser, FiVideo, FiTarget  // Added FiTarget for advertisements
} from 'react-icons/fi';
import adminService from '../../services/adminService';

// [Previous StatCard and ActivityItem components remain the same...]
const StatCard = ({ icon, title, value, bgColor, textColor, linkTo, trend }) => (
  <Link 
    to={linkTo} 
    className="block rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    aria-label={`View ${title.toLowerCase()}: ${value}`}
  >
    <div className={`${bgColor} p-6`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${textColor} bg-white bg-opacity-30 mr-4`} aria-hidden="true">
          {icon}
        </div>
        <div>
          <p className="text-white text-sm">{title}</p>
          <div className="flex items-center">
            <h3 className="text-white text-2xl font-bold">{value}</h3>
            {trend && (
              <span className={`ml-2 flex items-center text-sm ${trend > 0 ? 'text-green-300' : 'text-red-300'}`}>
                <FiTrendingUp className={`${trend < 0 && 'transform rotate-180'} mr-1`} />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </Link>
);

const ActivityItem = ({ activity }) => {
  const getBorderColor = (type) => {
    switch (type) {
      case 'article': return 'border-blue-500';
      case 'application': return 'green-500';
      case 'registration': return 'border-orange-500';
      case 'advertisement': return 'border-purple-500'; // New activity type
      default: return 'border-gray-500';
    }
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const getMessage = () => {
    switch (activity.type) {
      case 'article':
        return (
          <p className="text-gray-800">
            New article <span className="font-medium">{activity.title}</span> submitted by <span className="font-medium">{activity.user}</span>
          </p>
        );
      case 'application':
        return (
          <p className="text-gray-800">
            New reporter application from <span className="font-medium">{activity.user}</span>
          </p>
        );
      case 'registration':
        return (
          <p className="text-gray-800">
            New user registered: <span className="font-medium">{activity.user}</span>
          </p>
        );
      case 'advertisement':
        return (
          <p className="text-gray-800">
            New advertisement <span className="font-medium">{activity.title}</span> created
          </p>
        );
      default:
        return <p className="text-gray-800">Unknown activity</p>;
    }
  };

  return (
    <div className={`border-l-4 ${getBorderColor(activity.type)} pl-4 py-2 hover:bg-gray-50 rounded-r`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600">{formatRelativeTime(activity.timestamp)}</p>
          {getMessage()}
        </div>
        {activity.type === 'article' && (
          <Link 
            to={`/admin/news/edit/${activity.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm ml-2"
          >
            View
          </Link>
        )}
        {activity.type === 'application' && (
          <Link 
            to={`/admin/applications/${activity.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm ml-2"
          >
            Review
          </Link>
        )}
        {activity.type === 'advertisement' && (
          <Link 
            to={`/admin/advertisements/edit/${activity.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm ml-2"
          >
            Edit
          </Link>
        )}
      </div>
    </div>
  );
};

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReporters: 0,
    totalArticles: 0,
    pendingArticles: 0,
    pendingApplications: 0,
    recentViews: 0,
    totalPeople: 0,
    videoNews: 0,
    totalAdvertisements: 0, // New stat
    activeAdvertisements: 0, // New stat
    recentActivity: [],
    trends: {
      users: 0,
      articles: 5,
      views: 12,
      advertisements: 0 // New trend
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAdminStats();
      setStats(data);
    } catch (error) {
      setError('Failed to fetch statistics: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(() => {
      fetchStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" role="status">
          <span className="sr-only">Loading dashboard stats...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <button 
          onClick={handleRefresh} 
          className={`flex items-center text-blue-600 hover:text-blue-800 focus:outline-none focus:underline ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={refreshing}
          aria-label="Refresh dashboard data"
        >
          <FiRefreshCw className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert" aria-live="assertive">
          <div className="flex items-center">
            <FiAlertTriangle className="mr-2" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button 
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium focus:outline-none focus:underline"
          >
            Try Again
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<FiUsers size={24} />}
          title="Total Users"
          value={stats.totalUsers}
          bgColor="bg-blue-600"
          textColor="text-blue-600"
          linkTo="/admin/users"
          trend={stats.trends?.users}
        />
        
        <StatCard 
          icon={<FiUserCheck size={24} />}
          title="Total Reporters"
          value={stats.totalReporters}
          bgColor="bg-green-600"
          textColor="text-green-600"
          linkTo="/admin/reporters"
        />
        
        <StatCard 
          icon={<FiFileText size={24} />}
          title="Total Articles"
          value={stats.totalArticles}
          bgColor="bg-purple-600"
          textColor="text-purple-600"
          linkTo="/admin/news"
          trend={stats.trends?.articles}
        />
        
        <StatCard 
          icon={<FiFileText size={24} />}
          title="Pending Articles"
          value={stats.pendingArticles}
          bgColor={stats.pendingArticles > 10 ? "bg-red-600" : "bg-yellow-600"}
          textColor={stats.pendingArticles > 10 ? "text-red-600" : "text-yellow-600"}
          linkTo="/admin/news?status=pending"
        />
        
        <StatCard 
          icon={<FiAlertTriangle size={24} />}
          title="Pending Applications"
          value={stats.pendingApplications}
          bgColor={stats.pendingApplications > 5 ? "bg-orange-600" : "bg-orange-500"}
          textColor={stats.pendingApplications > 5 ? "text-orange-600" : "text-orange-500"}
          linkTo="/admin/applications"
        />
        
        <StatCard 
          icon={<FiEye size={24} />}
          title="Recent Views"
          value={stats.recentViews}
          bgColor="bg-indigo-600"
          textColor="text-indigo-600"
          linkTo="/admin/analytics"
          trend={stats.trends?.views}
        />

        <StatCard 
          icon={<FiUser size={24} />}
          title="Featured People"
          value={stats.totalPeople || 0}
          bgColor="bg-teal-600"
          textColor="text-teal-600"
          linkTo="/admin/people"
        />

        <StatCard 
          icon={<FiVideo size={24} />}
          title="Video News"
          value={stats.videoNews || 0}
          bgColor="bg-red-600"
          textColor="text-red-600"
          linkTo="/admin/news?video=true"
        />

        {/* New Advertisement Stats */}
        <StatCard 
          icon={<FiTarget size={24} />}
          title="Total Advertisements"
          value={stats.totalAdvertisements || 0}
          bgColor="bg-pink-600"
          textColor="text-pink-600"
          linkTo="/admin/advertisements"
          trend={stats.trends?.advertisements}
        />

        <StatCard 
          icon={<FiTarget size={24} />}
          title="Active Advertisements"
          value={stats.activeAdvertisements || 0}
          bgColor="bg-emerald-600"
          textColor="text-emerald-600"
          linkTo="/admin/advertisements?status=active"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiActivity className="mr-2 text-blue-600" aria-hidden="true" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/admin/news/create" 
              className="bg-blue-100 text-blue-700 p-4 rounded-lg hover:bg-blue-200 transition-colors flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Create new article"
            >
              <FiFileText className="mb-2" size={24} aria-hidden="true" />
              <span>Create Article</span>
            </Link>
            
            <Link 
              to="/admin/users/create" 
              className="bg-green-100 text-green-700 p-4 rounded-lg hover:bg-green-200 transition-colors flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Add new user"
            >
              <FiUsers className="mb-2" size={24} aria-hidden="true" />
              <span>Add User</span>
            </Link>
            
            <Link 
              to="/admin/categories/create" 
              className="bg-purple-100 text-purple-700 p-4 rounded-lg hover:bg-purple-200 transition-colors flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Add new category"
            >
              <FiTag className="mb-2" size={24} aria-hidden="true" />
              <span>Add Category</span>
            </Link>
            
            <Link 
              to="/admin/people/create" 
              className="bg-indigo-100 text-indigo-700 p-4 rounded-lg hover:bg-indigo-200 transition-colors flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Add new person"
            >
              <FiUser className="mb-2" size={24} aria-hidden="true" />
              <span>Add Person</span>
            </Link>
            
            <Link 
              to="/admin/applications" 
              className="bg-orange-100 text-orange-700 p-4 rounded-lg hover:bg-orange-200 transition-colors flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Review reporter applications"
            >
              <FiAlertTriangle className="mb-2" size={24} aria-hidden="true" />
              <span>Review Applications</span>
              {stats.pendingApplications > 0 && (
                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
                  {stats.pendingApplications}
                </span>
              )}
            </Link>
            
            <Link 
              to="/videos" 
              className="bg-red-100 text-red-700 p-4 rounded-lg hover:bg-red-200 transition-colors flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Browse video news"
            >
              <FiVideo className="mb-2" size={24} aria-hidden="true" />
              <span>Video News</span>
            </Link>

            {/* New Advertisement Quick Actions */}
            <Link 
              to="/admin/advertisements/create" 
              className="bg-pink-100 text-pink-700 p-4 rounded-lg hover:bg-pink-200 transition-colors flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-pink-500"
              aria-label="Create new advertisement"
            >
              <FiTarget className="mb-2" size={24} aria-hidden="true" />
              <span>Create Ad</span>
            </Link>
            
            <Link 
              to="/admin/advertisements" 
              className="bg-emerald-100 text-emerald-700 p-4 rounded-lg hover:bg-emerald-200 transition-colors flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Manage advertisements"
            >
              <FiTarget className="mb-2" size={24} aria-hidden="true" />
              <span>Manage Ads</span>
              {stats.totalAdvertisements > 0 && (
                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500 text-white">
                  {stats.totalAdvertisements}
                </span>
              )}
            </Link>
          </div>
        </div>
        
        {/* Recent Activity Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiActivity className="mr-2 text-indigo-600" aria-hidden="true" />
            Recent Activity
          </h3>
          
          {refreshing && (
            <div className="flex justify-center items-center py-4" aria-live="polite">
              <div className="animate-pulse text-gray-400">Updating activity...</div>
            </div>
          )}
          
          {!refreshing && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FiActivity className="mx-auto h-10 w-10 text-gray-400 mb-2" aria-hidden="true" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          )}
          
          {stats.recentActivity && stats.recentActivity.length > 0 && (
            <div className="mt-4 text-right">
              <Link 
                to="/admin/activity" 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                View all activity →
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Add custom CSS for scrollbar */}
      <style jsx='true'>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
      `}</style>
    </div>
  );
};

export default AdminHome;