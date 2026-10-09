import React from 'react';
import { X, Trophy, Flame, Share2 } from 'lucide-react';
import type { PlayerStats } from '../game/storage';
import type { GuessComparison } from '../types/character';
import { FlashEmblem } from './FlashEmblem';
import { generateShareText, shareResult } from '../game/share';
import { getActiveStreak } from '../game/storage';
import { trackShare } from '../utils/analytics';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  todayDateString?: string;
  timeUntilNext: string;
  isGameFinished: boolean;
  dayNumber: number;
  comparisons: GuessComparison[];
  isWon: boolean;
  onToast: (msg: string) => void;
  onResetDaily?: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  todayDateString = '',
  timeUntilNext,
  isGameFinished,
  dayNumber,
  comparisons,
  isWon,
  onToast,
  onResetDaily,
}) => {
  if (!isOpen) return null;

  const winPercentage =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const maxDistributionCount = Math.max(
    1,
    ...Object.values(stats.guessDistribution)
  );

  const activeStreak = todayDateString
    ? getActiveStreak(stats, todayDateString)
    : stats.currentStreak;

  const handleShare = async () => {
    const text = generateShareText(dayNumber, comparisons, isWon);
    const result = await shareResult(text);
    trackShare('daily', result.method, isWon);

    if (result.success) {
      onToast(result.method === 'native' ? 'Result shared!' : 'Copied to clipboard!');
    } else {
      onToast('Failed to copy. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0d0f18] border-2 border-[#2c3349] rounded-[8px] p-5 sm:p-7 shadow-2xl text-white overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded hover:bg-[#1b1f2e] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-4">
          <FlashEmblem size={24} variant="emblem" />
          <h2 className="font-heading text-2xl uppercase italic tracking-wider">
            Your Statistics
          </h2>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-center font-tech">
          <div className="bg-[#121422] p-2 rounded-[4px] border border-[#23293e]">
            <span className="text-2xl font-bold text-white block">
              {stats.gamesPlayed}
            </span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Played
            </span>
          </div>

          <div className="bg-[#121422] p-2 rounded-[4px] border border-[#23293e]">
            <span className="text-2xl font-bold text-[#fbbf24] block">
              {winPercentage}%
            </span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Win %
            </span>
          </div>

          <div className="bg-[#121422] p-2 rounded-[4px] border border-[#23293e]">
            <span className="text-2xl font-bold text-emerald-400 block">
              {activeStreak}
            </span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 text-emerald-400" /> Streak
            </span>
          </div>

          <div className="bg-[#121422] p-2 rounded-[4px] border border-[#23293e]">
            <span className="text-2xl font-bold text-[#dc2626] block">
              {stats.maxStreak}
            </span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center justify-center gap-0.5">
              <Trophy className="w-3 h-3 text-[#dc2626]" /> Best
            </span>
          </div>
        </div>

        {/* Guess Distribution Bars */}
        <div className="mb-6 font-tech">
          <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2.5">
            Guess Distribution
          </h3>

          <div className="space-y-1.5 text-xs font-bold">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((guessNum) => {
              const count = stats.guessDistribution[guessNum] || 0;
              const widthPct = Math.max(
                8,
                Math.round((count / maxDistributionCount) * 100)
              );
              const isCurrentGuessCount =
                isGameFinished && isWon && comparisons.length === guessNum;

              return (
                <div key={guessNum} className="flex items-center gap-2">
                  <span className="w-3 text-right font-bold text-gray-400">
                    {guessNum}
                  </span>
                  <div className="flex-1 bg-[#121422] rounded-[2px] h-6 p-0.5 overflow-hidden border border-[#1f2436]">
                    <div
                      style={{ width: `${count > 0 ? widthPct : 8}%` }}
                      className={`h-full rounded-[2px] flex items-center justify-end px-2 font-bold text-white transition-all duration-500 ${
                        isCurrentGuessCount
                          ? 'bg-[#dc2626] border border-[#ef4444]'
                          : count > 0
                          ? 'bg-[#2563eb] border border-[#3b82f6]'
                          : 'bg-[#1b1f2e] text-gray-400'
                      }`}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Game Timer & Share Action */}
        <div className="pt-3 border-t border-[#23293d] flex flex-col sm:flex-row items-center justify-between gap-3 font-tech">
          <div className="text-left">
            <span className="text-[11px] text-gray-400 block font-bold uppercase tracking-wider">
              Next Daily Flashle in
            </span>
            <span className="font-mono text-base font-bold text-[#fbbf24] tracking-widest">
              {timeUntilNext}
            </span>
          </div>

          {isGameFinished && (
            <button
              onClick={handleShare}
              className="w-full sm:w-auto py-2.5 px-4 bg-[#dc2626] hover:bg-[#ef4444] text-white text-xs font-bold rounded-[4px] flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 uppercase tracking-wider cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          )}
        </div>

        {onResetDaily && (
          <div className="mt-3 pt-2 text-center border-t border-[#1a1e2e]">
            <button
              onClick={() => {
                onResetDaily();
                onClose();
              }}
              title="Reset today's daily progress to guess again"
              className="text-[11px] text-gray-400 hover:text-red-400 underline font-tech uppercase tracking-wider transition-colors cursor-pointer"
            >
              Reset Today's Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
