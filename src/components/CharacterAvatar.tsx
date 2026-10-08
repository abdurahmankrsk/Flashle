import React, { useState } from 'react';
import type { FlashCharacter } from '../types/character';

interface CharacterAvatarProps {
  character: FlashCharacter;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-9 h-9 text-xs',
  sm: 'w-12 h-12 text-sm',
  md: 'w-14 h-14 text-base',
  lg: 'w-20 h-20 text-lg',
  xl: 'w-28 h-28 text-2xl',
};


const EXTENSIONS = ['.jpg', '.webp', '.png', '.jpeg'];

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 'md',
  className = '',
}) => {
  const [extIndex, setExtIndex] = useState(0);
  const sizeClasses = SIZE_MAP[size];

  if (extIndex < EXTENSIONS.length) {
    return (
      <div
        className={`relative shrink-0 rounded-md overflow-hidden bg-[#12141f] border-2 border-[#2d3247] ${sizeClasses} ${className}`}
      >
        <img
          key={`${character.id}-${extIndex}`}
          src={`/characters/${character.id}${EXTENSIONS[extIndex]}`}
          alt={character.name}
          onError={() => setExtIndex((prev) => prev + 1)}
          className="w-full h-full object-cover object-center transform-gpu"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  // Graceful fallback
  return (
    <div
      className={`shrink-0 rounded-md flex items-center justify-center font-bold uppercase border-2 border-[#31364d] bg-[#181a28] text-gray-200 select-none ${sizeClasses} ${className}`}
    >
      {character.name.charAt(0)}
    </div>
  );
};
