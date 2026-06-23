import Review from '../models/review.model';
import Product from '../models/product.model';
import Order from '../models/order.model';
import { ApiError } from '../utils/api-error';
import mongoose from 'mongoose';

export class ReviewService {
  /**
   * Recalculates average rating and rating distribution for a product and saves it.
   */
  static async updateProductRatingStats(productId: string) {
    const product = await Product.findById(productId);
    if (!product) return;

    // Recalculate average rating & num reviews
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), status: 'APPROVED' } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          numReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      product.numReviews = stats[0].numReviews;
      product.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    } else {
      product.numReviews = 0;
      product.averageRating = 0;
    }
    await product.save();
  }

  /**
   * Helper to check if a user has ordered a product and paid or completed.
   */
  static async checkIfVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
    const order = await Order.findOne({
      user: userId,
      'items.product': productId,
      paymentStatus: 'PAID'
    });
    if (order) return true;

    // Alternate: COD with DELIVERED orderStatus
    const codOrder = await Order.findOne({
      user: userId,
      'items.product': productId,
      paymentMethod: 'COD',
      orderStatus: 'DELIVERED'
    });

    return !!codOrder;
  }

  /**
   * Create or update a review for a product and update product rating aggregates.
   */
  static async createReview(
    productId: string,
    userId: string,
    rating: number,
    comment: string,
    images: string[] = []
  ) {
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const isVerifiedPurchase = await this.checkIfVerifiedPurchase(userId, productId);

    let review = await Review.findOne({ product: productId, user: userId });
    
    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      review.images = images;
      review.isVerifiedPurchase = isVerifiedPurchase;
      await review.save();
    } else {
      // Create new review
      review = new Review({
        product: productId,
        user: userId,
        rating,
        comment,
        images,
        isVerifiedPurchase,
        status: 'APPROVED', // Default approved, mutable via admin moderate
      });
      await review.save();
    }

    // Recalculate average rating & stats
    await this.updateProductRatingStats(productId);

    // Return populated review
    const populated = await Review.findById(review._id).populate('user', 'name email');
    return populated;
  }

  /**
   * Update a review details
   */
  static async updateReview(
    reviewId: string,
    userId: string,
    data: { rating?: number; comment?: string; images?: string[] }
  ) {
    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      throw ApiError.notFound('Review not found or unauthorized');
    }

    if (data.rating !== undefined) review.rating = data.rating;
    if (data.comment !== undefined) review.comment = data.comment;
    if (data.images !== undefined) review.images = data.images;

    await review.save();

    // Recalculate stats
    await this.updateProductRatingStats(review.product.toString());

    return await Review.findById(review._id).populate('user', 'name email');
  }

  /**
   * Delete a review (owner or Admin)
   */
  static async deleteReview(reviewId: string, userId: string, userRoles: string[]) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('admin');
    if (review.user.toString() !== userId && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to delete this review');
    }

    await Review.findByIdAndDelete(reviewId);

    // Recalculate aggregates
    await this.updateProductRatingStats(review.product.toString());
    return { success: true };
  }

  /**
   * Toggle a like (helpfulness upvote) on a review
   */
  static async toggleLike(reviewId: string, userId: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const likeIndex = review.likes.findIndex((id) => id.toString() === userId);

    if (likeIndex > -1) {
      // Unlike
      review.likes.splice(likeIndex, 1);
    } else {
      // Like
      review.likes.push(userIdObj);
    }

    review.likesCount = review.likes.length;
    await review.save();

    return review;
  }

  /**
   * Fetch reviews list for a product with pagination, sorting, and filters.
   */
  static async getProductReviews(
    productId: string,
    query: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'helpful' | 'ratingHigh' | 'ratingLow';
      rating?: number;
      verifiedOnly?: boolean;
    } = {}
  ) {
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      throw ApiError.notFound('Product not found');
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    // Filter rules
    const filter: any = { product: productId, status: 'APPROVED' };
    if (query.rating) {
      filter.rating = Number(query.rating);
    }
    if (query.verifiedOnly === true || String(query.verifiedOnly) === 'true') {
      filter.isVerifiedPurchase = true;
    }

    // Sort rules
    let sortObj: any = { createdAt: -1 };
    if (query.sort === 'helpful') {
      sortObj = { likesCount: -1, createdAt: -1 };
    } else if (query.sort === 'ratingHigh') {
      sortObj = { rating: -1, createdAt: -1 };
    } else if (query.sort === 'ratingLow') {
      sortObj = { rating: 1, createdAt: -1 };
    }

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    return {
      reviews,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  /**
   * Renders rating distribution stats (1 to 5 stars counts).
   */
  static async getProductRatingDistribution(productId: string) {
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), status: 'APPROVED' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format output (ensure stars 1 to 5 are populated)
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.forEach((item) => {
      distribution[item._id] = item.count;
    });

    return distribution;
  }

  /**
   * Admin: List all reviews across the platform
   */
  static async listAllReviews(query: { page?: number; limit?: number; status?: string } = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }

    const reviews = await Review.find(filter)
      .populate('product', 'name slug images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    return {
      reviews,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  /**
   * Admin: Moderate review status (approve or reject)
   */
  static async moderateReview(reviewId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    review.status = status;
    await review.save();

    // Recalculate aggregates
    await this.updateProductRatingStats(review.product.toString());

    return review;
  }
}

export default ReviewService;
