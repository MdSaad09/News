import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-blue-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link 
        to="/" 
        className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;