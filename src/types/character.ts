export type Gender = 'Male' | 'Female' | 'Other';

export type Species = 
  | 'Human' 
  | 'Metahuman' 
  | 'Kryptonian' 
  | 'Gorilla' 
  | 'Shark-Human' 
  | 'Artificial / AI' 
  | 'Cosmic / Entity'
  | 'Avatar / Entity';

export type Alignment = 'Hero' | 'Villain' | 'Anti-Hero' | 'Neutral';

export type EarthOrigin = 
  | 'Earth-1 / Prime' 
  | 'Earth-2' 
  | 'Earth-3' 
  | 'Earth-19' 
  | 'Earth-38' 
  | 'Earth-221'
  | 'Multiverse / Other';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

export interface FlashCharacter {
  id: string;
  name: string;
  aliases: string[];
  actor: string;
  gender: Gender;
  species: Species;
  alignment: Alignment;
  power: string;       // E.g., "Super Speed", "Vibrations", "Cryokinesis", "None"
  speedster?: boolean;
  firstSeason: number; // 1 to 9
  seasons: number[];   // Array of seasons appeared in
  earth: EarthOrigin;
  teams: string[];     // Key affiliations
  quote: string;       // Iconic quote
  role: string;        // E.g., "The Flash / STAR Labs Leader"
  difficulty: Difficulty;
}

export type AttributeStatus = 'correct' | 'partial' | 'incorrect';
export type Direction = 'higher' | 'lower' | 'equal';

export interface AttributeComparison {
  value: string;
  status: AttributeStatus;
  direction?: Direction; // For numeric attributes (e.g., season)
  label?: string;
}

export interface GuessComparison {
  character: FlashCharacter;
  gender: AttributeComparison;
  species: AttributeComparison;
  power: AttributeComparison;
  speedster: AttributeComparison;
  alignment: AttributeComparison;
  firstSeason: AttributeComparison;
  earth: AttributeComparison;
  teams: AttributeComparison;
  isCorrect: boolean;
}
