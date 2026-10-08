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
  // Deterministic daily difficulty: 40% Easy, 30% Medium, 30% Hard
  const a = 1103515245;
  const c = 12345;
  const seed = (dayNumber * a + c) >>> 0;
  const roll = seed % 100;
  if (roll < 40) return 'Easy';    // 0..39 (40%)
  if (roll < 70) return 'Medium';  // 40..69 (30%)
  return 'Hard';                   // 70..99 (30%)
}

export function getDailyCharacter(date: Date = new Date()): {
  character: FlashCharacter;
  dayNumber: number;
  dateString: string;
  difficulty: Difficulty;
} {
  const dateString = getTodayDateString(date);
  const dayNumber = getDayNumber(date);
  const difficulty = getDailyDifficulty(dayNumber);
  const pool = CHARACTERS.filter((c) => c.difficulty === difficulty);
  const activePool = pool.length > 0 ? pool : CHARACTERS;
  const index = getDailyIndex(dayNumber, activePool.length);
  const character = activePool[index];
  return { character, dayNumber, dateString, difficulty };
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
