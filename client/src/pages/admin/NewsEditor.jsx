import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft, FiUpload, FiImage } from 'react-icons/fi';
import axios from 'axios';

const NewsEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '', // Add summary field - it's required
    category: 'other', // Add category field with default - it's required
    coverImage: '', // Changed from imageUrl to coverImage
    tags: [],
    isPublished: true // Default to published status
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [uploading, setUploading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isEditMode) {
      const fetchNews = async () => {
        try {
          setInitialLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          };
          
          const response = await axios.get(`/api/news/${id}`, config);
          const newsItem = response.data;
          
          setFormData({
            title: newsItem.title,
            content: newsItem.content,
            imageUrl: newsItem.imageUrl || '',
            isPublished: newsItem.isPublished || true, // Default to true for admin
            status: newsItem.status || 'published' // Default to published
          });
          
          setInitialLoading(false);
        } catch (error) {
          toast.error('Failed to fetch news: ' + (error.response?.data?.message || error.message));
          navigate('/admin/news');
        }
      };
      
      fetchNews();
    }
  }, [id, isEditMode, navigate, user.token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For admins, if the isPublished checkbox is modified, also update the status accordingly
    if (name === 'isPublished' && type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        isPublished: checked,
        status: checked ? 'published' : 'draft'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      };

      const response = await axios.post('/api/upload', formData, config);
      
      // Check for urls array (from your previous implementation) or direct url
      const imageUrl = response.data.urls?.[0] || response.data.url;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }
      
      setFormData(prev => ({
        ...prev,
        imageUrl: imageUrl
      }));
      
      setUploading(false);
      toast.success('Image uploaded successfully');
    } catch (error) {
      setUploading(false);
      toast.error(error.response?.data?.message || error.message || 'Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // For admin, ensure the news is published
    const newsData = {
      ...formData,
      isPublished: true, // Always published for admin
      status: 'published' // Always published status for admin
    };
    
    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };
      
      if (isEditMode) {
        await axios.put(`/api/news/${id}`, newsData, config);
        toast.success('News updated and published successfully');
      } else {
        await axios.post('/api/news', newsData, config);
        toast.success('News created and published successfully');
      }
      
      navigate('/admin/news');
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{isEditMode ? 'Edit News' : 'Create News'}</h2>
        
        <button
          onClick={() => navigate('/admin/news')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" />
          Back to News
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            News Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter news title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
            News Content *
          </label>
          <textarea
            id="content"
            name="content"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter news content"
            value={formData.content}
            onChange={handleChange}
            rows="12"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Featured Image
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              disabled={uploading}
            >
              <FiUpload className="mr-2" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
            
            {formData.imageUrl ? (
              <div className="relative">
                <img src={formData.imageUrl} alt="Preview" className="h-20 w-auto rounded-md" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="h-20 w-32 bg-gray-200 flex items-center justify-center rounded-md">
                <FiImage className="text-gray-400 text-2xl" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Adding an image makes your news article more engaging
          </p>
        </div>
        
        {/* For admin users, hide the publish toggle or make it locked to true */}
        {user.role === 'admin' ? (
          <div className="mb-6">
            <div className="flex items-center bg-green-50 p-3 rounded-md">
              <span className="text-green-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="text-green-700 font-medium">
                This news will be automatically published
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700 font-medium">Publish this news</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Unpublished news will not be visible to the public
            </p>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || uploading}
            className={`flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${(loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiSave className="mr-2" />
            {loading ? 'Saving...' : (user.role === 'admin' ? 'Save & Publish' : 'Save News')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsEditor;