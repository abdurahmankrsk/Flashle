import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import type { ActiveGameMode } from './components/Header';
import { GuessInput } from './components/GuessInput';
import { GuessHistory } from './components/GuessHistory';
import { EndGameModal } from './components/EndGameModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { StatsModal } from './components/StatsModal';
import { ArchiveModal } from './components/ArchiveModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { FlashEmblem } from './components/FlashEmblem';
import { CHARACTERS } from './data/characters';
import type { FlashCharacter, GuessComparison, Difficulty } from './types/character';
import { compareGuess } from './game/comparator';
import {
  getDailyCharacter,
  getDailyCharacterForDate,
  getTimeUntilNextMidnight,
  getTodayDateString,
  formatDayNumber,
} from './game/daily';
import type { HistoricalPuzzleInfo } from './game/daily';
import {
  loadDailyState,
  saveDailyState,
  clearDailyState,
  loadArchiveState,
  saveArchiveState,
  loadStats,
  getActiveStreak,
  recordGameResult,
} from './game/storage';
import type { PlayerStats, DailyGameState } from './game/storage';
import {
  trackPageView,
  trackPuzzleStart,
  trackPuzzleComplete,
} from './utils/analytics';
import { Calendar, RefreshCw, Sparkles } from 'lucide-react';

const MAX_GUESSES = 8;

