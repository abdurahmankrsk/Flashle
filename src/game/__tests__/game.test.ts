import { describe, it, expect, beforeEach } from 'vitest';
import { CHARACTERS } from '../../data/characters';
import { compareGuess } from '../comparator';
import {
  getDailyCharacter,
  getDailyCharacterForDate,
  getHistoricalPuzzles,
} from '../daily';
import { generateShareText } from '../share';
import {
  getDaysDifference,
  recordGameResult,
  getActiveStreak,
  loadArchiveState,
  saveArchiveState,
  INITIAL_STATS,
} from '../storage';
import {
  trackPuzzleStart,
  trackPuzzleComplete,
  trackShare,
} from '../../utils/analytics';

// Setup in-memory localStorage polyfill for Node test environment
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

const mockStorage = new LocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
});

describe('Flash Character Database', () => {
  it('contains at least 100 distinct canonical CW Flash characters', () => {
    expect(CHARACTERS.length).toBeGreaterThanOrEqual(100);
  });

  it('has unique IDs for every character', () => {
    const ids = CHARACTERS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('has valid seasons (between 1 and 9) for all characters', () => {
    CHARACTERS.forEach((char) => {
      expect(char.firstSeason).toBeGreaterThanOrEqual(1);
      expect(char.firstSeason).toBeLessThanOrEqual(9);
      expect(char.seasons.length).toBeGreaterThan(0);
      char.seasons.forEach((s) => {
        expect(s).toBeGreaterThanOrEqual(1);
        expect(s).toBeLessThanOrEqual(9);
      });
      expect(char.seasons).toContain(char.firstSeason);
    });
  });

  it('has valid alignments and species', () => {
    const validAlignments = ['Hero', 'Villain', 'Anti-Hero', 'Neutral'];
    const validSpecies = [
      'Human',
      'Metahuman',
      'Kryptonian',
      'Gorilla',
      'Shark-Human',
      'Artificial / AI',
      'Cosmic / Entity',
      'Avatar / Entity',
    ];
    CHARACTERS.forEach((char) => {
      expect(validAlignments).toContain(char.alignment);
      expect(validSpecies).toContain(char.species);
      expect(char.name.trim().length).toBeGreaterThan(0);
      expect(char.actor.trim().length).toBeGreaterThan(0);
      expect(char.role.trim().length).toBeGreaterThan(0);
    });
  });

  it('assigns every character a valid, balanced difficulty (Easy, Medium, Hard, Very Hard)', () => {
    const validDiffs = ['Easy', 'Medium', 'Hard', 'Very Hard'];
    CHARACTERS.forEach((char) => {
      expect(validDiffs).toContain(char.difficulty);
    });
    const easy = CHARACTERS.filter((c) => c.difficulty === 'Easy');
    const med = CHARACTERS.filter((c) => c.difficulty === 'Medium');
    const hard = CHARACTERS.filter((c) => c.difficulty === 'Hard');
    const veryHard = CHARACTERS.filter((c) => c.difficulty === 'Very Hard');

    // Verify healthy distribution across all difficulties
    expect(easy.length).toBeGreaterThanOrEqual(15);
    expect(med.length).toBeGreaterThanOrEqual(30);
    expect(hard.length).toBeGreaterThanOrEqual(40);
    expect(veryHard.length).toBe(7);
  });
});

describe('Attribute Comparator', () => {
  const barry = CHARACTERS.find((c) => c.id === 'barry-allen')!;
  const wally = CHARACTERS.find((c) => c.id === 'wally-west')!;
  const zoom = CHARACTERS.find((c) => c.id === 'hunter-zolomon')!;
  const iris = CHARACTERS.find((c) => c.id === 'iris-west-allen')!;
  const snart = CHARACTERS.find((c) => c.id === 'leonard-snart')!;
  const khione = CHARACTERS.find((c) => c.id === 'khione')!;

  it('returns all green when guessing the exact secret character', () => {
    const result = compareGuess(barry, barry);
    expect(result.isCorrect).toBe(true);
    expect(result.gender.status).toBe('correct');
    expect(result.species.status).toBe('correct');
    expect(result.alignment.status).toBe('correct');
    expect(result.speedster.status).toBe('correct');
    expect(result.firstSeason.status).toBe('correct');
    expect(result.firstSeason.direction).toBe('equal');
    expect(result.earth.status).toBe('correct');
    expect(result.teams.status).toBe('correct');
  });

  it('correctly compares Barry (S1 Hero Speedster) with Wally (S2 Hero Speedster)', () => {
    const result = compareGuess(wally, barry);
    expect(result.isCorrect).toBe(false);
    expect(result.gender.status).toBe('correct');
    expect(result.species.status).toBe('correct');
    expect(result.alignment.status).toBe('correct');
    expect(result.speedster.status).toBe('correct');
    expect(result.firstSeason.status).toBe('partial');
    expect(result.firstSeason.direction).toBe('lower');
  });

  it('correctly compares Barry (Hero Speedster) with Zoom (Villain Speedster S2)', () => {
    const result = compareGuess(zoom, barry);
    expect(result.isCorrect).toBe(false);
    expect(result.alignment.status).toBe('incorrect');
    expect(result.speedster.status).toBe('correct');
    expect(result.earth.status).toBe('incorrect');
  });

  it('correctly compares Barry with Iris (Non-speedster human)', () => {
    const result = compareGuess(iris, barry);
    expect(result.gender.status).toBe('incorrect');
    expect(result.speedster.status).toBe('incorrect');
    expect(result.species.status).toBe('incorrect');
    expect(result.firstSeason.status).toBe('correct');
  });

  it('handles Anti-Hero partial match with Hero', () => {
    const result = compareGuess(snart, barry);
    expect(result.alignment.status).toBe('partial');
  });

  it('indicates higher direction when secret debuted later', () => {
    const result = compareGuess(barry, khione);
    expect(result.firstSeason.direction).toBe('higher');
    expect(result.firstSeason.status).toBe('incorrect');
  });

  it('detects partial team matches when sharing a team', () => {
    const result1 = compareGuess(snart, barry);
    expect(result1.teams.status).toBe('incorrect');

    const result2 = compareGuess(wally, barry);
    expect(result2.teams.status).toBe('partial');
  });
});

describe('Daily Puzzle Determinism & Archive Mode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns identical character for the same date', () => {
    const date1 = new Date('2026-10-08T08:00:00Z');
    const date2 = new Date('2026-10-08T18:00:00Z');
    const puzzle1 = getDailyCharacter(date1);
    const puzzle2 = getDailyCharacter(date2);

    expect(puzzle1.character.id).toBe(puzzle2.character.id);
    expect(puzzle1.dayNumber).toBe(puzzle2.dayNumber);
    expect(puzzle1.dateString).toBe(puzzle2.dateString);
  });

  it('reproduces historical puzzles accurately for any past date string', () => {
    const past = getDailyCharacterForDate('2026-10-08');
    expect(past.dayNumber).toBe(1);
    expect(past.dateString).toBe('2026-10-08');
    expect(past.character).toBeDefined();
    expect(past.character.name.length).toBeGreaterThan(0);
  });

  it('generates reverse chronological historical puzzle list up to current date', () => {
    const currentDate = new Date('2026-10-10T12:00:00Z');
    const puzzles = getHistoricalPuzzles(currentDate);
    expect(puzzles.length).toBe(3); // Day 1, Day 2, Day 3
    expect(puzzles[0].dayNumber).toBe(3);
    expect(puzzles[1].dayNumber).toBe(2);
    expect(puzzles[2].dayNumber).toBe(1);
    expect(puzzles[0].isToday).toBe(true);
    expect(puzzles[1].isToday).toBe(false);
  });

  it('isolates archive state in localStorage without modifying daily state', () => {
    const testDate = '2026-10-08';
    const state = loadArchiveState(testDate, 1);
    expect(state.guesses).toEqual([]);
    expect(state.status).toBe('playing');

    saveArchiveState({
      date: testDate,
      dayNumber: 1,
      guesses: ['barry-allen'],
      status: 'won',
    });

    const loaded = loadArchiveState(testDate, 1);
    expect(loaded.status).toBe('won');
    expect(loaded.guesses).toContain('barry-allen');
  });
});

