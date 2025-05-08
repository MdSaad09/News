import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="font-montserrat">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3">Subscribe to Our Newsletter</h3>
            <p className="text-blue-100 mb-6">Get the latest news and updates delivered straight to your inbox</p>
            <form className="flex flex-col sm:flex-row gap-2 justify-center">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow max-w-md"
                required
              />
              <button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md transition-colors font-semibold"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Breaking News</h3>
              <p className="text-gray-300 mb-4">Your trusted source for the latest news and updates from around the world.</p>
              <div className="flex flex-col space-y-2">
                <div className="flex items-start">
                  <FiMapPin className="text-blue-300 mt-1 mr-2" />
                  <span className="text-gray-300">123 News Street, City, Country</span>
                </div>
                <div className="flex items-start">
                  <FiPhone className="text-blue-300 mt-1 mr-2" />
                  <span className="text-gray-300">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-start">
                  <FiMail className="text-blue-300 mt-1 mr-2" />
                  <span className="text-gray-300">contact@breakingnews.com</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                    Categories
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/category/politics" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                    Politics
                  </Link>
                </li>
                <li>
                  <Link to="/category/technology" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                    Technology
                  </Link>
                </li>
                <li>
                  <Link to="/category/sports" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                    Sports
                  </Link>
                </li>
                <li>
                  <Link to="/category/entertainment" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                    Entertainment
                  </Link>
                </li>
                <li>
                  <Link to="/category/business" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                    Business
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-3 mb-6">
                <a href="#" className="bg-gray-700 hover:bg-blue-600 text-white p-2 rounded-full transition-colors">
                  <FiFacebook className="w-5 h-5" />
                </a>
                <a href="#" className="bg-gray-700 hover:bg-blue-600 text-white p-2 rounded-full transition-colors">
                  <FiTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="bg-gray-700 hover:bg-blue-600 text-white p-2 rounded-full transition-colors">
                  <FiInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="bg-gray-700 hover:bg-blue-600 text-white p-2 rounded-full transition-colors">
                  <FiYoutube className="w-5 h-5" />
                </a>
              </div>
              <h5 className="text-sm font-semibold mb-2 text-white">Download Our App</h5>
              <div className="flex flex-col space-y-2">
                <a href="#" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.9 5c-.2 0-.3 0-.4.1-.7.4-1.5.6-2.3.6-.8 0-1.6-.2-2.3-.6-.5-.3-1.1-.3-1.6 0-.7.4-1.5.6-2.3.6-.8 0-1.6-.2-2.3-.6-.1-.1-.2-.1-.4-.1-.4 0-.7.3-.7.7v12.6c0 .4.3.7.7.7.1 0 .3 0 .4-.1.7-.4 1.5-.6 2.3-.6.8 0 1.6.2 2.3.6.2.1.5.2.8.2.3 0 .5-.1.8-.2.7-.4 1.5-.6 2.3-.6.8 0 1.6.2 2.3.6.1.1.2.1.4.1.4 0 .7-.3.7-.7V5.7c0-.4-.3-.7-.7-.7zM12 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
                  </svg>
                  App Store
                </a>
                <a href="#" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.8.7-1.5 1.5-1.5h15c.8 0 1.5.7 1.5 1.5v17c0 .8-.7 1.5-1.5 1.5h-15c-.8 0-1.5-.7-1.5-1.5zm17-17h-16v13h16v-13zm-7 16c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z"/>
                  </svg>
                  Google Play
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>&copy; {currentYear} Breaking News. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;