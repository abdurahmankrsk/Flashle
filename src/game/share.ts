import type { GuessComparison } from '../types/character';

export function generateShareText(
  dayNumber: number,
  comparisons: GuessComparison[],
  isWon: boolean,
  maxGuesses: number = 8
): string {
  const guessCount = comparisons.length;
  const score = isWon ? `${guessCount}/${maxGuesses}` : `X/${maxGuesses}`;

  const formattedDay = String(dayNumber).padStart(4, '0');
  const header = `⚡ Flashle #${formattedDay} — ${score}`;

  const grid = comparisons
    .map((comp) => {
      const gEmoji = comp.gender.status === 'correct' ? '🟩' : '🟥';
      const aEmoji =
        comp.alignment.status === 'correct'
          ? '🟩'
          : comp.alignment.status === 'partial'
          ? '🟨'
          : '🟥';
      const spEmoji =
        comp.species.status === 'correct'
          ? '🟩'
          : comp.species.status === 'partial'
          ? '🟨'
          : '🟥';
      const powEmoji =
        (comp.power || comp.speedster).status === 'correct'
          ? '🟩'
          : (comp.power || comp.speedster).status === 'partial'
          ? '🟨'
          : '🟥';
      
      let sEmoji = '🟥';
      if (comp.firstSeason.status === 'correct') {
        sEmoji = '🟩';
      } else if (comp.firstSeason.direction === 'higher') {
        sEmoji = '⬆️';
      } else if (comp.firstSeason.direction === 'lower') {
        sEmoji = '⬇️';
      }

      const eEmoji =
        comp.earth.status === 'correct'
          ? '🟩'
          : comp.earth.status === 'partial'
          ? '🟨'
          : '🟥';

      const tEmoji =
        comp.teams.status === 'correct'
          ? '🟩'
          : comp.teams.status === 'partial'
          ? '🟨'
          : '🟥';

      return `${gEmoji}${spEmoji}${powEmoji}${aEmoji}${sEmoji}${eEmoji}${tEmoji}`;
    })
    .join('\n');

  const footer = isWon
    ? `Solved in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'} ⚡`
    : `Ran out of tachyons 🥀`;

  return `${header}\n\n${grid}\n\n${footer}\nPlay at: `;
}

export async function shareResult(
  shareText: string
): Promise<{ success: boolean; method: 'native' | 'clipboard'; error?: string }> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Flashle',
        text: shareText,
      });
      return { success: true, method: 'native' };
    } catch (e: unknown) {
      if ((e as Error)?.name === 'AbortError') {
        return { success: false, method: 'native', error: 'Share canceled' };
      }
      // Fallback to clipboard if share failed
    }
  }

  // Clipboard fallback
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareText);
      return { success: true, method: 'clipboard' };
    } else {
      // Legacy fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return { success: true, method: 'clipboard' };
    }
  } catch (err) {
    return { success: false, method: 'clipboard', error: String(err) };
  }
}
