import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiInfo } from 'react-icons/fi';
import userService from '../../services/userService';

const ReporterApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [feedback, setFeedback] = useState('');
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await userService.getReporterApplications();
        setApplications(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch applications: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleReviewApplication = async (status) => {
    if (status === 'rejected' && (!feedback || feedback.trim() === '')) {
      toast.error('Please provide feedback for rejection');
      return;
    }

    try {
      await userService.reviewReporterApplication(selectedApplication._id, status, feedback);

      // Update the local state
      setApplications(applications.filter(app => app._id !== selectedApplication._id));
      setSelectedApplication(null);
      setFeedback('');
      
      toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

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
      <h2 className="text-2xl font-bold mb-6">Reporter Applications</h2>
      
      {applications.length === 0 ? (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
          No pending reporter applications at this time.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map((application) => (
            <div key={application._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h3 className="text-xl font-semibold">{application.name}</h3>
                  <p className="text-gray-600">{application.email}</p>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(application.reporterApplication.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FiInfo className="inline mr-1" /> Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Review Application</h3>
              
              <div className="mb-4">
                <p className="text-gray-700 font-semibold">Name:</p>
                <p>{selectedApplication.name}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 font-semibold">Email:</p>
                <p>{selectedApplication.email}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 font-semibold">Applied On:</p>
                <p>{new Date(selectedApplication.reporterApplication.appliedAt).toLocaleDateString()}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 font-semibold">Motivation:</p>
                <div className="bg-gray-50 p-4 rounded-md mt-2">
                  {selectedApplication.bio}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="feedback">
                  Feedback (required for rejection):
                </label>
                <textarea
                  id="feedback"
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback to the applicant..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedApplication(null);
                    setFeedback('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => handleReviewApplication('rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <FiX className="inline mr-1" /> Reject
                </button>
                
                <button
                  onClick={() => handleReviewApplication('approved')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FiCheck className="inline mr-1" /> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporterApplications;