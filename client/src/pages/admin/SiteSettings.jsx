import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiSave } from 'react-icons/fi';
import settingsService from '../../services/settingsService';

const SiteSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Breaking News',
    siteDescription: 'Your trusted source for the latest news and updates from around the world.',
    contactEmail: 'contact@breakingnews.com',
    contactPhone: '+1 (555) 123-4567',
    contactAddress: '123 News Street, City, Country',
    socialLinks: {
      facebook: 'https://facebook.com/breakingnews',
      twitter: 'https://twitter.com/breakingnews',
      instagram: 'https://instagram.com/breakingnews',
      youtube: 'https://youtube.com/breakingnews'
    },
    featuredCategories: ['politics', 'technology', 'sports', 'entertainment'],
    homepageLayout: 'standard',
    enableComments: true,
    requireCommentApproval: true,
    enableNewsletter: true,
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getSettings();
        setSettings(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch site settings: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects (like socialLinks.facebook)
      const [parent, child] = name.split('.');
      setSettings({
        ...settings,
        [parent]: {
          ...settings[parent],
          [child]: value
        }
      });
    } else {
      // Handle regular inputs
      setSettings({
        ...settings,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await settingsService.updateSettings(settings);
      setSaving(false);
      toast.success('Settings updated successfully');
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
    <div>
      <h2 className="text-2xl font-bold mb-6">Site Settings</h2>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* General Settings */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">General Settings</h3>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteName">
              Site Name
            </label>
            <input
              id="siteName"
              name="siteName"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.siteName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="homepageLayout">
              Homepage Layout
            </label>
            <select
              id="homepageLayout"
              name="homepageLayout"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.homepageLayout}
              onChange={handleChange}
            >
              <option value="standard">Standard</option>
              <option value="magazine">Magazine</option>
              <option value="blog">Blog</option>
              <option value="grid">Grid</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteDescription">
              Site Description
            </label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.siteDescription}
              onChange={handleChange}
            ></textarea>
          </div>
          
          {/* Contact Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 mt-4">Contact Information</h3>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactEmail">
              Contact Email
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.contactEmail}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactPhone">
              Contact Phone
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.contactPhone}
              onChange={handleChange}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactAddress">
              Contact Address
            </label>
            <input
              id="contactAddress"
              name="contactAddress"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.contactAddress}
              onChange={handleChange}
            />
          </div>
          
          {/* Social Media Links */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 mt-4">Social Media Links</h3>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="socialLinks.facebook">
              Facebook URL
            </label>
            <input
              id="socialLinks.facebook"
              name="socialLinks.facebook"
              type="url"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.socialLinks.facebook}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="socialLinks.twitter">
              Twitter URL
            </label>
            <input
              id="socialLinks.twitter"
              name="socialLinks.twitter"
              type="url"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.socialLinks.twitter}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="socialLinks.instagram">
              Instagram URL
            </label>
            <input
              id="socialLinks.instagram"
              name="socialLinks.instagram"
              type="url"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.socialLinks.instagram}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="socialLinks.youtube">
              YouTube URL
            </label>
            <input
              id="socialLinks.youtube"
              name="socialLinks.youtube"
              type="url"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.socialLinks.youtube}
              onChange={handleChange}
            />
          </div>
          
          {/* Feature Toggles */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 mt-4">Feature Settings</h3>
          </div>
          
          <div className="flex items-center">
            <input
              id="enableComments"
              name="enableComments"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={settings.enableComments}
              onChange={handleChange}
            />
            <label htmlFor="enableComments" className="ml-2 block text-sm text-gray-700">
              Enable Comments on Articles
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="requireCommentApproval"
              name="requireCommentApproval"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={settings.requireCommentApproval}
              onChange={handleChange}
            />
            <label htmlFor="requireCommentApproval" className="ml-2 block text-sm text-gray-700">
              Require Comment Approval
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="enableNewsletter"
              name="enableNewsletter"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={settings.enableNewsletter}
              onChange={handleChange}
            />
            <label htmlFor="enableNewsletter" className="ml-2 block text-sm text-gray-700">
              Enable Newsletter Subscription
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center"
            disabled={saving}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettings;
