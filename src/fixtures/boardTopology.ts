import type { HexDefinition } from '../types/game';

export const STANDARD_BOARD_HEXES: HexDefinition[] = [
  // Row -2 (3 tiles)
  { id: 0,  q: 0,  r: -2, resource: 'ore',    rollNumber: 10, pips: 3 },
  { id: 1,  q: 1,  r: -2, resource: 'sheep',  rollNumber: 2,  pips: 1 },
  { id: 2,  q: 2,  r: -2, resource: 'wood',   rollNumber: 9,  pips: 4 },

  // Row -1 (4 tiles)
  { id: 3,  q: -1, r: -1, resource: 'wheat',  rollNumber: 12, pips: 1 },
  { id: 4,  q: 0,  r: -1, resource: 'brick',  rollNumber: 6,  pips: 5 },
  { id: 5,  q: 1,  r: -1, resource: 'sheep',  rollNumber: 4,  pips: 3 },
  { id: 6,  q: 2,  r: -1, resource: 'brick',  rollNumber: 10, pips: 3 },

  // Row 0 (5 tiles - equator)
  { id: 7,  q: -2, r: 0,  resource: 'wheat',  rollNumber: 9,  pips: 4 },
  { id: 8,  q: -1, r: 0,  resource: 'wood',   rollNumber: 11, pips: 2 },
  { id: 9,  q: 0,  r: 0,  resource: 'desert', rollNumber: null, pips: 0 },
  { id: 10, q: 1,  r: 0,  resource: 'wood',   rollNumber: 3,  pips: 2 },
  { id: 11, q: 2,  r: 0,  resource: 'ore',    rollNumber: 8,  pips: 5 },

  // Row 1 (4 tiles)
  { id: 12, q: -2, r: 1,  resource: 'wood',   rollNumber: 8,  pips: 5 },
  { id: 13, q: -1, r: 1,  resource: 'ore',    rollNumber: 3,  pips: 2 },
  { id: 14, q: 0,  r: 1,  resource: 'wheat',  rollNumber: 4,  pips: 3 },
  { id: 15, q: 1,  r: 1,  resource: 'sheep',  rollNumber: 5,  pips: 4 },

  // Row 2 (3 tiles)
  { id: 16, q: -2, r: 2,  resource: 'brick',  rollNumber: 5,  pips: 4 },
  { id: 17, q: -1, r: 2,  resource: 'wheat',  rollNumber: 6,  pips: 5 },
  { id: 18, q: 0,  r: 2,  resource: 'sheep',  rollNumber: 11, pips: 2 },
];