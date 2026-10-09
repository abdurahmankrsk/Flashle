import React, { useMemo } from 'react';
import { X, CheckCircle, XCircle, Clock, Play } from 'lucide-react';
import { FlashEmblem } from './FlashEmblem';
import { getHistoricalPuzzles, formatDayNumber } from '../game/daily';
import { getAllStoredGameStates } from '../game/storage';
import type { HistoricalPuzzleInfo } from '../game/daily';
import { useModalAccessibility } from '../utils/useModalAccessibility';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPuzzle: (puzzle: HistoricalPuzzleInfo) => void;
  activeDateString: string;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  onSelectPuzzle,
  activeDateString,
}) => {
  const modalRef = useModalAccessibility(isOpen, onClose);
  const puzzles = useMemo(() => getHistoricalPuzzles(), []);
  const storedStates = useMemo(() => {
    if (!isOpen) return {};
    return getAllStoredGameStates();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-lg bg-[#0d0f18] border-2 border-[#2c3349] rounded-[8px] p-5 sm:p-6 shadow-2xl text-white overflow-hidden max-h-[90vh] flex flex-col focus:outline-none"
      >
        {/* Close Button with >= 44x44px touch target */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[#1b1f2e] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2 shrink-0">
          <FlashEmblem size={26} variant="emblem" />
          <h2 id="archive-modal-title" className="font-heading text-2xl sm:text-3xl uppercase italic tracking-wider">
            Puzzle <span className="text-[#ef4444]">Archive</span>
          </h2>
        </div>

        <p className="font-body text-xs text-gray-300 mb-4 shrink-0">
          Revisit past daily Flashle puzzles. Archive games do not alter your daily streak.
        </p>

        {/* Puzzle List Container */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {puzzles.map((puzzle) => {
            const formattedDay = formatDayNumber(puzzle.dayNumber);
            const state = storedStates[puzzle.dateString];
            const isCurrentlyPlaying = puzzle.dateString === activeDateString;

            let statusBadge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-tech font-bold uppercase px-2 py-0.5 rounded bg-[#171a29] text-gray-400 border border-[#2b3149]">
                <Play className="w-3 h-3 text-gray-400" />
                Unplayed
              </span>
            );

            if (state) {
              if (state.status === 'won') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 text-[11px] font-tech font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    Solved ({state.guesses.length}/8)
                  </span>
                );
              } else if (state.status === 'lost') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 text-[11px] font-tech font-bold uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/40">
                    <XCircle className="w-3 h-3 text-red-400" />
                    Defeated (X/8)
                  </span>
                );
              } else if (state.guesses.length > 0) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 text-[11px] font-tech font-bold uppercase px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/40">
                    <Clock className="w-3 h-3 text-amber-400" />
                    In Progress ({state.guesses.length}/8)
                  </span>
                );
              }
            }

            return (
              <div
                key={puzzle.dateString}
                onClick={() => onSelectPuzzle(puzzle)}
                className={`p-3 rounded-[6px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrentlyPlaying
                    ? 'bg-[#1a1f33] border-[#dc2626] ring-1 ring-[#dc2626]/50 shadow-md'
                    : 'bg-[#11131e] border-[#22273b] hover:bg-[#161a2b] hover:border-[#384163]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[4px] bg-[#0c0e18] border border-[#2b3149] flex flex-col items-center justify-center shrink-0">
                    <span className="font-tech text-[10px] text-gray-400 font-bold uppercase leading-none">DAY</span>
                    <span className="font-tech text-xs font-black text-white leading-tight">#{puzzle.dayNumber}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-tech text-sm font-bold text-white tracking-wide">
                        Flashle #{formattedDay}
                      </span>
                      {puzzle.isToday && (
                        <span className="bg-[#dc2626] text-white text-[9px] font-tech font-extrabold uppercase px-1.5 py-0.2 rounded tracking-wider">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-body">
                      <span>{puzzle.formattedDate}</span>
                      <span>•</span>
                      <span
                        className={`font-tech text-[10px] font-bold uppercase ${
                          puzzle.difficulty === 'Easy'
                            ? 'text-emerald-400'
                            : puzzle.difficulty === 'Medium'
                            ? 'text-amber-400'
                            : puzzle.difficulty === 'Hard'
                            ? 'text-red-400'
                            : 'text-purple-300'
                        }`}
                      >
                        {puzzle.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {statusBadge}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-[#22273b] flex items-center justify-between text-xs text-gray-400 font-tech">
          <span>{puzzles.length} {puzzles.length === 1 ? 'puzzle' : 'puzzles'} available</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#1a1d2d] hover:bg-[#252a40] text-gray-200 rounded text-xs uppercase font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