export const App: React.FC = () => {
  // Mode: Daily vs Practice vs Archive
  const [activeMode, setActiveMode] = useState<ActiveGameMode>('daily');

  // Daily puzzle info
  const dailyInfo = useMemo(() => getDailyCharacter(), []);
  const dayNumber = dailyInfo.dayNumber;
  const dateString = dailyInfo.dateString;

  // Archive puzzle state
  const [archiveDateString, setArchiveDateString] = useState<string>(dateString);
  const archiveInfo = useMemo(() => {
    return getDailyCharacterForDate(archiveDateString);
  }, [archiveDateString]);

  // Practice state
  const [practiceDifficulty, setPracticeDifficulty] = useState<Difficulty | 'All'>('All');
  const [practiceSecret, setPracticeSecret] = useState<FlashCharacter>(() => {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    return CHARACTERS[randomIndex];
  });
  const [practiceGuesses, setPracticeGuesses] = useState<string[]>([]);
  const [practiceStatus, setPracticeStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // Daily game state
  const [dailyState, setDailyState] = useState<DailyGameState>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('reset')) {
        clearDailyState();
        window.history.replaceState({}, document.title, window.location.pathname);
        return {
          date: dateString,
          dayNumber,
          guesses: [],
          status: 'playing',
        };
      }
    }
    return loadDailyState(dateString, dayNumber);
  });

  // Archive game state
  const [archiveState, setArchiveState] = useState<DailyGameState>(() => {
    return loadArchiveState(archiveDateString, archiveInfo.dayNumber);
  });

  // Stats & Streak
  const [stats, setStats] = useState<PlayerStats>(() => loadStats());
  const activeStreak = useMemo(() => {
    return getActiveStreak(stats, dateString);
  }, [stats, dateString]);

  // Modals and UI state
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(() => {
    return !localStorage.getItem('flashle_seen_rules');
  });
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [showEndGame, setShowEndGame] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newestGuessId, setNewestGuessId] = useState<string | undefined>(undefined);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');

  // Midnight countdown timer
  const [timeUntilNext, setTimeUntilNext] = useState<string>(
    getTimeUntilNextMidnight().formatted
  );

  // Initial Analytics Tracking on mount
  const hasInitializedAnalytics = useRef(false);
  useEffect(() => {
    if (!hasInitializedAnalytics.current) {
      hasInitializedAnalytics.current = true;
      trackPageView();
      trackPuzzleStart('daily', dailyInfo.difficulty, dailyInfo.dayNumber);
    }
  }, [dailyInfo]);

  // Midnight roll-over timer
  useEffect(() => {
    const interval = setInterval(() => {
      const countdown = getTimeUntilNextMidnight();
      setTimeUntilNext(countdown.formatted);

      // Check if new day rolled over
      const nowStr = getTodayDateString();
      if (nowStr !== dateString && activeMode === 'daily') {
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dateString, activeMode]);

  // Reset daily progress (for debugging/testing)
  const handleResetDaily = useCallback(() => {
    clearDailyState();
    setDailyState({
      date: dateString,
      dayNumber,
      guesses: [],
      status: 'playing',
    });
    setShowEndGame(false);
    setToastMessage("Today's game has been reset!");
  }, [dateString, dayNumber]);

  // Expose on window for easy browser console reset: window.resetDaily()
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).resetDaily = handleResetDaily;
  }, [handleResetDaily]);

  // Sync daily state to localStorage
  useEffect(() => {
    saveDailyState(dailyState);
  }, [dailyState]);

  // Sync archive state to localStorage when playing archive
  useEffect(() => {
    if (activeMode === 'archive') {
      saveArchiveState(archiveState);
    }
  }, [archiveState, activeMode]);

  // Current active secret, guesses, and status
  const currentSecret = useMemo(() => {
    if (activeMode === 'daily') return dailyInfo.character;
    if (activeMode === 'archive') return archiveInfo.character;
    return practiceSecret;
  }, [activeMode, dailyInfo, archiveInfo, practiceSecret]);

  const currentGuesses = useMemo(() => {
    if (activeMode === 'daily') return dailyState.guesses;
    if (activeMode === 'archive') return archiveState.guesses;
    return practiceGuesses;
  }, [activeMode, dailyState.guesses, archiveState.guesses, practiceGuesses]);

  const currentStatus = useMemo(() => {
    if (activeMode === 'daily') return dailyState.status;
    if (activeMode === 'archive') return archiveState.status;
    return practiceStatus;
  }, [activeMode, dailyState.status, archiveState.status, practiceStatus]);

  const currentDayNumber = useMemo(() => {
    if (activeMode === 'daily') return dailyInfo.dayNumber;
    if (activeMode === 'archive') return archiveInfo.dayNumber;
    return 0;
  }, [activeMode, dailyInfo.dayNumber, archiveInfo.dayNumber]);

  const currentDifficulty = useMemo(() => {
    if (activeMode === 'daily') return dailyInfo.difficulty;
    if (activeMode === 'archive') return archiveInfo.difficulty;
    return practiceSecret.difficulty;
  }, [activeMode, dailyInfo.difficulty, archiveInfo.difficulty, practiceSecret.difficulty]);

  const comparisons: GuessComparison[] = useMemo(() => {
    return currentGuesses
      .map((id) => CHARACTERS.find((c) => c.id === id))
      .filter((c): c is FlashCharacter => !!c)
      .map((char) => compareGuess(char, currentSecret));
  }, [currentGuesses, currentSecret]);

  // Handle closing Toast
  const handleCloseToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Handle closing How To Play
  const handleCloseHowToPlay = () => {
    setShowHowToPlay(false);
    localStorage.setItem('flashle_seen_rules', 'true');
  };

  // Switch modes
  const handleToggleMode = (mode: ActiveGameMode) => {
    setActiveMode(mode);
    setNewestGuessId(undefined);
    if (mode === 'practice') {
      trackPuzzleStart('practice', practiceDifficulty);
    }
  };

  // Start a new practice game with difficulty filtering
  const pickPracticeCharacter = useCallback((diff: Difficulty | 'All', currentId?: string): FlashCharacter => {
    const pool = diff === 'All' ? CHARACTERS : CHARACTERS.filter((c) => c.difficulty === diff);
    const activePool = pool.length > 0 ? pool : CHARACTERS;

    let available = activePool.filter((c) => c.id !== currentId);
    if (available.length === 0) available = activePool;

    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }, []);

  const handleSelectPracticeDifficulty = (diff: Difficulty | 'All') => {
    setPracticeDifficulty(diff);
    const nextChar = pickPracticeCharacter(diff, practiceSecret.id);
    setPracticeSecret(nextChar);
    setPracticeGuesses([]);
    setPracticeStatus('playing');
    setNewestGuessId(undefined);
    setShowEndGame(false);
    trackPuzzleStart('practice', diff);
  };

  const handleNewPracticeGame = () => {
    const nextChar = pickPracticeCharacter(practiceDifficulty, practiceSecret.id);
    setPracticeSecret(nextChar);
    setPracticeGuesses([]);
    setPracticeStatus('playing');
    setNewestGuessId(undefined);
    setShowEndGame(false);
    trackPuzzleStart('practice', practiceDifficulty);
  };

  // Select an archive puzzle
  const handleSelectArchivePuzzle = (puzzle: HistoricalPuzzleInfo) => {
    if (puzzle.isToday) {
      setActiveMode('daily');
      setShowArchive(false);
      setToastMessage("Switched to today's daily puzzle!");
      return;
    }

    setArchiveDateString(puzzle.dateString);
    const savedArchiveState = loadArchiveState(puzzle.dateString, puzzle.dayNumber);
    setArchiveState(savedArchiveState);
    setActiveMode('archive');
    setShowArchive(false);
    setNewestGuessId(undefined);
    setToastMessage(`Loaded Archive Day #${formatDayNumber(puzzle.dayNumber)} (${puzzle.formattedDate})`);
    trackPuzzleStart('archive', puzzle.difficulty, puzzle.dayNumber);
  };

  // Return to today's daily puzzle from archive
  const handleReturnToToday = () => {
    setActiveMode('daily');
    setNewestGuessId(undefined);
    setToastMessage("Returned to today's daily puzzle!");
  };

  // Submit a guess
  const handleGuess = useCallback(
    (character: FlashCharacter) => {
      if (currentStatus !== 'playing') return;

      if (currentGuesses.includes(character.id)) {
        setToastMessage(`${character.name} was already guessed!`);
        return;
      }

      const nextGuesses = [...currentGuesses, character.id];
      const isWon = character.id === currentSecret.id;
      const isLost = !isWon && nextGuesses.length >= MAX_GUESSES;
      const nextStatus = isWon ? 'won' : isLost ? 'lost' : 'playing';

      setNewestGuessId(character.id);

      // Accessible live announcement for assistive technologies
      if (isWon) {
        setScreenReaderAnnouncement(
          `Congratulations! You guessed ${character.name} and solved the mystery in ${nextGuesses.length} attempts!`
        );
      } else if (isLost) {
        setScreenReaderAnnouncement(
          `Game over. You ran out of attempts. The secret character was ${currentSecret.name}.`
        );
      } else {
        setScreenReaderAnnouncement(
          `Guessed ${character.name}. ${MAX_GUESSES - nextGuesses.length} attempts remaining.`
        );
      }

      if (activeMode === 'daily') {
        const nextState: DailyGameState = {
          ...dailyState,
          guesses: nextGuesses,
          status: nextStatus,
          completedAt: nextStatus !== 'playing' ? new Date().toISOString() : undefined,
        };
        setDailyState(nextState);

        if (nextStatus !== 'playing') {
          const updatedStats = recordGameResult(isWon, nextGuesses.length, dateString);
          setStats(updatedStats);
          trackPuzzleComplete('daily', isWon, nextGuesses.length, dailyInfo.difficulty, dayNumber);
          setTimeout(() => {
            setShowEndGame(true);
          }, 800);
        }
      } else if (activeMode === 'archive') {
        const nextState: DailyGameState = {
          ...archiveState,
          guesses: nextGuesses,
          status: nextStatus,
          completedAt: nextStatus !== 'playing' ? new Date().toISOString() : undefined,
        };
        setArchiveState(nextState);
        saveArchiveState(nextState);

        if (nextStatus !== 'playing') {
          trackPuzzleComplete('archive', isWon, nextGuesses.length, archiveInfo.difficulty, archiveInfo.dayNumber);
          setTimeout(() => {
            setShowEndGame(true);
          }, 800);
        }
      } else {
        // Practice mode
        setPracticeGuesses(nextGuesses);
        setPracticeStatus(nextStatus);

        if (nextStatus !== 'playing') {
          trackPuzzleComplete('practice', isWon, nextGuesses.length, practiceSecret.difficulty);
          setTimeout(() => {
            setShowEndGame(true);
          }, 800);
        }
      }
    },
    [
      currentStatus,
      currentGuesses,
      currentSecret,
      activeMode,
      dailyState,
      archiveState,
      dateString,
      dayNumber,
      dailyInfo.difficulty,
      archiveInfo.difficulty,
      archiveInfo.dayNumber,
      practiceSecret.difficulty,
    ]
  );

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col selection:bg-[#dc2626] selection:text-white">
      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={handleCloseToast} />

      {/* Accessible Live Region for Assistive Technologies */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {screenReaderAnnouncement}
      </div>

      {/* Main Header */}
      <Header
        dayNumber={currentDayNumber || dayNumber}
        difficulty={currentDifficulty}
        activeMode={activeMode}
        streak={activeStreak}
        archiveDateString={activeMode === 'archive' ? archiveDateString : undefined}
        practiceDifficulty={practiceDifficulty}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenStats={() => setShowStats(true)}
        onOpenArchive={() => setShowArchive(true)}
        onToggleMode={handleToggleMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center w-full max-w-6xl mx-auto py-2 sm:py-4 px-2 sm:px-4">
        {/* Practice Mode Difficulty Selector Bar */}
        {activeMode === 'practice' && (
          <div className="w-full max-w-2xl px-2 my-2">
            <div className="bg-[#0e101a]/95 border-2 border-[#2b3147] rounded-[8px] p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-lg backdrop-blur-sm">
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                <span className="font-tech text-xs text-gray-300 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                  Difficulty:
                </span>
                {(['All', 'Easy', 'Medium', 'Hard', 'Very Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleSelectPracticeDifficulty(diff)}
                    className={`min-h-[38px] px-3 py-1.5 rounded text-xs font-tech font-bold uppercase transition-all cursor-pointer flex items-center justify-center ${
                      practiceDifficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                          : diff === 'Medium'
                          ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                          : diff === 'Hard'
                          ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400'
                          : diff === 'Very Hard'
                          ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                          : 'bg-[#dc2626] text-white shadow-sm ring-1 ring-red-400'
                        : 'bg-[#161926] text-gray-400 hover:text-gray-200 border border-[#252b3e]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNewPracticeGame}
                className="flex items-center gap-1 text-xs font-tech font-bold text-gray-200 hover:text-white uppercase bg-[#1f2438] hover:bg-[#2b334f] px-3 py-2 min-h-[38px] rounded border border-[#333b56] transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Next</span>
              </button>
            </div>
          </div>
        )}

        {/* Archive Mode Banner */}
        {activeMode === 'archive' && (
          <div className="w-full max-w-2xl px-2 my-2">
            <div className="bg-[#131728]/95 border-2 border-[#374266] rounded-[8px] p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-[#fbbf24] shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-tech text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      Archive: Day #{formatDayNumber(archiveInfo.dayNumber)} ({archiveDateString})
                    </span>
                    <span
                      className={`text-[9px] font-tech font-bold uppercase px-1.5 py-0.2 rounded border ${
                        archiveInfo.difficulty === 'Easy'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                          : archiveInfo.difficulty === 'Medium'
                          ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                          : archiveInfo.difficulty === 'Hard'
                          ? 'bg-red-950/80 text-red-400 border-red-500/40'
                          : 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                      }`}
                    >
                      {archiveInfo.difficulty}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-body block">
                    Historical puzzle • Does not alter daily streak
                  </span>
                </div>
              </div>

              <button
                onClick={handleReturnToToday}
                className="px-3 py-2 min-h-[38px] bg-[#dc2626] hover:bg-[#ef4444] text-white text-xs font-tech font-bold uppercase tracking-wider rounded transition-colors shadow-md cursor-pointer shrink-0 flex items-center justify-center"
              >
                Today's Daily →
              </button>
            </div>
          </div>
        )}

        {/* Banner if game finished */}
        {currentStatus !== 'playing' && (
          <div className="w-full max-w-2xl px-2 my-2">
            <button
              type="button"
              onClick={() => setShowEndGame(true)}
              className="w-full cursor-pointer bg-[#0e1019]/90 border-2 border-[#2b3147] hover:border-[#dc2626] focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 rounded-[8px] p-3 flex items-center justify-between font-tech transition-all shadow-lg group backdrop-blur-sm text-left"
              aria-label="View character dossier and share result"
            >
              <div className="flex items-center gap-2.5">
                {currentStatus === 'won' ? (
                  <FlashEmblem size={22} variant="emblem" />
                ) : (
                  <span className="w-5 h-5 flex items-center justify-center font-bold text-red-500 border border-red-500 rounded-[2px] text-xs">
                    ✕
                  </span>
                )}
                <span className="text-sm font-bold uppercase tracking-wider text-white">
                  {currentStatus === 'won'
                    ? `Solved in ${comparisons.length} guesses!`
                    : `Answer: ${currentSecret.name}`}
                </span>
              </div>
              <span className="text-[#fbbf24] font-bold text-xs uppercase tracking-wider group-hover:underline flex items-center gap-1">
                View Dossier & Share →
              </span>
            </button>
          </div>
        )}

        {/* Guess Input & Tracker */}
        <GuessInput
          guessedCharacterIds={currentGuesses}
          disabled={currentStatus !== 'playing'}
          isWon={currentStatus === 'won'}
          onGuess={handleGuess}
          maxGuesses={MAX_GUESSES}
        />

        {/* Guess History Grid */}
        <GuessHistory
          comparisons={comparisons}
          newestGuessId={newestGuessId}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <EndGameModal
        isOpen={showEndGame}
        onClose={() => setShowEndGame(false)}
        isWon={currentStatus === 'won'}
        secret={currentSecret}
        comparisons={comparisons}
        dayNumber={currentDayNumber || dayNumber}
        isDaily={activeMode === 'daily'}
        timeUntilNext={timeUntilNext}
        onSwitchToPractice={() => {
          setActiveMode('practice');
          handleNewPracticeGame();
        }}
        onNewPracticeGame={handleNewPracticeGame}
        onToast={(msg) => setToastMessage(msg)}
      />

      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={handleCloseHowToPlay}
      />

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        todayDateString={dateString}
        timeUntilNext={timeUntilNext}
        isGameFinished={dailyState.status !== 'playing'}
        dayNumber={dayNumber}
        comparisons={comparisons}
        isWon={dailyState.status === 'won'}
        onToast={(msg) => setToastMessage(msg)}
        onResetDaily={handleResetDaily}
      />

      <ArchiveModal
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        onSelectPuzzle={handleSelectArchivePuzzle}
        activeDateString={activeMode === 'archive' ? archiveDateString : dateString}
      />
    </div>
  );
};

export default App;
