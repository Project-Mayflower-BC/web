// ============================================================================
// 1. Core Domain Constants & Enums (Mirrors constants.py & devcards.py)
// ============================================================================

export const Resources = {
  BRICK: 0,
  LUMBER: 1,
  WOOL: 2,
  GRAIN: 3,
  ORE: 4,
} as const;
export type ResourceId = (typeof Resources)[keyof typeof Resources];

export const DESERT_TERRAIN_ID = 5;
export type TerrainId = ResourceId | typeof DESERT_TERRAIN_ID;

export const RESOURCE_NAMES = ['brick', 'lumber', 'wool', 'grain', 'ore'] as const;
export type ResourceName = (typeof RESOURCE_NAMES)[number];

export const COLONIST_RESOURCE_NAMES = ['brick', 'wood', 'sheep', 'wheat', 'ore'] as const;
export type ColonistResourceName = (typeof COLONIST_RESOURCE_NAMES)[number];

export const TERRAIN_NAMES = ['hills', 'forest', 'pasture', 'fields', 'mountains', 'desert'] as const;
export type TerrainName = (typeof TERRAIN_NAMES)[number];

export const GENERIC_PORT_ID = 5;
export type PortTypeId = ResourceId | typeof GENERIC_PORT_ID;

export const PORT_NAMES = ['brick 2:1', 'lumber 2:1', 'wool 2:1', 'grain 2:1', 'ore 2:1', '3:1'] as const;

export const DevCards = {
  KNIGHT: 11,
  VICTORY_POINT: 12,
  MONOPOLY: 13,
  ROAD_BUILDING: 14,
  YEAR_OF_PLENTY: 15,
} as const;
export type DevCardId = (typeof DevCards)[keyof typeof DevCards];

export const PieceEnums = {
  ROAD: 0,
  SETTLEMENT: 2,
  CITY: 3,
  ROBBER: 5,
} as const;
export type PieceEnum = (typeof PieceEnums)[keyof typeof PieceEnums];

export const ANY_CARD = 9;

// ============================================================================
// 2. Colonist Raw WebSocket Schema (Mirrors colonist.py loader inputs)
// ============================================================================

export interface ColonistRawEvent {
  decoded?: {
    id?: string; // Target game channel is "130"
    value?: any; // Nested envelope support for v0.1-0.3 and v0.4
    data?: {
      type: number; // 4 = Board Snapshot, 91 = State Diff, 45 = End Game
      sequence?: number;
      payload?: any;
    };
  };
}

export interface ColonistSessionExport {
  schema: 'colonist-session-collector/v1' | string;
  extensionVersion?: string;
  events: ColonistRawEvent[];
}

export interface ColonistMapHexState {
  x: number;
  y: number;
  type: number; // 0 = desert, 1..5 = lumber, brick, wool, grain, ore
  diceNumber?: number;
}

export interface ColonistMapCornerState {
  x: number;
  y: number;
  z: number;
  owner?: number | null;
  buildingType?: number; // 1 = settlement, 2 = city
}

export interface ColonistMapEdgeState {
  x: number;
  y: number;
  z: number;
  owner?: number | null;
}

export interface ColonistPortEdgeState {
  x: number;
  y: number;
  z: number;
  type: number; // 1 = 3:1 generic; 2..6 = 2:1 lumber, brick, wool, grain, ore
}

// ============================================================================
// 3. Normalized Engine Records & Action Protocol (Mirrors colonist.py Action)
// ============================================================================

export type ActionKind =
  | 'setup_settlement'
  | 'place_road'
  | 'build'
  | 'roll'
  | 'discard'
  | 'robber'
  | 'steal'
  | 'buy_dev'
  | 'play_dev'
  | 'year_of_plenty'
  | 'monopoly'
  | 'bank_trade'
  | 'player_trade'
  | 'gain'
  | 'award'
  | 'shortage'
  | 'chat';

export interface ActionRecord {
  index: number;
  sequence: number;
  kind: ActionKind;
  seat: number | null;
  data: Record<string, any>;
}

export interface CheckpointRecord {
  afterAction: number;
  sequence: number;
  handSizes: Record<number, number>; // seat -> count
  ownHand: [number, number, number, number, number] | null; // counts5: brick, lumber, wool, grain, ore
}

export interface NegotiationRecord {
  id: string;
  sequence: number;
  afterAction: number;
  turn: number;
  proposer: number;
  give: [number, number, number, number, number];
  get: [number, number, number, number, number];
  counterTo?: string | null;
  responses: Record<number, 'accept' | 'reject'>;
  responseOrder: Array<[number, 'accept' | 'reject', number]>;
  outcome: 'traded' | 'countered' | 'not_taken' | 'no_takers' | null;
  partner: number | null;
  openGive: number;
  openGet: number;
}

// ============================================================================
// 4. Web Client Replay State (Consumed by BoardView, TimelineDock & ReviewView)
// ============================================================================

export type PlayerColor = 'red' | 'blue' | 'orange' | 'white';

export interface BoardPieceRoad {
  edgeId: number;
  ownerColor: PlayerColor;
}

export interface BoardPieceBuilding {
  vertexId: number;
  type: 'settlement' | 'city';
  ownerColor: PlayerColor;
}

export interface PlayerSummary {
  seatId: number;
  name: string;
  color: PlayerColor;
  victoryPoints: number;
  totalCards: number;
}

export interface OpeningPlacementCandidate {
  rank: number;
  vertexId: number;
  grade: 'best' | 'good' | 'inaccuracy';
  isAboutEqual?: boolean;
  winProbability: number;
  deltaEV: number;
  annotation: string;
}

export interface TurnEvaluation {
  moveGrade: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  deltaEV: number;
  adviceSummary: string;
}

export interface ReplayTurn {
  turnIndex: number;
  activeColor: PlayerColor;
  diceRoll: [number, number] | null;
  actionDescription: string;
  robberHexId: number;
  roads: BoardPieceRoad[];
  buildings: BoardPieceBuilding[];
  playerSummaries: PlayerSummary[];
  candidates?: OpeningPlacementCandidate[];
  evaluation?: TurnEvaluation;
}

export interface GameSettingsSnapshot {
  numPlayers: number;
  vpToWin: number;
  discardLimit: number;
  friendlyRobber: boolean;
  diceMode: 'balanced' | 'random';
}

export interface ParsedReplaySession {
  settings: GameSettingsSnapshot;
  turns: ReplayTurn[];
  rawActions: ActionRecord[];
  checkpoints: CheckpointRecord[];
  negotiations: NegotiationRecord[];
  winner: number | null;
  warnings: string[];
}