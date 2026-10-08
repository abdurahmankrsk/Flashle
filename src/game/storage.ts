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

export function recordGameResult(
  won: boolean,
  guessCount: number,
  dateString: string
): PlayerStats {
  const currentStats = loadStats();

  // Avoid recording twice for the same day
  if (currentStats.lastCompletedDate === dateString) {
    return currentStats;
  }

  const gamesPlayed = currentStats.gamesPlayed + 1;
  const gamesWon = won ? currentStats.gamesWon + 1 : currentStats.gamesWon;

  // Streak logic
  let currentStreak = currentStats.currentStreak;
  if (won) {
    // Check if yesterday was played or if it continues streak
    currentStreak += 1;
  } else {
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
