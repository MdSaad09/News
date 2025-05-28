// src/components/common/PersonCard.jsx
import { Link } from 'react-router-dom';

const PersonCard = ({ person }) => {
  const { id, name, slug, image, profession } = person;
  
  return (
    <Link 
      to={`/people/${slug || id}`}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden"
    >
      <div className="relative pt-[100%]"> {/* 1:1 aspect ratio */}
        // Import at the top of the file
        import { getImageUrl } from '../../utils/imageUtils';
        
        // Update person image
        <img 
          src={getImageUrl(image)} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/person-placeholder.jpg"; // Fallback image
          }}
        />
      </div>
      
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{name}</h3>
        {profession && (
          <p className="text-gray-600 dark:text-gray-300 text-sm">{profession}</p>
        )}
      </div>
    </Link>
  );
};

export default PersonCard;