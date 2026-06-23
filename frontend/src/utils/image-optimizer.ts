/**
 * Dynamic Image Optimization Utility for Cloudinary URLs.
 * If the URL is hosted on Cloudinary, inject resizing and optimization parameters.
 * E.g. converts ".../upload/v12345/..." to ".../upload/w_400,c_scale,q_auto,f_auto/v12345/..."
 */
export const getOptimizedImageUrl = (url: string | undefined, width = 400, quality = 'auto'): string => {
  if (!url) return '';

  // If it's not a Cloudinary image, return the original URL
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  try {
    // Check if the URL already has transformation properties
    // Cloudinary URLs contain /upload/ followed by version or optional folder names.
    const uploadPart = '/upload/';
    const index = url.indexOf(uploadPart);
    if (index === -1) return url;

    const base = url.substring(0, index + uploadPart.length);
    const rest = url.substring(index + uploadPart.length);

    // If rest already starts with transforms (like w_, h_, q_, f_), avoid duplicate injections
    const firstSegment = rest.split('/')[0];
    if (
      firstSegment.includes('w_') ||
      firstSegment.includes('h_') ||
      firstSegment.includes('q_') ||
      firstSegment.includes('f_') ||
      firstSegment.includes('c_')
    ) {
      return url;
    }

    // Inject format auto, quality auto, scale crop/resize transform
    const transform = `w_${width},c_scale,q_${quality},f_auto/`;
    return `${base}${transform}${rest}`;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return url;
  }
};
