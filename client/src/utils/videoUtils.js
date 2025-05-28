/**
 * Video utility functions for handling video embeds
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - YouTube video ID or null if invalid
 */
export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Extract Vimeo video ID from Vimeo URL
 * @param {string} url - Vimeo URL
 * @returns {string|null} - Vimeo video ID or null if invalid
 */
export const getVimeoVideoId = (url) => {
  if (!url) return null;
  
  const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
  const match = url.match(regExp);
  
  return match ? match[3] : null;
};

/**
 * Generate YouTube thumbnail URL from video ID
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, hqdefault, mqdefault, sddefault, maxresdefault)
 * @returns {string} - YouTube thumbnail URL
 */
export const getYouTubeThumbnailUrl = (videoId, quality = 'hqdefault') => {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

/**
 * Render embedded video based on URL
 * @param {string} url - Video URL (YouTube, Vimeo, or direct file)
 * @param {string} thumbnail - Thumbnail URL for the video
 * @param {string} title - Video title for accessibility
 * @returns {JSX.Element} - Rendered video component
 */
export const renderVideo = (url, thumbnail, title) => {
  // Check if it's a YouTube URL
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title={title || "YouTube video"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }
  
  // Check if it's a Vimeo URL
  const vimeoId = getVimeoVideoId(url);
  if (vimeoId) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title={title || "Vimeo video"}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }
  
  // Assume it's a direct video file URL
  if (url && url.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <video 
        controls 
        className="w-full rounded-lg" 
        poster={thumbnail}
        preload="metadata"
      >
        <source src={url} type={`video/${url.split('.').pop().toLowerCase()}`} />
        Your browser does not support the video tag.
      </video>
    );
  }
  
  // Fallback for unsupported video types
  return (
    <div className="bg-gray-200 text-gray-600 p-4 rounded-lg text-center">
      Unsupported video format
    </div>
  );
};