// src/components/common/EnhancedPersonCard.jsx
import { Link } from 'react-router-dom';
import { FiUser, FiEye, FiFileText, FiTrendingUp, FiHeart, FiShare2, FiExternalLink } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils';

const PersonCard = ({ 
  person, 
  showStats = false, 
  showActions = false,
  variant = 'default', // 'default', 'compact', 'detailed'
  onFollow,
  isFollowing = false
}) => {
  const { id, name, slug, image, profession, category, newsCount = 0, viewCount = 0 } = person;
  
  const getCategoryColor = (category) => {
    const colors = {
      politician: 'bg-red-100 text-red-800 border-red-200',
      celebrity: 'bg-purple-100 text-purple-800 border-purple-200',
      athlete: 'bg-green-100 text-green-800 border-green-200',
      business: 'bg-blue-100 text-blue-800 border-blue-200',
      activist: 'bg-orange-100 text-orange-800 border-orange-200',
      journalist: 'bg-gray-100 text-gray-800 border-gray-200',
      scientist: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      artist: 'bg-pink-100 text-pink-800 border-pink-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || colors.other;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} - News & Updates`,
          text: `Check out news and updates about ${name}`,
          url: window.location.origin + `/people/${slug || id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/people/${slug || id}`);
      // You could show a toast here
    }
  };

  if (variant === 'compact') {
    return (
      <Link 
        to={`/people/${slug || id}`}
        className="group flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-blue-300"
      >
        <div className="relative">
          <img 
            src={getImageUrl(image)} 
            alt={name} 
            className="w-12 h-12 rounded-full object-cover group-hover:scale-105 transition-transform duration-300" 
            loading="lazy"
          />
          {showStats && newsCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {newsCount > 9 ? '9+' : newsCount}
            </div>
          )}
        </div>
        
        <div className="ml-3 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
            {name}
          </h3>
          {profession && (
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
              {profession}
            </p>
          )}
        </div>
        
        {category && (
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(category)}`}>
            {category}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-200 hover:border-blue-300">
      <Link to={`/people/${slug || id}`} className="block">
        <div className="relative">
          {/* Image Container */}
          <div className="relative pt-[100%]"> {/* 1:1 aspect ratio */}
            <img 
              src={getImageUrl(image)} 
              alt={name} 
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/person-placeholder.jpg";
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Category Badge */}
            {category && (
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border backdrop-blur-sm ${getCategoryColor(category)}`}>
                  {category}
                </span>
              </div>
            )}
            
            {/* Stats Overlay */}
            {showStats && (
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center space-x-3 text-white text-xs">
                  {newsCount > 0 && (
                    <div className="flex items-center space-x-1 bg-black/40 rounded-full px-2 py-1">
                      <FiFileText size={12} />
                      <span>{formatNumber(newsCount)} articles</span>
                    </div>
                  )}
                  {viewCount > 0 && (
                    <div className="flex items-center space-x-1 bg-black/40 rounded-full px-2 py-1">
                      <FiEye size={12} />
                      <span>{formatNumber(viewCount)} views</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Trending Indicator */}
            {newsCount > 5 && (
              <div className="absolute top-3 right-3">
                <div className="bg-orange-500 text-white p-1 rounded-full animate-pulse">
                  <FiTrendingUp size={12} />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
      
      {/* Content */}
      <div className="p-4">
        <Link to={`/people/${slug || id}`}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        
        {profession && (
          <p className="text-gray-600 dark:text-gray-300 text-sm capitalize mb-3">
            {profession}
          </p>
        )}
        
        {/* Statistics Row */}
        {showStats && (
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-3">
              {newsCount > 0 && (
                <span className="flex items-center space-x-1">
                  <FiFileText size={12} />
                  <span>{formatNumber(newsCount)}</span>
                </span>
              )}
              {viewCount > 0 && (
                <span className="flex items-center space-x-1">
                  <FiEye size={12} />
                  <span>{formatNumber(viewCount)}</span>
                </span>
              )}
            </div>
            {newsCount > 0 && (
              <span className="text-green-600 font-medium">Active</span>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFollow && onFollow(person);
                }}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isFollowing 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <FiHeart size={12} className={isFollowing ? 'fill-current' : ''} />
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <FiShare2 size={12} />
                <span>Share</span>
              </button>
            </div>
            
            <Link
              to={`/people/${slug || id}`}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>View</span>
              <FiExternalLink size={12} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonCard;