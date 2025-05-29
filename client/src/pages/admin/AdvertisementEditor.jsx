// src/pages/admin/AdvertisementEditor.jsx - Updated with Display Modes
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft, FiUpload, FiEye, FiTarget, FiMonitor, FiSmartphone, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';

const AdvertisementEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'image',
    content: '',
    imageUrl: '',
    linkUrl: '',
    altText: '',
    position: 'sidebar-right',
    articlePosition: '',
    size: 'medium',
    width: '',
    height: '',
    pages: ['all'],
    excludePages: [],
    deviceTarget: 'all',
    startDate: '',
    endDate: '',
    priority: 1,
    displayMode: 'rotation',        // NEW FIELD
    rotationInterval: 10,           // NEW FIELD
    backgroundColor: '',
    textColor: '',
    borderRadius: 0,
    customCSS: '',
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // Fetch advertisement details if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchAdvertisement = async () => {
        try {
          setInitialLoading(true);
          const response = await axios.get(`/api/advertisements/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          
          const ad = response.data;
          setFormData({
            title: ad.title || '',
            type: ad.type || 'image',
            content: ad.content || '',
            imageUrl: ad.imageUrl || '',
            linkUrl: ad.linkUrl || '',
            altText: ad.altText || '',
            position: ad.position || 'sidebar-right',
            articlePosition: ad.articlePosition || '',
            size: ad.size || 'medium',
            width: ad.width || '',
            height: ad.height || '',
            pages: ad.pages || ['all'],
            excludePages: ad.excludePages || [],
            deviceTarget: ad.deviceTarget || 'all',
            startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
            endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
            priority: ad.priority || 1,
            displayMode: ad.displayMode || 'rotation',        // NEW FIELD
            rotationInterval: ad.rotationInterval || 10,      // NEW FIELD
            backgroundColor: ad.backgroundColor || '',
            textColor: ad.textColor || '',
            borderRadius: ad.borderRadius || 0,
            customCSS: ad.customCSS || '',
            isActive: ad.isActive !== false
          });
          
          setInitialLoading(false);
        } catch (error) {
          toast.error('Failed to fetch advertisement details');
          navigate('/admin/advertisements');
        }
      };
      
      fetchAdvertisement();
    }
  }, [id, isEditMode, navigate, user.token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (name, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [name]: array
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      setUploading(true);
      const response = await axios.post('/api/upload', formDataUpload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const imageUrl = response.data.url;
      setFormData(prev => ({
        ...prev,
        imageUrl: imageUrl
      }));
      
      setUploading(false);
      toast.success('Image uploaded successfully');
    } catch (error) {
      setUploading(false);
      toast.error('Failed to upload image');
    }

    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }

    if (formData.type === 'image' && !formData.imageUrl) {
      toast.error('Please upload an image or provide an image URL');
      return;
    }

    if ((formData.type === 'text' || formData.type === 'video' || formData.type === 'html') && !formData.content) {
      toast.error('Please provide content');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        pages: JSON.stringify(formData.pages),
        excludePages: JSON.stringify(formData.excludePages),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        width: formData.width ? parseInt(formData.width) : null,
        height: formData.height ? parseInt(formData.height) : null,
        articlePosition: formData.articlePosition ? parseInt(formData.articlePosition) : null,
        rotationInterval: formData.rotationInterval ? parseInt(formData.rotationInterval) : 10  // NEW FIELD
      };
      
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      
      if (isEditMode) {
        await axios.put(`/api/advertisements/${id}`, submitData, config);
        toast.success('Advertisement updated successfully');
      } else {
        await axios.post('/api/advertisements', submitData, config);
        toast.success('Advertisement created successfully');
      }
      
      navigate('/admin/advertisements');
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const AdPreview = () => {
    const getPreviewStyles = () => {
      const styles = {
        borderRadius: `${formData.borderRadius || 0}px`
      };

      if (formData.backgroundColor) {
        styles.backgroundColor = formData.backgroundColor;
      }

      if (formData.textColor) {
        styles.color = formData.textColor;
      }

      // Size-based dimensions
      switch (formData.size) {
        case 'small':
          styles.width = '300px';
          styles.height = '250px';
          break;
        case 'medium':
          styles.width = '728px';
          styles.height = '300px';
          break;
        case 'large':
          styles.width = '970px';
          styles.height = '250px';
          break;
        case 'custom':
          if (formData.width) styles.width = `${formData.width}px`;
          if (formData.height) styles.height = `${formData.height}px`;
          break;
        default:
          break;
      }

      return styles;
    };

    const previewStyles = getPreviewStyles();

    return (
      <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">Preview</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {formData.deviceTarget === 'desktop' && <FiMonitor />}
            {formData.deviceTarget === 'mobile' && <FiSmartphone />}
            {formData.deviceTarget === 'all' && (
              <>
                <FiMonitor />
                <FiSmartphone />
              </>
            )}
            {formData.displayMode === 'rotation' && (
              <div className="flex items-center ml-2">
                <FiRefreshCw className="mr-1" />
                <span>{formData.rotationInterval}s</span>
              </div>
            )}
          </div>
        </div>
        
        <div 
          className="advertisement-preview relative border border-gray-200 rounded overflow-hidden"
          style={previewStyles}
        >
          {formData.type === 'image' && formData.imageUrl && (
            <img
              src={getImageUrl(formData.imageUrl)}
              alt={formData.altText || formData.title}
              className="w-full h-full object-contain"
            />
          )}
          
          {formData.type === 'text' && (
            <div className="flex items-center justify-center p-4 text-center h-full">
              <div dangerouslySetInnerHTML={{ __html: formData.content }} />
            </div>
          )}
          
          {formData.type === 'video' && formData.content && (
            <div 
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          )}
          
          {formData.type === 'html' && formData.content && (
            <div 
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          )}
          
          {/* Ad label */}
          <div className="absolute top-1 right-1 bg-gray-500 text-white text-xs px-1 py-0.5 rounded opacity-60">
            Ad
          </div>
          
          {/* Display Mode indicator */}
          <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded opacity-75">
            {formData.displayMode}
          </div>
        </div>
      </div>
    );
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
        <h2 className="text-2xl font-bold">
          {isEditMode ? 'Edit Advertisement' : 'Create Advertisement'}
        </h2>
        
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center text-purple-600 hover:text-purple-800"
          >
            <FiEye className="mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          <Link
            to="/admin/advertisements"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Advertisements
          </Link>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiTarget className="mr-2 text-blue-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Advertisement title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image">Image</option>
                  <option value="text">Text</option>
                  <option value="video">Video (Embed)</option>
                  <option value="html">HTML</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Content</h3>
            
            {formData.type === 'image' && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image *
                </label>
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
                </div>
                
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Or enter image URL"
                />
                
                {formData.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={getImageUrl(formData.imageUrl)}
                      alt="Preview"
                      className="max-w-xs h-auto border rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/news-placeholder.jpg";
                      }}
                    />
                  </div>
                )}
                
                <div className="mt-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    name="altText"
                    value={formData.altText}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Alternative text for accessibility"
                  />
                </div>
              </div>
            )}

            {(formData.type === 'text' || formData.type === 'video' || formData.type === 'html') && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    formData.type === 'text' 
                      ? 'Enter your advertisement text (HTML allowed)'
                      : formData.type === 'video'
                      ? 'Enter video embed code (YouTube, Vimeo, etc.)'
                      : 'Enter custom HTML code'
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.type === 'text' && 'You can use HTML tags for formatting'}
                  {formData.type === 'video' && 'Paste the embed code from YouTube, Vimeo, or other video platforms'}
                  {formData.type === 'html' && 'Custom HTML content (be careful with security)'}
                </p>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Click URL
              </label>
              <input
                type="url"
                name="linkUrl"
                value={formData.linkUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Where should this ad link to?"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: URL to redirect users when they click the advertisement
              </p>
            </div>
          </div>

          {/* Position & Display */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Position & Display</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Position *
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="header-top">Header Top</option>
                  <option value="header-bottom">Header Bottom</option>
                  <option value="sidebar-left">Sidebar Left</option>
                  <option value="sidebar-right">Sidebar Right</option>
                  <option value="content-top">Content Top</option>
                  <option value="content-middle">Content Middle</option>
                  <option value="content-bottom">Content Bottom</option>
                  <option value="footer-top">Footer Top</option>
                  <option value="footer-bottom">Footer Bottom</option>
                  <option value="between-articles">Between Articles</option>
                  <option value="floating-corner">Floating Corner</option>
                  <option value="overlay-center">Overlay Center</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Display Mode (multiple ads)
                </label>
                <select
                  name="displayMode"
                  value={formData.displayMode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rotation">Rotation (cycle through ads)</option>
                  <option value="random">Random (show random ad)</option>
                  <option value="priority">Priority (show highest priority)</option>
                  <option value="all">All (show all ads)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How should multiple ads in the same position be displayed?
                </p>
              </div>

              {formData.position === 'between-articles' && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Show After Every N Articles
                  </label>
                  <input
                    type="number"
                    name="articlePosition"
                    value={formData.articlePosition}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3 (show after every 3rd article)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to show between all articles
                  </p>
                </div>
              )}

              {(formData.displayMode === 'rotation' || !formData.displayMode) && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Rotation Interval (seconds)
                  </label>
                  <input
                    type="number"
                    name="rotationInterval"
                    value={formData.rotationInterval}
                    onChange={handleChange}
                    min="3"
                    max="60"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How often to switch between ads (3-60 seconds)
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Size
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Small (300x250)</option>
                  <option value="medium">Medium (728x300)</option>
                  <option value="large">Large (970x250)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher numbers show first (1-10)
                </p>
              </div>
            </div>

            {formData.size === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Targeting */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Targeting</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Pages to Show
                </label>
                <input
                  type="text"
                  value={formData.pages.join(', ')}
                  onChange={(e) => handleArrayChange('pages', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="all, home, news-detail, category-politics"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated list. Use 'all' for all pages.
                </p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Pages to Exclude
                </label>
                <input
                  type="text"
                  value={formData.excludePages.join(', ')}
                  onChange={(e) => handleArrayChange('excludePages', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin, login, register"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Pages where this ad should NOT appear
                </p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Device Target
                </label>
                <select
                  name="deviceTarget"
                  value={formData.deviceTarget}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Devices</option>
                  <option value="desktop">Desktop Only</option>
                  <option value="mobile">Mobile Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: When to start showing this ad
                </p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: When to stop showing this ad
                </p>
              </div>
            </div>
          </div>

          {/* Styling */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Styling</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Background Color
                </label>
                <input
                  type="color"
                  name="backgroundColor"
                  value={formData.backgroundColor}
                  onChange={handleChange}
                  className="w-full h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Text Color
                </label>
                <input
                  type="color"
                  name="textColor"
                  value={formData.textColor}
                  onChange={handleChange}
                  className="w-full h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Border Radius (px)
                </label>
                <input
                  type="number"
                  name="borderRadius"
                  value={formData.borderRadius}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Custom CSS
              </label>
              <textarea
                name="customCSS"
                value={formData.customCSS}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add custom CSS styles (advanced)"
              />
              <p className="text-xs text-gray-500 mt-1">
                    Advanced: Custom CSS properties in JSON format (e.g., {`{"boxShadow": "0 4px 8px rgba(0,0,0,0.1)"}`}) 
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-gray-700 font-medium">
                Active (Advertisement will be displayed)
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || uploading}
              className={`flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline ${(loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FiSave className="mr-2" />
              {loading ? 'Saving...' : (isEditMode ? 'Update Advertisement' : 'Create Advertisement')}
            </button>
          </div>
        </form>

        {/* Preview */}
        {showPreview && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <AdPreview />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertisementEditor;