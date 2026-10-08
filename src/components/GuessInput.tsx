import React, { useState, useRef, useMemo } from 'react';
import { Search } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import type { FlashCharacter } from '../types/character';
import { CharacterAvatar } from './CharacterAvatar';
import { FlashEmblem } from './FlashEmblem';

interface GuessInputProps {
  guessedCharacterIds: string[];
  disabled: boolean;
  onGuess: (character: FlashCharacter) => void;
  maxGuesses: number;
  isWon?: boolean;
}

export const GuessInput: React.FC<GuessInputProps> = ({
  guessedCharacterIds,
  disabled,
  onGuess,
  maxGuesses,
  isWon = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter candidates
  const filteredCharacters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const scored = CHARACTERS.filter((c) => !guessedCharacterIds.includes(c.id))
      .map((c) => {
        const nameLower = c.name.toLowerCase();
        const aliasLowers = c.aliases.map((a) => a.toLowerCase());
        const actorLower = c.actor.toLowerCase();
        const roleLower = c.role.toLowerCase();

        let score = 0;

        // Exact matches get highest priority
        if (aliasLowers.some((a) => a === q)) score = 100;
        else if (nameLower === q) score = 100;
        // Starts with
        else if (aliasLowers.some((a) => a.startsWith(q))) score = 85;
        else if (nameLower.startsWith(q)) score = 80;
        // Word boundary match (e.g. searching "thawne" matches "Eobard Thawne", or "zoom" in "Professor Zoom")
        else if (aliasLowers.some((a) => a.split(/\s+/).some((w) => w.startsWith(q)))) score = 75;
        else if (nameLower.split(/\s+/).some((w) => w.startsWith(q))) score = 70;
        // Substring matches
        else if (aliasLowers.some((a) => a.includes(q))) score = 40;
        else if (nameLower.includes(q)) score = 35;
        else if (actorLower.includes(q)) score = 20;
        else if (roleLower.includes(q)) score = 10;

        return { character: c, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    return scored.map((item) => item.character);
  }, [query, guessedCharacterIds]);


  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && filteredCharacters.length > 0) {
        setIsOpen(true);
      } else if (filteredCharacters.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredCharacters.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredCharacters.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + filteredCharacters.length) % filteredCharacters.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filteredCharacters[selectedIndex]) {
        submitSelection(filteredCharacters[selectedIndex]);
      } else if (filteredCharacters.length === 1) {
        submitSelection(filteredCharacters[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const submitSelection = (character: FlashCharacter) => {
    onGuess(character);
    setQuery('');
    setIsOpen(false);
  };

  const currentAttempt = disabled
    ? Math.max(1, Math.min(guessedCharacterIds.length, maxGuesses))
    : Math.min(guessedCharacterIds.length + 1, maxGuesses);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 my-4 sm:my-6">
      {/* Guesses indicator pills */}
      <div className="flex items-center justify-between mb-2.5 font-tech font-extrabold text-xs sm:text-sm uppercase tracking-wider text-gray-300">
        <span>
          Attempt <span className="text-white text-base sm:text-lg font-black">{currentAttempt}</span> / {maxGuesses}
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: maxGuesses }).map((_, i) => {
            const isFilled = i < guessedCharacterIds.length;
            const isCurrent = !disabled && i === guessedCharacterIds.length;
            const isWinningDot = isWon && i === guessedCharacterIds.length - 1;
            return (
              <span
                key={i}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] transition-all duration-300 ${
                  isWinningDot
                    ? 'bg-[#15803d] border border-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.7)]'
                    : isFilled
                    ? 'bg-[#dc2626] border border-[#ef4444] shadow-[0_0_6px_rgba(220,38,38,0.5)]'
                    : isCurrent
                    ? 'bg-[#fbbf24] border border-[#fef08a] shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                    : 'bg-[#181a26] border border-[#2b3046]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Input container */}
      <div className="relative">
        <div
          className={`flex items-center bg-[#0d0f17]/95 border-2 rounded-[8px] transition-all duration-150 overflow-hidden shadow-xl ${
            disabled
              ? 'opacity-50 border-[#232738] cursor-not-allowed'
              : isOpen && filteredCharacters.length > 0
              ? 'border-[#dc2626] ring-2 ring-[#dc2626]/40'
              : 'border-[#2a3044] hover:border-[#3e4763] focus-within:border-[#dc2626]'
          }`}
        >
          <div className="pl-4 pr-2 text-gray-400">
            <Search className="w-5 h-5 text-gray-400" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? 'Game finished for today!'
                : 'Search character, alias (e.g. Vibe, Zoom), or actor...'
            }
            className="w-full py-3.5 sm:py-4 px-2.5 bg-transparent text-white placeholder-gray-500 font-body font-semibold text-base sm:text-lg outline-none disabled:cursor-not-allowed"
            autoComplete="off"
            spellCheck="false"
          />

          {filteredCharacters.length > 0 && query.trim() && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (filteredCharacters[selectedIndex]) {
                  submitSelection(filteredCharacters[selectedIndex]);
                }
              }}
              className="mr-2 px-4 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white font-tech font-bold text-xs sm:text-sm uppercase tracking-wider rounded-[6px] flex items-center gap-1.5 transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <span>Guess</span>
              <FlashEmblem size={16} variant="bolt-only" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown with character portrait photos */}
        {isOpen && filteredCharacters.length > 0 && !disabled && (
          <ul
            ref={listRef}
            className="absolute left-0 right-0 top-full mt-1.5 bg-[#0e101a] border-2 border-[#2b3046] rounded-[6px] shadow-2xl overflow-hidden z-40 max-h-80 overflow-y-auto custom-scrollbar divide-y divide-[#1b1e2c]"
          >
            {filteredCharacters.map((char, index) => {
              const isSelected = index === selectedIndex;
              return (
                <li
                  key={char.id}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => submitSelection(char)}
                  className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#1c2032] text-white border-l-4 border-l-[#dc2626]'
                      : 'hover:bg-[#161825] text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Real Character Portrait Photo */}
                    <CharacterAvatar character={char} size="md" />


                    <div className="flex flex-col text-left truncate">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-tech font-bold text-white text-sm sm:text-base tracking-wide truncate">
                          {char.name}
                        </span>
                        {char.aliases.length > 0 && (
                          <span className="text-xs text-[#fbbf24] font-tech font-semibold truncate">
                            ({char.aliases[0]})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 font-body truncate">
                        {char.actor} • Season {char.firstSeason}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span
                      className={`font-tech text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[3px] border ${
                        char.difficulty === 'Easy'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                          : char.difficulty === 'Medium'
                          ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                          : 'bg-red-950/80 text-red-400 border-red-500/40'
                      }`}
                    >
                      {char.difficulty}
                    </span>
                    <span className="font-tech text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-[3px] bg-[#171a28] text-gray-300 border border-[#2b3149]">
                      {char.species}
                    </span>
                    {isSelected && (
                      <span className="text-[#fbbf24] font-bold text-sm">▶</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
