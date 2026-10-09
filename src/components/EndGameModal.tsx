import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Share2, RefreshCw, X } from 'lucide-react';
import type { FlashCharacter, GuessComparison } from '../types/character';
import { CharacterAvatar } from './CharacterAvatar';
import { FlashEmblem } from './FlashEmblem';
import { generateShareText, shareResult } from '../game/share';
import { trackShare } from '../utils/analytics';
import { useModalAccessibility } from '../utils/useModalAccessibility';

interface EndGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWon: boolean;
  secret: FlashCharacter;
  comparisons: GuessComparison[];
  dayNumber: number;
  isDaily: boolean;
  timeUntilNext: string;
  onSwitchToPractice: () => void;
  onNewPracticeGame: () => void;
  onToast: (msg: string) => void;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  isOpen,
  onClose,
  isWon,
  secret,
  comparisons,
  dayNumber,
  isDaily,
  timeUntilNext,
  onSwitchToPractice,
  onNewPracticeGame,
  onToast,
}) => {
  const modalRef = useModalAccessibility(isOpen, onClose);

  useEffect(() => {
    if (isOpen && isWon) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#dc2626', '#fbbf24', '#ffffff', '#eab308'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen, isWon]);

  if (!isOpen) return null;

  const handleShare = async () => {
    const shareText = generateShareText(
      dayNumber,
      comparisons,
      isWon,
      8,
      secret.difficulty,
      isDaily ? 'daily' : 'practice'
    );
    const result = await shareResult(shareText);
    trackShare(isDaily ? 'daily' : 'practice', result.method, isWon);

    if (result.success) {
      onToast(result.method === 'native' ? 'Result shared!' : 'Results copied to clipboard!');
    } else {
      onToast('Failed to copy. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="endgame-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-lg bg-[#0d0f18] border-2 border-[#2c3349] rounded-[8px] p-4 sm:p-6 shadow-2xl text-white overflow-x-hidden max-h-[92vh] overflow-y-auto custom-scrollbar focus:outline-none"
      >
        {/* Close Button with >= 44x44px touch target */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[#1b1f2e] transition-colors cursor-pointer z-10"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Victory / Defeat Header */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="flex justify-center mb-2">
            {isWon ? (
              <FlashEmblem size={44} variant="emblem" />
            ) : (
              <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-red-600 rounded-[4px] bg-[#1a0f12] text-red-500 font-black text-2xl">
                ✕
              </div>
            )}
          </div>
          <h2 id="endgame-modal-title" className="font-heading text-2xl sm:text-4xl tracking-wider uppercase italic">
            {isWon ? (
              <span className="text-white">
                YOU <span className="text-[#fbbf24]">GOT IT!</span>
              </span>
            ) : (
              <span className="text-red-500">SYSTEM OVERLOAD</span>
            )}
          </h2>
          <p className="font-tech text-xs sm:text-sm text-gray-300 uppercase tracking-wider font-semibold mt-0.5">
            {isWon
              ? `Solved in ${comparisons.length} ${
                  comparisons.length === 1 ? 'guess' : 'guesses'
                }!`
              : `You ran out of tachyons. The secret character was:`}
          </p>
        </div>

        {/* Character Dossier Card - Fully Responsive on Mobile (320px+) */}
        <div className="bg-[#121422] border-2 border-[#272d42] rounded-[6px] p-3.5 sm:p-5 mb-4 sm:mb-5 shadow-inner w-full">
          <div className="flex items-start gap-3 sm:gap-4 mb-3.5 pb-3 border-b border-[#212638] w-full">
            {/* Real Character Photo */}
            <CharacterAvatar character={secret} size="lg" className="border-2 border-[#fbbf24] shrink-0 w-16 h-16 sm:w-20 sm:h-20" />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <h3 className="font-tech text-lg sm:text-2xl font-bold text-white tracking-wide break-words leading-tight">
                  {secret.name}
                </h3>
                <span
                  className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-[3px] border shrink-0 ${
                    secret.difficulty === 'Easy'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                      : secret.difficulty === 'Medium'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-500/50'
                      : secret.difficulty === 'Hard'
                      ? 'bg-red-950/80 text-red-400 border-red-500/50'
                      : 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                  }`}
                >
                  {secret.difficulty}
                </span>
                {secret.speedster && (
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-[3px] bg-[#dc2626] text-white shrink-0">
                    Speedster
                  </span>
                )}
              </div>
              <p className="font-tech text-xs text-[#fbbf24] font-semibold uppercase tracking-wider break-words">
                {secret.aliases.length > 0 ? secret.aliases.join(' • ') : 'No aliases'}
              </p>
              <p className="font-body text-xs text-gray-400 mt-0.5">Portrayed by {secret.actor}</p>
            </div>
          </div>

          {/* Quote */}
          {secret.quote && (
            <div className="font-body italic text-xs sm:text-sm text-gray-200 bg-[#090b12] p-2.5 sm:p-3 rounded-md border border-[#283048] mb-3 break-words shadow-sm">
              "{secret.quote}"
            </div>
          )}

          {/* Stats Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 text-xs font-tech">
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638] min-w-0">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Role</span>
              <span className="font-bold text-gray-200 break-words leading-tight block text-[11px] sm:text-xs">{secret.role}</span>
            </div>
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638] min-w-0">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Debut</span>
              <span className="font-bold text-gray-200 block text-[11px] sm:text-xs">Season {secret.firstSeason}</span>
            </div>
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638] min-w-0">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Species</span>
              <span className="font-bold text-gray-200 break-words block text-[11px] sm:text-xs">{secret.species}</span>
            </div>
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638] min-w-0">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Alignment</span>
              <span className="font-bold text-gray-200 block text-[11px] sm:text-xs">{secret.alignment}</span>
            </div>
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638] min-w-0">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Origin</span>
              <span className="font-bold text-gray-200 break-words block text-[11px] sm:text-xs">{secret.earth}</span>
            </div>
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638] min-w-0">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Seasons</span>
              <span className="font-bold text-gray-200 break-words block text-[11px] sm:text-xs">
                S{secret.seasons.join(', S')}
              </span>
            </div>
          </div>
        </div>

        {/* Daily Countdown & Sharing Controls */}
        <div className="space-y-2.5 sm:space-y-3">
          {isDaily && (
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-[4px] bg-[#10121d] border border-[#252b3e] text-xs font-tech font-semibold uppercase tracking-wider">
              <span className="text-gray-400">Next Flashle in</span>
              <span className="font-mono font-bold text-sm text-[#fbbf24] tracking-widest">
                {timeUntilNext}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 sm:py-3 px-4 bg-[#dc2626] hover:bg-[#ef4444] text-white font-tech font-bold rounded-[4px] flex items-center justify-center gap-2 shadow-lg shadow-[#dc2626]/30 transition-transform active:scale-95 uppercase tracking-wider text-xs sm:text-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Result</span>
            </button>

            {isDaily ? (
              <button
                onClick={() => {
                  onClose();
                  onSwitchToPractice();
                }}
                className="py-2.5 sm:py-3 px-4 bg-[#191c28] hover:bg-[#232839] text-gray-200 font-tech font-bold uppercase tracking-wider rounded-[4px] flex items-center justify-center gap-2 border border-[#2e344a] transition-colors text-xs sm:text-sm cursor-pointer"
              >
                <span>Practice Mode</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onNewPracticeGame();
                  onClose();
                }}
                className="py-2.5 sm:py-3 px-4 bg-[#191c28] hover:bg-[#232839] text-gray-200 font-tech font-bold uppercase tracking-wider rounded-[4px] flex items-center justify-center gap-2 border border-[#2e344a] transition-colors text-xs sm:text-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Next Character</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
