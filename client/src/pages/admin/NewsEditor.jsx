import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft, FiUpload, FiImage, FiVideo, FiUser, FiX, FiPlus, FiSearch, FiUsers, FiUserPlus, FiTag } from 'react-icons/fi';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';
// Add this import after your existing imports
import { detectPeopleWithScoring, quickDetectPeople } from '../../utils/personDetection.js';


const NewsEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef(null);
  const videoThumbnailRef = useRef(null);
  const personSearchRef = useRef(null);
  
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
  const [videoThumbnailFile, setVideoThumbnailFile] = useState(null);
  
  // Enhanced People Management State
  const [people, setPeople] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [personSearchTerm, setPersonSearchTerm] = useState('');
  const [showPersonSearch, setShowPersonSearch] = useState(false);
  const [suggestedPeople, setSuggestedPeople] = useState([]);
  const [isAnalyzingContent, setIsAnalyzingContent] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [settingUpCategories, setSettingUpCategories] = useState(false);

  // Debounced content analysis for person suggestions
 const analyzeContentForPeople = useCallback(
  debounce((content) => {
    if (!content || content.length < 50) {
      setSuggestedPeople([]);
      return;
    }
    
    setIsAnalyzingContent(true);
    console.log('🔍 Analyzing content for people mentions...');
    
    // ✨ Use the smart detection utility
    const detectedPeople = detectPeopleWithScoring(content, people);
    
    // Filter out already selected people
    const suggestions = detectedPeople.filter(person => 
      !selectedPeople.some(selected => selected.id === person.id)
    );
    
    console.log('🎯 Smart detection found:', suggestions.map(p => `${p.name} (${p.finalScore?.toFixed(2)})`));
    setSuggestedPeople(suggestions.slice(0, 5)); // Limit to top 5 suggestions
    setIsAnalyzingContent(false);
  }, 1000),
  [people, selectedPeople]
);

  // Enhanced person search functionality
  useEffect(() => {
    if (personSearchTerm.trim() === '') {
      setFilteredPeople(people);
    } else {
      const filtered = people.filter(person => 
        person.name.toLowerCase().includes(personSearchTerm.toLowerCase()) ||
        (person.profession && person.profession.toLowerCase().includes(personSearchTerm.toLowerCase())) ||
        (person.category && person.category.toLowerCase().includes(personSearchTerm.toLowerCase()))
      );
      setFilteredPeople(filtered);
    }
  }, [personSearchTerm, people]);

  // Content analysis trigger
  useEffect(() => {
    analyzeContentForPeople(formData.content);
  }, [formData.content, analyzeContentForPeople]);

  // Check and setup default categories if needed
  const checkAndSetupCategories = async () => {
    try {
      setSettingUpCategories(true);
      
      const response = await axios.get('/api/categories');
      
      if (response.data.length === 0 && user.role === 'admin') {
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
          
          const updatedResponse = await axios.get('/api/categories');
          setCategories(updatedResponse.data);
          
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

  // Fetch people with enhanced loading
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoadingPeople(true);
        const response = await axios.get('/api/people');
        setPeople(response.data);
        setFilteredPeople(response.data);
        console.log('✅ Loaded', response.data.length, 'people');
        setLoadingPeople(false);
      } catch (error) {
        console.error('Error fetching people:', error);
        toast.error('Failed to load people data');
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
          
          if (user.role === 'admin') {
            await checkAndSetupCategories();
          } else {
            toast.error('No categories found. Please contact an administrator.');
          }
        } else {
          setCategories(response.data);
          
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

  // Enhanced person selection handlers
  const handlePersonToggle = (person) => {
    setSelectedPeople(prev => {
      const isSelected = prev.some(p => p.id === person.id);
      if (isSelected) {
        return prev.filter(p => p.id !== person.id);
      } else {
        return [...prev, person];
      }
    });
  };

  const handlePersonRemove = (personId) => {
    setSelectedPeople(prev => prev.filter(p => p.id !== personId));
  };

  const handlePersonSearchFocus = () => {
    setShowPersonSearch(true);
  };

  const handlePersonSearchBlur = () => {
    // Delay hiding to allow clicks on person cards
    setTimeout(() => setShowPersonSearch(false), 200);
  };

  const handleSuggestionAccept = (person) => {
    if (!selectedPeople.some(p => p.id === person.id)) {
      setSelectedPeople(prev => [...prev, person]);
      setSuggestedPeople(prev => prev.filter(p => p.id !== person.id));
      toast.success(`Added ${person.name} to the article`);
    }
  };

  const handleCreateNewPerson = () => {
    const searchTerm = personSearchTerm.trim();
    if (searchTerm) {
      navigate(`/admin/people/create?name=${encodeURIComponent(searchTerm)}&returnTo=${encodeURIComponent(window.location.pathname)}`);
    } else {
      navigate('/admin/people/create');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
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
      
      const imageUrl = response.data.url || response.data.urls?.[0];
      
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }
      
      console.log('Uploaded image URL:', imageUrl);
      
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

    e.target.value = '';
  };

  const handleEmbedCodeChange = (e) => {
    const embedCode = e.target.value;
    
    let hasValidVideo = false;
    let thumbnailUrl = '';
    
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    const youtubeMatch = embedCode.match(youtubeRegex);
    
    if (youtubeMatch && youtubeMatch[1]) {
      const videoId = youtubeMatch[1];
      hasValidVideo = true;
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      if (!videoThumbnailFile && !formData.videoThumbnail) {
        setFormData(prev => ({
          ...prev,
          videoThumbnail: thumbnailUrl
        }));
      }
    }
    
    const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const vimeoMatch = embedCode.match(vimeoRegex);
    
    if (vimeoMatch && vimeoMatch[3]) {
      hasValidVideo = true;
    }
    
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
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      videoThumbnail: previewUrl
    }));
  
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const formDataToSubmit = new FormData();
      
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('content', formData.content);
      formDataToSubmit.append('summary', formData.summary);
      
      console.log('Selected category:', formData.category);
      
      let categoryId;
      
      if (categories.length > 0) {
        const categoryObj = categories.find(c => 
          c.name.toLowerCase() === formData.category.toLowerCase() ||
          c.slug === formData.category.toLowerCase()
        );
        
        if (categoryObj) {
          categoryId = categoryObj.id;
          console.log('Found matching category from API:', categoryObj);
        } else {
          const defaultCategory = categories.find(c => c.slug === 'other' || c.name.toLowerCase() === 'other');
          if (defaultCategory) {
            categoryId = defaultCategory.id;
            console.log('Using default category:', defaultCategory);
          } else if (categories.length > 0) {
            categoryId = categories[0].id;
            console.log('Using first available category:', categories[0]);
          } else {
            toast.error('No valid categories available');
            setLoading(false);
            return;
          }
        }
      } else {
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
      
      console.log('Final categoryId being sent:', categoryId);
      
      formDataToSubmit.append('categoryId', String(categoryId));
      formDataToSubmit.append('isPublished', 'true');
      
      if (formData.featuredVideo) {
        formDataToSubmit.append('featuredVideo', formData.featuredVideo);
        formDataToSubmit.append('hasVideo', 'true');
      }
      
      if (videoThumbnailFile) {
        formDataToSubmit.append('videoThumbnail', videoThumbnailFile);
      } else if (formData.videoThumbnail) {
        formDataToSubmit.append('videoThumbnail', formData.videoThumbnail);
      }
      
      if (formData.imageUrl || formData.coverImage) {
        const coverImageValue = formData.imageUrl || formData.coverImage;
        console.log('Setting coverImage to:', coverImageValue);
        formDataToSubmit.append('coverImage', coverImageValue);
      } else if (isEditMode) {
        console.log('Explicitly setting empty coverImage in edit mode');
        formDataToSubmit.append('coverImage', '');
      } else {
        console.log('No cover image provided, setting default');
        formDataToSubmit.append('coverImage', '/uploads/images/default.jpg');
      }
      
      if (selectedPeople.length > 0) {
        formDataToSubmit.append('people', JSON.stringify(selectedPeople.map(p => p.id)));
      }
      
      if (formData.tags && formData.tags.length > 0) {
        formDataToSubmit.append('tags', JSON.stringify(formData.tags));
      } else {
        formDataToSubmit.append('tags', JSON.stringify([]));
      }
      
      formDataToSubmit.append('additionalCategories', JSON.stringify([]));
      
      console.log('Form data being sent:');
      for (let pair of formDataToSubmit.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
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
        {/* Basic News Information */}
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
                <button
                  type="button"
                  onClick={() => {
                    console.log('Removing image');
                    setFormData(prev => ({ 
                      ...prev, 
                      imageUrl: '', 
                      coverImage: '' 
                    }));
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
        
        {/* ✨ ENHANCED PEOPLE SELECTION SECTION ✨ */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-gray-700 text-sm font-bold">
              <FiUsers className="inline mr-2" />
              Related People & Celebrities
            </label>
            <div className="flex items-center space-x-2">
              {selectedPeople.length > 0 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {selectedPeople.length} selected
                </span>
              )}
              <button
                type="button"
                onClick={handleCreateNewPerson}
                className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md text-sm transition-colors"
                title="Create new person"
              >
                <FiUserPlus className="mr-1" size={14} />
                Add Person
              </button>
            </div>
          </div>
          
          {loadingPeople ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              <span className="ml-2 text-gray-500">Loading people...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 🎯 Content Analysis Suggestions */}
              {suggestedPeople.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {isAnalyzingContent ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
                      ) : (
                        <FiUsers className="text-blue-600 mr-2" />
                      )}
                      <span className="text-sm font-medium text-blue-800">
                        Suggested People (detected in content)
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedPeople.map(person => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => handleSuggestionAccept(person)}
                        className="flex items-center bg-white border border-blue-300 hover:border-blue-500 hover:bg-blue-50 px-3 py-1 rounded-full text-sm transition-all duration-200 group"
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-gray-200 flex-shrink-0">
                          {person.image ? (
                            <img src={getImageUrl(person.image)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                              {person.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-blue-700 group-hover:text-blue-900">{person.name}</span>
                        <FiPlus className="ml-1 text-blue-500 group-hover:text-blue-700" size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 🔍 Smart Search Interface */}
              <div className="relative">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={personSearchRef}
                    type="text"
                    value={personSearchTerm}
                    onChange={(e) => setPersonSearchTerm(e.target.value)}
                    onFocus={handlePersonSearchFocus}
                    onBlur={handlePersonSearchBlur}
                    placeholder="Search people by name, profession, or category..."
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  {personSearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setPersonSearchTerm('');
                        personSearchRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
                
                {/* Search Results Dropdown */}
                {showPersonSearch && filteredPeople.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPeople.slice(0, 8).map(person => {
                      const isSelected = selectedPeople.some(p => p.id === person.id);
                      return (
                        <div
                          key={person.id}
                          onClick={() => handlePersonToggle(person)}
                          className={`flex items-center p-3 cursor-pointer transition-all hover:bg-gray-50 ${
                            isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                            {person.image ? (
                              <img src={getImageUrl(person.image)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                                {person.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                                {person.name}
                              </span>
                              {isSelected && (
                                <FiX className="ml-2 text-blue-500" size={16} />
                              )}
                            </div>
                            {person.profession && (
                              <p className="text-sm text-gray-500 truncate">{person.profession}</p>
                            )}
                            {person.category && (
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(person.category)}`}>
                                  <FiTag className="mr-1" size={10} />
                                  {person.category}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Quick Create Option */}
                    {personSearchTerm && !filteredPeople.some(p => 
                      p.name.toLowerCase() === personSearchTerm.toLowerCase()
                    ) && (
                      <div className="border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handleCreateNewPerson}
                          className="w-full flex items-center p-3 text-left hover:bg-gray-50 text-blue-600 hover:text-blue-700"
                        >
                          <FiUserPlus className="mr-3" />
                          <span>Create new person: "{personSearchTerm}"</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* 👥 Selected People Display */}
              {selectedPeople.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Selected People ({selectedPeople.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPeople.map(person => (
                      <div
                        key={person.id}
                        className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-2 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-gray-200 flex-shrink-0">
                          {person.image ? (
                            <img src={getImageUrl(person.image)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-medium">
                              {person.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 mr-2">{person.name}</span>
                        {person.profession && (
                          <span className="text-xs text-gray-500 mr-2">• {person.profession}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePersonRemove(person.id)}
                          className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 🎨 All People Grid (when no search) */}
              {!showPersonSearch && personSearchTerm === '' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                  {people.length > 0 ? (
                    people.map(person => {
                      const isSelected = selectedPeople.some(p => p.id === person.id);
                      return (
                        <div
                          key={person.id}
                          onClick={() => handlePersonToggle(person)}
                          className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-blue-100 border-2 border-blue-300 shadow-md' 
                              : 'bg-white hover:bg-gray-100 border-2 border-transparent hover:border-gray-200'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-gray-200 flex-shrink-0">
                            {person.image ? (
                              <img src={getImageUrl(person.image)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-medium">
                                {person.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{person.name}</div>
                            {person.profession && (
                              <div className="text-xs text-gray-500 truncate">{person.profession}</div>
                            )}
                          </div>
                          {isSelected && (
                            <FiX className="text-blue-600 ml-1" size={14} />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      <FiUsers className="mx-auto text-gray-300 text-2xl mb-2" />
                      <p>No people found.</p>
                      <button
                        type="button"
                        onClick={() => navigate('/admin/people/create')}
                        className="text-blue-600 hover:underline text-sm mt-1"
                      >
                        Add the first person
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            💡 <strong>Tip:</strong> The system automatically detects people mentioned in your article content and suggests them above.
            You can also search and manually select people related to this news.
          </p>
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

// 🛠️ Helper Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function extractPossibleNames(content) {
  // Simple algorithm to extract potential person names
  // This could be enhanced with NLP libraries
  const words = content.split(/\s+/);
  const possibleNames = [];
  
  for (let i = 0; i < words.length - 1; i++) {
    const word1 = words[i].replace(/[^\w]/g, '');
    const word2 = words[i + 1].replace(/[^\w]/g, '');
    
    // Check if both words start with capital letters (potential names)
    if (word1.length > 1 && word2.length > 1 && 
        word1[0] === word1[0].toUpperCase() && 
        word2[0] === word2[0].toUpperCase()) {
      possibleNames.push(`${word1} ${word2}`);
    }
  }
  
  return [...new Set(possibleNames)]; // Remove duplicates
}

function getCategoryColor(category) {
  const colors = {
    politician: 'bg-red-100 text-red-800',
    celebrity: 'bg-purple-100 text-purple-800',
    athlete: 'bg-green-100 text-green-800',
    business: 'bg-blue-100 text-blue-800',
    activist: 'bg-orange-100 text-orange-800',
    journalist: 'bg-gray-100 text-gray-800',
    scientist: 'bg-indigo-100 text-indigo-800',
    artist: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return colors[category] || colors.other;
}

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

export default NewsEditor;