import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, clearAuthError, refreshUserSession } from '../redux/thunks/authThunk';
import { selectIsSessionExpired } from '../redux/slices/authSlice';
import FormInput from '../components/common/FormInput';

const ProfilePage = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const isSessionExpired = useSelector(selectIsSessionExpired);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [passwordError, setPasswordError] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  // Add activity listeners to refresh session
  useEffect(() => {
    const handleActivity = () => {
      dispatch(refreshUserSession());
    };
    
    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('keydown', handleActivity);
    
    return () => {
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
    };
  }, [dispatch]);
  
  // Handle session expiration
  useEffect(() => {
    if (isSessionExpired) {
      navigate('/login');
    }
  }, [isSessionExpired, navigate]);
  
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
    
    // Clear any previous errors
    dispatch(clearAuthError());
    setError(null);
    setPasswordError(null);
  }, [user, navigate, dispatch]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear password errors when user types
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      setPasswordError(null);
    }
  };
  
  // Password validation function
  const validatePassword = (password) => {
    if (!password) return ""; // No validation if no password (keeping current)
    
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return "";
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setMessage(null);
    setError(null);
    
    // Check if passwords match if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Validate password if provided
    if (formData.password) {
      const validationError = validatePassword(formData.password);
      if (validationError) {
        setPasswordError(validationError);
        return;
      }
    }
    
    // Only include password if it's provided
    const updateData = {
      name: formData.name,
      email: formData.email,
    };
    
    if (formData.password) {
      updateData.password = formData.password;
    }
    
    try {
      await dispatch(updateProfile(updateData)).unwrap();
      
      setMessage('Profile updated successfully');
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden font-montserrat">
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8" id="profile-heading">Your Profile</h2>
        
        {message && (
          <div 
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" 
            role="alert"
            aria-live="polite"
          >
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        
        {error && (
          <div 
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" 
            role="alert"
            aria-live="assertive"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {isSessionExpired && (
          <div 
            className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4" 
            role="alert"
            aria-live="assertive"
          >
            <span className="block sm:inline">Your session has expired. Please log in again.</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} aria-labelledby="profile-heading">
          <FormInput
            id="name"
            label="Full Name"
            type="text"
            placeholder="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
          
          <FormInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              New Password (leave blank to keep current)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="password"
              type="password"
              placeholder="New Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {passwordError && (
              <p className="text-red-500 text-xs italic mt-1">{passwordError}</p>
            )}
          </div>
          
          {/* Password strength guidelines (only shown when password field has input) */}
          {formData.password && (
            <div className="mb-4 text-xs text-gray-600">
              <p className="font-semibold mb-1">Password must contain:</p>
              <ul className="list-disc pl-5">
                <li className={formData.password.length >= 8 ? "text-green-600" : ""}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>
                  One uppercase letter
                </li>
                <li className={/[a-z]/.test(formData.password) ? "text-green-600" : ""}>
                  One lowercase letter
                </li>
                <li className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>
                  One number
                </li>
              </ul>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <button
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full relative"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="opacity-0">Update Profile</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;