export type ResourceType = 'ore' | 'wheat' | 'sheep' | 'wood' | 'brick' | 'desert';
export type PlayerColor = 'red' | 'blue' | 'orange' | 'white';
export type BuildingType = 'settlement' | 'city';
export type MoveGrade = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export interface HexDefinition {
  id: number;
  q: number; // Axial coordinate q
  r: number; // Axial coordinate r
  resource: ResourceType;
  rollNumber: number | null; // 2-12 (null for desert)
  pips: number;              // 0-5 probability dots
}

export interface BuildingPlacement {
  vertexId: number;
  type: BuildingType;
  ownerColor: PlayerColor;
  turnBuilt: number;
}

export interface RoadPlacement {
  edgeId: number;
  ownerColor: PlayerColor;
  turnBuilt: number;
}

export interface PlayerScorecard {
  seatId: number;
  color: PlayerColor;
  name: string;
  victoryPoints: number;
  totalCards: number;
  playedKnights: number;
  longestRoad: boolean;
  largestArmy: boolean;
}

export interface EvaluationMetadata {
  winProbability: number;
  deltaEV: number;
  moveGrade: MoveGrade;
  adviceSummary: string;
}

export interface TurnState {
  turnIndex: number;
  activeSeat: number;
  activeColor: PlayerColor;
  actionDescription: string;
  diceRoll: [number, number] | null;
  robberHexId: number;
  buildings: BuildingPlacement[];
  roads: RoadPlacement[];
  playerSummaries: PlayerScorecard[];
  evaluation?: EvaluationMetadata;
}

export interface DemoMatchFixture {
  matchId: string;
  title: string;
  totalTurns: number;
  hexes: HexDefinition[];
  turns: TurnState[];
}