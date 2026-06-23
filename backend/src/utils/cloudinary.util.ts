import { cloudinary } from '../config/cloudinary.config';
import fs from 'fs';
import { logger } from './logger';
import { ApiError } from './api-error';

/**
 * Extract Cloudinary Public ID from Image URL
 */
export const getPublicIdFromUrl = (url: string): string => {
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return '';
    
    const pathAfterUpload = parts[1]; // e.g. "v1234567/folder/subfolder/image.jpg"
    const pathParts = pathAfterUpload.split('/');
    
    // Remove the version tag (e.g. "v1234567") if it exists
    if (pathParts[0].startsWith('v') && !isNaN(Number(pathParts[0].slice(1)))) {
      pathParts.shift();
    }
    
    const pathWithoutVersion = pathParts.join('/'); // e.g. "folder/subfolder/image.jpg"
    
    // Strip file extension
    const lastDotIndex = pathWithoutVersion.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return pathWithoutVersion.slice(0, lastDotIndex);
    }
    
    return pathWithoutVersion;
  } catch (error) {
    logger.error('Error parsing Cloudinary public ID:', error);
    return '';
  }
};

/**
 * Upload local file to Cloudinary and delete local temp file
 */
export const uploadImage = async (localFilePath: string, folder = 'ecomm'): Promise<string> => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'auto',
    });
    
    // Clean up local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    return response.secure_url;
  } catch (error: any) {
    // Ensure file is deleted locally even if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    logger.error('Cloudinary upload error:', error);
    throw ApiError.internal('Failed to upload image to cloud storage');
  }
};

/**
 * Delete image from Cloudinary using URL
 */
export const deleteImage = async (url: string): Promise<boolean> => {
  try {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return false;
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error: any) {
    logger.error('Cloudinary delete error:', error);
    return false;
  }
};
