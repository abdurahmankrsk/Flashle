import React from 'react';

interface FlashEmblemProps {
  className?: string;
  size?: number;
  variant?: 'emblem' | 'bolt-only';
}

/**
 * Authentic CW The Flash emblem and bolt
 */
export const FlashEmblem: React.FC<FlashEmblemProps> = ({
  className = '',
  size = 36,
  variant = 'emblem',
}) => {
  if (variant === 'bolt-only') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Chunky, Bold 3-Pronged CW Flash Lightning Bolt */}
        <polygon
          points="70,8 22,38 38,38 16,66 32,66 12,94 66,62 50,62 84,32 68,32 90,8"
          fill="#fbbf24"
          stroke="#92400e"
          strokeWidth="2.5"
          strokeLinejoin="miter"
        />
        {/* 3D Highlight facet */}
        <polygon
          points="70,8 22,38 38,38 16,66 32,66 12,94 26,76 42,50 56,26 70,8"
          fill="#fef08a"
          opacity="0.65"
        />
      </svg>
    );
  }

  return (
    <img
      src="/flash-emblem.png"
      alt="The Flash Emblem"
      decoding="async"
      style={{ height: size, width: 'auto' }}
      className={`inline-block object-contain drop-shadow-[0_2px_12px_rgba(234,179,8,0.45)] select-none ${className}`}
    />
  );
};
