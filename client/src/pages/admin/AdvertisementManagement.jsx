// src/pages/admin/AdvertisementManagement.jsx - Modern version without deprecated dependencies
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiBarChart2, 
  FiMove, FiFilter, FiGrid, FiList, FiRefreshCw, FiArrowUp, FiArrowDown 
} from 'react-icons/fi';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';

const AdvertisementManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    position: 'all',
    status: 'all',
    type: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [selectedAd, setSelectedAd] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchAdvertisements();
  }, [filters, pagination.currentPage]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
        ...filters
      });

      const response = await axios.get(`/api/advertisements/admin?${queryParams}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setAdvertisements(response.data.advertisements);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch advertisements');
      setLoading(false);
    }
  };

  // Modern HTML5 Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) return;

    const items = [...advertisements];
    const draggedItemData = items[draggedItem];
    
    // Remove dragged item
    items.splice(draggedItem, 1);
    
    // Insert at new position
    const adjustedDropIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    items.splice(adjustedDropIndex, 0, draggedItemData);

    // Update local state immediately
    setAdvertisements(items);

    // Update sort orders on server
    const reorderData = items.map((item, index) => ({
      id: item.id,
      sortOrder: index
    }));

    try {
      await axios.put('/api/advertisements/reorder', 
        { advertisements: reorderData },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success('Advertisement order updated');
    } catch (error) {
      toast.error('Failed to update order');
      fetchAdvertisements(); // Revert on error
    }
  };

  const moveAdvertisement = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= advertisements.length) return;

    const items = [...advertisements];
    const [movedItem] = items.splice(index, 1);
    items.splice(newIndex, 0, movedItem);

    setAdvertisements(items);

    // Update sort orders
    const reorderData = items.map((item, idx) => ({
      id: item.id,
      sortOrder: idx
    }));

    try {
      await axios.put('/api/advertisements/reorder', 
        { advertisements: reorderData },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success('Advertisement order updated');
    } catch (error) {
      toast.error('Failed to update order');
      fetchAdvertisements(); // Revert on error
    }
  };

  const toggleAdStatus = async (id) => {
    try {
      const response = await axios.put(`/api/advertisements/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setAdvertisements(ads => 
        ads.map(ad => 
          ad.id === id ? { ...ad, isActive: !ad.isActive } : ad
        )
      );
      
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to toggle advertisement status');
    }
  };

  const deleteAdvertisement = async () => {
    if (!selectedAd) return;

    try {
      await axios.delete(`/api/advertisements/${selectedAd.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setAdvertisements(ads => ads.filter(ad => ad.id !== selectedAd.id));
      setShowDeleteModal(false);
      setSelectedAd(null);
      toast.success('Advertisement deleted successfully');
    } catch (error) {
      toast.error('Failed to delete advertisement');
    }
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'text': return '📝';
      case 'video': return '🎥';
      case 'html': return '💻';
      default: return '📄';
    }
  };

  const AdCard = ({ ad, index }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, index)}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, index)}
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg cursor-move ${
        !ad.isActive ? 'opacity-60' : ''
      }`}
    >
      <div className="relative">
        {/* Drag Handle */}
        <div className="absolute top-2 right-2 p-1 bg-gray-700 bg-opacity-50 text-white rounded z-10">
          <FiMove size={16} />
        </div>

        {/* Manual Move Buttons */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1 z-10">
          <button
            onClick={() => moveAdvertisement(index, 'up')}
            disabled={index === 0}
            className={`p-1 rounded text-white text-xs ${
              index === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            title="Move Up"
          >
            <FiArrowUp size={12} />
          </button>
          <button
            onClick={() => moveAdvertisement(index, 'down')}
            disabled={index === advertisements.length - 1}
            className={`p-1 rounded text-white text-xs ${
              index === advertisements.length - 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            title="Move Down"
          >
            <FiArrowDown size={12} />
          </button>
        </div>

        {/* Ad Preview */}
        <div className="h-32 bg-gray-100 flex items-center justify-center relative">
          {ad.type === 'image' && ad.imageUrl ? (
            <img
              src={getImageUrl(ad.imageUrl)}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl">
              {getTypeIcon(ad.type)}
            </div>
          )}
          
          {/* Status Badge */}
          <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium ${
            ad.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {ad.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Ad Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate">{ad.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {getPositionLabel(ad.position)}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            {ad.type.toUpperCase()} • Priority: {ad.priority}
          </p>

          {/* Analytics */}
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>👁️ {ad.impressions || 0}</span>
            <span>🖱️ {ad.clicks || 0}</span>
            <span>📱 {ad.deviceTarget}</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Link
              to={`/admin/advertisements/edit/${ad.id}`}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded text-sm transition-colors"
            >
              <FiEdit className="inline mr-1" />
              Edit
            </Link>
            
            <button
              onClick={() => toggleAdStatus(ad.id)}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                ad.isActive 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {ad.isActive ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
            
            <Link
              to={`/admin/advertisements/analytics/${ad.id}`}
              className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm transition-colors"
            >
              <FiBarChart2 size={16} />
            </Link>
            
            <button
              onClick={() => {
                setSelectedAd(ad);
                setShowDeleteModal(true);
              }}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Advertisement
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Analytics
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {advertisements.map((ad, index) => (
            <tr 
              key={ad.id} 
              className={`${!ad.isActive ? 'opacity-60' : ''} hover:bg-gray-50`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <FiMove className="text-gray-400 cursor-move" />
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveAdvertisement(index, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded text-xs ${
                        index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      <FiArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => moveAdvertisement(index, 'down')}
                      disabled={index === advertisements.length - 1}
                      className={`p-1 rounded text-xs ${
                        index === advertisements.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      <FiArrowDown size={12} />
                    </button>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    {ad.type === 'image' && ad.imageUrl ? (
                      <img
                        src={getImageUrl(ad.imageUrl)}
                        alt={ad.title}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-xl">
                        {getTypeIcon(ad.type)}
                      </div>
                      
                    )}
                  

                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                    <div className="text-sm text-gray-500">{ad.type.toUpperCase()}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{getPositionLabel(ad.position)}</div>
                <div className="text-sm text-gray-500">Priority: {ad.priority}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>👁️ {ad.impressions || 0} impressions</div>
                <div>🖱️ {ad.clicks || 0} clicks</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  ad.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {ad.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Link
                    to={`/admin/advertisements/edit/${ad.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FiEdit size={16} />
                  </Link>
                  <button
                    onClick={() => toggleAdStatus(ad.id)}
                    className={`${ad.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                  >
                    {ad.isActive ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                  <Link
                    to={`/admin/advertisements/analytics/${ad.id}`}
                    className="text-purple-600 hover:text-purple-900"
                  >
                    <FiBarChart2 size={16} />
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedAd(ad);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 lg:mb-0">Advertisement Management</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={fetchAdvertisements}
            className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
          
          <Link
            to="/admin/advertisements/create"
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus className="mr-2" />
            Create Advertisement
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <FiFilter className="mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.position}
            onChange={(e) => setFilters({...filters, position: e.target.value})}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Positions</option>
            <option value="header-top">Header Top</option>
            <option value="header-bottom">Header Bottom</option>
            <option value="sidebar-left">Sidebar Left</option>
            <option value="sidebar-right">Sidebar Right</option>
            <option value="content-top">Content Top</option>
            <option value="content-middle">Content Middle</option>
            <option value="content-bottom">Content Bottom</option>
            <option value="footer-top">Footer Top</option>
            <option value="footer-bottom">Footer Bottom</option>
            <option value="between-articles">Between Articles</option>
            <option value="floating-corner">Floating Corner</option>
            <option value="overlay-center">Overlay Center</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            <option value="image">Image</option>
            <option value="text">Text</option>
            <option value="video">Video</option>
            <option value="html">HTML</option>
          </select>

          {/* View Mode Toggle */}
          <div className="ml-auto flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
            >
              <FiList size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Drag and Drop Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <FiMove className="text-blue-600 mr-2" />
          <p className="text-blue-800 text-sm">
            <strong>Reorder ads:</strong> Drag cards to rearrange order, or use the arrow buttons. Higher positions show first.
          </p>
        </div>
      </div>

      {/* Content */}
      {advertisements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Advertisements Found</h3>
          <p className="text-gray-500 mb-4">Create your first advertisement to get started.</p>
          <Link
            to="/admin/advertisements/create"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <FiPlus className="mr-2" />
            Create Advertisement
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {advertisements.map((ad, index) => (
            <AdCard key={ad.id} ad={ad} index={index} />
          ))}
        </div>
      ) : (
        <ListView />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
              disabled={pagination.currentPage === 1}
              className={`px-3 py-2 rounded border ${
                pagination.currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`px-3 py-2 rounded border ${
                pagination.currentPage === pagination.totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete the advertisement "{selectedAd.title}"? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAd(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAdvertisement}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementManagement;