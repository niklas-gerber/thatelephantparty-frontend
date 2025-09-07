// lib/image-loader.ts
export const customLoader = ({ 
  src, 
  width, 
  quality = 75 
}: { 
  src: string; 
  width: number; 
  quality?: number 
}) => {
  // If the image is already a full URL from our backend
  if (src.startsWith('http://backend:3001/') || src.startsWith('http://localhost:3001/')) {
    // Check if the backend supports image optimization with query parameters
    // If your backend supports resizing via query params, use:
    return `${src}?width=${width}&quality=${quality}`
    
    // If your backend doesn't support resizing, you'll need to use unoptimized
    // return src
  }
  
  // For relative paths, construct the full URL with optimization parameters
  // Assuming your backend supports resizing via query parameters
  const baseUrl = 'http://backend:3001';
  return `${baseUrl}${src}?width=${width}&quality=${quality}`;
}