describe('Streak Tracking & Calendar Edge Cases', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('calculates calendar day differences accurately without timezone errors', () => {
    expect(getDaysDifference('2026-10-08', '2026-10-09')).toBe(1);
    expect(getDaysDifference('2026-10-08', '2026-10-10')).toBe(2);
    expect(getDaysDifference('2026-10-08', '2026-10-08')).toBe(0);
  });

  it('initializes streak to 1 on first daily puzzle win', () => {
    const stats = recordGameResult(true, 3, '2026-10-08');
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.gamesWon).toBe(1);
    expect(stats.currentStreak).toBe(1);
    expect(stats.maxStreak).toBe(1);
    expect(stats.guessDistribution[3]).toBe(1);
  });

  it('does not increment streak twice when replaying on the same calendar day', () => {
    recordGameResult(true, 3, '2026-10-08');
    const repeated = recordGameResult(true, 2, '2026-10-08');
    expect(repeated.gamesPlayed).toBe(1);
    expect(repeated.currentStreak).toBe(1);
  });

  it('increments streak on consecutive calendar day win', () => {
    recordGameResult(true, 3, '2026-10-08');
    const day2 = recordGameResult(true, 4, '2026-10-09');
    expect(day2.gamesPlayed).toBe(2);
    expect(day2.gamesWon).toBe(2);
    expect(day2.currentStreak).toBe(2);
    expect(day2.maxStreak).toBe(2);

    const day3 = recordGameResult(true, 2, '2026-10-10');
    expect(day3.currentStreak).toBe(3);
    expect(day3.maxStreak).toBe(3);
  });

  it('resets current streak to 1 on win after missing a calendar day, while preserving maxStreak', () => {
    recordGameResult(true, 3, '2026-10-08');
    recordGameResult(true, 4, '2026-10-09'); // Streak = 2

    // Player skips 2026-10-10 and plays on 2026-10-11
    const day4 = recordGameResult(true, 2, '2026-10-11');
    expect(day4.currentStreak).toBe(1);
    expect(day4.maxStreak).toBe(2); // Best preserved!
  });

  it('resets current streak to 0 on a daily puzzle loss', () => {
    recordGameResult(true, 3, '2026-10-08');
    recordGameResult(true, 4, '2026-10-09'); // Streak = 2

    const lostDay = recordGameResult(false, 8, '2026-10-10');
    expect(lostDay.currentStreak).toBe(0);
    expect(lostDay.maxStreak).toBe(2);
    expect(lostDay.gamesWon).toBe(2);
    expect(lostDay.gamesPlayed).toBe(3);
  });

  it('evaluates active streak status accurately via getActiveStreak', () => {
    const stats = {
      ...INITIAL_STATS,
      gamesPlayed: 3,
      gamesWon: 3,
      currentStreak: 3,
      maxStreak: 3,
      lastCompletedDate: '2026-10-08',
    };

    // If today is same day or yesterday, streak is still alive
    expect(getActiveStreak(stats, '2026-10-08')).toBe(3);
    expect(getActiveStreak(stats, '2026-10-09')).toBe(3);

    // If today is 2 days later, streak has lapsed
    expect(getActiveStreak(stats, '2026-10-11')).toBe(0);
  });
});

