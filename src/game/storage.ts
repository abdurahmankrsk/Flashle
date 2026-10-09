export interface DailyGameState {
  date: string;
  dayNumber: number;
  guesses: string[]; // Character IDs
  status: 'playing' | 'won' | 'lost';
  completedAt?: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: { [guesses: number]: number }; // 1 to 8
  lastCompletedDate?: string;
}

const STORAGE_KEYS = {
  DAILY_STATE: 'flashle_daily_state_v3',
  STATS: 'flashle_stats_v1',
  SETTINGS: 'flashle_settings_v1',
  ARCHIVE_PREFIX: 'flashle_archive_',
};

export function clearDailyState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DAILY_STATE);
  } catch (e) {
    console.error('Failed to clear daily state', e);
  }
}

export const INITIAL_STATS: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
  },
};

export interface GameSettings {
  soundEnabled: boolean;
  highContrast: boolean;
}

export const INITIAL_SETTINGS: GameSettings = {
  soundEnabled: true,
  highContrast: false,
};

/**
 * Calculates calendar day difference (dateStr2 - dateStr1).
 * Example: '2026-10-09' vs '2026-10-08' = 1 day
 */
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  if (!dateStr1 || !dateStr2) return 0;
  const d1 = new Date(`${dateStr1}T00:00:00Z`).getTime();
  const d2 = new Date(`${dateStr2}T00:00:00Z`).getTime();
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function loadDailyState(currentDateString: string, dayNumber: number): DailyGameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_STATE);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyGameState;
      // If it's the same day, restore it
      if (parsed.date === currentDateString) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse daily state from localStorage', e);
  }

  // New day or first time
  return {
    date: currentDateString,
    dayNumber,
    guesses: [],
    status: 'playing',
  };
}

export function saveDailyState(state: DailyGameState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_STATE, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save daily state', e);
  }
}

/**
 * Load an individual archive puzzle state
 */
export function loadArchiveState(dateString: string, dayNumber: number): DailyGameState {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.ARCHIVE_PREFIX}${dateString}`);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyGameState;
      if (parsed.date === dateString) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(`Failed to load archive state for ${dateString}`, e);
  }

  return {
    date: dateString,
    dayNumber,
    guesses: [],
    status: 'playing',
  };
}

/**
 * Save an individual archive puzzle state
 */
export function saveArchiveState(state: DailyGameState): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.ARCHIVE_PREFIX}${state.date}`, JSON.stringify(state));
  } catch (e) {
    console.error(`Failed to save archive state for ${state.date}`, e);
  }
}

/**
 * Retrieves all stored puzzle completions across daily and archive modes
 */
export function getAllStoredGameStates(): Record<string, DailyGameState> {
  const result: Record<string, DailyGameState> = {};
  try {
    // 1. Check daily state
    const dailyRaw = localStorage.getItem(STORAGE_KEYS.DAILY_STATE);
    if (dailyRaw) {
      const daily = JSON.parse(dailyRaw) as DailyGameState;
      if (daily?.date) {
        result[daily.date] = daily;
      }
    }

    // 2. Check archive states
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.ARCHIVE_PREFIX)) {
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val) as DailyGameState;
          if (parsed?.date) {
            result[parsed.date] = parsed;
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to get all stored game states', e);
  }
  return result;
}

export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerStats;
      return {
        ...INITIAL_STATS,
        ...parsed,
        guessDistribution: {
          ...INITIAL_STATS.guessDistribution,
          ...(parsed.guessDistribution || {}),
        },
      };
    }
  } catch (e) {
    console.error('Failed to load stats', e);
  }
  return INITIAL_STATS;
}

/**
 * Detects if a player completed/won yesterday's puzzle across localStorage keys:
 * - flashle_daily_state_v3, flashle_daily_state_v2
 * - flashle_archive_{yesterdayDateString}
 * - flashle_stats_v1 with yesterday's lastCompletedDate or gamesWon
 */
