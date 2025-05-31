// src/pages/EnhancedPersonNewsPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiUser, FiRefreshCw, FiCalendar, FiLink, FiMapPin, FiTag, 
  FiEye, FiFileText, FiShare2, FiHeart, FiTwitter, FiInstagram, 
  FiFacebook, FiLinkedin, FiYoutube, FiGlobe, FiTrendingUp,
  FiFilter, FiGrid, FiList, FiClock, FiUsers
} from 'react-icons/fi';
import { Helmet } from 'react-helmet';
import NewsCard from '../components/common/NewsCard';
import { getImageUrl } from '../utils/imageUtils';
import personService from '../services/personService';

const PersonNewsPage = () => {
  const { slug } = useParams();
  const [person, setPerson] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('latest'); // latest, oldest, popular
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  
  useEffect(() => {
    fetchPersonAndNews();
    checkFollowStatus();
    window.scrollTo(0, 0);
  }, [slug, page, sortBy, categoryFilter]);

  const fetchPersonAndNews = async () => {
    try {
      setLoading(true);
      
      // Get person details
      const personData = await personService.getPersonById(slug);
      setPerson(personData);
      
      // Get their news with filters
      const newsData = await personService.getNewsByPerson(personData.id, page, {
        sort: sortBy,
        category: categoryFilter
      });
      
      setNews(newsData.news || newsData.items || newsData);
      setTotalPages(newsData.pages || newsData.pagination?.totalPages || 1);
      setTotalCount(newsData.totalCount || newsData.pagination?.totalItems || 0);
      
      // Extract categories from news
      if (newsData.news || newsData.items) {
        const categories = [...new Set(
          (newsData.news || newsData.items)
            .map(article => article.category?.name)
            .filter(Boolean)
        )];
        setAvailableCategories(categories);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching person data:', err);
      setError('Failed to load person data. Please try again.');
      setLoading(false);
    }
  };

  const checkFollowStatus = () => {
    // Check if person is followed (from localStorage or your backend)
    const followedPeople = JSON.parse(localStorage.getItem('followedPeople') || '[]');
    setIsFollowing(followedPeople.includes(slug));
  };

  const handleFollow = () => {
    const followedPeople = JSON.parse(localStorage.getItem('followedPeople') || '[]');
    
    if (isFollowing) {
      // Unfollow
      const updated = followedPeople.filter(id => id !== slug);
      localStorage.setItem('followedPeople', JSON.stringify(updated));
      setIsFollowing(false);
    } else {
      // Follow
      followedPeople.push(slug);
      localStorage.setItem('followedPeople', JSON.stringify(followedPeople));
      setIsFollowing(true);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${person.name} - News & Updates`,
      text: `Check out the latest news about ${person.name}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleRetry = () => {
    setError(null);
    fetchPersonAndNews();
  };

  const getCategoryColor = (category) => {
    const colors = {
      politician: 'bg-red-50 text-red-700 border border-red-200',
      celebrity: 'bg-purple-50 text-purple-700 border border-purple-200',
      athlete: 'bg-green-50 text-green-700 border border-green-200',
      business: 'bg-blue-50 text-blue-700 border border-blue-200',
      activist: 'bg-orange-50 text-orange-700 border border-orange-200',
      journalist: 'bg-gray-50 text-gray-700 border border-gray-200',
      scientist: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      artist: 'bg-pink-50 text-pink-700 border border-pink-200',
      other: 'bg-gray-50 text-gray-600 border border-gray-200'
    };
    return colors[category] || colors.other;
  };

  const formatSocialMediaUrl = (platform, value) => {
    if (!value) return null;
    
    if (value.startsWith('http')) return value;
    
    const baseUrls = {
      twitter: 'https://twitter.com/',
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/',
      linkedin: 'https://linkedin.com/in/',
      youtube: 'https://youtube.com/c/'
    };
    
    const cleanValue = value.replace('@', '');
    return baseUrls[platform] + cleanValue;
  };

  const socialIcons = {
    twitter: FiTwitter,
    instagram: FiInstagram,
    facebook: FiFacebook,
    linkedin: FiLinkedin,
    youtube: FiYoutube
  };

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalArticles: totalCount,
      viewCount: person?.viewCount || 0,
      followersCount: person?.followersCount || 0,
      recentActivity: news.length > 0 ? 'Active' : 'Inactive'
    };
  }, [totalCount, person, news]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-center items-center h-64 font-montserrat" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" role="status">
            <span className="sr-only">Loading person profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div 
          className="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg" 
          role="alert"
          aria-live="assertive"
        >
          <h2 className="text-lg font-semibold mb-2">Error Loading Profile</h2>
          <span className="block">{error}</span>
          <button 
            onClick={handleRetry}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center py-10 font-montserrat max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
            <FiUser className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Person Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The person you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            to="/people" 
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Browse All People
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{person.name} | Breaking News</title>
        <meta name="description" content={person.description || `Latest news and updates about ${person.name}`} />
        <meta property="og:title" content={`${person.name} | Breaking News`} />
        <meta property="og:description" content={person.description || `Latest news and updates about ${person.name}`} />
        <meta property="og:image" content={getImageUrl(person.image)} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-montserrat">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-8" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center">
              <li className="flex items-center">
                <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Home</Link>
                <span className="mx-2">/</span>
              </li>
              <li className="flex items-center">
                <Link to="/people" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">People</Link>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-700 dark:text-gray-300" aria-current="page">
                {person.name}
              </li>
            </ol>
          </nav>
          
          {/* Enhanced Person Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-10">
            {/* Cover/Background Section - Updated to match your website's gray theme */}
            <div className="h-48 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 relative">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            </div>
            
            {/* Profile Content */}
            <div className="relative px-6 pb-6">
              <div className="sm:flex sm:items-end sm:space-x-6">
                {/* Profile Picture */}
                <div className="relative -mt-20 sm:-mt-16">
                  <img 
                    className="w-32 h-32 rounded-full ring-4 ring-white shadow-lg object-cover" 
                    src={getImageUrl(person.image)} 
                    alt={person.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/person-placeholder.jpg";
                    }}
                  />
                  {person.category && (
                    <div className="absolute -bottom-2 -right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(person.category)}`}>
                        {person.category}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Profile Info */}
                <div className="mt-6 sm:mt-0 sm:flex-1">
                  <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {person.name}
                      </h1>
                      
                      {person.profession && (
                        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                          <FiUser className="mr-2" />
                          <span className="text-lg">{person.profession}</span>
                        </div>
                      )}
                      
                      {person.nationality && (
                        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                          <FiMapPin className="mr-2" />
                          <span>{person.nationality}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons - Updated to match your theme */}
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                      <button
                        onClick={handleFollow}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                          isFollowing
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                      >
                        <FiHeart className={`mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      
                      <button
                        onClick={handleShare}
                        className="flex items-center px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                      >
                        <FiShare2 className="mr-2" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalArticles}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.viewCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.followersCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                    stats.recentActivity === 'Active' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    {stats.recentActivity}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* About Section */}
            <div className="lg:col-span-2 space-y-6">
              {person.description && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">About</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{person.description}</p>
                </div>
              )}
            </div>
            
            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Information</h3>
                <div className="space-y-3">
                  {person.birthDate && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <FiCalendar className="mr-3 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Born</div>
                        <div>{new Date(person.birthDate).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}</div>
                      </div>
                    </div>
                  )}
                  
                  {person.website && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <FiGlobe className="mr-3 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Website</div>
                        <a 
                          href={person.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:underline transition-colors"
                        >
                          Official Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Social Media */}
              {person.socialMedia && Object.keys(person.socialMedia).some(key => person.socialMedia[key]) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Social Media</h3>
                  <div className="space-y-3">
                    {Object.entries(person.socialMedia).map(([platform, value]) => {
                      if (!value) return null;
                      const Icon = socialIcons[platform];
                      const url = formatSocialMediaUrl(platform, value);
                      
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                        >
                          <Icon className="mr-3" />
                          <span className="capitalize">{platform}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* News Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {/* News Header with Filters */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Latest News about {person.name}
                  </h2>
                  {totalCount > 0 && (
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {totalCount} {totalCount === 1 ? 'article' : 'articles'} found
                    </p>
                  )}
                </div>
                
                {/* View Controls */}
                <div className="flex items-center space-x-4">
                  {/* Category Filter */}
                  {availableCategories.length > 0 && (
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Categories</option>
                      {availableCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  )}
                  
                  {/* Sort Options */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                  
                  {/* View Mode Toggle - Updated colors */}
                  <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-500'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-500'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiList size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* News Content */}
            <div className="p-6">
              {Array.isArray(news) && news.length > 0 ? (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-6"
                }>
                  {news.map(article => (
                    <NewsCard 
                      key={article.id} 
                      article={article}
                      variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <FiFileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No news articles found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    There are currently no news articles about {person?.name}.
                  </p>
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-10">
                  <nav className="flex items-center space-x-2" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        page === 1
                          ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else {
                        if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-md border transition-colors ${
                            page === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        page === totalPages
                          ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
          
          {/* Back to People Button */}
          <div className="mt-8 text-center">
            <Link
              to="/people"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FiUsers className="mr-2" />
              Browse All People
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonNewsPage;