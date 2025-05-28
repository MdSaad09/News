import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUpload, FiPlus, FiSearch, FiFile, FiTrash2, FiCheck, FiEdit, FiDownload, FiFilter, FiFileText, FiX, FiGrid, FiList, FiVideo } from 'react-icons/fi';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';

const API_URL = 'http://localhost:5000';
axios.defaults.baseURL = API_URL;

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [importedNews, setImportedNews] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef(null);
  const importFileRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [importErrors, setImportErrors] = useState([]);
  const [previewMode, setPreviewMode] = useState('grid'); // 'grid' or 'table'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [videoFilter, setVideoFilter] = useState('all'); // 'all', 'video', 'non-video'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user && user.token) {
      fetchNews();
    }
  }, [user, page, statusFilter, categoryFilter, videoFilter]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token || ''}`
        },
        params: {
          // Add any query parameters you need
          page: page,
          limit: itemsPerPage,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          hasVideo: videoFilter !== 'all' ? (videoFilter === 'video') : undefined,
          search: searchTerm || undefined
        }
      };
      
      // Make sure to use the correct endpoint - this should be '/api/news/admin'
      // not just '/api/news' which might be for public news
      const response = await axios.get('/api/news/admin', config);
      
      // Handle the response data properly
      if (response.data && Array.isArray(response.data)) {
        // If the response is a direct array
        setNews(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } else if (response.data && response.data.news) {
        // If the response is paginated with a 'news' property
        setNews(response.data.news);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages || 1);
          // You can also set the page if it comes from the backend
          // setPage(response.data.pagination.page);
        }
      } else {
        // Fallback
        setNews([]);
        setTotalPages(1);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError('Failed to fetch news: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchNews();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setVideoFilter('all'); // Reset video filter
    setPage(1);
    fetchNews();
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('image', file);
    });

    try {
      setUploading(true);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token || ''}`
        }
      };

      const response = await axios.post('/api/upload', formData, config);
      
      // Add the uploaded images to the imported news
      const uploadedImageUrls = response.data?.urls || [];
      
      if (uploadedImageUrls.length > 0) {
        setImportedNews(prev => {
          return prev.map((item, index) => {
            // Find the first item without an image
            const targetIndex = prev.findIndex(item => !item?.coverImage && !item?.imageUrl);
            if (targetIndex === index && index < uploadedImageUrls.length) {
              return { 
                ...item, 
                coverImage: uploadedImageUrls[index],
                imageUrl: uploadedImageUrls[index] 
              };
            }
            return item;
          });
        });
        
        toast.success(`${uploadedImageUrls.length} images uploaded successfully`);
      } else {
        toast.warning('No image URLs returned from server');
      }
      
      setUploading(false);
    } catch (error) {
      setUploading(false);
      toast.error(error.response?.data?.message || 'Failed to upload images');
    }
    
    // Clear the file input
    if (e.target) e.target.value = '';
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setBulkUploadLoading(true);
    setImportErrors([]);
    
    // Check file size
    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      setBulkUploadLoading(false);
      if (e.target) e.target.value = '';
      return;
    }
    
    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['txt', 'docx'];
    if (!allowedExtensions.includes(extension)) {
      toast.error(`Only ${allowedExtensions.join(', ')} files are supported.`);
      setBulkUploadLoading(false);
      if (e.target) e.target.value = '';
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token || ''}`
        }
      };
      
      let parsedArticles = [];
      
      // Try to use the server endpoint if available, otherwise fallback to client-side parsing
      try {
        const response = await axios.post('/api/news/import/parse', formData, config);
        if (response.data && response.data.articles) {
          parsedArticles = response.data.articles;
        }
      } catch (parseError) {
        // If the endpoint doesn't exist or fails, try client-side parsing
        if (extension === 'txt') {
          const reader = new FileReader();
          const textContent = await new Promise((resolve) => {
            reader.onload = (event) => resolve(event.target?.result);
            reader.readAsText(file);
          });
          
          if (typeof textContent === 'string') {
            parsedArticles = parseImportedContent(textContent);
          }
        } else {
          throw new Error(`Cannot parse ${extension} files on the client. Server-side parsing failed.`);
        }
      }
      
      if (parsedArticles && parsedArticles.length > 0) {
        // Normalize the imported news format
        const normalizedArticles = parsedArticles.map(article => ({
          ...article,
          // Add default values for required fields
          title: article?.title || 'Untitled Article',
          category: article?.category || 'other',
          summary: article?.summary || (article?.content ? article.content.substring(0, 150) + '...' : 'No summary available'),
          // Normalize image fields
          coverImage: article?.coverImage || article?.imageUrl || '',
          imageUrl: article?.imageUrl || article?.coverImage || '',
          // Handle tags if they're not already an array
          tags: Array.isArray(article?.tags) ? article.tags : (article?.tags ? [article.tags] : [])
        }));
        
        setImportedNews(normalizedArticles);
        setShowImportModal(true);
        toast.success(`${normalizedArticles.length} news items parsed successfully`);
      } else {
        toast.warning('No valid articles found in the file');
        setImportErrors(['No valid articles could be parsed from the file']);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to parse file');
      setImportErrors([error.response?.data?.message || error.message || 'File parsing failed']);
    } finally {
      setBulkUploadLoading(false);
      // Reset the file input
      if (e.target) e.target.value = '';
    }
  };

  const handleBatchPublish = async () => {
    try {
      setUploading(true);
      
      // Filter out items without required fields
      const validItems = importedNews.filter(item => item?.title && item?.content);
      
      if (validItems.length === 0) {
        toast.error('No valid news items to publish');
        setUploading(false);
        return;
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || ''}`
        }
      };
      
      // Send the batch directly to the server
      const response = await axios.post('/api/news/import', { 
        newsItems: validItems 
      }, config);
      
      setUploading(false);
      
      if (response.data?.success) {
        setShowImportModal(false);
        setImportedNews([]);
        toast.success(`${response.data.imported} news items published successfully${response.data.failed > 0 ? `, ${response.data.failed} failed` : ''}`);
        
        // Refresh the news list
        fetchNews();
      } else {
        toast.error('Failed to publish news items');
      }
    } catch (error) {
      console.error('Batch publish error:', error);
      setUploading(false);
      toast.error('An error occurred during publishing');
    }
  };

  const parseImportedContent = (content) => {
    if (!content) return [];
    
    try {
      // First check if it's in the NEWSH format
      if (content.includes('NEWSH:')) {
        const lines = content.split('\n');
        const importedItems = [];
        let currentItem = {};
      
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]?.trim() || '';
          
          if (line.startsWith('NEWSH:')) {
            // If we already have a current item with a title, save it and start a new one
            if (currentItem.title) {
              importedItems.push(currentItem);
              currentItem = {};
            }
            currentItem.title = line.substring(6).trim();
          } else if (line.startsWith('NEWSD:')) {
            currentItem.content = line.substring(6).trim();
          } else if (line.startsWith('NEWSS:')) {
            currentItem.summary = line.substring(6).trim();
          } else if (line.startsWith('NEWSIMG:') || line.startsWith('COVERIMAGE:')) {
            currentItem.imageUrl = line.substring(line.indexOf(':') + 1).trim();
            currentItem.coverImage = currentItem.imageUrl;
          } else if (line.startsWith('CATEGORY:')) {
            currentItem.category = line.substring(9).trim();
          } else if (line.startsWith('TAGS:')) {
            currentItem.tags = line.substring(5).trim().split(',').map(tag => tag.trim());
          } else if (currentItem.content && line) {
            // Append to content if we're already in a content section and the line is not empty
            currentItem.content += '\n' + line;
          }
        }
    
        // Add the last item if it has a title
        if (currentItem.title) {
          importedItems.push(currentItem);
        }
        
        if (importedItems.length > 0) {
          return importedItems;
        }
      }
      
      // If not in NEWSH format, try simple format (article separated by multiple blank lines)
      const articles = content.split(/\n{2,}/);
      return articles.filter(article => article?.trim())
        .map(article => {
          if (!article) return null;
          const lines = article.trim().split('\n');
          const title = lines[0]?.trim() || '';
          const content = lines.slice(1).join('\n').trim();
          
          return {
            title,
            content,
            summary: content ? content.substring(0, Math.min(150, content.length)) + '...' : '',
            category: 'other'
          };
        })
        .filter(article => article && article.title && article.content);
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error('Failed to parse imported content: ' + error.message);
    }
  };

  const handlePublishImportedNews = async () => {
    try {
      setUploading(true);
      
      // Filter out items without required fields
      const validItems = importedNews.filter(item => item?.title && item?.content);
      
      if (validItems.length === 0) {
        toast.error('No valid news items to publish');
        setUploading(false);
        return;
      }
  
      // Create an array to track successful publications
      let successCount = 0;
      let failedCount = 0;
      
      // Process each news item individually
      for (const item of validItems) {
        try {
          const config = {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user?.token || ''}`
            }
          };
  
          // Check if the image is a base64 string
          let imageUrl = item?.imageUrl || item?.coverImage || '';
          
          // If no image URL is provided, use a default placeholder image
          if (!imageUrl) {
            imageUrl = 'https://via.placeholder.com/800x400?text=No+Image+Available';
          }
          
          // If it's a base64 image, upload it first
          if (imageUrl.startsWith('data:image')) {
            try {
              // Convert base64 to file
              const fetchResponse = await fetch(imageUrl);
              const blob = await fetchResponse.blob();
              const file = new File([blob], "image.jpg", { type: "image/jpeg" });
              
              // Create form data for image upload
              const formData = new FormData();
              formData.append('image', file);
              
              // Upload the image
              const uploadConfig = {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${user?.token || ''}`
                }
              };
              
              const uploadResponse = await axios.post('/api/upload', formData, uploadConfig);
              
              if (uploadResponse.data?.urls && uploadResponse.data.urls.length > 0) {
                imageUrl = uploadResponse.data.urls[0];
              } else if (uploadResponse.data?.url) {
                imageUrl = uploadResponse.data.url;
              } else {
                imageUrl = 'https://via.placeholder.com/800x400?text=Upload+Failed';
              }
            } catch (uploadError) {
              console.error('Failed to upload base64 image:', uploadError);
              // Use placeholder if upload fails
              imageUrl = 'https://via.placeholder.com/800x400?text=Upload+Failed';
            }
          }
          
          // Generate a summary from the content if it's not provided
          const summary = item?.summary || (item?.content ? item.content.substring(0, Math.min(150, item.content.length)) + '...' : '');
          
          // Prepare the news data object
          const newsData = {
            title: item?.title || '',
            content: item?.content || '',
            summary: summary,
            coverImage: imageUrl,
            category: item?.category || 'other',
            tags: item?.tags || [],
            isPublished: true
          };
          
          // Send the news item to the server
          const response = await axios.post('/api/news', newsData, config);
          successCount++;
          
          // Add a small delay between requests to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (itemError) {
          failedCount++;
          console.error('Error publishing item:', item?.title);
          console.error('Error details:', itemError.response?.data || itemError.message);
          
          // More specific error handling based on status code
                    // More specific error handling based on status code
                    if (itemError.response?.status === 400) {
                      toast.error(`Validation error for "${item?.title || 'Unknown'}": ${itemError.response?.data?.message || 'Missing required fields'}`);
                    } else if (itemError.response?.status === 413) {
                      toast.error(`File too large for "${item?.title || 'Unknown'}". Try a smaller image.`);
                    }
                  }
                }
                
                setUploading(false);
                
                if (successCount > 0) {
                  setShowImportModal(false);
                  setImportedNews([]);
                  toast.success(`${successCount} news items published successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}`);
                  
                  // Refresh the news list
                  fetchNews();
                } else {
                  toast.error('Failed to publish any news items. Check console for details.');
                }
              } catch (error) {
                console.error('Publish error:', error);
                setUploading(false);
                toast.error('An unexpected error occurred during publishing');
              }
            };
          
            const handleRemoveImportedItem = (index) => {
              if (index >= 0 && index < importedNews.length) {
                setImportedNews(prev => prev.filter((_, i) => i !== index));
              }
            };
          
            const handleDeleteNews = async () => {
              if (!selectedNews || !selectedNews.id) return;
              
              try {
                const config = {
                  headers: {
                    Authorization: `Bearer ${user?.token || ''}`
                  }
                };
                
                await axios.delete(`/api/news/${selectedNews.id}`, config);
                
                // Update local state
                setNews(news.filter(item => item?.id !== selectedNews?.id));
                setShowDeleteModal(false);
                setSelectedNews(null);
                
                toast.success('News deleted successfully');
              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete news');
              }
            };
          
            const downloadSampleTemplate = () => {
              const sampleContent = `NEWSH: Sample News Article Title
          NEWSD: This is the main content of your news article. You can write multiple paragraphs here.
          
          This is a new paragraph in the content.
          NEWSS: This is a brief summary of the article.
          NEWSIMG: https://example.com/image.jpg
          CATEGORY: technology
          TAGS: news, sample, technology
          
          NEWSH: Another Sample Article Title
          NEWSD: Content for the second article goes here.
          NEWSS: A concise summary for the second article.
          NEWSIMG: https://via.placeholder.com/800x400?text=No+Image+Available
          CATEGORY: politics
          TAGS: politics, world`;
          
              const blob = new Blob([sampleContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'news_template.txt';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            };
          
            const updateImportedNewsItem = (index, field, value) => {
              if (index >= 0 && index < importedNews.length) {
                const updatedNews = [...importedNews];
                updatedNews[index] = { ...updatedNews[index], [field]: value };
                setImportedNews(updatedNews);
              }
            };
          
            // Apply filters to news array
            const applyFilters = (newsArray) => {
              if (!Array.isArray(newsArray)) return [];
              
              return newsArray.filter(item => {
                if (!item) return false;
                
                // Search filter
                const matchesSearch = !searchTerm || 
                  (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()));
                
                // Status filter
                const matchesStatus = statusFilter === 'all' || 
                  (statusFilter === 'published' && item.isPublished) ||
                  (statusFilter === 'draft' && !item.isPublished);
                
                // Category filter
                const matchesCategory = categoryFilter === 'all' || 
                  (item.category && item.category === categoryFilter);
                  
                // Video filter - new
                const matchesVideo = videoFilter === 'all' || 
                  (videoFilter === 'video' && item.hasVideo) ||
                  (videoFilter === 'non-video' && !item.hasVideo);
                
                return matchesSearch && matchesStatus && matchesCategory && matchesVideo;
              });
            };
          
            const filteredNews = applyFilters(news);
              
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
              <div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                  <h2 className="text-2xl font-bold mb-4 md:mb-0">News Management</h2>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="relative">
                      <input
                        type="text"
                        placeholder="Search news..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <button type="submit" className="hidden">Search</button>
                    </form>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={downloadSampleTemplate}
                        className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <FiDownload className="mr-2" />
                        Template
                      </button>
                      
                      <button
                        onClick={() => importFileRef.current && importFileRef.current.click()}
                        className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        disabled={bulkUploadLoading}
                      >
                        <FiFile className="mr-2" />
                        {bulkUploadLoading ? 'Parsing...' : 'Import News'}
                      </button>
                      <input
                        type="file"
                        ref={importFileRef}
                        onChange={handleImportFile}
                        className="hidden"
                        accept=".txt,.docx"
                      />
                      
                      <Link
                        to="/admin/news/create"
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <FiPlus className="mr-2" />
                        Add News
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiFilter className="mr-2 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                    
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="border rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="politics">Politics</option>
                      <option value="sports">Sports</option>
                      <option value="technology">Technology</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="business">Business</option>
                      <option value="health">Health</option>
                      <option value="science">Science</option>
                      <option value="other">Other</option>
                    </select>
                    
                    <select
                      value={videoFilter}
                      onChange={(e) => setVideoFilter(e.target.value)}
                      className="border rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Content</option>
                      <option value="video">With Video</option>
                      <option value="non-video">No Video</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={resetFilters}
                    className="ml-auto text-sm px-3 py-1.5 text-gray-600 hover:text-gray-900 flex items-center"
                  >
                    <FiX className="mr-1" /> Clear Filters
                  </button>
                </div>
                
                {filteredNews.length === 0 ? (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
                    No news found. {searchTerm && 'Try a different search term or'} <Link to="/admin/news/create" className="text-blue-600 hover:underline">create a new article</Link>.
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredNews.filter(item => item != null).map((item) => (
                            <tr key={item?.id || Math.random().toString()} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 mr-4">
                                    <img 
                                      className="h-10 w-10 rounded-md object-cover" 
                                      src={getImageUrl(item?.coverImage || item?.imageUrl) || 'https://via.placeholder.com/40x40?text=No+Image'} 
                                      alt={item?.title || 'News image'}
                                      onError={(e) => {
                                        if (e.target) {
                                          e.target.onerror = null;
                                          e.target.src = 'https://via.placeholder.com/40x40?text=Error';
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="text-sm font-medium text-gray-900 max-w-sm truncate">
                                    {item?.title || 'Untitled'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {typeof item?.category === 'object' ? 
                                (item?.category?.name || 'Other') : 
                                (item?.category || 'Other')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item && item.hasVideo ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    <FiVideo className="mr-1" />
                                    Video
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    No Video
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item && item.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {item && item.isPublished ? 'Published' : 'Draft'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item && (item.publishedAt || item.createdAt) ? 
                                  new Date(item.publishedAt || item.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-3">
                                  <Link 
                                    to={`/admin/news/edit/${item?.id}`}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Edit"
                                  >
                                    <FiEdit />
                                  </Link>
                                  <button
                                    onClick={() => {
                                      setSelectedNews(item);
                                      setShowDeleteModal(true);
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-500">
                          Page {page} of {totalPages}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className={`px-3 py-1 rounded border ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                            className={`px-3 py-1 rounded border ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {/* Import News Modal - Enhanced */}
                {showImportModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">Imported News Items ({importedNews.length})</h3>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setPreviewMode('grid')}
                                className={`p-2 rounded ${previewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                                title="Grid View"
                              >
                                <FiGrid size={20} />
                              </button>
                              <button
                                onClick={() => setPreviewMode('table')}
                                className={`p-2 rounded ${previewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                                title="Table View"
                              >
                                <FiList size={20} />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => fileInputRef.current && fileInputRef.current.click()}
                              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                              disabled={uploading}
                            >
                              <FiUpload className="mr-2" />
                              {uploading ? 'Uploading...' : 'Upload Images'}
                            </button>
                          </div>
                        </div>
                        
                        {importErrors.length > 0 && (
                          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md">
                            <h4 className="font-bold">Import Errors:</h4>
                            <ul className="list-disc pl-5">
                              {importErrors.map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <input
                          type="file"
                          multiple
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                          accept="image/*"
                        />
                        
                        {/* Grid View */}
                        {previewMode === 'grid' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                              {importedNews.filter(item => item != null).map((item, index) => (
                    <div key={index} className="border rounded-md p-4 relative bg-white hover:shadow-md transition">
                      <button
                        onClick={() => handleRemoveImportedItem(index)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                        title="Remove"
                      >
                        <FiTrash2 />
                      </button>
                      
                      <div className="mb-3">
                        <input
                          type="text"
                          className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                          value={item?.title || ''}
                          onChange={(e) => updateImportedNewsItem(index, 'title', e.target.value)}
                          placeholder="News Title"
                        />
                      </div>
                      
                      <div className="mb-3 h-32 bg-gray-100 rounded overflow-hidden">
                        {(item?.coverImage || item?.imageUrl) ? (
                          <div className="relative h-full">
                            <img 
                              src={getImageUrl(item?.coverImage || item?.imageUrl)} 
                              alt={item?.title || 'News image'} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                if (e.target) {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                updateImportedNewsItem(index, 'coverImage', '');
                                updateImportedNewsItem(index, 'imageUrl', '');
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                              title="Remove image"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400">
                            <FiFileText className="mr-2" /> No image
                          </div>
                        )}
                      </div>
                      
                      <div className="flex mb-3 space-x-2">
                        <select
                          className="shadow-sm border rounded py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                          value={item?.category || 'other'}
                          onChange={(e) => updateImportedNewsItem(index, 'category', e.target.value)}
                        >
                          <option value="politics">Politics</option>
                          <option value="sports">Sports</option>
                          <option value="technology">Technology</option>
                          <option value="entertainment">Entertainment</option>
                          <option value="business">Business</option>
                          <option value="health">Health</option>
                          <option value="science">Science</option>
                          <option value="other">Other</option>
                        </select>
                        
                        <input
                          type="text"
                          className="shadow-sm border rounded py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                          value={item?.tags ? (Array.isArray(item.tags) ? item.tags.join(', ') : item.tags) : ''}
                          onChange={(e) => updateImportedNewsItem(index, 'tags', e.target.value.split(',').map(tag => tag.trim()))}
                          placeholder="Tags (comma separated)"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <textarea
                          className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          value={item?.summary || ''}
                          onChange={(e) => updateImportedNewsItem(index, 'summary', e.target.value)}
                          placeholder="Summary (optional)"
                        ></textarea>
                      </div>
                      
                      <div>
                        <textarea
                          className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="4"
                          value={item?.content || ''}
                          onChange={(e) => updateImportedNewsItem(index, 'content', e.target.value)}
                          placeholder="Content"
                        ></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Table View */}
              {previewMode === 'table' && (
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content Preview</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importedNews.filter(item => item != null).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="text"
                              className="shadow-sm border rounded w-full py-1 px-2 text-gray-700 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={item?.title || ''}
                              onChange={(e) => updateImportedNewsItem(index, 'title', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="h-12 w-12 relative">
                              {(item?.coverImage || item?.imageUrl) ? (
                                <img 
                                  src={getImageUrl(item?.coverImage || item?.imageUrl)} 
                                  alt="Preview" 
                                  className="h-12 w-12 object-cover rounded"
                                  onError={(e) => {
                                    if (e.target) {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/48?text=Error';
                                    }
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 bg-gray-100 flex items-center justify-center rounded">
                                  <span className="text-xs text-gray-500">No img</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select
                              className="shadow-sm border rounded py-1 px-2 text-gray-700 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={item?.category || 'other'}
                              onChange={(e) => updateImportedNewsItem(index, 'category', e.target.value)}
                            >
                              <option value="politics">Politics</option>
                              <option value="sports">Sports</option>
                              <option value="technology">Technology</option>
                              <option value="entertainment">Entertainment</option>
                              <option value="business">Business</option>
                              <option value="health">Health</option>
                              <option value="science">Science</option>
                              <option value="other">Other</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {item?.content ? (item.content.substring(0, 40) + '...') : 'No content'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleRemoveImportedItem(index)}
                              className="text-red-600 hover:text-red-800 mx-1"
                              title="Remove"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportedNews([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishImportedNews}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  disabled={uploading || importedNews.length === 0}
                >
                  <FiCheck className="mr-2" />
                  {uploading ? 'Publishing...' : 'Publish All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete the news article "{selectedNews?.title || 'Unknown'}"? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedNews(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNews}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;