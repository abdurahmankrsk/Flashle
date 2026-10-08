import React from 'react';
import type { AttributeComparison } from '../types/character';

interface AttributeTileProps {
  label?: string;
  comparison: AttributeComparison;
  delayIndex?: number;
  isNew?: boolean;
}

export const AttributeTile: React.FC<AttributeTileProps> = ({
  comparison,
  delayIndex = 0,
  isNew = false,
}) => {
  const { status, value, direction } = comparison;

  // Authentic Loldle / Smashdle color indicators with true vibrant Yellow
  let colorClasses = '';
  if (status === 'correct') {
    colorClasses = 'bg-[#15803d] border-[#22c55e] text-white';
  } else if (status === 'partial') {
    // True, vibrant game yellow (not orange/brown)
    colorClasses = 'bg-[#ca8a04] border-[#facc15] text-white';
  } else {
    colorClasses = 'bg-[#991b1b] border-[#ef4444] text-white';
  }

  const animationClass = isNew
    ? `tile-flip tile-delay-${Math.min(delayIndex, 7)}`
    : '';

  const valStr = String(value);
  const isLong = valStr.length > 12;

  return (
    <div
      className={`aspect-square w-full rounded-[6px] border-2 flex flex-col items-center justify-center p-1 sm:p-2 text-center select-none shadow-md transition-all game-tile relative overflow-hidden ${colorClasses} ${animationClass}`}
    >
      <div className="flex items-center justify-center gap-0.5 sm:gap-1.5 w-full h-full px-0.5">
        <span
          className={`font-tech font-extrabold ${
            isLong
              ? 'text-[10px] sm:text-[11px] md:text-xs'
              : 'text-xs sm:text-sm md:text-base'
          } tracking-wide leading-tight text-center break-words drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]`}
        >
          {value}
        </span>
        {direction && direction !== 'equal' && (
          <span className="shrink-0 ml-1 text-[#fef08a] drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] flex items-center justify-center">
            {direction === 'higher' ? (
              <svg
                className="w-4 h-4 md:w-5 md:h-5 fill-current"
                viewBox="0 0 24 24"
                aria-label="Higher season"
              >
                {/* Solid arrow with vertical stem line and arrowhead */}
                <path d="M12 2L4 10h5v12h6V10h5L12 2z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 md:w-5 md:h-5 fill-current"
                viewBox="0 0 24 24"
                aria-label="Lower season"
              >
                {/* Solid arrow with vertical stem line and arrowhead */}
                <path d="M12 22l8-8h-5V2h-6v12H4l8 8z" />
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  );
};