export function detectYesterdayPlayedWin(todayDateString: string): boolean {
  try {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const yesterdayDate = new Date(`${todayDateString}T00:00:00Z`);
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // 1. Check daily state storage keys
    const stateKeys = [STORAGE_KEYS.DAILY_STATE, 'flashle_daily_state_v2', 'flashle_daily_state_v1'];
    for (const key of stateKeys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.date === yesterdayStr || getDaysDifference(parsed.date, todayDateString) === 1)) {
          if (parsed.status === 'won') {
            return true;
          }
        }
      }
    }

    // 2. Check archive states
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.ARCHIVE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.date === yesterdayStr || getDaysDifference(parsed.date, todayDateString) === 1)) {
            if (parsed.status === 'won') {
              return true;
            }
          }
        }
      }
    }

    // 3. Check stats lastCompletedDate
    const statsRaw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (statsRaw) {
      const parsedStats = JSON.parse(statsRaw);
      if (parsedStats && parsedStats.lastCompletedDate) {
        const diff = getDaysDifference(parsedStats.lastCompletedDate, todayDateString);
        if (diff === 1 && (parsedStats.gamesWon || 0) > 0) {
          return true;
        }
      }
    }
  } catch (e) {
    console.error('Error detecting yesterday play', e);
  }
  return false;
}

/**
 * Returns the currently active streak, checking if a player has missed a day.
 * If the player completed yesterday or today, the streak remains intact.
 * Automatically recovers streak if user played/won yesterday before the streak feature was added.
 */
export function getActiveStreak(stats: PlayerStats, todayDateString: string): number {
  const yesterdayWon = detectYesterdayPlayedWin(todayDateString);

  // If yesterday was played and won, but stats streak was 0 (or not yet updated):
  if (yesterdayWon) {
    // If today is already completed and won:
    if (stats.lastCompletedDate === todayDateString) {
      return Math.max(stats.currentStreak, 2);
    }
    // If today is not completed yet:
    return Math.max(stats.currentStreak, 1);
  }

  if (!stats.lastCompletedDate || stats.currentStreak <= 0) {
    return 0;
  }
  const diff = getDaysDifference(stats.lastCompletedDate, todayDateString);
  // diff === 0 (played today) or diff === 1 (played yesterday, today still active)
  if (diff <= 1) {
    return stats.currentStreak;
  }
  // Missed a day or more
  return 0;
}

export function recordGameResult(
  won: boolean,
  guessCount: number,
  dateString: string
): PlayerStats {
  const currentStats = loadStats();

  // Avoid recording twice for the same calendar day
  if (currentStats.lastCompletedDate === dateString) {
    return currentStats;
  }

  const gamesPlayed = currentStats.gamesPlayed + 1;
  const gamesWon = won ? currentStats.gamesWon + 1 : currentStats.gamesWon;

  // Streak logic
  let currentStreak = currentStats.currentStreak;
  const yesterdayWon = detectYesterdayPlayedWin(dateString);

  if (won) {
    if (yesterdayWon || (currentStats.lastCompletedDate && getDaysDifference(currentStats.lastCompletedDate, dateString) === 1)) {
      // Exactly consecutive calendar day
      currentStreak = Math.max(currentStreak + 1, (yesterdayWon && currentStreak === 0 ? 2 : currentStreak + 1));
    } else if (currentStats.lastCompletedDate && getDaysDifference(currentStats.lastCompletedDate, dateString) === 0) {
      // Same day (safeguard)
    } else {
      // First win or restarted streak
      currentStreak = 1;
    }
  } else {
    // Loss on daily puzzle resets streak to 0
    currentStreak = 0;
  }

  const maxStreak = Math.max(currentStats.maxStreak, currentStreak);

  // Distribution
  const distribution = { ...currentStats.guessDistribution };
  if (won && guessCount >= 1 && guessCount <= 8) {
    distribution[guessCount] = (distribution[guessCount] || 0) + 1;
  }

  const updated: PlayerStats = {
    gamesPlayed,
    gamesWon,
    currentStreak,
    maxStreak,
    guessDistribution: distribution,
    lastCompletedDate: dateString,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save updated stats', e);
  }

  return updated;
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return INITIAL_SETTINGS;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
