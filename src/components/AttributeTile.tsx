import React from 'react';
import type { AttributeComparison } from '../types/character';

interface AttributeTileProps {
  label?: string;
  comparison: AttributeComparison;
  delayIndex?: number;
  isNew?: boolean;
}

export const AttributeTile: React.FC<AttributeTileProps> = ({
  label,
  comparison,
  delayIndex = 0,
  isNew = false,
}) => {
  const { status, value, direction } = comparison;

  // Use accessible, token-backed theme classes with WCAG AA/AAA compliant contrast
  let colorClasses = '';

  if (status === 'correct') {
    colorClasses = 'game-tile-correct';
  } else if (status === 'partial') {
    colorClasses = 'game-tile-partial font-black';
  } else {
    colorClasses = 'game-tile-incorrect';
  }

  // Unified Flash gold arrow with high contrast on both red and yellow tiles
  const arrowColorClass = 'text-[#fef08a]';

  const statusLabel =
    status === 'correct'
      ? 'Exact match'
      : status === 'partial'
      ? 'Partial match'
      : 'No match';

  const directionLabel =
    direction === 'higher'
      ? 'Debuted in a later season'
      : direction === 'lower'
      ? 'Debuted in an earlier season'
      : '';

  const animationClass = isNew
    ? `tile-flip tile-delay-${Math.min(delayIndex, 7)}`
    : '';

  const valStr = String(value);
  const isLong = valStr.length > 12;

  return (
    <div
      role="cell"
      className={`aspect-square w-full rounded-[6px] border-2 flex flex-col items-center justify-center p-1 sm:p-2 text-center select-none shadow-md transition-all game-tile relative overflow-hidden ${colorClasses} ${animationClass}`}
    >
      <div className="flex items-center justify-center gap-0.5 sm:gap-1.5 w-full h-full px-0.5">
        <span
          className={`font-tech font-extrabold ${
            isLong
              ? 'text-[10px] sm:text-[11px] md:text-xs'
              : 'text-xs sm:text-sm md:text-base'
          } tracking-wide leading-tight text-center break-words ${
            status === 'partial' ? 'drop-shadow-none' : 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
          }`}
        >
          {value}
          <span className="sr-only">
            {label ? ` (${label}): ` : ': '}
            {statusLabel}
            {directionLabel ? `, ${directionLabel}` : ''}
          </span>
        </span>
        {direction && direction !== 'equal' && (
          <span className={`shrink-0 ml-1 ${arrowColorClass} drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] flex items-center justify-center`}>
            {direction === 'higher' ? (
              <svg
                role="img"
                className="w-4 h-4 md:w-5 md:h-5 fill-current"
                viewBox="0 0 24 24"
                aria-label={directionLabel || 'Higher season'}
                stroke="#09090b"
                strokeWidth="2.5"
                strokeLinejoin="round"
                style={{ paintOrder: 'stroke fill' }}
              >
                {/* Solid arrow with vertical stem line and arrowhead */}
                <path d="M12 2L4 10h5v12h6V10h5L12 2z" />
              </svg>
            ) : (
              <svg
                role="img"
                className="w-4 h-4 md:w-5 md:h-5 fill-current"
                viewBox="0 0 24 24"
                aria-label={directionLabel || 'Lower season'}
                stroke="#09090b"
                strokeWidth="2.5"
                strokeLinejoin="round"
                style={{ paintOrder: 'stroke fill' }}
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
