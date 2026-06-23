import React, { useState } from 'react';
import { Star, CheckCircle, ThumbsUp, Trash2, Edit3, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Review } from '../../types';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { toggleLikeReview, deleteReview } from '../../features/review/reviewSlice';
import { toast } from 'react-hot-toast';

interface ReviewListProps {
  productId: string;
  reviews: Review[];
  pagination: any;
  currentUserId?: string;
  isAdmin?: boolean;
  onEditReview: (review: Review) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: {
    sort?: 'newest' | 'helpful' | 'ratingHigh' | 'ratingLow';
    rating?: number;
    verifiedOnly?: boolean;
  }) => void;
  filters: {
    sort: 'newest' | 'helpful' | 'ratingHigh' | 'ratingLow';
    rating: number;
    verifiedOnly: boolean;
  };
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  pagination,
  currentUserId,
  isAdmin,
  onEditReview,
  onPageChange,
  onFilterChange,
  filters,
}) => {
  const dispatch = useAppDispatch();
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null);

  const handleLike = async (reviewId: string) => {
    if (!currentUserId) {
      toast.error('Please log in to upvote reviews');
      return;
    }
    await dispatch(toggleLikeReview(reviewId));
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      const resultAction = await dispatch(deleteReview(reviewId));
      if (deleteReview.fulfilled.match(resultAction)) {
        toast.success('Review deleted successfully');
      } else {
        toast.error('Failed to delete review');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-6">
      {/* Filter and Sorting Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Rating filter */}
          <select
            value={filters.rating}
            onChange={(e) => onFilterChange({ rating: Number(e.target.value) })}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-300"
          >
            <option value={0}>All Stars</option>
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>

          {/* Sort order selection */}
          <select
            value={filters.sort}
            onChange={(e) =>
              onFilterChange({ sort: e.target.value as any })
            }
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-300"
          >
            <option value="newest">Newest First</option>
            <option value="helpful">Helpful (Top Rated)</option>
            <option value="ratingHigh">Highest Rating</option>
            <option value="ratingLow">Lowest Rating</option>
          </select>

          {/* Verified purchase toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-700 dark:text-slate-300 ml-1">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => onFilterChange({ verifiedOnly: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300 dark:border-slate-700"
            />
            <span>Verified Purchases Only</span>
          </label>
        </div>

        {pagination && pagination.total > 0 && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing {reviews.length} of {pagination.total} reviews
          </span>
        )}
      </div>

      {/* Reviews items list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            No reviews matching your filters yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-6">
          {reviews.map((review) => {
            const isAuthor = review.user?._id === currentUserId;
            const hasLiked = currentUserId && review.likes?.includes(currentUserId);
            
            return (
              <div key={review._id} className="pt-6 first:pt-0 space-y-3">
                {/* Author Name and Rating and Badges Row */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-bold text-slate-900 dark:text-white mr-1">
                        {review.rating}
                      </span>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </div>

                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {review.user?.name || 'Anonymous User'}
                    </div>

                    {review.isVerifiedPurchase && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                {/* Review Comment text */}
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {review.comment}
                </p>

                {/* Attached review images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {review.images.map((url, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImageZoom(url)}
                        className="relative group h-16 w-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer shadow-sm active:scale-95 transition-transform"
                      >
                        <img src={url} alt="Review attachment thumbnail" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Like / Helpful button and delete/edit action buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(review._id)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition cursor-pointer select-none ${
                        hasLiked
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${hasLiked ? 'fill-indigo-600 dark:fill-indigo-400' : ''}`} />
                      <span>Helpful ({review.likesCount || 0})</span>
                    </button>
                  </div>

                  {(isAuthor || isAdmin) && (
                    <div className="flex items-center gap-2">
                      {isAuthor && (
                        <button
                          onClick={() => onEditReview(review)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 text-slate-500 hover:text-rose-600 cursor-pointer rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-6">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          
          {Array.from({ length: pagination.totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`h-8 w-8 text-xs font-semibold rounded-lg border transition ${
                  pagination.page === pageNum
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 bg-transparent'
                } cursor-pointer`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      )}

      {/* Zoom Image Modal Overlay */}
      {activeImageZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-3xl max-h-[85vh] w-full flex items-center justify-center">
            <button
              onClick={() => setActiveImageZoom(null)}
              className="absolute top-[-40px] right-0 md:right-[-40px] text-white/80 hover:text-white p-2 transition cursor-pointer"
            >
              <X className="h-7 w-7" />
            </button>
            <img
              src={activeImageZoom}
              alt="Zoomed attachment"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
