// Updated NewsDetailPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiEye, FiUser, FiShare2, FiRefreshCw, FiTag, FiVideo } from 'react-icons/fi';
import DOMPurify from 'dompurify';
import newsService from '../services/newsService';
import { Helmet } from 'react-helmet';
import VideoPlayer from '../components/common/VideoPlayer';
// Import at the top of the file
import { getImageUrl } from '../utils/imageUtils';

const NewsDetailPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  
  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      const data = await newsService.getNewsById(id);
      setNews(data);
      
      // Track view after successfully loading the article
      try {
        await newsService.trackNewsView(id);
      } catch (err) {
        console.error('Failed to track view', err);
      }
      
      // Fetch related articles
      if (data.category) {
        const relatedData = await newsService.getAllNews({ 
          category: data.category?.id || data.category,
          limit: 3,
          exclude: id
        });
        setRelatedArticles(relatedData.news || []);
      }
      
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch news details. Please try again.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNewsDetail();
    // Scroll to top when navigating between articles
    window.scrollTo(0, 0);
  }, [id]);
  
  // Sanitize HTML content to prevent XSS attacks
  const getSanitizedContent = (content) => {
    return { __html: DOMPurify.sanitize(content) };
  };
  
  const handleRetry = () => {
    fetchNewsDetail();
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-montserrat" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" role="status">
          <span className="sr-only">Loading article...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div 
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-montserrat" 
        role="alert"
        aria-live="assertive"
      >
        <span className="block sm:inline">{error}</span>
        <button 
          onClick={handleRetry}
          className="ml-4 text-red-700 font-semibold hover:text-red-900 focus:outline-none focus:underline"
        >
          <FiRefreshCw className="inline mr-1" />
          Try Again
        </button>
      </div>
    );
  }
  
  if (!news) {
    return (
      <div className="text-center py-10 font-montserrat">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">News Not Found</h1>
        <p className="text-gray-600 mb-6">The news article you're looking for doesn't exist or has been removed.</p>
        <Link 
          to="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Back to Home
        </Link>
      </div>
    );
  }
  
  // Get people if present (handle MySQL format)
  const people = news.People || [];
  
  // Get categories (primary + additional)
  const primaryCategory = news.category?.name || news.category;
  const allCategories = news.additionalCategories 
    ? [primaryCategory, ...news.additionalCategories.map(c => c.name || c)]
    : [primaryCategory];
  
  return (
    <>
      {/* SEO metadata */}
      <Helmet>
        <title>{news.title} | Breaking News</title>
        <meta name="description" content={news.summary} />
        <meta property="og:title" content={news.title} />
        <meta property="og:description" content={news.summary} />
        <meta property="og:image" content={news.videoThumbnail || news.coverImage} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        {news.hasVideo && <meta property="og:video" content={news.featuredVideo} />}
      </Helmet>
      
      <article className="max-w-4xl mx-auto font-montserrat">
        {/* Breadcrumb navigation */}
        <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center">
            <li className="flex items-center">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center">
              <Link 
                to={`/category/${typeof news.category === 'object' ? news.category.slug || news.category.id : news.category.toLowerCase()}`} 
                className="hover:text-blue-600 capitalize"
              >
                {typeof news.category === 'object' ? news.category.name : news.category}
              </Link>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-700 truncate" aria-current="page">
              {news.title}
            </li>
          </ol>
        </nav>
        
        {/* Category tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {allCategories.map((category, index) => (
            <span key={index} className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide">
              {category}
            </span>
          ))}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{news.title}</h1>
        
        <div className="flex flex-wrap items-center text-gray-600 mb-6 gap-y-2">
          <div className="flex items-center mr-4">
            <FiUser className="mr-2" aria-hidden="true" />
            
            {news.author.profilePicture ? (
            <img 
            src={getImageUrl(news.author.profilePicture)} 
            alt="" 
            className="w-8 h-8 rounded-full mr-2"
            />
            ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2" aria-hidden="true">
            {news.author.name.charAt(0)}
            </div>
            )}
            <span>{news.author.name}</span>
          </div>
          
          <div className="flex items-center mr-4">
            <FiCalendar className="mr-2" aria-hidden="true" />
            <time dateTime={news.publishedAt}>
              {new Date(news.publishedAt).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </time>
          </div>
          
          <div className="flex items-center mr-4">
            <FiEye className="mr-2" aria-hidden="true" />
            <span>{news.views} views</span>
          </div>
          
          <button 
            onClick={handleShare} 
            className="ml-auto flex items-center text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
            aria-label="Share this article"
          >
            <FiShare2 className="mr-1" />
            Share
          </button>
        </div>
        
        {/* People tags - New */}
        {people.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-gray-700 font-medium flex items-center">
              <FiTag className="mr-1" />
              Featured:
            </span>
            {people.map(person => (
              <Link 
                key={person.id}
                to={`/people/${person.slug || person.id}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors flex items-center"
              >
                {person.image && (
                  <img 
                    src={getImageUrl(person.image)} 
                    alt="" 
                    className="w-5 h-5 rounded-full mr-1 object-cover"
                  />
                )}
                {person.name}
              </Link>
            ))}
          </div>
        )}
        
        {/* Main media - Video takes priority over image */}
        <div className="mb-6">
          {news.hasVideo && news.featuredVideo ? (
            <VideoPlayer 
              src={news.featuredVideo} 
              thumbnail={getImageUrl(news.videoThumbnail) || news.coverImage} 
              title={news.title} 
            />
          ) : news.coverImage ? (
            // Update main article image
            <img 
            src={getImageUrl(news.coverImage)} 
            alt={news.title} 
            className="w-full h-80 md:h-96 object-cover rounded-lg"
            loading="lazy"
            onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/news-placeholder.jpg"; // Fallback image
            }}
            />
          ) : null}
        </div>
        
        {/* Article content - safely sanitized */}
        <div 
          ref={contentRef}
          className="prose lg:prose-lg max-w-none mb-8" 
          dangerouslySetInnerHTML={getSanitizedContent(news.content)}
        ></div>
        
        {/* Tags section */}
        {news.tags && news.tags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag, index) => (
                <Link 
                  key={index} 
                  to={`/tag/${tag.toLowerCase()}`}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Media Gallery with improved handling */}
        {news.media && news.media.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Media Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {news.media.map((mediaUrl, index) => {
                if (mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i)) {
                  return (
                    <img 
                      key={index} 
                      src={mediaUrl} 
                      alt={`Additional media for ${news.title}`} 
                      className="w-full h-40 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                      loading="lazy"
                      onClick={() => window.open(mediaUrl, '_blank')}
                    />
                  );
                } else if (mediaUrl.match(/\.(mp4|webm|ogg)$/i)) {
                  return (
                    <div key={index} className="relative">
                      <video 
                        controls 
                        className="w-full h-40 object-cover rounded"
                        preload="metadata"
                      >
                        <source src={mediaUrl} />
                        Your browser does not support the video tag.
                      </video>
                      <span className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
                        Video
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
        
        {/* Related articles section */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(article => (
                <div key={article.id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/news/${article.id}`}>
                    <div className="relative">
                      <img 
                        src={getImageUrl(article.videoThumbnail || article.coverImage)} 
                        alt="" 
                        className="w-full h-40 object-cover"
                        loading="lazy"
                      />
                      {article.hasVideo && (
                        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <FiVideo className="mr-1" /> Video
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-blue-600 font-semibold uppercase">
                        {article.category?.name || article.category}
                      </span>
                      <h3 className="text-lg font-bold mt-1 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.summary}</p>
                      
                      {/* People tags for related articles */}
                      {article.People && article.People.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {article.People.slice(0, 2).map(person => (
                            <span 
                              key={person.id}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              {person.name}
                            </span>
                          ))}
                          {article.People.length > 2 && (
                            <span className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-full">
                              +{article.People.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-8 flex justify-between">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to News
          </Link>
          
          <button 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            className="text-blue-600 hover:text-blue-700 font-semibold"
            aria-label="Scroll to top"
          >
            Back to Top ↑
          </button>
        </div>
      </article>
    </>
  );
};

export default NewsDetailPage;