import type { FlashCharacter } from '../types/character';

export interface SearchMatch {
  character: FlashCharacter;
  score: number;
  matchedAlias?: string;
}

/**
 * Normalizes text for lenient searching:
 * - Lowercases and strips diacritics
 * - Removes periods so "H.R." becomes "hr" and "Dr." becomes "dr"
 * - Replaces hyphens, quotes, and punctuation with spaces
 */
export function cleanText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .replace(/[-_'"`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips all non-alphanumeric characters for compact prefix/initials matching
 */
export function compactText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Robust character search with prioritized ranking:
 * 1. Exact full name / alias match (Score 100)
 * 2. Exact word match on initials / name token (Score 95 - e.g. "hr" matches "H.R." in "H.R. Wells")
 * 3. Prefix match on full name (Score 90)
 * 4. Prefix match on alias (Score 85 - e.g. "harr" matches "Harrison 'H.R.' Wells")
 * 5. Prefix match on any word in name (Score 80)
 * 6. Prefix match on any word in alias (Score 75)
 * 7. Initials match (Score 70 - e.g. "hrw" -> H.R. Wells)
 * 8. Substring matches on alias, name, actor, role (Score 40-10)
 */
export function searchCharacters(
  characters: FlashCharacter[],
  query: string,
  excludedIds: string[] = [],
  limit = 8
): SearchMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const cleanQ = cleanText(query);
  const compactQ = compactText(query);
  if (!cleanQ && !compactQ) return [];

  const excludedSet = new Set(excludedIds);
  const scored: SearchMatch[] = [];

  for (const c of characters) {
    if (excludedSet.has(c.id)) continue;

    const cleanName = cleanText(c.name);
    const compactName = compactText(c.name);
    const nameWords = cleanName.split(' ').filter(Boolean);

    const cleanAliases = c.aliases.map(cleanText);
    const compactAliases = c.aliases.map(compactText);
    const allAliasWords = cleanAliases.flatMap((a) => a.split(' ').filter(Boolean));

    const cleanActor = cleanText(c.actor);
    const cleanRole = cleanText(c.role);

    let score = 0;

    // 1. Exact match on full name or alias
    if (cleanName === cleanQ || compactName === compactQ) {
      score = 100;
    } else if (cleanAliases.some((a) => a === cleanQ) || compactAliases.some((a) => a === compactQ)) {
      score = 100;
    }
    // 2. Exact word match on name word or alias word (e.g. typing "hr" matches "H.R." in "H.R. Wells")
    else if (
      nameWords.some((w) => w === cleanQ || w === compactQ) ||
      allAliasWords.some((w) => w === cleanQ || w === compactQ)
    ) {
      score = 95;
    }
    // 3. Name starts with query
    else if (cleanName.startsWith(cleanQ) || compactName.startsWith(compactQ)) {
      score = 90;
    }
    // 4. Alias starts with query
    else if (cleanAliases.some((a) => a.startsWith(cleanQ)) || compactAliases.some((a) => a.startsWith(compactQ))) {
      score = 85;
    }
    // 5. Any word in name starts with query
    else if (nameWords.some((w) => w.startsWith(cleanQ))) {
      score = 80;
    }
    // 6. Any word in alias starts with query
    else if (allAliasWords.some((w) => w.startsWith(cleanQ))) {
      score = 75;
    }
    // 7. Initials match (e.g. "hrw" -> H.R. Wells)
    else if (nameWords.length > 1 && nameWords.map((w) => w[0]).join('') === compactQ) {
      score = 70;
    }
    // 8. Substring match
    else if (cleanAliases.some((a) => a.includes(cleanQ)) || compactAliases.some((a) => a.includes(compactQ))) {
      score = 40;
    } else if (cleanName.includes(cleanQ) || compactName.includes(compactQ)) {
      score = 35;
    } else if (cleanActor.includes(cleanQ)) {
      score = 20;
    } else if (cleanRole.includes(cleanQ)) {
      score = 10;
    }

    if (score > 0) {
      const matchedAlias = c.aliases.find((a) => {
        const ca = cleanText(a);
        const compA = compactText(a);
        return ca.includes(cleanQ) || compA.includes(compactQ);
      });

      scored.push({
        character: c,
        score,
        matchedAlias,
      });
    }
  }

  return scored
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Stable secondary sort: character name length then alphabetical
      return a.character.name.localeCompare(b.character.name);
    })
    .slice(0, limit);
}
