import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft, FiUpload, FiImage, FiVideo, FiUser, FiX, FiPlus } from 'react-icons/fi';
import axios from 'axios';
// Import VideoPlayer for preview
import VideoPlayer from '../../components/common/VideoPlayer';
import { getImageUrl } from '../../utils/imageUtils';

const NewsEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef(null);
  // Remove videoInputRef as we'll use a text input instead
  const videoThumbnailRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '', 
    category: 'other',
    coverImage: '',
    imageUrl: '',
    hasVideo: false,
    featuredVideo: '',
    videoThumbnail: '',
    tags: [],
    isPublished: true
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [uploading, setUploading] = useState(false);
  // Remove videoUploading and videoFile states
  const [videoThumbnailFile, setVideoThumbnailFile] = useState(null);
  const [people, setPeople] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [settingUpCategories, setSettingUpCategories] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  // Check and setup default categories if needed
  const checkAndSetupCategories = async () => {
    try {
      setSettingUpCategories(true);
      
      // First check if categories exist
      const response = await axios.get('/api/categories');
      
      if (response.data.length === 0 && user.role === 'admin') {
        // Show confirmation dialog
        const shouldCreate = window.confirm(
          'No categories found in the database. Would you like to create default categories?'
        );
        
        if (shouldCreate) {
          const setupResponse = await axios.post('/api/categories/setup', {}, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          
          toast.success('Default categories created successfully');
          console.log('Categories created:', setupResponse.data);
          
          // Fetch categories again
          const updatedResponse = await axios.get('/api/categories');
          setCategories(updatedResponse.data);
          
          // Update category mapping
          const mapping = {};
          updatedResponse.data.forEach(category => {
            mapping[category.name.toLowerCase()] = category.id;
            mapping[category.slug] = category.id;
          });
          setCategoryMap(mapping);
          
          setSettingUpCategories(false);
          return true;
        }
      }
      
      setSettingUpCategories(false);
      return response.data.length > 0;
    } catch (error) {
      console.error('Error checking/setting up categories:', error);
      toast.error('Failed to set up categories');
      setSettingUpCategories(false);
      return false;
    }
  };

  // Fetch people
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoadingPeople(true);
        const response = await axios.get('/api/people');
        setPeople(response.data);
        setLoadingPeople(false);
      } catch (error) {
        console.error('Error fetching people:', error);
        setLoadingPeople(false);
      }
    };
    
    fetchPeople();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        console.log('Fetched categories:', response.data);
        
        if (response.data.length === 0) {
          console.log('No categories found');
          
          // For admin users, offer to create default categories
          if (user.role === 'admin') {
            await checkAndSetupCategories();
          } else {
            toast.error('No categories found. Please contact an administrator.');
          }
        } else {
          setCategories(response.data);
          
          // Create a mapping from category name/slug to ID
          const mapping = {};
          response.data.forEach(category => {
            mapping[category.name.toLowerCase()] = category.id;
            mapping[category.slug] = category.id;
          });
          console.log('Created category mapping:', mapping);
          setCategoryMap(mapping);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
  
    fetchCategories();
  }, [user.role, user.token]);

  // Fetch news details if editing
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
          
          // Find category name from ID
          let categoryName = 'other';
          if (categories.length > 0) {
            const foundCategory = categories.find(c => c.id === newsItem.categoryId);
            if (foundCategory) {
              categoryName = foundCategory.slug;
            }
          }
          
          setFormData({
            title: newsItem.title || '',
            content: newsItem.content || '',
            summary: newsItem.summary || '',
            category: categoryName,
            imageUrl: newsItem.imageUrl || newsItem.coverImage || '',
            coverImage: newsItem.coverImage || newsItem.imageUrl || '',
            hasVideo: newsItem.hasVideo || false,
            featuredVideo: newsItem.featuredVideo || '',
            videoThumbnail: newsItem.videoThumbnail || '',
            tags: newsItem.tags || [],
            isPublished: newsItem.isPublished || true
          });
          
          // Set selected people if present
          if (newsItem.People && newsItem.People.length > 0) {
            setSelectedPeople(newsItem.People);
          }
          
          setInitialLoading(false);
        } catch (error) {
          toast.error('Failed to fetch news: ' + (error.response?.data?.message || error.message));
          navigate('/admin/news');
        }
      };
      
      fetchNews();
    }
  }, [id, isEditMode, navigate, user.token, categories]);

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
  
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
  
    try {
      setUploading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
  
      const response = await axios.post('/api/upload', formDataUpload, config);
      
      // Check for urls array or direct url
      const imageUrl = response.data.url || response.data.urls?.[0];
      
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }
      
      console.log('Uploaded image URL:', imageUrl); // Debug log
      
      setFormData(prev => ({
        ...prev,
        imageUrl: imageUrl,
        coverImage: imageUrl
      }));
      
      setUploading(false);
      toast.success('Image uploaded successfully');
    } catch (error) {
      setUploading(false);
      toast.error(error.response?.data?.message || error.message || 'Failed to upload image');
    }

    // Reset the file input
    e.target.value = '';
  };

  const handleEmbedCodeChange = (e) => {
    const embedCode = e.target.value;
    
    // Basic validation and extraction of video ID
    let hasValidVideo = false;
    let thumbnailUrl = '';
    
    // Check if it's a YouTube URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    const youtubeMatch = embedCode.match(youtubeRegex);
    
    if (youtubeMatch && youtubeMatch[1]) {
      // It's a YouTube video, extract the ID
      const videoId = youtubeMatch[1];
      hasValidVideo = true;
      
      // Generate YouTube thumbnail URL
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      // If we don't have a custom thumbnail, use the YouTube one
      if (!videoThumbnailFile && !formData.videoThumbnail) {
        setFormData(prev => ({
          ...prev,
          videoThumbnail: thumbnailUrl
        }));
      }
    }
    
    // Check if it's a Vimeo URL
    const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const vimeoMatch = embedCode.match(vimeoRegex);
    
    if (vimeoMatch && vimeoMatch[3]) {
      hasValidVideo = true;
      
      // For Vimeo, we would need to make an API call to get the thumbnail
      // This is optional and can be implemented later
    }
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      featuredVideo: embedCode,
      hasVideo: embedCode.trim() !== ''
    }));
  };

  const handleVideoThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setVideoThumbnailFile(file);
    // Create a preview URL for UI only
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      videoThumbnail: previewUrl
    }));
  
    // Reset the file input
    e.target.value = '';
  };

  const handlePeopleToggle = (person) => {
    setSelectedPeople(prev => {
      const isSelected = prev.some(p => p.id === person.id);
      if (isSelected) {
        return prev.filter(p => p.id !== person.id);
      } else {
        return [...prev, person];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a proper FormData object for multipart/form-data submission
      const formDataToSubmit = new FormData();
      
      // Add basic text fields
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('content', formData.content);
      formDataToSubmit.append('summary', formData.summary);
      
      // DEBUGGING: Log the selected category
      console.log('Selected category:', formData.category);
      
      // Get categoryId from the dynamic mapping if available
      let categoryId;
      
      if (categories.length > 0) {
        // Find the category by name or slug
        const categoryObj = categories.find(c => 
          c.name.toLowerCase() === formData.category.toLowerCase() ||
          c.slug === formData.category.toLowerCase()
        );
        
        if (categoryObj) {
          // We found a direct match from our API data
          categoryId = categoryObj.id;
          console.log('Found matching category from API:', categoryObj);
        } else {
          // No direct match, try to find a default category
          const defaultCategory = categories.find(c => c.slug === 'other' || c.name.toLowerCase() === 'other');
          if (defaultCategory) {
            categoryId = defaultCategory.id;
            console.log('Using default category:', defaultCategory);
          } else if (categories.length > 0) {
            // Just use the first category if no default found
            categoryId = categories[0].id;
            console.log('Using first available category:', categories[0]);
          } else {
            toast.error('No valid categories available');
            setLoading(false);
            return;
          }
        }
      } else {
        // Fall back to static mapping if no categories from API
        const staticCategoryMap = {
          'politics': 1,
          'sports': 2,
          'technology': 3,
          'entertainment': 4,
          'business': 5,
          'health': 6,
          'science': 7,
          'other': 8
        };
        categoryId = staticCategoryMap[formData.category.toLowerCase()] || 8;
        console.log('Using static category mapping (no API data):', categoryId);
      }
      
      // DEBUGGING: Log the final categoryId
      console.log('Final categoryId being sent:', categoryId);
      
      // Append categoryId as a string
      formDataToSubmit.append('categoryId', String(categoryId));
      
      // For admin, ensure the news is published
      formDataToSubmit.append('isPublished', 'true');
      
      // Handle files and media
      
      // 1. Handle video
      if (formData.featuredVideo) {
        // If we have a video URL (YouTube or Vimeo)
        formDataToSubmit.append('featuredVideo', formData.featuredVideo);
        formDataToSubmit.append('hasVideo', 'true');
      }
      
      // 2. Handle video thumbnail
      if (videoThumbnailFile) {
        // If we have a new thumbnail file, append it directly
        formDataToSubmit.append('videoThumbnail', videoThumbnailFile);
      } else if (formData.videoThumbnail) {
        // If we have a previously uploaded thumbnail URL
        formDataToSubmit.append('videoThumbnail', formData.videoThumbnail);
      }
      
      // 3. Handle cover image
      if (formData.imageUrl || formData.coverImage) {
        const coverImageValue = formData.imageUrl || formData.coverImage;
        console.log('Setting coverImage to:', coverImageValue);
        formDataToSubmit.append('coverImage', coverImageValue);
      } else if (isEditMode) {
        // If in edit mode and both image fields are empty, explicitly set to empty
        // This signals to the backend that we want to remove the image
        console.log('Explicitly setting empty coverImage in edit mode');
        formDataToSubmit.append('coverImage', '');
      } else {
        // If no cover image is provided in create mode, set a default
        console.log('No cover image provided, setting default');
        formDataToSubmit.append('coverImage', '/uploads/images/default.jpg');
      }
      
      // Handle selected people - convert array of objects to array of IDs
      if (selectedPeople.length > 0) {
        formDataToSubmit.append('people', JSON.stringify(selectedPeople.map(p => p.id)));
      }
      
      // Handle tags
      if (formData.tags && formData.tags.length > 0) {
        formDataToSubmit.append('tags', JSON.stringify(formData.tags));
      } else {
        formDataToSubmit.append('tags', JSON.stringify([]));
      }
      
      // Add empty array for additionalCategories
      formDataToSubmit.append('additionalCategories', JSON.stringify([]));
      
      // DEBUGGING: Log all form data being sent
      console.log('Form data being sent:');
      for (let pair of formDataToSubmit.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      // Create request config with proper headers for FormData
      const config = {
        headers: {
          // Important: When using FormData, don't set Content-Type
          // Axios will set it automatically with the correct boundary
          Authorization: `Bearer ${user.token}`
        }
      };
      
      // Submit the request
      if (isEditMode) {
        const response = await axios.put(`/api/news/${id}`, formDataToSubmit, config);
        console.log('Update response:', response.data);
        toast.success('News updated successfully');
      } else {
        const response = await axios.post('/api/news', formDataToSubmit, config);
        console.log('Create response:', response.data);
        toast.success('News created successfully');
      }
      
      navigate('/admin/news');
    } catch (error) {
      setLoading(false);
      console.error('Error details:', error.response?.data || error);
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
      
      {categories.length === 0 && (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-yellow-700">
          No categories found. You need categories to create news articles.
          {user.role === 'admin' && (
            <button
              type="button"
              onClick={checkAndSetupCategories}
              disabled={settingUpCategories}
              className="ml-2 font-medium text-yellow-700 underline hover:text-yellow-600 focus:outline-none"
            >
              {settingUpCategories ? 'Setting up...' : 'Setup default categories'}
            </button>
          )}
          {user.role !== 'admin' && (
            <span className="ml-2 font-medium text-yellow-700">
              Please contact an administrator.
            </span>
          )}
        </p>
      </div>
    </div>
  </div>
)}
      
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
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="summary">
      Summary *
    </label>
    <textarea
      id="summary"
      name="summary"
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Brief summary of the article (150-200 characters recommended)"
      value={formData.summary}
      onChange={handleChange}
      rows="2"
      required
    />
  </div>

  <div className="mb-6">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
      Category *
    </label>
    <div className="flex items-center">
      <select
        id="category"
        name="category"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={formData.category}
        onChange={handleChange}
        required
        disabled={categories.length === 0}
      >
        <option value="">Select a category</option>
        {categories.map(category => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
        {categories.length === 0 && (
          <option value="other">Other (Default)</option>
        )}
      </select>
      
      {user.role === 'admin' && (
        <Link 
          to="/admin/categories"
          className="ml-2 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-md"
          title="Manage Categories"
        >
          <FiPlus size={20} />
        </Link>
      )}
    </div>
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
      
      {(formData.imageUrl || formData.coverImage) ? (
        <div className="relative">
          
          <img 
            src={getImageUrl(formData.imageUrl || formData.coverImage)} 
            alt="Preview" 
            className="h-20 w-auto rounded-md" 
          />
          
          // Update video thumbnail preview
          <img 
            src={videoThumbnailFile ? URL.createObjectURL(videoThumbnailFile) : getImageUrl(formData.videoThumbnail)} 
            alt="Video thumbnail" 
            className="h-20 w-auto rounded-md"
          />
          <button
            type="button"
            onClick={() => {
              // Clear both image fields and log the action
              console.log('Removing image');
              setFormData(prev => ({ 
                ...prev, 
                imageUrl: '', 
                coverImage: '' 
              }));
              // Reset file input if it has a value
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
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
  
  {/* Featured Video section */}
  <div className="mb-6">
    <label className="block text-gray-700 text-sm font-bold mb-2">
      Featured Video (Optional)
    </label>
    <div className="mb-2">
      <input
        type="text"
        name="featuredVideo"
        value={formData.featuredVideo}
        onChange={handleEmbedCodeChange}
        placeholder="Enter YouTube or Vimeo URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p className="text-xs text-gray-500 mt-1">
        Paste a YouTube or Vimeo video URL. The video will be embedded in your article.
      </p>
    </div>
    
    {formData.featuredVideo && (
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-green-600">
            <FiVideo className="inline mr-1" />
            Video Added
          </span>
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, featuredVideo: '', hasVideo: false }));
            }}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
        
        {/* Video Preview */}
        <div className="mt-2 mb-4">
          <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video">
            {formData.featuredVideo && formData.featuredVideo.includes('youtube.com') && (
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(formData.featuredVideo)}?rel=0&modestbranding=1`}
                title="Video Preview"
                frameBorder="0"
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
            {formData.featuredVideo && formData.featuredVideo.includes('vimeo.com') && (
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://player.vimeo.com/video/${getVimeoVideoId(formData.featuredVideo)}`}
                title="Vimeo Preview"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>
      </div>
    )}
    
    {formData.hasVideo && (
      <div className="mt-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Video Thumbnail (Optional)
        </label>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => videoThumbnailRef.current.click()}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <FiImage className="mr-2" />
            Upload Custom Thumbnail
          </button>
          <input
            type="file"
            ref={videoThumbnailRef}
            onChange={handleVideoThumbnailUpload}
            className="hidden"
            accept="image/*"
          />
          
          {(videoThumbnailFile || formData.videoThumbnail) && (
            <div className="relative">
              <img 
                src={videoThumbnailFile ? URL.createObjectURL(videoThumbnailFile) : getImageUrl(formData.videoThumbnail)} 
                alt="Video thumbnail" 
                className="h-20 w-auto rounded-md"
              />
              <button
                type="button"
                onClick={() => {
                  setVideoThumbnailFile(null);
                  setFormData(prev => ({ ...prev, videoThumbnail: '' }));
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          A custom thumbnail will be displayed before the video plays. If not provided, the default video thumbnail will be used.
        </p>
      </div>
    )}
  </div>
  
  {/* Related People section */}
  <div className="mb-6">
    <label className="block text-gray-700 text-sm font-bold mb-2">
      Related People
    </label>
    
    {loadingPeople ? (
      <div className="flex items-center space-x-2">
        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        <span className="text-sm text-gray-500">Loading people...</span>
      </div>
    ) : (
      <>
        {/* Selected people */}
        {selectedPeople.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedPeople.map(person => (
              <div 
                key={person.id} 
                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {person.name}
                <button
                  type="button"
                  onClick={() => handlePeopleToggle(person)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* People selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
          {people.length > 0 ? (
            people.map(person => {
              const isSelected = selectedPeople.some(p => p.id === person.id);
              return (
                <div 
                  key={person.id}
                  onClick={() => handlePeopleToggle(person)}
                  className={`flex items-center p-2 rounded cursor-pointer ${
                    isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-gray-200 flex-shrink-0">
                    {person.image ? (
                      <img src={person.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        {person.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm truncate">{person.name}</span>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-500 py-4">
              No people found. <Link to="/admin/people/create" className="text-blue-600 hover:underline">Add people</Link> first.
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-1">
          Tag relevant people that appear in this news article
        </p>
      </>
    )}
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
      disabled={loading || uploading || categories.length === 0}
      className={`flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${(loading || uploading || categories.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
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


const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url?.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getVimeoVideoId = (url) => {
  const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
  const match = url?.match(regExp);
  return match ? match[3] : null;
};