import React, { useState, useRef, useMemo } from 'react';
import { Search } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import type { FlashCharacter } from '../types/character';
import { searchCharacters } from '../utils/search';

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
  const isSubmittingRef = useRef(false);

  // Filter candidates using smart ranked search
  const searchResults = useMemo(() => {
    return searchCharacters(CHARACTERS, query, guessedCharacterIds, 8);
  }, [query, guessedCharacterIds]);

  const filteredCharacters = useMemo(() => {
    return searchResults.map((r) => r.character);
  }, [searchResults]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isWon || isSubmittingRef.current) return;

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
      if (disabled || isWon || isSubmittingRef.current) return;
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
    if (disabled || isWon || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    inputRef.current?.blur();
    setQuery('');
    setIsOpen(false);
    onGuess(character);
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 500);
  };

  const currentAttempt = disabled
    ? Math.max(1, Math.min(guessedCharacterIds.length, maxGuesses))
    : Math.min(guessedCharacterIds.length + 1, maxGuesses);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 my-3 sm:my-6">
      {/* Guesses indicator pills */}
      <div className="flex items-center justify-between mb-2 sm:mb-2.5 font-tech font-extrabold text-xs sm:text-sm uppercase tracking-wider text-gray-300">
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
      <div className="relative w-full">
        <div
          className={`flex items-center bg-[#0d0f17]/95 border-2 rounded-[8px] transition-all duration-150 shadow-xl min-h-[50px] sm:min-h-[54px] ${
            disabled
              ? 'opacity-50 border-[#232738] cursor-not-allowed'
              : isOpen && filteredCharacters.length > 0
              ? 'border-[#dc2626] ring-2 ring-[#dc2626]/40'
              : 'border-[#2a3044] hover:border-[#3e4763] focus-within:border-[#dc2626]'
          }`}
        >
          <div className="pl-3 sm:pl-4 pr-1.5 sm:pr-2 text-gray-400 shrink-0">
            <Search className="w-5 h-5 text-gray-400" />
          </div>

          <input
            ref={inputRef}
            id="character-search-input"
            role="combobox"
            aria-label="Search character by name, alias, or actor"
            aria-autocomplete="list"
            aria-expanded={isOpen && filteredCharacters.length > 0 && !disabled}
            aria-controls="character-suggestions-list"
            aria-activedescendant={
              isOpen && filteredCharacters[selectedIndex]
                ? `character-option-${filteredCharacters[selectedIndex].id}`
                : undefined
            }
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
                : 'Search character, alias (e.g. Vibe, Zoom)...'
            }
            className="w-full py-3 px-2 bg-transparent text-white placeholder-gray-500 font-body font-semibold text-base sm:text-lg outline-none disabled:cursor-not-allowed leading-normal"
            autoComplete="off"
            spellCheck="false"
          />

          {filteredCharacters.length > 0 && query.trim() && (
            <button
              type="button"
              disabled={disabled || isWon}
              onClick={() => {
                if (filteredCharacters[selectedIndex] && !disabled && !isWon && !isSubmittingRef.current) {
                  submitSelection(filteredCharacters[selectedIndex]);
                }
              }}
              className="mr-2 px-3 sm:px-4 py-2 min-h-[44px] min-w-[64px] bg-[#dc2626] hover:bg-[#ef4444] text-white font-tech font-bold text-xs sm:text-sm uppercase tracking-wider rounded-[6px] transition-transform active:scale-95 shadow-md cursor-pointer shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Guess</span>
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown with clear readable layout */}
        {isOpen && filteredCharacters.length > 0 && !disabled && !isWon && (
          <ul
            ref={listRef}
            id="character-suggestions-list"
            role="listbox"
            aria-label="Character suggestions"
            className="absolute left-0 right-0 top-full mt-1.5 bg-[#0e101a] border-2 border-[#2b3046] rounded-[6px] shadow-2xl overflow-hidden z-50 max-h-[60vh] sm:max-h-80 overflow-y-auto custom-scrollbar divide-y divide-[#1b1e2c]"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {searchResults.map((match, index) => {
              const char = match.character;
              const isSelected = index === selectedIndex;
              const subtitleAlias = match.matchedAlias || (char.aliases.length > 0 ? char.aliases[0] : null);
              return (
                <li
                  key={char.id}
                  id={`character-option-${char.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    if (!disabled && !isWon && !isSubmittingRef.current) {
                      submitSelection(char);
                    }
                  }}
                  className={`px-3 py-2.5 sm:py-3 flex items-center justify-between cursor-pointer transition-colors min-h-[50px] ${
                    isSelected
                      ? 'bg-[#1e2338] text-white ring-1 ring-inset ring-[#ef4444]/40'
                      : 'hover:bg-[#161825] text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    {/* Character Portrait - Large, crisp, and high-definition */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-[8px] overflow-hidden border-2 border-[#384364] bg-[#121422] shadow-md relative">
                      <img
                        src={`/characters/${char.id}.jpg`}
                        alt={char.name}
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
                        className="w-full h-full items-center justify-center font-bold uppercase text-gray-200 font-tech text-base bg-[#181a28]"
                      >
                        {char.name.charAt(0)}
                      </div>
                    </div>

                    {/* Character Identity */}
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5 min-w-0">
                        <span className="font-tech font-bold text-white text-base sm:text-lg tracking-wide break-words">
                          {char.name}
                        </span>
                        {subtitleAlias && (
                          <span className="text-xs sm:text-sm text-[#fbbf24] font-tech font-semibold">
                            ({subtitleAlias})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-body truncate mt-0.5">
                        {char.actor}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="shrink-0 ml-3 text-[#fbbf24] font-bold text-base sm:text-lg pr-1">
                      ▶
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
