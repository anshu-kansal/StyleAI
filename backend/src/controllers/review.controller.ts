import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { uploadImage, deleteImage } from '../utils/cloudinary.util';
import Review from '../models/review.model';
import { ApiError } from '../utils/api-error';
import { UserRole } from '../constants/enums';

/**
 * Submit or update a review for a product.
 * Supports file uploads (max 5 images).
 */
export const createOrUpdateProductReview = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const userId = req.user!.id;
  
  let rating = req.body.rating;
  if (typeof rating === 'string') {
    rating = Number(rating);
  }
  
  const comment = req.body.comment;
  
  // Handle image uploads
  const files = req.files as Express.Multer.File[] | undefined;
  const uploadedImages: string[] = [];
  
  try {
    if (files && files.length > 0) {
      for (const file of files) {
        const secureUrl = await uploadImage(file.path, 'ecomm/reviews');
        uploadedImages.push(secureUrl);
      }
    }
  } catch (error) {
    // Clean up any uploaded files in this request if one failed
    for (const imgUrl of uploadedImages) {
      await deleteImage(imgUrl);
    }
    throw error;
  }
  
  // Find if there's an existing review
  const existingReview = await Review.findOne({ product: productId, user: userId });
  
  let finalImages = existingReview ? [...existingReview.images] : [];
  
  if (uploadedImages.length > 0) {
    // If new images uploaded, we replace the old ones from Cloudinary and use new ones.
    if (existingReview && existingReview.images && existingReview.images.length > 0) {
      for (const oldImg of existingReview.images) {
        await deleteImage(oldImg);
      }
    }
    finalImages = uploadedImages;
  } else if (req.body.images) {
    // If images are passed as urls (e.g. keep or delete existing ones)
    let reqImages = req.body.images;
    if (typeof reqImages === 'string') {
      try {
        reqImages = JSON.parse(reqImages);
      } catch {
        reqImages = [reqImages];
      }
    }
    if (Array.isArray(reqImages)) {
      // Delete any old images that are no longer in the request
      if (existingReview && existingReview.images) {
        const toDelete = existingReview.images.filter(img => !reqImages.includes(img));
        for (const img of toDelete) {
          await deleteImage(img);
        }
      }
      finalImages = reqImages;
    }
  }
  
  const review = await ReviewService.createReview(
    productId,
    userId,
    rating,
    comment,
    finalImages
  );
  
  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'Review submitted successfully', review)
  );
});

/**
 * Fetch reviews for a specific product.
 */
export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const { page, limit, sort, rating, verifiedOnly } = req.query;
  
  const result = await ReviewService.getProductReviews(productId, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sort: sort as any,
    rating: rating ? Number(rating) : undefined,
    verifiedOnly: verifiedOnly === 'true',
  });
  
  const distribution = await ReviewService.getProductRatingDistribution(productId);
  
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Product reviews retrieved successfully', {
      reviews: result.reviews,
      pagination: result.pagination,
      distribution
    })
  );
});

/**
 * Toggle upvote / like on a review.
 */
export const toggleReviewLike = asyncHandler(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const userId = req.user!.id;
  
  const review = await ReviewService.toggleLike(reviewId, userId);
  
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Review helpfulness toggled successfully', {
      likesCount: review.likesCount,
      likes: review.likes
    })
  );
});

/**
 * Delete a review.
 */
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const userId = req.user!.id;
  const userRoles = req.user!.roles || [];
  
  const review = await Review.findById(reviewId);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  
  const isAdmin = userRoles.includes(UserRole.ADMIN);
  if (review.user.toString() !== userId && !isAdmin) {
    throw ApiError.forbidden('You are not authorized to delete this review');
  }
  
  // Clean up images from Cloudinary
  if (review.images && review.images.length > 0) {
    for (const url of review.images) {
      await deleteImage(url);
    }
  }
  
  await ReviewService.deleteReview(reviewId, userId, userRoles);
  
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Review deleted successfully')
  );
});

/**
 * Admin: List all reviews.
 */
export const listAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;
  
  const result = await ReviewService.listAllReviews({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as string,
  });
  
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'All reviews retrieved successfully', result)
  );
});

/**
 * Admin: Moderate a review status (APPROVE/REJECT).
 */
export const moderateReview = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    throw ApiError.badRequest('Invalid status. Allowed values: PENDING, APPROVED, REJECTED');
  }
  
  const review = await ReviewService.moderateReview(req.params.id, status);
  
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, `Review status updated to ${status}`, review)
  );
});
