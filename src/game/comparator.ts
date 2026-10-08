import type { FlashCharacter, GuessComparison, AttributeComparison } from '../types/character';

export function compareGuess(guess: FlashCharacter, secret: FlashCharacter): GuessComparison {
  const isCorrect = guess.id === secret.id;

  // 1. Gender
  const genderComp: AttributeComparison = {
    value: guess.gender,
    status: guess.gender === secret.gender ? 'correct' : 'incorrect',
  };

  // 2. Species
  let speciesStatus: 'correct' | 'partial' | 'incorrect' = 'incorrect';
  if (guess.species === secret.species) {
    speciesStatus = 'correct';
  } else if (
    (guess.species === 'Avatar / Entity' && secret.species === 'Cosmic / Entity') ||
    (guess.species === 'Cosmic / Entity' && secret.species === 'Avatar / Entity')
  ) {
    speciesStatus = 'partial';
  }
  const speciesComp: AttributeComparison = {
    value: guess.species,
    status: speciesStatus,
  };

  // 3. Power
  const guessPower = guess.power || (guess.speedster ? 'Super Speed' : 'None');
  const secretPower = secret.power || (secret.speedster ? 'Super Speed' : 'None');

  let powerStatus: 'correct' | 'partial' | 'incorrect' = 'incorrect';
  if (guessPower === secretPower) {
    powerStatus = 'correct';
  } else {
    const isSpeed = (p: string) => p.toLowerCase().includes('speed');
    const isVibe = (p: string) => p.toLowerCase().includes('vibration') || p.toLowerCase().includes('sonic');
    const isCold = (p: string) => p.toLowerCase().includes('cryo') || p.toLowerCase().includes('cold');
    const isEnergy = (p: string) =>
      p.toLowerCase().includes('fire') ||
      p.toLowerCase().includes('pyro') ||
      p.toLowerCase().includes('em ') ||
      p.toLowerCase().includes('weather') ||
      p.toLowerCase().includes('lightning');
    const isMind = (p: string) =>
      p.toLowerCase().includes('telepath') ||
      p.toLowerCase().includes('hypnosis') ||
      p.toLowerCase().includes('damping');
    const isNone = (p: string) => p.toLowerCase().startsWith('none');

    if (
      (isSpeed(guessPower) && isSpeed(secretPower)) ||
      (isVibe(guessPower) && isVibe(secretPower)) ||
      (isCold(guessPower) && isCold(secretPower)) ||
      (isEnergy(guessPower) && isEnergy(secretPower)) ||
      (isMind(guessPower) && isMind(secretPower)) ||
      (isNone(guessPower) && isNone(secretPower))
    ) {
      powerStatus = 'partial';
    }
  }

  const powerComp: AttributeComparison = {
    value: guessPower,
    status: powerStatus,
  };

  // 4. Alignment
  let alignmentStatus: 'correct' | 'partial' | 'incorrect' = 'incorrect';
  if (guess.alignment === secret.alignment) {
    alignmentStatus = 'correct';
  } else if (
    (guess.alignment === 'Anti-Hero' && (secret.alignment === 'Hero' || secret.alignment === 'Villain')) ||
    (secret.alignment === 'Anti-Hero' && (guess.alignment === 'Hero' || guess.alignment === 'Villain')) ||
    (guess.alignment === 'Neutral' && secret.alignment === 'Anti-Hero') ||
    (secret.alignment === 'Neutral' && guess.alignment === 'Anti-Hero')
  ) {
    alignmentStatus = 'partial';
  }
  const alignmentComp: AttributeComparison = {
    value: guess.alignment,
    status: alignmentStatus,
  };

  // 5. First Season
  let seasonStatus: 'correct' | 'partial' | 'incorrect' = 'incorrect';
  let direction: 'higher' | 'lower' | 'equal' = 'equal';

  if (guess.firstSeason === secret.firstSeason) {
    seasonStatus = 'correct';
    direction = 'equal';
  } else {
    direction = secret.firstSeason > guess.firstSeason ? 'higher' : 'lower';
    if (Math.abs(guess.firstSeason - secret.firstSeason) === 1) {
      seasonStatus = 'partial'; // Close! Within 1 season
    }
  }

  const firstSeasonComp: AttributeComparison = {
    value: `Season ${guess.firstSeason}`,
    status: seasonStatus,
    direction,
  };

  // 6. Earth Origin
  let earthStatus: 'correct' | 'partial' | 'incorrect' = 'incorrect';
  if (guess.earth === secret.earth) {
    earthStatus = 'correct';
  } else if (
    (guess.earth.includes('Earth-1') && secret.earth.includes('Prime')) ||
    (guess.earth.includes('Prime') && secret.earth.includes('Earth-1'))
  ) {
    earthStatus = 'partial';
  }
  const earthComp: AttributeComparison = {
    value: guess.earth,
    status: earthStatus,
  };

  // 7. Affiliations / Teams
  const sharedTeams = guess.teams.filter((t) => secret.teams.includes(t));
  let teamsStatus: 'correct' | 'partial' | 'incorrect' = 'incorrect';

  const sortedGuess = [...guess.teams].sort().join(',');
  const sortedSecret = [...secret.teams].sort().join(',');

  if (sortedGuess === sortedSecret) {
    teamsStatus = 'correct';
  } else if (sharedTeams.length > 0) {
    // If they share at least one team
    teamsStatus = 'partial';
  }

  const teamsComp: AttributeComparison = {
    value: guess.teams.join(', '),
    status: teamsStatus,
    label: sharedTeams.length > 0 ? `Shared: ${sharedTeams.join(', ')}` : undefined,
  };

  return {
    character: guess,
    gender: genderComp,
    species: speciesComp,
    power: powerComp,
    speedster: powerComp, // for backwards compatibility
    alignment: alignmentComp,
    firstSeason: firstSeasonComp,
    earth: earthComp,
    teams: teamsComp,
    isCorrect,
  };
}
