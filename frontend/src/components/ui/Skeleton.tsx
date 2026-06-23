import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rectangular' }) => {
  return (
    <div
      className={clsx(
        'skeleton-loader',
        {
          'rounded-full': variant === 'circular',
          'rounded-xl': variant === 'rectangular',
          'h-4 w-full rounded': variant === 'text',
        },
        className
      )}
    />
  );
};

export default Skeleton;
