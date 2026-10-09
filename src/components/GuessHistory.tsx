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
      <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 text-center">
        <div className="bg-[#0c0e18]/90 border-2 border-[#242a3e] rounded-lg p-5 sm:p-8 max-w-lg mx-auto shadow-2xl backdrop-blur-sm">
          <div className="flex justify-center mb-3">
            <FlashEmblem size={48} variant="emblem" />
          </div>
          <h3 className="font-heading text-2xl sm:text-4xl text-white tracking-wide uppercase italic mb-1">
            Can you guess the secret character?
          </h3>
          <p className="font-tech text-xs sm:text-sm md:text-base text-gray-300 uppercase tracking-wider mb-5">
            Type any character from The CW's <span className="text-white font-bold">The Flash</span> to receive attribute clues.
          </p>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-center text-xs bg-[#080910] p-3 sm:p-3.5 rounded-md border border-[#1e2333] font-tech font-bold uppercase tracking-wider">
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-4 h-4 rounded-[3px] bg-[#15803d] border border-[#22c55e]" />
              <span className="text-gray-200 text-[11px] sm:text-xs">Exact Match</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-4 h-4 rounded-[3px] bg-[#ca8a04] border border-[#facc15]" />
              <span className="text-gray-200 text-[11px] sm:text-xs">Partial / Close</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-4 h-4 rounded-[3px] bg-[#991b1b] border border-[#ef4444]" />
              <span className="text-gray-200 text-[11px] sm:text-xs">No Match</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Classic Loldle / Smashdle style: most recent attempt displayed on top
  const reversedGuesses = [...comparisons].reverse();

  return (
    <div className="w-full max-w-5xl md:max-w-6xl mx-auto px-1 sm:px-4 my-3 sm:my-4">
      {/* Scroll container on phone, fits naturally on desktop */}
      <div className="w-full overflow-x-auto pb-3 custom-scrollbar">
        <div
          role="table"
          aria-label="Guess comparison history"
          className="min-w-[640px] md:min-w-0 w-full"
        >
          {/* Table Column Headers Bar — Clear, large, crisp font */}
          <div role="rowgroup" className="w-full mb-2 select-none">
            <div role="row" className="grid grid-cols-8 gap-1.5 sm:gap-2.5 text-center text-[11px] sm:text-sm md:text-base font-tech font-extrabold tracking-wider uppercase text-zinc-100">
              <div role="columnheader">CHARACTER</div>
              <div role="columnheader">GENDER</div>
              <div role="columnheader">SPECIES</div>
              <div role="columnheader">POWERS</div>
              <div role="columnheader">ALIGNMENT</div>
              <div role="columnheader">DEBUT</div>
              <div role="columnheader">ORIGIN</div>
              <div role="columnheader">AFFILIATION</div>
            </div>
            <hr className="border-t-2 border-white/20 mt-1.5 mb-2.5" />
          </div>

          {/* Grid of Guess Rows — Exactly 8 squares per row, scaled up and clear */}
          <div role="rowgroup" className="space-y-2 sm:space-y-3">
            {reversedGuesses.map((guess, index) => {
              const isNew = guess.character.id === newestGuessId;
              const nameLen = guess.character.name.length;
              const nameFontSize =
                nameLen > 16
                  ? 'text-[8px] sm:text-[9px] md:text-[10.5px]'
                  : nameLen > 12
                  ? 'text-[9px] sm:text-[10px] md:text-xs'
                  : 'text-[10px] sm:text-xs md:text-sm';

              return (
                <div
                  role="row"
                  aria-label={`Guess ${comparisons.length - index}: ${guess.character.name}`}
                  key={`${guess.character.id}-${comparisons.length - index}`}
                  className="grid grid-cols-8 gap-1.5 sm:gap-2.5 items-center w-full"
                >
                  {/* Column 1: Character Portrait Square — 100% contained flex-col, impossible to overflow */}
                  <div
                    role="cell"
                    className={`aspect-square w-full rounded-[6px] border-2 border-[#2d3247] bg-[#121420] flex flex-col overflow-hidden shadow-lg select-none game-tile ${
                      isNew ? 'tile-flip tile-delay-0' : ''
                    }`}
                  >
                    <div className="flex-1 min-h-0 w-full relative overflow-hidden bg-[#12141f] flex items-center justify-center">
                      <img
                        src={`/characters/${guess.character.id}.jpg`}
                        alt={guess.character.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-[center_20%] select-none"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                      <div
                        style={{ display: 'none' }}
                        className="w-full h-full items-center justify-center font-bold uppercase text-gray-200 font-tech text-xs sm:text-sm"
                      >
                        {guess.character.name.charAt(0)}
                      </div>
                    </div>

                    <div className="shrink-0 w-full bg-black/95 border-t border-[#2d3247] py-0.5 sm:py-1 px-0.5 text-center flex items-center justify-center min-h-[16px] sm:min-h-[22px]">
                      <span className={`${nameFontSize} font-tech font-bold text-white uppercase leading-[1.1] break-words text-center tracking-tight line-clamp-2`}>
                        {guess.character.name}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Gender */}
                  <AttributeTile
                    label="Gender"
                    comparison={guess.gender}
                    delayIndex={1}
                    isNew={isNew}
                  />

                  {/* Column 3: Species */}
                  <AttributeTile
                    label="Species"
                    comparison={guess.species}
                    delayIndex={2}
                    isNew={isNew}
                  />

                  {/* Column 4: Powers */}
                  <AttributeTile
                    label="Powers"
                    comparison={guess.power}
                    delayIndex={3}
                    isNew={isNew}
                  />

                  {/* Column 5: Alignment */}
                  <AttributeTile
                    label="Alignment"
                    comparison={guess.alignment}
                    delayIndex={4}
                    isNew={isNew}
                  />

                  {/* Column 6: Debut Season */}
                  <AttributeTile
                    label="Debut Season"
                    comparison={guess.firstSeason}
                    delayIndex={5}
                    isNew={isNew}
                  />

                  {/* Column 7: Origin Earth */}
                  <AttributeTile
                    label="Origin Earth"
                    comparison={guess.earth}
                    delayIndex={6}
                    isNew={isNew}
                  />

                  {/* Column 8: Affiliation */}
                  <AttributeTile
                    label="Affiliation"
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
