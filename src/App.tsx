import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { GuessInput } from './components/GuessInput';
import { GuessHistory } from './components/GuessHistory';
import { EndGameModal } from './components/EndGameModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { StatsModal } from './components/StatsModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { FlashEmblem } from './components/FlashEmblem';
import { CHARACTERS } from './data/characters';
import type { FlashCharacter, GuessComparison } from './types/character';
import { compareGuess } from './game/comparator';
import {
  getDailyCharacter,
  getTimeUntilNextMidnight,
  getTodayDateString,
} from './game/daily';
import {
  loadDailyState,
  saveDailyState,
  clearDailyState,
  loadStats,
  recordGameResult,
} from './game/storage';

import type { PlayerStats, DailyGameState } from './game/storage';


const MAX_GUESSES = 8;

export const App: React.FC = () => {
  // Mode: Daily vs Practice
  const [isDaily, setIsDaily] = useState<boolean>(true);

  // Daily puzzle info
  const dailyInfo = useMemo(() => getDailyCharacter(), []);
  const dailySecret = dailyInfo.character;
  const dayNumber = dailyInfo.dayNumber;
  const dateString = dailyInfo.dateString;

  // Practice secret
  const [practiceSecret, setPracticeSecret] = useState<FlashCharacter>(() => {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    return CHARACTERS[randomIndex];
  });

  // Current active secret based on mode
  const currentSecret = isDaily ? dailySecret : practiceSecret;

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

  // Practice game state
  const [practiceGuesses, setPracticeGuesses] = useState<string[]>([]);
  const [practiceStatus, setPracticeStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // Stats
  const [stats, setStats] = useState<PlayerStats>(() => loadStats());

  // Modals and UI state
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(() => {
    return !localStorage.getItem('flashle_seen_rules');
  });
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showEndGame, setShowEndGame] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newestGuessId, setNewestGuessId] = useState<string | undefined>(undefined);

  // Midnight countdown timer
  const [timeUntilNext, setTimeUntilNext] = useState<string>(
    getTimeUntilNextMidnight().formatted
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const countdown = getTimeUntilNextMidnight();
      setTimeUntilNext(countdown.formatted);

      // Check if new day rolled over
      const nowStr = getTodayDateString();
      if (nowStr !== dateString && isDaily) {
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dateString, isDaily]);

  // Reset daily progress (for testing, reset command, or UI reset)
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

  // Current guesses & comparisons based on mode
  const currentGuesses = isDaily ? dailyState.guesses : practiceGuesses;
  const currentStatus = isDaily ? dailyState.status : practiceStatus;

  const comparisons: GuessComparison[] = useMemo(() => {
    return currentGuesses
      .map((id) => CHARACTERS.find((c) => c.id === id))
      .filter((c): c is FlashCharacter => !!c)
      .map((char) => compareGuess(char, currentSecret));
  }, [currentGuesses, currentSecret]);

  // Handle closing How To Play
  const handleCloseHowToPlay = () => {
    setShowHowToPlay(false);
    localStorage.setItem('flashle_seen_rules', 'true');
  };

  // Switch between Daily and Practice mode
  const handleToggleMode = (toDaily: boolean) => {
    setIsDaily(toDaily);
    setNewestGuessId(undefined);
  };


  // Start a new practice game
  const handleNewPracticeGame = () => {
    let nextIndex = Math.floor(Math.random() * CHARACTERS.length);
    if (CHARACTERS[nextIndex].id === practiceSecret.id) {
      nextIndex = (nextIndex + 1) % CHARACTERS.length;
    }
    setPracticeSecret(CHARACTERS[nextIndex]);
    setPracticeGuesses([]);
    setPracticeStatus('playing');
    setNewestGuessId(undefined);
    setShowEndGame(false);
    setToastMessage('New practice game started! Good luck.');
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

      if (isDaily) {
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
          setTimeout(() => {
            setShowEndGame(true);
          }, 800);
        }
      } else {
        // Practice mode
        setPracticeGuesses(nextGuesses);
        setPracticeStatus(nextStatus);
        if (nextStatus !== 'playing') {
          setTimeout(() => {
            setShowEndGame(true);
          }, 800);
        }
      }
    },
    [currentStatus, currentGuesses, currentSecret, isDaily, dailyState, dateString]
  );

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col selection:bg-[#dc2626] selection:text-white">
      {/* Toast Notification */}

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Main Header */}
      <Header
        dayNumber={dayNumber}
        difficulty={dailyInfo.difficulty}
        isDaily={isDaily}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenStats={() => setShowStats(true)}
        onToggleMode={handleToggleMode}
      />


      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center w-full max-w-6xl mx-auto py-2 sm:py-4">
        {/* Banner if game finished */}
        {currentStatus !== 'playing' && (
          <div className="w-full max-w-xl px-4 my-2">
            <div
              onClick={() => setShowEndGame(true)}
              className="cursor-pointer bg-[#0e1019]/90 border-2 border-[#2b3147] hover:border-[#dc2626] rounded-[6px] p-3 flex items-center justify-between font-tech transition-all shadow-lg group backdrop-blur-sm"
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
            </div>
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
        dayNumber={dayNumber}
        isDaily={isDaily}
        timeUntilNext={timeUntilNext}
        onSwitchToPractice={() => {
          setIsDaily(false);
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
        timeUntilNext={timeUntilNext}
        isGameFinished={dailyState.status !== 'playing'}
        dayNumber={dayNumber}
        comparisons={comparisons}
        isWon={dailyState.status === 'won'}
        onToast={(msg) => setToastMessage(msg)}
        onResetDaily={handleResetDaily}
      />
    </div>
  );
};

export default App;
