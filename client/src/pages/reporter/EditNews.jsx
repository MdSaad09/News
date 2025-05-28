import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiSave, FiImage, FiX, FiTag, FiPlus, FiLoader } from 'react-icons/fi';
// Add this import at the top of the file
import { getImageUrl } from '../../utils/imageUtils';

const EditNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([
    'politics', 'sports', 'technology', 'entertainment', 
    'business', 'health', 'science', 'other'
  ]);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    coverImage: '',
    media: [],
    tags: []
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would fetch this from your API
        // const config = {
        //   headers: {
        //     Authorization: `Bearer ${user.token}`
        //   }
        // };
        // 
        // const response = await axios.get(`http://localhost:5000/api/news/${id}`, config);
        // setFormData(response.data);
        
        // For now, we'll use placeholder data
        // This would be replaced with actual API call in production
        const placeholderData = {
          _id: id,
          title: 'Sample Article Title',
          summary: 'This is a sample summary for the article being edited.',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
          category: 'technology',
          coverImage: 'https://via.placeholder.com/800x400?text=Article+Cover+Image',
          media: [
            'https://via.placeholder.com/400x300?text=Additional+Media+1',
            'https://via.placeholder.com/400x300?text=Additional+Media+2'
          ],
          tags: ['technology', 'innovation', 'future']
        };
        
        setFormData(placeholderData);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch article details');
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real application, you would upload this to a server or cloud storage
    // For now, we'll use a local URL
    const imageUrl = URL.createObjectURL(file);
    setFormData({ ...formData, coverImage: imageUrl });
    
    if (errors.coverImage) {
      setErrors({ ...errors, coverImage: '' });
    }
  };
  
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // In a real application, you would upload these to a server or cloud storage
    // For now, we'll use local URLs
    const mediaUrls = files.map(file => URL.createObjectURL(file));
    setFormData({ ...formData, media: [...formData.media, ...mediaUrls] });
  };
  
  const removeMedia = (index) => {
    const updatedMedia = [...formData.media];
    updatedMedia.splice(index, 1);
    setFormData({ ...formData, media: updatedMedia });
  };
  
  const addTag = () => {
    if (!currentTag.trim()) return;
    
    if (!formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
    }
    
    setCurrentTag('');
  };
  
  const removeTag = (tag) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(t => t !== tag) 
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot be more than 100 characters';
    }
    
    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required';
    } else if (formData.summary.length > 200) {
      newErrors.summary = 'Summary cannot be more than 200 characters';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.coverImage) {
      newErrors.coverImage = 'Cover image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setSaving(true);
      
      // In a real application, you would send this to your API
      // const config = {
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${user.token}`
      //   }
      // };
      // 
      // const response = await axios.put(`http://localhost:5000/api/news/${id}`, formData, config);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaving(false);
      toast.success('Article updated successfully');
      navigate('/reporter');
    } catch (error) {
      setSaving(false);
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Article</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : ''}`}
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter article title"
            maxLength="100"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          <p className="text-gray-500 text-xs mt-1">{formData.title.length}/100 characters</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="summary">
            Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            id="summary"
            name="summary"
            rows="2"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.summary ? 'border-red-500' : ''}`}
            value={formData.summary}
            onChange={handleChange}
            placeholder="Enter a brief summary of the article"
            maxLength="200"
          ></textarea>
          {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary}</p>}
          <p className="text-gray-500 text-xs mt-1">{formData.summary.length}/200 characters</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-500' : ''}`}
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="coverImage">
            Cover Image <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              <FiImage className="mr-2" />
              Change Image
              <input
                id="coverImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverImageChange}
              />
            </label>
          </div>
          {errors.coverImage && <p className="text-red-500 text-xs mt-1">{errors.coverImage}</p>}
          
          {formData.coverImage && (
            <div className="mt-2">
              <div className="relative inline-block">
                <img 
                  src={getImageUrl(formData.coverImage)} 
                  alt="Cover Preview" 
                  className="h-40 w-auto rounded-md"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            rows="10"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.content ? 'border-red-500' : ''}`}
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your article content here..."
          ></textarea>
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Additional Media (Optional)
          </label>
          <div className="flex items-center">
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              <FiImage className="mr-2" />
              Add Media
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleMediaChange}
              />
            </label>
          </div>
          
          {formData.media.length > 0 && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.media.map((media, index) => (
                <div key={index} className="relative">
                  <img 
                    src={media} 
                    alt={`Media ${index + 1}`} 
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    onClick={() => removeMedia(index)}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Tags (Optional)
          </label>
          <div className="flex items-center">
            <input
              type="text"
              className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a tag"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-r px-4 py-2 transition-colors"
              onClick={addTag}
            >
              <FiPlus />
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <FiTag className="mr-1" />
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-blue-800 hover:text-blue-900"
                    onClick={() => removeTag(tag)}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-colors"
            disabled={saving}
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditNews;