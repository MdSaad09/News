// src/components/common/VideoPlayer.jsx
import { useState, useEffect, useRef } from 'react';
import { FiPlay, FiMaximize, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils';

const VideoPlayer = ({ src, thumbnail, title }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Determine video type
  const isYouTube = src?.includes('youtube.com') || src?.includes('youtu.be');
  const isVimeo = src?.includes('vimeo.com');
  const isExternalVideo = isYouTube || isVimeo;

  // Extract video ID for embedded players
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVimeoVideoId = (url) => {
    const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const match = url?.match(regExp);
    return match ? match[3] : null;
  };

  useEffect(() => {
    // Cleanup function to pause video when component unmounts
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Error playing video:', error);
        });
    }
  };

  const handleMouseEnter = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    if (!isPlaying) {
      setShowControls(false);
    }
  };

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const enterFullscreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement.webkitRequestFullscreen) {
      videoElement.webkitRequestFullscreen();
    } else if (videoElement.mozRequestFullScreen) {
      videoElement.mozRequestFullScreen();
    } else if (videoElement.msRequestFullscreen) {
      videoElement.msRequestFullscreen();
    }
  };

  // Render YouTube embed
  if (isYouTube) {
    const videoId = getYouTubeVideoId(src);
    if (!videoId) {
      return <div className="bg-red-100 text-red-800 p-4 rounded">Invalid YouTube URL</div>;
    }

    return (
      <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={title || "YouTube video"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Render Vimeo embed
  if (isVimeo) {
    const videoId = getVimeoVideoId(src);
    if (!videoId) {
      return <div className="bg-red-100 text-red-800 p-4 rounded">Invalid Vimeo URL</div>;
    }

    return (
      <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://player.vimeo.com/video/${videoId}`}
          title={title || "Vimeo video"}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Render self-hosted video with custom controls
  return (
    <div 
      className="relative w-full rounded-lg overflow-hidden bg-black"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Show thumbnail until video is loaded */}
      {(!isLoaded || !isPlaying) && thumbnail && (
        <div className="absolute inset-0 z-10">
          <img 
            src={getImageUrl(thumbnail)} 
            alt={title || 'Video thumbnail'} 
            className="w-full h-full object-cover"
          />
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-30 transition-all duration-300"
            aria-label="Play video"
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary-600 text-white">
              <FiPlay className="text-2xl ml-1" />
            </div>
          </button>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full"
        controls={showControls || isPlaying}
        preload="metadata"
        onLoadedData={handleLoadedData}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Custom controls overlay (optional) */}
      {showControls && isLoaded && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-70 hover:opacity-100 transition-opacity z-20">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleMute}
                className="hover:text-primary-400 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
              </button>
            </div>
            
            <button 
              onClick={enterFullscreen}
              className="hover:text-primary-400 transition-colors"
              aria-label="Enter fullscreen"
            >
              <FiMaximize size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;