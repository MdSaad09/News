import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiUsers, FiFileText, FiUserCheck, FiAlertTriangle, FiEye, FiTag } from 'react-icons/fi';
import adminService from '../../services/adminService';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReporters: 0,
    totalArticles: 0,
    pendingArticles: 0,
    pendingApplications: 0,
    recentViews: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAdminStats();
        setStats(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch statistics: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  const StatCard = ({ icon, title, value, bgColor, textColor, linkTo }) => (
    <Link to={linkTo} className="block">
      <div className={`${bgColor} rounded-lg shadow-md p-6 transition-transform hover:scale-105`}>
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${textColor} bg-white bg-opacity-30 mr-4`}>
            {icon}
          </div>
          <div>
            <p className="text-white text-sm">{title}</p>
            <h3 className="text-white text-2xl font-bold">{value}</h3>
          </div>
        </div>
      </div>
    </Link>
  );

  // Format timestamp to relative time (e.g., "2 hours ago")
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

  // Get border color based on activity type
  const getActivityBorderColor = (type) => {
    switch (type) {
      case 'article':
        return 'border-blue-500';
      case 'application':
        return 'border-green-500';
      case 'registration':
        return 'border-orange-500';
      default:
        return 'border-gray-500';
    }
  };

  // Get activity message based on type
  const getActivityMessage = (activity) => {
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
      default:
        return <p className="text-gray-800">Unknown activity</p>;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<FiUsers size={24} />}
          title="Total Users"
          value={stats.totalUsers}
          bgColor="bg-blue-600"
          textColor="text-blue-600"
          linkTo="/admin/users"
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
        />
        
        <StatCard 
          icon={<FiFileText size={24} />}
          title="Pending Articles"
          value={stats.pendingArticles}
          bgColor="bg-yellow-600"
          textColor="text-yellow-600"
          linkTo="/admin/news?status=pending"
        />
        
        <StatCard 
          icon={<FiAlertTriangle size={24} />}
          title="Pending Applications"
          value={stats.pendingApplications}
          bgColor="bg-orange-600"
          textColor="text-orange-600"
          linkTo="/admin/applications"
        />
        
        <StatCard 
          icon={<FiEye size={24} />}
          title="Recent Views"
          value={stats.recentViews}
          bgColor="bg-indigo-600"
          textColor="text-indigo-600"
          linkTo="/admin/analytics"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/news/create" className="bg-blue-100 text-blue-700 p-4 rounded-lg hover:bg-blue-200 transition-colors">
              <FiFileText className="mb-2" size={24} />
              <span>Create Article</span>
            </Link>
            
            <Link to="/admin/users/create" className="bg-green-100 text-green-700 p-4 rounded-lg hover:bg-green-200 transition-colors">
              <FiUsers className="mb-2" size={24} />
              <span>Add User</span>
            </Link>
            
            <Link to="/admin/categories/create" className="bg-purple-100 text-purple-700 p-4 rounded-lg hover:bg-purple-200 transition-colors">
              <FiTag className="mb-2" size={24} />
              <span>Add Category</span>
            </Link>
            
            <Link to="/admin/applications" className="bg-orange-100 text-orange-700 p-4 rounded-lg hover:bg-orange-200 transition-colors">
              <FiAlertTriangle className="mb-2" size={24} />
              <span>Review Applications</span>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className={`border-l-4 ${getActivityBorderColor(activity.type)} pl-4 py-1`}>
                  <p className="text-sm text-gray-600">{formatRelativeTime(activity.timestamp)}</p>
                  {getActivityMessage(activity)}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;