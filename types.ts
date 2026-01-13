
export interface CardData {
  id: number;
  uniqueId: string;
  content: string; // Emoji
  isFlipped: boolean;
  isMatched: boolean;
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  WON = 'WON'
}

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
