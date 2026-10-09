import React from 'react';
import { HelpCircle, BarChart3, Calendar } from 'lucide-react';
import { FlashEmblem } from './FlashEmblem';
import { formatDayNumber } from '../game/daily';
import type { Difficulty } from '../types/character';

export type ActiveGameMode = 'daily' | 'practice' | 'archive';

interface HeaderProps {
  dayNumber: number;
  difficulty: Difficulty;
  activeMode: ActiveGameMode;
  streak: number;
  archiveDateString?: string;
  practiceDifficulty?: Difficulty | 'All';
  onOpenHowToPlay: () => void;
  onOpenStats: () => void;
  onOpenArchive: () => void;
  onToggleMode: (mode: ActiveGameMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  dayNumber,
  difficulty,
  activeMode,
  streak,
  archiveDateString,
  practiceDifficulty = 'All',
  onOpenHowToPlay,
  onOpenStats,
  onOpenArchive,
  onToggleMode,
}) => {
  const formattedDay = formatDayNumber(dayNumber);

  return (
    <header className="w-full pt-3 sm:pt-4 pb-2 px-3 sm:px-6 relative z-30 select-none">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-2">
        {/* Left: Utility, Archive & Social Links with WCAG 44x44px touch targets */}
        <div className="flex items-center gap-1.5 sm:gap-2 order-2 md:order-1 flex-wrap">
          <button
            onClick={onOpenHowToPlay}
            title="How to play"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg bg-[#0d101a]/85 border border-white/10 text-gray-300 hover:text-white hover:border-red-500/50 backdrop-blur-md transition-colors shadow-sm cursor-pointer"
            aria-label="How to play"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenStats}
            title={streak > 0 ? `Statistics (${streak} day streak)` : 'Statistics'}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg bg-[#0d101a]/85 border border-white/10 text-gray-300 hover:text-white hover:border-red-500/50 backdrop-blur-md transition-colors shadow-sm cursor-pointer gap-1"
            aria-label="Statistics"
          >
            <BarChart3 className="w-5 h-5" />
            {streak > 0 && (
              <span className="font-tech text-xs font-bold text-amber-400 hidden sm:inline">
                {streak}
              </span>
            )}
          </button>
          <button
            onClick={onOpenArchive}
            title="Past Daily Puzzles Archive"
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg border backdrop-blur-md transition-colors shadow-sm cursor-pointer gap-1 ${
              activeMode === 'archive'
                ? 'bg-[#dc2626] border-[#ef4444] text-white'
                : 'bg-[#0d101a]/85 border-white/10 text-gray-300 hover:text-white hover:border-red-500/50'
            }`}
            aria-label="Puzzle Archive"
          >
            <Calendar className="w-5 h-5" />
          </button>

          <span className="w-px h-5 bg-white/10 mx-0.5 hidden sm:inline-block" />

          {/* GitHub Icon */}
          <a
            href="https://github.com/abdurahmankrsk"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub: abdurahmankrsk"
            aria-label="GitHub"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg bg-[#0d101a]/85 border border-white/10 text-gray-300 hover:text-white hover:border-white/40 backdrop-blur-md transition-colors shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* LinkedIn Icon */}
          <a
            href="https://www.linkedin.com/in/abdurahman-kari%C5%A1ik-872446268/"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn: Abdurahman Karišik"
            aria-label="LinkedIn"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg bg-[#0d101a]/85 border border-white/10 text-gray-300 hover:text-[#38bdf8] hover:border-[#38bdf8]/50 backdrop-blur-md transition-colors shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
            </svg>
          </a>

          {/* Ko-fi Icon */}
          <a
            href="https://ko-fi.com/abdurahmank"
            target="_blank"
            rel="noopener noreferrer"
            title="Support on Ko-fi"
            aria-label="Ko-fi"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg bg-[#0d101a]/85 border border-white/10 text-gray-300 hover:text-[#ff5e5b] hover:border-[#ff5e5b]/50 backdrop-blur-md transition-colors shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.683-2.566.28-2.146.425-4.053.483-5.228 1.942.179 4.298-.444 5.441-2.856zm-6.223 1.701c-.139 1.464-.325 3.125-.562 4.673-.131.859-1.041.979-1.041.979H3.143c-.87 0-.964-.813-.964-.813-.081-3.649-.047-9.584-.047-9.584h15.58s.005.127.021.365c-.02.482-.047 2.115-.075 4.38zm3.921-1.026c-.347.728-1.059 1.052-1.956 1.052-.078-.711-.186-1.554-.316-2.457 1.258.077 2.496.657 2.272 1.405z"/>
              <path d="M9.82 9.073c-.947-.946-2.482-.946-3.429 0-.946.947-.946 2.482 0 3.429l3.429 3.429 3.428-3.429c.947-.947.947-2.482 0-3.429-.947-.946-2.482-.946-3.428 0l-.001.001-.001-.001z" />
            </svg>
          </a>
        </div>

        {/* Center: Flash Logo & Badge */}
        <div className="flex flex-col items-center text-center order-1 md:order-2">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5">
            <FlashEmblem size={44} variant="emblem" />
            <img
              src="/flashle-title.png"
              alt="Flashle"
              decoding="async"
              className="h-9 sm:h-11 md:h-12 w-auto object-contain select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
            />
          </div>

          {/* Subtitle: Day number, Difficulty Badge & Streak */}
          <div className="flex items-center gap-2 mt-1 sm:mt-1.5 flex-wrap justify-center">
            <span className="font-tech text-xs sm:text-sm font-bold tracking-wider text-gray-300 uppercase">
              {activeMode === 'daily'
                ? `Daily #${formattedDay}`
                : activeMode === 'archive'
                ? `Archive #${formattedDay} (${archiveDateString || ''})`
                : `Practice`}
            </span>
            {activeMode === 'practice' ? (
              <span
                className={`font-tech text-[10px] sm:text-xs font-bold uppercase px-2 py-0.5 rounded border tracking-wide ${
                  practiceDifficulty === 'Easy'
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                    : practiceDifficulty === 'Medium'
                    ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                    : practiceDifficulty === 'Hard'
                    ? 'bg-red-950/80 text-red-400 border-red-500/40'
                    : practiceDifficulty === 'Very Hard'
                    ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                    : 'bg-[#181d2e] text-gray-300 border-[#2d3652]'
                }`}
              >
                {practiceDifficulty}
              </span>
            ) : (
              <span
                className={`font-tech text-[10px] sm:text-xs font-bold uppercase px-2 py-0.5 rounded border tracking-wide ${
                  difficulty === 'Easy'
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                    : difficulty === 'Medium'
                    ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                    : difficulty === 'Hard'
                    ? 'bg-red-950/80 text-red-400 border-red-500/40'
                    : 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                }`}
              >
                {difficulty}
              </span>
            )}
            {/* Streak Badge with Clean Spacing */}
            <button
              onClick={onOpenStats}
              title={`Daily Streak: ${streak} day${streak === 1 ? '' : 's'}. Click to view statistics.`}
              className="flex items-center gap-1.5 font-tech text-[10px] sm:text-xs font-bold uppercase px-2.5 py-1 rounded border bg-amber-950/70 border-amber-500/40 text-amber-300 hover:bg-amber-900/60 hover:border-amber-400 transition-colors cursor-pointer shadow-sm min-h-[36px]"
              aria-label="View streak statistics"
            >
              <span className="text-amber-400 text-xs">🔥</span>
              <span className="tracking-wider">{streak} Streak</span>
            </button>
          </div>
        </div>

        {/* Right: Clean Segmented Mode Selector with WCAG touch targets and Tab semantics */}
        <div
          role="tablist"
          aria-label="Game mode selector"
          className="flex items-center bg-[#0d101a]/85 p-1 rounded-lg border border-white/10 backdrop-blur-md shadow-sm order-3"
        >
          <button
            role="tab"
            aria-selected={activeMode === 'daily'}
            onClick={() => onToggleMode('daily')}
            className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all select-none cursor-pointer flex items-center justify-center ${
              activeMode === 'daily'
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Daily
          </button>
          <button
            role="tab"
            aria-selected={activeMode === 'practice'}
            onClick={() => onToggleMode('practice')}
            className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all select-none cursor-pointer flex items-center justify-center ${
              activeMode === 'practice'
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Practice
          </button>
          <button
            role="tab"
            aria-selected={activeMode === 'archive'}
            onClick={onOpenArchive}
            className={`min-h-[44px] px-3 sm:px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all select-none cursor-pointer flex items-center justify-center ${
              activeMode === 'archive'
                ? 'bg-[#ca8a04] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Archive
          </button>
        </div>
      </div>
    </header>
  );
};
