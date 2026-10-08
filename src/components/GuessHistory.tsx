import React from 'react';
import type { GuessComparison } from '../types/character';
import { AttributeTile } from './AttributeTile';
import { FlashEmblem } from './FlashEmblem';

interface GuessHistoryProps {
  comparisons: GuessComparison[];
  newestGuessId?: string;
}

export const GuessHistory: React.FC<GuessHistoryProps> = ({
  comparisons,
  newestGuessId,
}) => {
  if (comparisons.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="bg-[#0c0e18]/90 border-2 border-[#242a3e] rounded-lg p-6 sm:p-8 max-w-lg mx-auto shadow-2xl backdrop-blur-sm">
          <div className="flex justify-center mb-3">
            <FlashEmblem size={52} variant="emblem" />
          </div>
          <h3 className="font-heading text-3xl sm:text-4xl text-white tracking-wide uppercase italic mb-1">
            Can you guess today's secret character?
          </h3>
          <p className="font-tech text-sm sm:text-base text-gray-300 uppercase tracking-wider mb-5">
            Type any character from The CW's <span className="text-white font-bold">The Flash</span> to receive attribute clues.
          </p>

          <div className="grid grid-cols-3 gap-2.5 text-center text-xs sm:text-sm bg-[#080910] p-3.5 rounded-md border border-[#1e2333] font-tech font-bold uppercase tracking-wider">
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-4 h-4 rounded-[3px] bg-[#15803d] border border-[#22c55e]" />
              <span className="text-gray-200">Exact Match</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-4 h-4 rounded-[3px] bg-[#ca8a04] border border-[#facc15]" />
              <span className="text-gray-200">Partial / Close</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-4 h-4 rounded-[3px] bg-[#991b1b] border border-[#ef4444]" />
              <span className="text-gray-200">No Match</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Classic Loldle / Smashdle style: most recent attempt displayed on top
  const reversedGuesses = [...comparisons].reverse();

  return (
    <div className="w-full max-w-5xl md:max-w-6xl mx-auto px-2 sm:px-4 my-4">
      {/* Scroll container on phone, fits naturally on desktop */}
      <div className="w-full overflow-x-auto pb-3 custom-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
        <div className="min-w-[680px] md:min-w-0 w-full">
          {/* Table Column Headers Bar — Clear, large, crisp font */}
          <div className="w-full mb-2 select-none">
            <div className="grid grid-cols-8 gap-2 sm:gap-2.5 text-center text-xs sm:text-sm md:text-base font-tech font-extrabold tracking-wider uppercase text-zinc-100">
              <div>CHARACTER</div>
              <div>GENDER</div>
              <div>SPECIES</div>
              <div>POWERS</div>
              <div>ALIGNMENT</div>
              <div>DEBUT</div>
              <div>ORIGIN</div>
              <div>AFFILIATION</div>
            </div>
            <hr className="border-t-2 border-white/20 mt-1.5 mb-2.5" />
          </div>

      {/* Grid of Guess Rows — Exactly 8 squares per row, scaled up and clear */}
      <div className="space-y-2 sm:space-y-3">
        {reversedGuesses.map((guess, index) => {
          const isNew = guess.character.id === newestGuessId;
          const nameLen = guess.character.name.length;
          const nameFontSize =
            nameLen > 16
              ? 'text-[8.5px] sm:text-[9.5px] md:text-[11px]'
              : nameLen > 12
              ? 'text-[9.5px] sm:text-[10.5px] md:text-xs'
              : 'text-[10.5px] sm:text-xs md:text-sm';

          return (
            <div
              key={`${guess.character.id}-${comparisons.length - index}`}
              className="grid grid-cols-8 gap-2 sm:gap-2.5 items-center w-full"
            >
              {/* Column 1: Character Portrait Square (High quality, smooth downscaling) */}
              <div
                className={`aspect-square w-full rounded-[6px] border-2 border-[#2d3247] bg-[#121420] relative overflow-hidden shadow-lg select-none ${
                  isNew ? 'tile-flip tile-delay-0' : ''
                }`}
              >
                <img
                  src={`/characters/${guess.character.id}.jpg`}
                  alt={guess.character.name}
                  className="w-full h-full object-cover object-center transform-gpu"
                  loading="lazy"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/85 backdrop-blur-[2px] py-1 px-0.5 text-center flex items-center justify-center min-h-[18px] sm:min-h-[24px]">
                  <span className={`${nameFontSize} font-tech font-bold text-white uppercase leading-[1.1] break-words text-center tracking-tight`}>
                    {guess.character.name}
                  </span>
                </div>
              </div>

              {/* Column 2: Gender */}
              <AttributeTile
                comparison={guess.gender}
                delayIndex={1}
                isNew={isNew}
              />

              {/* Column 3: Species */}
              <AttributeTile
                comparison={guess.species}
                delayIndex={2}
                isNew={isNew}
              />

              {/* Column 4: Powers */}
              <AttributeTile
                comparison={guess.power}
                delayIndex={3}
                isNew={isNew}
              />

              {/* Column 5: Alignment */}
              <AttributeTile
                comparison={guess.alignment}
                delayIndex={4}
                isNew={isNew}
              />

              {/* Column 6: Debut Season */}
              <AttributeTile
                comparison={guess.firstSeason}
                delayIndex={5}
                isNew={isNew}
              />

              {/* Column 7: Origin Earth */}
              <AttributeTile
                comparison={guess.earth}
                delayIndex={6}
                isNew={isNew}
              />

              {/* Column 8: Affiliation */}
              <AttributeTile
                comparison={guess.teams}
                delayIndex={7}
                isNew={isNew}
              />
            </div>
          );
        })}
      </div>
        </div>
      </div>
    </div>
  );
};
