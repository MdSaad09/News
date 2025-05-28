import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearError, selectIsSessionExpired } from '../redux/slices/authSlice';
import { login, clearAuthError, refreshUserSession } from '../redux/thunks/authThunk';
import FormInput from '../components/common/FormInput';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const { email, password } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isLoading, error } = useSelector((state) => state.auth);
  const isSessionExpired = useSelector(selectIsSessionExpired);
  
  // Handle session expiration
  useEffect(() => {
    if (isSessionExpired) {
      // Show session expired message or notification
      dispatch(clearAuthError());
    }
  }, [isSessionExpired, dispatch]);
  
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
    dispatch(clearAuthError());
  }, [user, navigate, dispatch]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(login({ 
        email, 
        password, 
        rememberMe
      })).unwrap();
      
      setLoginSuccess(true);
      
      // Delay redirect to show success message
      setTimeout(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData?.role === 'reporter') {
          navigate('/reporter');
        } else if (userData?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);
      
    } catch (err) {
      // Error handling is done in the thunk
      console.error('Login failed:', err);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden font-montserrat">
      <div className="px-6 py-8">
        <form onSubmit={handleSubmit} aria-labelledby="login-heading">
          <h2 id="login-heading" className="text-2xl font-bold text-center text-gray-800 mb-8">
            Login to Your Account
          </h2>
          
          {isSessionExpired && (
            <div 
              className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4" 
              role="alert"
              aria-live="polite"
            >
              <span className="block sm:inline">Your session has expired. Please log in again.</span>
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
          
          {loginSuccess && (
            <div 
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" 
              role="alert"
              aria-live="polite"
            >
              <span className="block sm:inline">Login successful! Redirecting...</span>
            </div>
          )}
          
          <FormInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          
          <FormInput
            id="password"
            label="Password"
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="mb-6"
          />
          
          <div className="flex items-center mb-4">
            <input
              id="rememberMe"
              type="checkbox"
              name="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full relative"
              type="submit"
              disabled={isLoading || loginSuccess}
            >
              {isLoading ? (
                <>
                  <span className="opacity-0">Login</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;