describe('Analytics Event Dispatcher', () => {
  it('does not crash and handles events gracefully in all environments', () => {
    expect(() => {
      trackPuzzleStart('daily', 'Easy', 1);
      trackPuzzleStart('practice', 'Medium');
      trackPuzzleComplete('daily', true, 4, 'Easy', 1);
      trackShare('daily', 'clipboard', true);
    }).not.toThrow();
  });
});

describe('Share Results Formatter', () => {
  it('does not leak the character name in share text', () => {
    const barry = CHARACTERS.find((c) => c.id === 'barry-allen')!;
    const wally = CHARACTERS.find((c) => c.id === 'wally-west')!;
    const comp1 = compareGuess(wally, barry);
    const comp2 = compareGuess(barry, barry);

    const shareText = generateShareText(42, [comp1, comp2], true, 8, 'Medium');

    expect(shareText).toContain('⚡ Flashle #0042 [Medium] — 2/8');
    expect(shareText).not.toContain('Barry');
    expect(shareText).not.toContain('Wally');
    expect(shareText).toContain('🟩');
    expect(shareText).toContain('Tachyons synchronized in 2 guesses! ⚡');
    expect(shareText).toContain('Think you know The Flash?');
  });

  it('formats loss share text correctly without revealing secret', () => {
    const barry = CHARACTERS.find((c) => c.id === 'barry-allen')!;
    const wally = CHARACTERS.find((c) => c.id === 'wally-west')!;
    const comp = compareGuess(wally, barry);
    const lossShare = generateShareText(42, [comp], false, 8, 'Hard');

    expect(lossShare).toContain('⚡ Flashle #0042 [Hard] — X/8');
    expect(lossShare).not.toContain('Barry');
    expect(lossShare).toContain('Ran out of tachyons! 🥀');
    expect(lossShare).toContain('Think you know The Flash?');
  });

  it('detects yesterday win and preserves active streak', () => {
    // Mock yesterday win in localStorage
    localStorage.setItem(
      'flashle_daily_state_v3',
      JSON.stringify({ date: '2026-10-08', status: 'won', guesses: ['barry-allen'] })
    );

    const initialStats = {
      gamesPlayed: 1,
      gamesWon: 1,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
    };

    const streak = getActiveStreak(initialStats, '2026-10-09');
    expect(streak).toBe(1);

    // If won today as well, streak becomes 2
    const resultStats = recordGameResult(true, 3, '2026-10-09');
    expect(resultStats.currentStreak).toBe(2);
  });
});
