import { describe, it, expect } from 'vitest';
import { CHARACTERS } from '../../data/characters';
import { compareGuess } from '../comparator';
import { getDailyCharacter, getDayNumber, getTodayDateString, getDailyDifficulty } from '../daily';
import { generateShareText } from '../share';

describe('Flash Character Database', () => {
  it('contains at least 50 distinct characters', () => {
    expect(CHARACTERS.length).toBeGreaterThanOrEqual(50);
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
    CHARACTERS.forEach((char) => {
      expect(validAlignments).toContain(char.alignment);
      expect(char.name.trim().length).toBeGreaterThan(0);
      expect(char.actor.trim().length).toBeGreaterThan(0);
    });
  });

  it('assigns every character a valid difficulty (Easy, Medium, Hard)', () => {
    const validDiffs = ['Easy', 'Medium', 'Hard'];
    CHARACTERS.forEach((char) => {
      expect(validDiffs).toContain(char.difficulty);
    });
    const easy = CHARACTERS.filter((c) => c.difficulty === 'Easy');
    const med = CHARACTERS.filter((c) => c.difficulty === 'Medium');
    const hard = CHARACTERS.filter((c) => c.difficulty === 'Hard');
    expect(easy.length).toBeGreaterThanOrEqual(15);
    expect(med.length).toBeGreaterThanOrEqual(15);
    expect(hard.length).toBeGreaterThanOrEqual(15);
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
    // Secret: Barry (Season 1), Guess: Wally (Season 2)
    const result = compareGuess(wally, barry);
    expect(result.isCorrect).toBe(false);
    expect(result.gender.status).toBe('correct');
    expect(result.species.status).toBe('correct');
    expect(result.alignment.status).toBe('correct');
    expect(result.speedster.status).toBe('correct');
    // Wally is Season 2, secret is Season 1 -> Barry is earlier (lower) and exactly 1 season away (partial)
    expect(result.firstSeason.status).toBe('partial');
    expect(result.firstSeason.direction).toBe('lower');
  });

  it('correctly compares Barry (Hero Speedster) with Zoom (Villain Speedster S2)', () => {
    // Secret: Barry, Guess: Zoom
    const result = compareGuess(zoom, barry);
    expect(result.isCorrect).toBe(false);
    expect(result.alignment.status).toBe('incorrect');
    expect(result.speedster.status).toBe('correct');
    expect(result.earth.status).toBe('incorrect'); // Earth-2 vs Earth-1
  });

  it('correctly compares Barry with Iris (Non-speedster human)', () => {
    // Secret: Barry, Guess: Iris
    const result = compareGuess(iris, barry);
    expect(result.gender.status).toBe('incorrect');
    expect(result.speedster.status).toBe('incorrect');
    expect(result.species.status).toBe('incorrect');
    expect(result.firstSeason.status).toBe('correct'); // Both debuted Season 1
  });

  it('handles Anti-Hero partial match with Hero', () => {
    // Secret: Barry (Hero), Guess: Snart (Anti-Hero)
    const result = compareGuess(snart, barry);
    expect(result.alignment.status).toBe('partial');
  });

  it('indicates higher direction when secret debuted later', () => {
    // Secret: Khione (Season 9), Guess: Barry (Season 1)
    const result = compareGuess(barry, khione);
    expect(result.firstSeason.direction).toBe('higher');
    expect(result.firstSeason.status).toBe('incorrect'); // > 1 season away
  });

  it('detects partial team matches when sharing a team', () => {
    // Secret: Barry (Team Flash, CCPD, Justice League), Guess: Snart (Rogues, Legends of Tomorrow)
    const result1 = compareGuess(snart, barry);
    expect(result1.teams.status).toBe('incorrect');

    // Secret: Barry, Guess: Wally (Team Flash, Legends)
    const result2 = compareGuess(wally, barry);
    expect(result2.teams.status).toBe('partial'); // Shared Team Flash
  });

  it('correctly compares power categories and handles partial cold powers', () => {
    const frost = CHARACTERS.find((c) => c.id === 'killer-frost')!;
    const caitlin = CHARACTERS.find((c) => c.id === 'caitlin-snow')!;
    const cisco = CHARACTERS.find((c) => c.id === 'cisco-ramon')!;
    const gypsy = CHARACTERS.find((c) => c.id === 'gypsy')!;

    // Caitlin is separate from Killer Frost
    expect(caitlin.id).not.toBe(frost.id);
    expect(caitlin.species).toBe('Human');
    expect(frost.species).toBe('Metahuman');
    expect(caitlin.power).toBe('None');
    expect(frost.power).toBe('Cryokinesis');

    // Super speed exact match
    expect(compareGuess(wally, barry).power.status).toBe('correct');

    // Vibrations exact match
    expect(compareGuess(gypsy, cisco).power.status).toBe('correct');

    // Cryo-Tech vs Cryokinesis partial cold match
    expect(compareGuess(snart, frost).power.status).toBe('partial');

    // Vibrations vs Super Speed incorrect
    expect(compareGuess(cisco, barry).power.status).toBe('incorrect');
  });
});

