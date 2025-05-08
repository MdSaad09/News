import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { FiMenu, FiX, FiUser, FiLogOut, FiSearch, FiBell } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Breaking News</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">Home</Link>
            <Link to="/category/politics" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">Politics</Link>
            <Link to="/category/technology" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">Technology</Link>
            <Link to="/category/sports" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">Sports</Link>
            <Link to="/category/entertainment" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">Entertainment</Link>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search news..."
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none w-40 lg:w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </form>

            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <button className="relative p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <FiBell className="text-xl" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <span className="mr-2">Admin Dashboard</span>
                      </Link>
                    )}
                    
                    {(user.role === 'reporter' ) && (
                      <Link to="/reporter" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <span className="mr-2">Reporter Dashboard</span>
                      </Link>
                    )}
                    
                    <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FiUser className="mr-2" />
                      <span>Profile</span>
                    </Link>
                    
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <FiLogOut className="mr-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Search news..."
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none w-full transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </form>
            
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-800 hover:text-blue-600 font-medium transition-colors py-2">Home</Link>
              <Link to="/category/politics" className="text-gray-800 hover:text-blue-600 font-medium transition-colors py-2">Politics</Link>
              <Link to="/category/technology" className="text-gray-800 hover:text-blue-600 font-medium transition-colors py-2">Technology</Link>
              <Link to="/category/sports" className="text-gray-800 hover:text-blue-600 font-medium transition-colors py-2">Sports</Link>
              <Link to="/category/entertainment" className="text-gray-800 hover:text-blue-600 font-medium transition-colors py-2">Entertainment</Link>
            </nav>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              {user ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-3 px-2 py-2 bg-gray-50 rounded-md">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  
                  {(user.role === 'reporter' || user.role === 'admin') && (
                    <Link to="/reporter" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      <span>Reporter Dashboard</span>
                    </Link>
                  )}
                  
                  <Link to="/profile" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    <FiUser className="mr-2" />
                    <span>Profile</span>
                  </Link>
                  
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center px-2 py-2 text-red-600 hover:bg-gray-100 rounded-md"
                  >
                    <FiLogOut className="mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link to="/login" className="px-4 py-2 text-center text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;