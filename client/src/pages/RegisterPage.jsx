import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerStart, registerSuccess, registerFailure, clearError } from '../redux/slices/authSlice';
import authService from '../services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    applyAsReporter: false,
    motivation: ''
  });
  
  const [passwordError, setPasswordError] = useState('');
  const { name, email, password, confirmPassword, role, applyAsReporter, motivation } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // If user is already logged in, redirect based on role
    if (user) {
      if (user.role === 'reporter') {
        navigate('/reporter');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
    
    // Clear any previous errors
    dispatch(clearError());
  }, [user, navigate, dispatch]);
  
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    
    // Clear password error when user types in password fields
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      setPasswordError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Check if applying as reporter but no motivation
    if (applyAsReporter && (!motivation || motivation.trim().length < 50)) {
      dispatch(registerFailure('Please provide a detailed motivation (at least 50 characters)'));
      return;
    }
    
    try {
      dispatch(registerStart());
      const userData = await authService.register({ 
        name, 
        email, 
        password,
        role,
        applyAsReporter,
        motivation: applyAsReporter ? motivation : ''
      });
      dispatch(registerSuccess(userData));
      
      // Redirect based on role
      if (userData.role === 'reporter') {
        navigate('/reporter');
      } else if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong';
      dispatch(registerFailure(message));
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden font-montserrat">
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Create an Account</h2>
        
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="name"
              type="text"
              placeholder="Full Name"
              name="name"
              value={name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="email"
              type="email"
              placeholder="Email"
              name="email"
              value={email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="password"
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
            />
            {passwordError && (
              <p className="text-red-500 text-xs italic mt-1">{passwordError}</p>
            )}
          </div>
          
          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Account Type
            </label>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  id="roleUser"
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="roleUser" className="ml-2 block text-sm text-gray-700">
                  Regular User
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="roleReporter"
                  type="radio"
                  name="role"
                  value="reporter"
                  checked={role === 'reporter'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="roleReporter" className="ml-2 block text-sm text-gray-700">
                  Reporter
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Reporters can submit news articles after registration.
            </p>
          </div>
          
          {/* Reporter Application Option (only shown if role is not reporter) */}
          {role === 'user' && (
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  id="applyAsReporter"
                  type="checkbox"
                  name="applyAsReporter"
                  checked={applyAsReporter}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="applyAsReporter" className="ml-2 block text-sm text-gray-700">
                  Apply as a Reporter
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Apply to become a reporter. You'll be able to submit news articles after registration.
              </p>
            </div>
          )}
          
          {/* Motivation Field (only shown if applying as reporter or role is reporter) */}
          {(applyAsReporter || role === 'reporter') && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motivation">
                {role === 'reporter' ? 'Tell us about yourself as a reporter' : 'Why do you want to be a reporter?'} (min. 50 characters)
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="motivation"
                name="motivation"
                rows="4"
                placeholder="Describe your experience, interests, and why you want to join our team..."
                value={motivation}
                onChange={handleChange}
                required={applyAsReporter || role === 'reporter'}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                {motivation.length}/50 characters (minimum required)
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;