describe('Daily Puzzle Determinism', () => {
  it('returns identical character for the same date', () => {
    const date1 = new Date('2026-10-08T08:00:00Z');
    const date2 = new Date('2026-10-08T18:00:00Z');
    const puzzle1 = getDailyCharacter(date1);
    const puzzle2 = getDailyCharacter(date2);

    expect(puzzle1.character.id).toBe(puzzle2.character.id);
    expect(puzzle1.dayNumber).toBe(puzzle2.dayNumber);
    expect(puzzle1.dateString).toBe(puzzle2.dateString);
  });

  it('increments day number each consecutive day', () => {
    const d1 = new Date('2026-10-08T00:00:00Z');
    const d2 = new Date('2026-10-09T00:00:00Z');
    const dayNum1 = getDayNumber(d1);
    const dayNum2 = getDayNumber(d2);

    expect(dayNum2).toBe(dayNum1 + 1);
  });

  it('generates consistent date string YYYY-MM-DD', () => {
    const d = new Date('2026-10-08T12:00:00Z');
    const str = getTodayDateString(d);
    expect(str).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('distributes daily difficulty according to 40% Easy, 30% Medium, 30% Hard ratio', () => {
    let easyCount = 0;
    let medCount = 0;
    let hardCount = 0;
    const TOTAL_DAYS = 1000;
    for (let day = 1; day <= TOTAL_DAYS; day++) {
      const diff = getDailyDifficulty(day);
      if (diff === 'Easy') easyCount++;
      else if (diff === 'Medium') medCount++;
      else if (diff === 'Hard') hardCount++;
    }
    // Verify 40% Easy, 30% Medium, 30% Hard
    expect(easyCount / TOTAL_DAYS).toBeCloseTo(0.40, 1);
    expect(medCount / TOTAL_DAYS).toBeCloseTo(0.30, 1);
    expect(hardCount / TOTAL_DAYS).toBeCloseTo(0.30, 1);
  });
});

describe('Share Results Formatter', () => {
  it('does not leak the character name in share text', () => {
    const barry = CHARACTERS.find((c) => c.id === 'barry-allen')!;
    const wally = CHARACTERS.find((c) => c.id === 'wally-west')!;
    const comp1 = compareGuess(wally, barry);
    const comp2 = compareGuess(barry, barry);

    const shareText = generateShareText(42, [comp1, comp2], true);

    expect(shareText).toContain('Flashle #0042 — 2/8');
    expect(shareText).not.toContain('Barry');
    expect(shareText).not.toContain('Wally');
    expect(shareText).toContain('🟩');
    expect(shareText).toContain('Solved in 2 guesses');
  });

  it('formats loss share text correctly without revealing secret', () => {
    const barry = CHARACTERS.find((c) => c.id === 'barry-allen')!;
    const wally = CHARACTERS.find((c) => c.id === 'wally-west')!;
    const comp = compareGuess(wally, barry);
    const lossShare = generateShareText(42, [comp], false);

    expect(lossShare).toContain('Flashle #0042 — X/8');
    expect(lossShare).not.toContain('Barry');
    expect(lossShare).toContain('Ran out of tachyons');
  });

});
