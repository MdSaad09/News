// src/pages/admin/PersonEditor.jsx - COMPLETE ENHANCED VERSION
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FiSave, FiX, FiUpload, FiUser, FiGlobe, FiTwitter, FiInstagram, FiFacebook, FiLinkedin, FiYoutube } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/imageUtils';
import personService from '../../services/personService';

const PersonEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    description: '',
    website: '',
    birthDate: '',
    slug: '',
    category: 'other',
    nationality: '',
    socialMedia: {
      twitter: '',
      instagram: '',
      facebook: '',
      linkedin: '',
      youtube: ''
    }
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const personCategories = [
    { value: 'politician', label: 'Politician' },
    { value: 'celebrity', label: 'Celebrity' },
    { value: 'athlete', label: 'Athlete' },
    { value: 'business', label: 'Business Leader' },
    { value: 'activist', label: 'Activist' },
    { value: 'journalist', label: 'Journalist' },
    { value: 'scientist', label: 'Scientist' },
    { value: 'artist', label: 'Artist' },
    { value: 'other', label: 'Other' }
  ];
  
  useEffect(() => {
    if (isEditing) {
      fetchPersonData();
    } else {
      // Check for query parameters (e.g., from news editor)
      const nameParam = searchParams.get('name');
      if (nameParam) {
        setFormData(prev => ({
          ...prev,
          name: nameParam
        }));
      }
    }
  }, [id, searchParams]);
  
  const fetchPersonData = async () => {
    try {
      setLoading(true);
      const data = await personService.getPersonById(id);
      
      let formattedBirthDate = '';
      if (data.birthDate) {
        const date = new Date(data.birthDate);
        formattedBirthDate = date.toISOString().split('T')[0];
      }
      
      setFormData({
        name: data.name || '',
        profession: data.profession || '',
        description: data.description || '',
        website: data.website || '',
        birthDate: formattedBirthDate,
        slug: data.slug || '',
        category: data.category || 'other',
        nationality: data.nationality || '',
        socialMedia: data.socialMedia || {
          twitter: '',
          instagram: '',
          facebook: '',
          linkedin: '',
          youtube: ''
        }
      });
      
      if (data.image) {
        setImagePreview(data.image);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching person data:', err);
      setError('Failed to load person data. Please try again.');
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const personData = { ...formData };
      
      if (imageFile) {
        personData.image = imageFile;
      }
      
      if (isEditing) {
        await personService.updatePerson(id, personData);
        toast.success('Person updated successfully');
      } else {
        await personService.createPerson(personData);
        toast.success('Person created successfully');
      }
      
      navigate('/admin/people');
    } catch (err) {
      console.error('Error saving person:', err);
      setError('Failed to save person data. Please try again.');
      toast.error('Failed to save person');
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/people');
  };
  
  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Person' : 'Create New Person'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FiUser className="mr-2 text-blue-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
                    Profession
                  </label>
                  <input
                    type="text"
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {personCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                    Nationality
                  </label>
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Slug (URL-friendly name)
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="e.g. john-doe (leave empty to auto-generate)"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    If left empty, a slug will be automatically generated from the name.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Social Media Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FiGlobe className="mr-2 text-blue-600" />
                Online Presence
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiTwitter className="inline mr-1" />
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                      placeholder="@username or full URL"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiInstagram className="inline mr-1" />
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      placeholder="@username or full URL"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiFacebook className="inline mr-1" />
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      placeholder="Profile URL"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiLinkedin className="inline mr-1" />
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                      placeholder="Profile URL"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiYoutube className="inline mr-1" />
                      YouTube
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.youtube}
                      onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                      placeholder="Channel URL"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="6"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Tell us about this person..."
              ></textarea>
            </div>
          </div>
          
          {/* Right column - Image upload */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Person Image
              </label>
              <div className="flex flex-col items-center">
                {/* Image preview */}
                {imagePreview ? (
                  <div className="mb-4 relative">
                    <img 
                      src={imageFile ? imagePreview : getImageUrl(imagePreview)} 
                      alt="Preview" 
                      className="w-48 h-48 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-sm hover:bg-red-600"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <FiUser className="mx-auto text-gray-400 text-4xl mb-2" />
                      <span className="text-gray-500 text-sm">No image</span>
                    </div>
                  </div>
                )}
                
                {/* Upload button */}
                <label htmlFor="image-upload" className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-6 py-3 rounded-md flex items-center transition-colors">
                  <FiUpload className="mr-2" />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (formData.name) {
                      const slug = formData.name
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '');
                      setFormData(prev => ({ ...prev, slug }));
                    }
                  }}
                  className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1"
                >
                  Auto-generate slug from name
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      socialMedia: {
                        twitter: '',
                        instagram: '',
                        facebook: '',
                        linkedin: '',
                        youtube: ''
                      }
                    }));
                  }}
                  className="w-full text-left text-sm text-red-600 hover:text-red-800 py-1"
                >
                  Clear all social media links
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form actions */}
        <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiX className="mr-2 -ml-1" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            <FiSave className="mr-2 -ml-1" />
            {loading ? 'Saving...' : isEditing ? 'Update Person' : 'Create Person'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonEditor;