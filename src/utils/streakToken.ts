/**
 * Utility for generating and verifying signed, expiring streak restoration tokens.
 */

const SECRET_SALT = 'flashle_speed_force_token_salt_2026';
const USED_TOKENS_STORAGE_KEY = 'flashle_used_streak_tokens';

// Simple deterministic hash function for generating token signatures
function createHash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}`;
}

export function computeStreakSignature(streak: number, exp: number, win: boolean): string {
  const payload = `${streak}:${exp}:${win ? 1 : 0}:${SECRET_SALT}`;
  return createHash(payload);
}

export interface TokenVerificationResult {
  valid: boolean;
  reason?: 'expired' | 'invalid_signature' | 'already_used';
}

export function isTokenAlreadyUsed(sig: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const raw = localStorage.getItem(USED_TOKENS_STORAGE_KEY);
    if (!raw) return false;
    const list = JSON.parse(raw) as string[];
    return Array.isArray(list) && list.includes(sig);
  } catch {
    return false;
  }
}

export function markTokenAsUsed(sig: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(USED_TOKENS_STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(sig)) {
      list.push(sig);
      localStorage.setItem(USED_TOKENS_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore storage errors
  }
}

export function verifyStreakToken(
  streak: number,
  exp: number,
  win: boolean,
  sig: string
): TokenVerificationResult {
  const expectedSig = computeStreakSignature(streak, exp, win);
  if (sig !== expectedSig) {
    return { valid: false, reason: 'invalid_signature' };
  }

  if (Date.now() > exp) {
    return { valid: false, reason: 'expired' };
  }

  if (isTokenAlreadyUsed(sig)) {
    return { valid: false, reason: 'already_used' };
  }

  return { valid: true };
}

export function generateStreakLink(
  streak: number,
  win: boolean = false,
  hoursValid: number = 48,
  baseUrl: string = 'https://flashle-game.vercel.app'
): string {
  const exp = Date.now() + hoursValid * 60 * 60 * 1000;
  const sig = computeStreakSignature(streak, exp, win);
  const winParam = win ? '&win=1' : '';
  return `${baseUrl}/?streak=${streak}&exp=${exp}&sig=${sig}${winParam}`;
}
