import type { Difficulty } from '../types/character';

/**
 * Lightweight, privacy-conscious analytics client for Flashle.
 * Supports Umami, Plausible, Vercel Web Analytics, or standard custom event dispatch.
 * 
 * Guarantees:
 * - No user accounts or personal identifiers required.
 * - Zero character guesses or free-text search queries transmitted.
 * - No invasive cookies or fingerprinting.
 * - Automatic deduplication against React StrictMode and component rerenders.
 * - Graceful degradation if blocked by ad-blockers or when offline.
 */

export type GameMode = 'daily' | 'practice' | 'archive';

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, string | number | boolean>) => void;
    };
    plausible?: (name: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

// Local storage key to measure privacy-conscious returning visitor cohort
const RETURNING_VISITOR_KEY = 'flashle_last_visit_date';

/**
 * Send an event to configured analytics provider (Umami, Plausible, or Custom)
 */
function sendEvent(eventName: string, eventData: Record<string, string | number | boolean> = {}): void {
  try {
    // 1. Umami integration
    if (typeof window !== 'undefined' && window.umami && typeof window.umami.track === 'function') {
      window.umami.track(eventName, eventData);
      return;
    }

    // 2. Plausible integration
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible(eventName, { props: eventData });
      return;
    }

    // 3. Optional dev console
    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${eventName}`, eventData);
    }
  } catch {
    // Gracefully swallow analytics failures (adblockers, offline, etc.)
  }
}

/**
 * Track initial page view & privacy-safe return visitor retention cohort
 */
export function trackPageView(): void {
  try {
    sendEvent('pageview');

    // Check return rate without tracking identity
    const today = new Date().toISOString().slice(0, 10);
    const lastVisit = localStorage.getItem(RETURNING_VISITOR_KEY);

    if (lastVisit && lastVisit !== today) {
      const d1 = new Date(`${today}T00:00:00Z`).getTime();
      const d2 = new Date(`${lastVisit}T00:00:00Z`).getTime();
      sendEvent('returning_visitor', {
        daysSinceLastVisit: Math.max(1, Math.round((d1 - d2) / (1000 * 60 * 60 * 24))),
      });
    }

    localStorage.setItem(RETURNING_VISITOR_KEY, today);
  } catch {
    // Ignore storage issues
  }
}

// Session deduplication cache to prevent duplicate puzzle starts per session/day
const startedPuzzlesCache = new Set<string>();

/**
 * Track when a player begins a puzzle session (deduplicated)
 */
export function trackPuzzleStart(
  mode: GameMode,
  difficulty?: Difficulty | 'All',
  dayNumber?: number
): void {
  const sessionKey = `${mode}-${dayNumber || 'practice'}-${difficulty || 'default'}`;
  if (startedPuzzlesCache.has(sessionKey)) {
    return; // Prevent duplicate counts on rerenders
  }
  startedPuzzlesCache.add(sessionKey);

  sendEvent('puzzle_start', {
    mode,
    difficulty: difficulty || 'Unknown',
    dayNumber: dayNumber || 0,
  });
}

/**
 * Track puzzle outcome (Solved vs Defeated)
 */
export function trackPuzzleComplete(
  mode: GameMode,
  won: boolean,
  guessCount: number,
  difficulty?: Difficulty,
  dayNumber?: number
): void {
  sendEvent('puzzle_complete', {
    mode,
    status: won ? 'won' : 'lost',
    guessCount,
    difficulty: difficulty || 'Unknown',
    dayNumber: dayNumber || 0,
  });
}

/**
 * Track when a player shares their result
 */
export function trackShare(
  mode: GameMode,
  method: 'native' | 'clipboard',
  isWon: boolean
): void {
  sendEvent('share_result', {
    mode,
    method,
    status: isWon ? 'won' : 'lost',
  });
}
