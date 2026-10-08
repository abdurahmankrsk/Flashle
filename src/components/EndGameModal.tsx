import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Share2, RefreshCw, X } from 'lucide-react';
import type { FlashCharacter, GuessComparison } from '../types/character';
import { CharacterAvatar } from './CharacterAvatar';
import { FlashEmblem } from './FlashEmblem';
import { generateShareText, shareResult } from '../game/share';

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
    const shareText = generateShareText(dayNumber, comparisons, isWon);
    const result = await shareResult(shareText);
    if (result.success) {
      onToast(result.method === 'native' ? 'Result shared!' : 'Results copied to clipboard!');
    } else {
      onToast('Failed to copy. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d0f18] border-2 border-[#2c3349] rounded-[8px] p-5 sm:p-7 shadow-2xl text-white overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded hover:bg-[#1b1f2e] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Victory / Defeat Header */}
        <div className="text-center mb-5">
          <div className="flex justify-center mb-2">
            {isWon ? (
              <FlashEmblem size={48} variant="emblem" />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center border-2 border-red-600 rounded-[4px] bg-[#1a0f12] text-red-500 font-black text-2xl">
                ✕
              </div>
            )}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl tracking-wider uppercase italic">
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
              ? `You solved today's Flashle in ${comparisons.length} ${
                  comparisons.length === 1 ? 'guess' : 'guesses'
                }!`
              : `You ran out of tachyons. The secret character was:`}
          </p>
        </div>

        {/* Character Dossier Card */}
        <div className="bg-[#121422] border-2 border-[#272d42] rounded-[6px] p-4 sm:p-5 mb-5 shadow-inner">
          <div className="flex items-center gap-4 mb-3.5 pb-3 border-b border-[#212638]">
            {/* Real Character Photo in Dossier */}
            <CharacterAvatar character={secret} size="xl" className="border-2 border-[#fbbf24]" />

            <div>
              <h3 className="font-tech text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                {secret.name}
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[3px] border ${
                    secret.difficulty === 'Easy'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                      : secret.difficulty === 'Medium'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-500/50'
                      : 'bg-red-950/80 text-red-400 border-red-500/50'
                  }`}
                >
                  {secret.difficulty}
                </span>
                {secret.speedster && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[3px] bg-[#dc2626] text-white">
                    Speedster
                  </span>
                )}
              </h3>
              <p className="font-tech text-xs text-[#fbbf24] font-semibold uppercase tracking-wider">
                {secret.aliases.length > 0 ? secret.aliases.join(' • ') : 'No aliases'}
              </p>
              <p className="font-body text-xs text-gray-400">Portrayed by {secret.actor}</p>
            </div>
          </div>

          {/* Quote */}
          {secret.quote && (
            <div className="font-body italic text-xs sm:text-sm text-gray-200 bg-[#090b12] p-3 rounded-[4px] border-l-2 border-[#dc2626] mb-3">
              "{secret.quote}"
            </div>
          )}

          {/* Stats Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-tech">
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638]">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Role</span>
              <span className="font-bold text-gray-200 truncate block">{secret.role}</span>
            </div>
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638]">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Debut</span>
              <span className="font-bold text-gray-200">Season {secret.firstSeason}</span>
            </div>
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638]">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Species</span>
              <span className="font-bold text-gray-200">{secret.species}</span>
            </div>
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638]">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Alignment</span>
              <span className="font-bold text-gray-200">{secret.alignment}</span>
            </div>
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638]">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Origin</span>
              <span className="font-bold text-gray-200">{secret.earth}</span>
            </div>
            <div className="bg-[#0b0d14] p-2 rounded-[3px] border border-[#212638]">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Seasons</span>
              <span className="font-bold text-gray-200">
                S{secret.seasons.join(', S')}
              </span>
            </div>
          </div>
        </div>

        {/* Daily Countdown & Sharing Controls */}
        <div className="space-y-3">
          {isDaily && (
            <div className="flex items-center justify-between p-3 rounded-[4px] bg-[#10121d] border border-[#252b3e] text-xs font-tech font-semibold uppercase tracking-wider">
              <span className="text-gray-400">Next Flashle in</span>
              <span className="font-mono font-bold text-sm text-[#fbbf24] tracking-widest">
                {timeUntilNext}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleShare}
              className="flex-1 py-3 px-4 bg-[#dc2626] hover:bg-[#ef4444] text-white font-tech font-bold rounded-[4px] flex items-center justify-center gap-2 shadow-lg shadow-[#dc2626]/30 transition-transform active:scale-95 uppercase tracking-wider text-sm"
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
                className="py-3 px-4 bg-[#191c28] hover:bg-[#232839] text-gray-200 font-tech font-bold uppercase tracking-wider rounded-[4px] flex items-center justify-center gap-2 border border-[#2e344a] transition-colors text-sm"
              >
                <span>Practice Mode</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onNewPracticeGame();
                  onClose();
                }}
                className="py-3 px-4 bg-[#191c28] hover:bg-[#232839] text-gray-200 font-tech font-bold uppercase tracking-wider rounded-[4px] flex items-center justify-center gap-2 border border-[#2e344a] transition-colors text-sm"
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
