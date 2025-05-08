import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../redux/slices/authSlice';
import authService from '../services/authService';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
    });
  }, [user, navigate]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      
      // Only include password if it's provided
      const updateData = {
        name: formData.name,
        email: formData.email,
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      const updatedUser = await authService.updateUserProfile(updateData);
      dispatch(loginSuccess(updatedUser));
      setMessage('Profile updated successfully');
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
      setLoading(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong';
      setError(message);
      setLoading(false);
    }
  };
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Your Profile</h2>
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              New Password (leave blank to keep current)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="New Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <button
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;