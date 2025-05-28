// src/pages/admin/PersonEditor.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import personService from '../../services/personService';

const PersonEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    description: '',
    website: '',
    birthDate: '',
    slug: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (isEditing) {
      fetchPersonData();
    }
  }, [id]);
  
  const fetchPersonData = async () => {
    try {
      setLoading(true);
      const data = await personService.getPersonById(id);
      
      // Format birth date for input if it exists
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
        slug: data.slug || ''
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
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
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
      
      // Prepare data for submission
      const personData = { ...formData };
      
      // Add image if selected
      if (imageFile) {
        personData.image = imageFile;
      }
      
      // Call API based on create or edit mode
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Text fields */}
          <div className="space-y-6">
            {/* Name */}
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
            
            {/* Profession */}
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
            
            {/* Slug */}
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
            
            {/* Website */}
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
            
            {/* Birth Date */}
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
          </div>
          
          {/* Right column - Image upload and description */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Person Image
              </label>
              <div className="mt-1 flex flex-col items-center">
                {/* Image preview */}
                {imagePreview ? (
                  <div className="mb-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-40 h-40 object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                
                {/* Upload button */}
                <label htmlFor="image-upload" className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md flex items-center">
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
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Form actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiX className="mr-2 -ml-1" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
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