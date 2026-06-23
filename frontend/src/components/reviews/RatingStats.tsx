import React from 'react';
import { Star } from 'lucide-react';

interface RatingStatsProps {
  averageRating: number;
  numReviews: number;
  distribution: Record<number, number>;
}

export const RatingStats: React.FC<RatingStatsProps> = ({
  averageRating,
  numReviews,
  distribution,
}) => {
  // Ensure stars 1-5 exist
  const starLevels = [5, 4, 3, 2, 1];
  const maxCount = Math.max(...Object.values(distribution), 1);

  // Calculate percentages
  const percentages = starLevels.reduce((acc, rating) => {
    const count = distribution[rating] || 0;
    const percentage = numReviews > 0 ? Math.round((count / numReviews) * 100) : 0;
    acc[rating] = percentage;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      {/* Average rating card */}
      <div className="flex flex-col items-center justify-center text-center p-4 border-r border-slate-100 dark:border-slate-800 md:col-span-1">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Customer Rating
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-extrabold text-slate-900 dark:text-white">
            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
          </span>
          <span className="text-lg text-slate-400">/ 5</span>
        </div>
        <div className="flex items-center gap-1 my-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(averageRating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-700'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Based on {numReviews} {numReviews === 1 ? 'rating' : 'ratings'}
        </p>
      </div>

      {/* Progress Bars */}
      <div className="md:col-span-2 flex flex-col gap-3">
        {starLevels.map((rating) => {
          const percentage = percentages[rating] || 0;
          const count = distribution[rating] || 0;
          return (
            <div key={rating} className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300 w-8">
                {rating} <Star className="h-3.5 w-3.5 fill-slate-400 text-slate-400" />
              </span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    rating >= 4
                      ? 'bg-emerald-500'
                      : rating === 3
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400 w-12 text-right">
                {percentage}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 w-8 text-right">
                ({count})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingStats;
