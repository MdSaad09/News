// Utility function to ensure image URLs are absolute
export const getImageUrl = (imagePath) => {
  // Log the input path for debugging
  console.log('Original image path:', imagePath);
  
  if (!imagePath) {
    console.log('No image path provided, using placeholder');
    return '/images/news-placeholder.jpg';
  }
  
  // If it's already an absolute URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('Using absolute URL:', imagePath);
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads, prepend the server URL
  if (imagePath.startsWith('/uploads')) {
    const url = `http://localhost:5000${imagePath}`;
    console.log('Path starts with /uploads, using:', url);
    return url;
  }
  
  // Otherwise, assume it's a relative path and prepend the server URL + /uploads
  const url = `http://localhost:5000/uploads/${imagePath}`;
  console.log('Using constructed URL:', url);
  return url;
};