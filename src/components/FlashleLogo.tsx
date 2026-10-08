import React from 'react';

interface FlashleLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Authentic CW The Flash title logo for FLASHLE matching the official series typography
 */
export const FlashleLogo: React.FC<FlashleLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl md:text-5xl',
    lg: 'text-4xl sm:text-5xl md:text-6xl',
  }[size];

  return (
    <div className={`relative inline-flex flex-col select-none ${className}`}>
      {/* Top "THE" subtitle matching CW logo placement */}
      <span className="font-flash text-[9px] sm:text-[10px] tracking-widest text-[#d4c4b5] italic -mb-1 ml-0.5 opacity-90 drop-shadow">
        THE
      </span>

      {/* Main "FLASHLE" letters with metallic sheen and golden bolt in 'A' */}
      <div className={`font-flash ${sizeClasses} tracking-wider italic flex items-baseline font-black leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]`}>
        <span className="text-flash-metallic">FL</span>

        {/* 'A' with sliced golden lightning bolt crossbar */}
        <span className="relative inline-block text-flash-metallic">
          A
          {/* Golden lightning bolt sliced horizontally across the 'A' crossbar */}
          <svg
            className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-[115%] h-[40%] pointer-events-none drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"
            viewBox="0 0 100 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon
              points="0,20 52,10 40,22 98,8 48,32 58,20 0,20"
              fill="url(#logoBoltGrad)"
              stroke="#78350f"
              strokeWidth="0.8"
            />
            <defs>
              <linearGradient id="logoBoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="30%" stopColor="#fde047" />
                <stop offset="70%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
          </svg>
        </span>

        <span className="text-flash-metallic">SH</span>
        <span className="text-[#dc2626] drop-shadow-[0_0_8px_rgba(220,38,38,0.7)] ml-0.5">
          LE
        </span>
      </div>
    </div>
  );
};
