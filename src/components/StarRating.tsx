/**
 * StarRating.tsx
 * Malazone.com — Reusable Star Rating Component
 * Display + Interactive modes
 * © 2026 Malazone Technologies PLC
 */

import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
  className = "",
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  // Normalize in case the parent passes a numeric string from an API aggregate.
  const numericRating = Number(rating) || 0;

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const displayRating = hoverRating || numericRating;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= displayRating;
        const halfFilled = !filled && starValue - 0.5 <= displayRating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : halfFilled
                  ? "fill-amber-400/50 text-amber-400"
                  : "fill-slate-200 dark:fill-slate-700 text-slate-300 dark:text-slate-600"
              } transition-colors`}
            />
          </button>
        );
      })}
      {showValue && numericRating > 0 && (
        <span className="ml-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
          {numericRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
