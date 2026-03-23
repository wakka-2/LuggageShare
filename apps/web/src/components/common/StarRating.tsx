'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

export default function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onRate,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;
  const roundedRating = Math.round(displayRating * 2) / 2; // round to nearest 0.5
  const iconClass = sizeMap[size];

  function handleClick(star: number) {
    if (interactive && onRate) {
      onRate(star);
    }
  }

  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1;
        const isFull = starIndex <= Math.floor(roundedRating);
        const isHalf = !isFull && starIndex === Math.ceil(roundedRating) && roundedRating % 1 !== 0;

        return (
          <button
            key={starIndex}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => interactive && setHoverRating(starIndex)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`relative p-0 border-0 bg-transparent ${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            }`}
            aria-label={`${starIndex} نجوم`}
          >
            {/* Background (empty) star */}
            <Star className={`${iconClass} text-v2-text-muted`} />

            {/* Filled overlay */}
            {(isFull || isHalf) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: isHalf ? '50%' : '100%' }}
              >
                <Star className={`${iconClass} text-v2-amber fill-v2-amber`} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
