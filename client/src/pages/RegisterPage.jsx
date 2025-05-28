import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearError, selectIsSessionExpired } from '../redux/slices/authSlice';
import { register, clearAuthError, refreshUserSession } from '../redux/thunks/authThunk';
import FormInput from '../components/common/FormInput';

const RegisterPage = () => {
  // Load saved form data if exists
  const savedFormData = localStorage.getItem('registrationForm') 
    ? JSON.parse(localStorage.getItem('registrationForm'))
    : null;

  const [formData, setFormData] = useState(savedFormData || {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    applyAsReporter: false,
    motivation: ''
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { name, email, password, confirmPassword, role, applyAsReporter, motivation } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isLoading, error } = useSelector((state) => state.auth);
  const isSessionExpired = useSelector(selectIsSessionExpired);
  
  // Save form data to localStorage when it changes
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      localStorage.setItem('registrationForm', JSON.stringify(formData));
    }
  }, [formData]);

  // Clear saved form on successful registration
  useEffect(() => {
    if (user) {
      localStorage.removeItem('registrationForm');
    }
  }, [user]);

  // Handle session expiration
  useEffect(() => {
    if (isSessionExpired) {
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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    
    // Clear password error when user types in password fields
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      setPasswordError('');
    }
  };
  
  // Password validation function
  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return "";
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
    // Check if applying as reporter but no motivation
    if ((applyAsReporter || role === 'reporter') && (!motivation || motivation.trim().length < 50)) {
      dispatch(clearError());
      dispatch({ type: 'auth/registerFailure', payload: 'Please provide a detailed motivation (at least 50 characters)' });
      return;
    }
    
    try {
      await dispatch(register({ 
        name, 
        email, 
        password,
        role,
        applyAsReporter,
        motivation: (applyAsReporter || role === 'reporter') ? motivation : ''
      })).unwrap();
      
      setRegistrationSuccess(true);
      localStorage.removeItem('registrationForm');
      
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
      }, 2000);
      
    } catch (err) {
      // Error is handled in the thunk
      console.error('Registration failed:', err);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden font-montserrat">
      <div className="px-6 py-8">
        <form onSubmit={handleSubmit} aria-labelledby="register-heading">
          <h2 id="register-heading" className="text-2xl font-bold text-center text-gray-800 mb-8">
            Create an Account
          </h2>
          
          {error && (
            <div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" 
              role="alert"
              aria-live="assertive"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {registrationSuccess && (
            <div 
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" 
              role="alert"
              aria-live="polite"
            >
              <span className="block sm:inline">Registration successful! Redirecting...</span>
            </div>
          )}
          
          <FormInput
            id="name"
            label="Full Name"
            type="text"
            placeholder="Full Name"
            name="name"
            value={name}
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
            autoComplete="new-password"
            error={passwordError}
          />
          
          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            error={passwordError ? "" : null}
            className="mb-6"
          />
          
          {/* Password strength guidelines */}
          <div className="mb-4 text-xs text-gray-600">
            <p className="font-semibold mb-1">Password must contain:</p>
            <ul className="list-disc pl-5">
              <li className={password.length >= 8 ? "text-green-600" : ""}>At least 8 characters</li>
              <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>One uppercase letter</li>
              <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>One lowercase letter</li>
              <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>One number</li>
            </ul>
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
                Apply to become a reporter. You'll be able to submit news articles after approval.
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
              <p className={`text-xs mt-1 ${motivation.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                {motivation.length}/50 characters (minimum required)
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full relative"
              type="submit"
              disabled={isLoading || registrationSuccess}
            >
              {isLoading ? (
                <>
                  <span className="opacity-0">Register</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                </>
              ) : (
                'Register'
              )}
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