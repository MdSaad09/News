import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import pageService from '../../services/pageService';

// You might want to use a rich text editor like React Quill or TinyMCE
// For simplicity, we'll use a textarea for now

const PageEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: true
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (isEditMode) {
      const fetchPage = async () => {
        try {
          setInitialLoading(true);
          const page = await pageService.getPageById(id);
          setFormData({
            title: page.title,
            slug: page.slug,
            content: page.content,
            metaTitle: page.metaTitle || '',
            metaDescription: page.metaDescription || '',
            isPublished: page.isPublished
          });
          setInitialLoading(false);
        } catch (error) {
          toast.error('Failed to fetch page: ' + (error.response?.data?.message || error.message));
          navigate('/admin/pages');
        }
      };
      
      fetchPage();
    }
  }, [id, isEditMode, navigate]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
      
      setFormData(prev => ({ ...prev, slug }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        await pageService.updatePage(id, formData);
        toast.success('Page updated successfully');
      } else {
        await pageService.createPage(formData);
        toast.success('Page created successfully');
      }
      
      navigate('/admin/pages');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
      setLoading(false);
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
        <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Page' : 'Create New Page'}</h2>
        
        <button
          onClick={() => navigate('/admin/pages')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" />
          Back to Pages
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Page Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter page title"
              value={formData.title}
              onChange={handleChange}
              onBlur={() => !formData.slug && generateSlug()}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="slug">
              Slug *
              <button
                type="button"
                onClick={generateSlug}
                className="ml-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Generate from title
              </button>
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="enter-page-slug"
              value={formData.slug}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
            Page Content *
          </label>
          <textarea
            id="content"
            name="content"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter page content (HTML supported)"
            value={formData.content}
            onChange={handleChange}
            rows="12"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="metaTitle">
              Meta Title (SEO)
            </label>
            <input
              id="metaTitle"
              name="metaTitle"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meta title (for SEO)"
              value={formData.metaTitle}
              onChange={handleChange}
              maxLength={70}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.metaTitle.length}/70 characters
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="metaDescription">
              Meta Description (SEO)
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meta description (for SEO)"
              value={formData.metaDescription}
              onChange={handleChange}
              rows="3"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.metaDescription.length}/160 characters
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-gray-700 font-medium">Publish this page</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Unpublished pages will not be visible to the public
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiSave className="mr-2" />
            {loading ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PageEditor;