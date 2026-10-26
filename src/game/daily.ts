import { CHARACTERS } from '../data/characters';
import type { FlashCharacter, Difficulty } from '../types/character';

// Anchor date: Launch date (Today = Day #0001)
// 2026-10-08 in Europe/Sarajevo timezone
const ANCHOR_DATE_STRING = '2026-10-08';

const SARAJEVO_TZ = 'Europe/Sarajevo';

// Seeded pseudo-random permutation of character indices
function getDailyIndex(dayNumber: number, poolSize: number): number {
  const a = 1664525;
  const c = 1013904223;
  const seed = (dayNumber * a + c) >>> 0;
  return seed % poolSize;
}

export function formatDayNumber(dayNumber: number): string {
  return String(dayNumber).padStart(4, '0');
}

export function getSarajevoDateParts(d: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: SARAJEVO_TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const get = (type: string) => {
    const p = parts.find((pt) => pt.type === type);
    return p ? parseInt(p.value, 10) : 0;
  };

  let hour = get('hour');
  if (hour === 24) hour = 0;

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour,
    minute: get('minute'),
    second: get('second'),
  };
}

export function getTodayDateString(d: Date = new Date()): string {
  const { year, month, day } = getSarajevoDateParts(d);
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
}

export function getDayNumber(date: Date = new Date()): number {
  const dateStr = getTodayDateString(date);
  const anchorTime = new Date(`${ANCHOR_DATE_STRING}T00:00:00Z`).getTime();
  const currentTime = new Date(`${dateStr}T00:00:00Z`).getTime();
  const diffDays = Math.floor((currentTime - anchorTime) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

export function getDailyDifficulty(dayNumber: number): Difficulty {
  // Deterministic daily difficulty: 40% Easy, 27.5% Medium, 27.5% Hard, 5% Very Hard
  const a = 1103515245;
  const c = 12345;
  const seed = (dayNumber * a + c) >>> 0;
  const roll = seed % 1000;
  if (roll < 400) return 'Easy';       // 0..399 (40%)
  if (roll < 675) return 'Medium';     // 400..674 (27.5%)
  if (roll < 950) return 'Hard';       // 675..949 (27.5%)
  return 'Very Hard';                  // 950..999 (5%)
}

// Canonical list of daily characters for past and current launch days to guarantee
// that adding new characters to the roster never mutates past or active daily puzzles.
export const HISTORICAL_DAILY_CHARACTERS: Record<number, string> = {
  1: 'martin-stein',
  2: 'rag-doll',
  3: 'killer-frost',
  4: 'gorilla-grodd',
  5: 'jay-garrick',
  6: 'clark-kent',
  7: 'kristen-kramer',
  8: 'plastique',
  9: 'jaco-birch',
  10: 'hunter-zolomon',
  11: 'mark-blaine',
  12: 'leonard-snart',
  13: 'sam-scudder',
  14: 'amunet-black',
  15: 'savitar',
  16: 'caitlin-snow',
  17: 'mick-rory',
  18: 'grace-gibbons',
  19: 'original-wells',
};

export function getDailyCharacter(date: Date = new Date()): {
  character: FlashCharacter;
  dayNumber: number;
  dateString: string;
  difficulty: Difficulty;
} {
  const dateString = getTodayDateString(date);
  const dayNumber = getDayNumber(date);

  // 1. Check fixed historical canonical mapping first so roster additions never mutate past/current puzzles
  if (HISTORICAL_DAILY_CHARACTERS[dayNumber]) {
    const historicalChar = CHARACTERS.find((c) => c.id === HISTORICAL_DAILY_CHARACTERS[dayNumber]);
    if (historicalChar) {
      return {
        character: historicalChar,
        dayNumber,
        dateString,
        difficulty: historicalChar.difficulty,
      };
    }
  }

  // 2. Deterministic pseudo-random generation for upcoming/future days
  const difficulty = getDailyDifficulty(dayNumber);
  const pool = CHARACTERS.filter((c) => c.difficulty === difficulty);
  const activePool = pool.length > 0 ? pool : CHARACTERS;
  const index = getDailyIndex(dayNumber, activePool.length);
  const character = activePool[index];
  return { character, dayNumber, dateString, difficulty };
}

export function getDailyCharacterForDate(dateString: string): {
  character: FlashCharacter;
  dayNumber: number;
  dateString: string;
  difficulty: Difficulty;
} {
  const d = new Date(`${dateString}T12:00:00Z`);
  return getDailyCharacter(d);
}

export interface HistoricalPuzzleInfo {
  dayNumber: number;
  dateString: string;
  difficulty: Difficulty;
  formattedDate: string;
  isToday: boolean;
}

export function getHistoricalPuzzles(currentDate: Date = new Date()): HistoricalPuzzleInfo[] {
  const todayStr = getTodayDateString(currentDate);
  const totalDays = getDayNumber(currentDate);
  const list: HistoricalPuzzleInfo[] = [];

  const anchorTime = new Date(`${ANCHOR_DATE_STRING}T12:00:00Z`).getTime();

  for (let day = totalDays; day >= 1; day--) {
    const timeForDay = anchorTime + (day - 1) * 24 * 60 * 60 * 1000;
    const dateObj = new Date(timeForDay);
    const dateStr = getTodayDateString(dateObj);
    const diff = HISTORICAL_DAILY_CHARACTERS[day]
      ? (CHARACTERS.find((c) => c.id === HISTORICAL_DAILY_CHARACTERS[day])?.difficulty ?? getDailyDifficulty(day))
      : getDailyDifficulty(day);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: SARAJEVO_TZ,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedDate = formatter.format(dateObj);

    list.push({
      dayNumber: day,
      dateString: dateStr,
      difficulty: diff,
      formattedDate,
      isToday: dateStr === todayStr,
    });
  }

  return list;
}

export function getTimeUntilNextMidnight(now: Date = new Date()): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const { hour, minute, second } = getSarajevoDateParts(now);
  const elapsedSeconds = hour * 3600 + minute * 60 + second;
  let remainingSeconds = 86400 - elapsedSeconds;
  if (remainingSeconds < 0 || remainingSeconds >= 86400) remainingSeconds = 0;

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formatted = [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');

  return { hours, minutes, seconds, formatted };
}
