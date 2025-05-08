import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const NewsDetailPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/news/${id}`);
        setNews(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch news details');
        setLoading(false);
      }
    };
    
    fetchNewsDetail();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-montserrat">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-montserrat" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  if (!news) {
    return (
      <div className="text-center py-10 font-montserrat">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">News Not Found</h2>
        <p className="text-gray-600 mb-6">The news article you're looking for doesn't exist.</p>
        <Link 
          to="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Back to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto font-montserrat">
      <span className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide mb-2">
        {news.category}
      </span>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{news.title}</h1>
      
      <div className="flex items-center text-gray-600 mb-6">
        <div className="flex items-center">
          {news.author.profilePicture ? (
            <img 
              src={news.author.profilePicture} 
              alt={news.author.name} 
              className="w-8 h-8 rounded-full mr-2"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
              {news.author.name.charAt(0)}
            </div>
          )}
          <span>{news.author.name}</span>
        </div>
        <span className="mx-2">•</span>
        <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
        <span className="mx-2">•</span>
        <span>{news.views} views</span>
      </div>
      
      <img 
        src={news.coverImage} 
        alt={news.title} 
        className="w-full h-96 object-cover rounded-lg mb-6"
      />
      
      <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: news.content }}></div>
      
      {news.tags && news.tags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {news.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {news.media && news.media.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Media Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {news.media.map((mediaUrl, index) => {
              if (mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i)) {
                return (
                  <img 
                    key={index} 
                    src={mediaUrl} 
                    alt={`Media ${index + 1}`} 
                    className="w-full h-40 object-cover rounded"
                  />
                );
              } else if (mediaUrl.match(/\.(mp4|webm|ogg)$/i)) {
                return (
                  <video 
                    key={index} 
                    controls 
                    className="w-full h-40 object-cover rounded"
                  >
                    <source src={mediaUrl} />
                    Your browser does not support the video tag.
                  </video>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <Link 
          to="/" 
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          ← Back to News
        </Link>
      </div>
    </div>
  );
};

export default NewsDetailPage;