// src/pages/admin/AdvertisementAnalytics.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FiArrowLeft, FiEye, FiMousePointer, FiTrendingUp, 
  FiCalendar, FiTarget, FiRefreshCw, FiBarChart2 
} from 'react-icons/fi';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';

const AdvertisementAnalytics = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [advertisement, setAdvertisement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch both analytics and advertisement details
      const [analyticsResponse, adResponse] = await Promise.all([
        axios.get(`/api/advertisements/${id}/analytics`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get(`/api/advertisements/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);
      
      setAnalytics(analyticsResponse.data);
      setAdvertisement(adResponse.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPositionLabel = (position) => {
    const labels = {
      'header-top': 'Header Top',
      'header-bottom': 'Header Bottom',
      'sidebar-left': 'Sidebar Left',
      'sidebar-right': 'Sidebar Right',
      'content-top': 'Content Top',
      'content-middle': 'Content Middle',
      'content-bottom': 'Content Bottom',
      'footer-top': 'Footer Top',
      'footer-bottom': 'Footer Bottom',
      'between-articles': 'Between Articles',
      'floating-corner': 'Floating Corner',
      'overlay-center': 'Overlay Center'
    };
    return labels[position] || position;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics || !advertisement) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Advertisement Not Found</h3>
        <p className="text-gray-500">The requested advertisement could not be found.</p>
        <Link
          to="/admin/advertisements"
          className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-2" />
          Back to Advertisements
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Advertisement Analytics</h2>
          <p className="text-gray-600">{advertisement.title}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <Link
            to={`/admin/advertisements/edit/${id}`}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Edit Advertisement
          </Link>
          
          <Link
            to="/admin/advertisements"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Advertisements
          </Link>
        </div>
      </div>

      {/* Advertisement Preview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiTarget className="mr-2 text-blue-600" />
          Advertisement Details
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div className="bg-gray-100 rounded p-4 flex items-center justify-center min-h-[150px]">
                {advertisement.type === 'image' && advertisement.imageUrl ? (
                  <img
                    src={getImageUrl(advertisement.imageUrl)}
                    alt={advertisement.altText || advertisement.title}
                    className="max-w-full max-h-32 object-contain"
                  />
                ) : advertisement.type === 'text' ? (
                  <div 
                    className="text-center text-sm"
                    dangerouslySetInnerHTML={{ __html: advertisement.content }}
                  />
                ) : (
                  <div className="text-gray-500 text-sm text-center">
                    {advertisement.type.toUpperCase()} Advertisement
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Details */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Position</label>
                <p className="text-lg">{getPositionLabel(advertisement.position)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-lg">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    advertisement.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {advertisement.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Device Target</label>
                <p className="text-lg capitalize">{advertisement.deviceTarget}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Priority</label>
                <p className="text-lg">{advertisement.priority}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-lg">{formatDate(advertisement.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Pages</label>
                <p className="text-lg">{advertisement.pages.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Impressions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FiEye size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.impressions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Clicks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FiMousePointer size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.clicks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Click-Through Rate */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FiTrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Click-Through Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.clickThroughRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiBarChart2 className="mr-2 text-purple-600" />
          Performance Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Summary */}
          <div>
            <h4 className="font-medium mb-3">Performance Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Engagement Rate</span>
                <span className="font-medium">
                  {analytics.impressions > 0 ? 
                    ((analytics.clicks / analytics.impressions) * 100).toFixed(2) + '%' : 
                    '0%'
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Daily Impressions</span>
                <span className="font-medium">
                  {analytics.createdAt ? 
                    Math.round(analytics.impressions / Math.max(1, Math.ceil((new Date() - new Date(analytics.createdAt)) / (1000 * 60 * 60 * 24)))) :
                    0
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Daily Clicks</span>
                <span className="font-medium">
                  {analytics.createdAt ? 
                    Math.round(analytics.clicks / Math.max(1, Math.ceil((new Date() - new Date(analytics.createdAt)) / (1000 * 60 * 60 * 24)))) :
                    0
                  }
                </span>
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div>
            <h4 className="font-medium mb-3">Recommendations</h4>
            <div className="space-y-2">
              {analytics.clickThroughRate < 1 && (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                  📈 Low CTR detected. Consider updating the ad content or position.
                </div>
              )}
              
              {analytics.impressions > 1000 && analytics.clicks < 10 && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                  🎯 High impressions but low clicks. Try a more compelling call-to-action.
                </div>
              )}
              
              {analytics.clickThroughRate > 3 && (
                <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm">
                  🎉 Great performance! This ad is performing well.
                </div>
              )}
              
              {analytics.impressions < 100 && advertisement.isActive && (
                <div className="p-3 bg-orange-50 text-orange-800 rounded-md text-sm">
                  👀 Low impressions. Check if targeting settings are too restrictive.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Information */}
      {(advertisement.startDate || advertisement.endDate) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiCalendar className="mr-2 text-indigo-600" />
            Schedule Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advertisement.startDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <p className="text-lg">{formatDate(advertisement.startDate)}</p>
              </div>
            )}
            
            {advertisement.endDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">End Date</label>
                <p className="text-lg">{formatDate(advertisement.endDate)}</p>
              </div>
            )}
          </div>
          
          {advertisement.endDate && (
            <div className="mt-4">
              {new Date(advertisement.endDate) < new Date() ? (
                <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
                  ⚠️ This advertisement has expired and is no longer showing.
                </div>
              ) : (
                <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm">
                  ✅ Advertisement is currently active and scheduled to end on {formatDate(advertisement.endDate)}.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvertisementAnalytics;