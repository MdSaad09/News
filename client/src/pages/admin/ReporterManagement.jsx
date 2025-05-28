import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUserCheck, FiEdit, FiTrash2, FiSearch, FiFilter, FiMail, FiEye } from 'react-icons/fi';
import userService from '../../services/userService';

const ReporterManagement = () => {
  const [reporters, setReporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchReporters = async () => {
      try {
        setLoading(true);
        // Get all users and filter reporters
        const allUsers = await userService.getUsers();
        const reporterUsers = allUsers.filter(user => user.role === 'reporter');
        setReporters(reporterUsers);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch reporters: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchReporters();
  }, []);

  const handleDeleteReporter = async () => {
    try {
      // First, update the user's role back to 'user'
      await userService.updateUser(selectedReporter.id, { role: 'user' });
      
      // Update the local state
      setReporters(reporters.filter(reporter => reporter.id !== selectedReporter.id));
      setShowDeleteModal(false);
      setSelectedReporter(null);
      
      toast.success('Reporter removed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const filteredReporters = reporters.filter(reporter => {
    return (
      reporter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reporter.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">Reporter Management</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search reporters..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
      
      {filteredReporters.length === 0 ? (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
          No reporters found. {searchTerm && 'Try a different search term.'}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReporters.map((reporter) => (
                  <tr key={reporter.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {reporter.profilePicture ? (
                            <img className="h-10 w-10 rounded-full" src={reporter.profilePicture} alt={reporter.name} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                              {reporter.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{reporter.name}</div>
                          <div className="text-sm text-gray-500">{reporter.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reporter.reporterStats?.articlesPublished || 0} published</div>
                      <div className="text-sm text-gray-500">{reporter.reporterStats?.articlesRejected || 0} rejected</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reporter.reporterStats?.lastArticleDate 
                          ? new Date(reporter.reporterStats.lastArticleDate).toLocaleDateString() 
                          : 'No activity'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(reporter.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => window.open(`mailto:${reporter.email}`, '_blank')}
                          title="Email Reporter"
                        >
                          <FiMail size={18} />
                        </button>
                        <Link
                          to={`/admin/reporters/${reporter.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Reporter Details"
                        >
                          <FiEye size={18} />
                        </Link>
                        <Link
                          to={`/admin/reporters/edit/${reporter.id}`}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Reporter"
                        >
                          <FiEdit size={18} />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            setSelectedReporter(reporter);
                            setShowDeleteModal(true);
                          }}
                          title="Remove Reporter"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Confirm Remove Reporter</h3>
            <p className="mb-6">Are you sure you want to remove {selectedReporter.name} from reporters? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReporter}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporterManagement;