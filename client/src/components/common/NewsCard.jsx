import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiEye, FiBookmark, FiShare2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const NewsCard = ({ article }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };
  
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.origin + `/news/${article._id}`,
      })
      .catch(err => toast.error('Error sharing article'));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.origin + `/news/${article._id}`)
        .then(() => toast.success('Link copied to clipboard'))
        .catch(() => toast.error('Failed to copy link'));
    }
  };
  
  return (
    <div className="group relative overflow-hidden rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 bg-white dark:bg-gray-800">
      {/* Category Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary-600 text-white">
          {article.category}
        </span>
      </div>
      
      {/* Actions */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button 
          onClick={handleBookmark}
          className={`p-2 rounded-full ${isBookmarked ? 'bg-secondary-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'} transition-colors`}
        >
          <FiBookmark className={isBookmarked ? 'fill-white' : ''} />
        </button>
        <button 
          onClick={handleShare}
          className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-colors"
        >
          <FiShare2 />
        </button>
      </div>
      
      <Link to={`/news/${article._id}`} className="block">
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img 
            src={article.coverImage} 
            alt={article.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {article.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {article.summary}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <FiClock className="mr-1" />
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <FiEye className="mr-1" />
                {article.views}
              </span>
            </div>
            
            <span className="text-primary-600 dark:text-primary-400 font-medium">
              Read More
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default NewsCard;