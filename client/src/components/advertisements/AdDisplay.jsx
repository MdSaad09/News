// src/components/advertisements/AdDisplay.jsx - FINAL PRODUCTION VERSION
import { useState, useEffect, useCallback } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const AdDisplay = ({ 
  position, 
  page = 'all', 
  device = 'all',
  articleIndex = null,
  className = '',
  rotationInterval = 10000, // 10 seconds default
  displayMode = 'rotation' // 'rotation', 'random', 'all', 'priority'
}) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [impressionsTracked, setImpressionsTracked] = useState(new Set());

  useEffect(() => {
    fetchAdvertisements();
  }, [position, page, device]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        position,
        page,
        device
      });
      
      const url = `http://localhost:5000/api/advertisements/active?${queryParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const responseText = await response.text();
        
        try {
          const ads = JSON.parse(responseText);
          setAdvertisements(ads);
        } catch (parseError) {
          console.error('Error parsing advertisement data:', parseError);
        }
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackImpression = useCallback(async (adId) => {
    if (impressionsTracked.has(adId)) return;
    
    try {
      await fetch(`http://localhost:5000/api/advertisements/${adId}/impression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setImpressionsTracked(prev => new Set([...prev, adId]));
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  }, [impressionsTracked]);

  const handleAdClick = async (ad) => {
    console.log('🖱️ Ad clicked:', ad.title, 'Link URL:', ad.linkUrl); // Debug log
    
    try {
      const response = await fetch(`http://localhost:5000/api/advertisements/${ad.id}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📊 Click tracking response:', response.status); // Debug log
      
      if (ad.linkUrl) {
        console.log('🔗 Opening URL:', ad.linkUrl); // Debug log
        window.open(ad.linkUrl, '_blank', 'noopener noreferrer');
      } else {
        console.log('❌ No linkUrl provided for ad:', ad.title); // Debug log
      }
    } catch (error) {
      console.error('Error tracking click:', error);
      if (ad.linkUrl) {
        window.open(ad.linkUrl, '_blank', 'noopener noreferrer');
      }
    }
  };

  // Rotation effect for multiple ads
  useEffect(() => {
    if (advertisements.length > 1 && displayMode === 'rotation') {
      const interval = setInterval(() => {
        setCurrentAdIndex(prev => (prev + 1) % advertisements.length);
      }, rotationInterval);
      
      return () => clearInterval(interval);
    }
  }, [advertisements.length, rotationInterval, displayMode]);

  // Track impressions when ads are loaded
  useEffect(() => {
    if (advertisements.length > 0) {
      advertisements.forEach(ad => {
        trackImpression(ad.id);
      });
    }
  }, [advertisements, trackImpression]);

  const getAdStyles = (ad) => {
    const styles = {
      borderRadius: `${ad.borderRadius || 0}px`,
      display: 'block',
      maxWidth: '100%',
      transition: 'all 0.3s ease'
    };

    if (ad.backgroundColor) {
      styles.backgroundColor = ad.backgroundColor;
    }

    if (ad.textColor) {
      styles.color = ad.textColor;
    }

    // Size-based dimensions
    switch (ad.size) {
      case 'small':
        styles.maxWidth = '300px';
        break;
      case 'medium':
        styles.maxWidth = '728px';
        break;
      case 'large':
        styles.maxWidth = '970px';
        break;
      case 'custom':
        if (ad.width) styles.width = `${ad.width}px`;
        if (ad.height) styles.height = `${ad.height}px`;
        break;
      default:
        break;
    }

    return styles;
  };

  const renderAdvertisement = (ad) => {
    const adStyles = getAdStyles(ad);
    const isClickable = ad.linkUrl;

    const AdContent = () => {
      switch (ad.type) {
        case 'image':
          return (
            <img
              src={ad.imageUrl.startsWith('http') ? ad.imageUrl : getImageUrl(ad.imageUrl)}
              alt={ad.altText || ad.title}
              className="w-full h-auto object-contain"
              style={adStyles}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          );

        case 'text':
          return (
            <div
              className="flex items-center justify-center p-4 text-center"
              style={adStyles}
            >
              <div dangerouslySetInnerHTML={{ __html: ad.content }} />
            </div>
          );

        case 'video':
          return (
            <div
              className="flex items-center justify-center"
              style={adStyles}
              dangerouslySetInnerHTML={{ __html: ad.content }}
            />
          );

        case 'html':
          return (
            <div
              style={adStyles}
              dangerouslySetInnerHTML={{ __html: ad.content }}
            />
          );

        default:
          return null;
      }
    };

    return (
      <div
        key={ad.id}
        className={`advertisement relative mb-4 ${isClickable ? 'cursor-pointer hover:opacity-90' : ''}`}
        onClick={isClickable ? () => handleAdClick(ad) : undefined}
        style={ad.customCSS ? { ...JSON.parse(ad.customCSS) } : {}}
      >
        <AdContent />
        
        {/* Optional: Ad label (remove if you don't want it) */}
        <div className="absolute top-1 right-1 bg-gray-500 text-white text-xs px-1 py-0.5 rounded opacity-50 hover:opacity-70">
          Ad
        </div>
      </div>
    );
  };

  const getRelevantAds = () => {
    let relevantAds = advertisements;
    
    // Filter for between-articles positioning
    if (position === 'between-articles' && articleIndex !== null) {
      relevantAds = advertisements.filter(ad => 
        !ad.articlePosition || (articleIndex + 1) % ad.articlePosition === 0
      );
    }
    
    // Apply display mode
    switch (displayMode) {
      case 'rotation':
        // Show one ad at a time, rotating
        return relevantAds.length > 0 ? [relevantAds[currentAdIndex]] : [];
      
      case 'random':
        // Show one random ad
        if (relevantAds.length > 0) {
          const randomIndex = Math.floor(Math.random() * relevantAds.length);
          return [relevantAds[randomIndex]];
        }
        return [];
      
      case 'priority':
        // Show only the highest priority ad
        if (relevantAds.length > 0) {
          const highestPriority = Math.max(...relevantAds.map(ad => ad.priority));
          return relevantAds.filter(ad => ad.priority === highestPriority).slice(0, 1);
        }
        return [];
      
      case 'all':
      default:
        // Show all ads
        return relevantAds;
    }
  };

  if (loading) {
    return null;
  }

  const relevantAds = getRelevantAds();

  if (relevantAds.length === 0) {
    return null;
  }

  // For overlay and floating ads
  if (position === 'overlay-center' || position === 'floating-corner') {
    return (
      <div className={`fixed z-50 ${position === 'overlay-center' 
        ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
        : 'bottom-4 right-4'
      }`}>
        {relevantAds.map(renderAdvertisement)}
      </div>
    );
  }

  // For regular positioned ads
  return (
    <div className={`advertisement-container ${className}`}>
      {relevantAds.map(renderAdvertisement)}
      
      {/* Show rotation indicators for multiple ads */}
      {advertisements.length > 1 && displayMode === 'rotation' && (
        <div className="flex justify-center mt-2 space-x-1">
          {advertisements.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentAdIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentAdIndex(index)}
              aria-label={`Show ad ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdDisplay;