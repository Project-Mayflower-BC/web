import { describe, it, expect } from 'vitest';
import { parseColonistExport } from './colonistAdapter';
import {
  type ColonistSessionExport,
  Resources,
  DESERT_TERRAIN_ID,
  GENERIC_PORT_ID,
  DevCards,
  PieceEnums,
  ANY_CARD,
} from '../types/replay';

// Helper to create a minimal valid Colonist snapshot event
function createMockSnapshotEvent(playOrder: number[] = [1, 2, 3, 4], robberTile: number = 0) {
  return {
    decoded: {
      id: '130',
      data: {
        type: 4,
        sequence: 1,
        payload: {
          playOrder,
          playerUserStates: playOrder.map((color) => ({
            selectedColor: color,
            username: `Player_${color}`,
          })),
          gameState: {
            mechanicRobberState: { locationTileIndex: robberTile },
            mapState: {
              tileHexStates: {},
              tileCornerStates: {},
              tileEdgeStates: {},
            },
          },
        },
      },
    },
  };
}

describe('Replay Types & Constants Contract', () => {
  it('preserves official engine resource indices and special tile sentinels', () => {
    expect(Resources.BRICK).toBe(0);
    expect(Resources.LUMBER).toBe(1);
    expect(Resources.WOOL).toBe(2);
    expect(Resources.GRAIN).toBe(3);
    expect(Resources.ORE).toBe(4);
    expect(DESERT_TERRAIN_ID).toBe(5);
    expect(GENERIC_PORT_ID).toBe(5);
  });

  it('aligns development cards and piece enums with Colonist specifications', () => {
    expect(DevCards.KNIGHT).toBe(11);
    expect(DevCards.VICTORY_POINT).toBe(12);
    expect(DevCards.MONOPOLY).toBe(13);
    expect(DevCards.ROAD_BUILDING).toBe(14);
    expect(DevCards.YEAR_OF_PLENTY).toBe(15);

    expect(PieceEnums.ROAD).toBe(0);
    expect(PieceEnums.SETTLEMENT).toBe(2);
    expect(PieceEnums.CITY).toBe(3);
    expect(PieceEnums.ROBBER).toBe(5);
    expect(ANY_CARD).toBe(9);
  });
});

describe('colonistAdapter: parseColonistExport', () => {
  describe('Schema & Snapshot Validation', () => {
    it('throws when schema does not start with colonist-session-collector/', () => {
      const invalidJson = {
        schema: 'invalid-schema/v2',
        events: [],
      } as unknown as ColonistSessionExport;

      expect(() => parseColonistExport(invalidJson)).toThrow(
        /Unsupported schema: Expected colonist-session-collector\/v1/
      );
    });

    it('throws when no Type 4 snapshot message exists on channel 130', () => {
      const missingSnapshotJson: ColonistSessionExport = {
        schema: 'colonist-session-collector/v1',
        events: [
          {
            decoded: {
              id: '130',
              data: { type: 91, payload: {} },
            },
          },
        ],
      };

      expect(() => parseColonistExport(missingSnapshotJson)).toThrow(
        /No board snapshot found \(type 4\)/
      );
    });

    it('handles nested decoded envelope value wrappers (v0.1-v0.3 vs v0.4 format)', () => {
      const wrappedPayload: ColonistSessionExport = {
        schema: 'colonist-session-collector/v1',
        events: [
          {
            decoded: {
              value: {
                id: '130',
                data: {
                  type: 4,
                  payload: {
                    playOrder: [1, 2, 3, 4],
                    gameState: {
                      mechanicRobberState: { locationTileIndex: 7 },
                    },
                  },
                },
              },
            },
          },
        ],
      };

      const turns = parseColonistExport(wrappedPayload);
      expect(turns).toHaveLength(1);
      expect(turns[0].robberHexId).toBe(7);
      expect(turns[0].turnIndex).toBe(0);
    });
  });

  describe('Turn 0 Initialization', () => {
    it('initializes Turn 0 with player summaries and starting robber position', () => {
      const recording: ColonistSessionExport = {
        schema: 'colonist-session-collector/v1',
        events: [createMockSnapshotEvent([1, 2, 3, 4], 9)],
      };

      const turns = parseColonistExport(recording);
      expect(turns).toHaveLength(1);

      const turn0 = turns[0];
      expect(turn0.turnIndex).toBe(0);
      expect(turn0.diceRoll).toBeNull();
      expect(turn0.robberHexId).toBe(9);
      expect(turn0.activeColor).toBe('red');
      expect(turn0.playerSummaries).toHaveLength(4);
      expect(turn0.playerSummaries[0]).toEqual({
        seatId: 0,
        name: 'Player 1',
        color: 'red',
        victoryPoints: 2,
        totalCards: 0,
      });
    });
  });

  describe('Diff Processing & Coordinate Matching', () => {
    it('creates new turns on dice rolls (log type 10)', () => {
      const recording: ColonistSessionExport = {
        schema: 'colonist-session-collector/v1',
        events: [
          createMockSnapshotEvent([1, 2, 3, 4]),
          {
            decoded: {
              id: '130',
              data: {
                type: 91,
                payload: {
                  diff: {
                    gameLogState: {
                      '1': {
                        text: {
                          type: 10,
                          playerColor: 1,
                          firstDice: 3,
                          secondDice: 4,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      };

      const turns = parseColonistExport(recording);
      expect(turns).toHaveLength(2); // Turn 0 and Turn 1
      expect(turns[1].turnIndex).toBe(1);
      expect(turns[1].diceRoll).toEqual([3, 4]);
      expect(turns[1].actionDescription).toContain('RED rolled a 7 (3 + 4)');
    });

    it('matches settlement builds to map diff corners via queue pop (pieceEnum 2)', () => {
      const recording: ColonistSessionExport = {
        schema: 'colonist-session-collector/v1',
        events: [
          createMockSnapshotEvent([1, 2, 3, 4]),
          {
            decoded: {
              id: '130',
              data: {
                type: 91,
                payload: {
                  diff: {
                    mapState: {
                      tileCornerStates: {
                        '14': { owner: 1, buildingType: 1 },
                      },
                    },
                    gameLogState: {
                      '1': {
                        text: {
                          type: 5,
                          playerColor: 1,
                          pieceEnum: PieceEnums.SETTLEMENT,
                        },
                      },
                      '2': {
                        text: {
                          type: 10,
                          playerColor: 1,
                          firstDice: 5,
                          secondDice: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      };

      const turns = parseColonistExport(recording);
      expect(turns[1].buildings).toHaveLength(1);
      expect(turns[1].buildings[0]).toEqual({
        vertexId: 14,
        type: 'settlement',
        ownerColor: 'red',
      });
    });

    it('matches road placements to map diff edges (pieceEnum 0)', () => {
      const recording: ColonistSessionExport = {
        schema: 'colonist-session-collector/v1',
        events: [
          createMockSnapshotEvent([1, 2, 3, 4]),
          {
            decoded: {
              id: '130',
              data: {
                type: 91,
                payload: {
                  diff: {
                    mapState: {
                      tileEdgeStates: {
                        '22': { owner: 2 },
                      },
                    },
                    gameLogState: {
                      '1': {
                        text: {
                          type: 4, // Setup free road
                          playerColor: 2,
                          pieceEnum: PieceEnums.ROAD,
                        },
                      },
                      '2': {
                        text: {
                          type: 10,
                          playerColor: 2,
                          firstDice: 4,
                          secondDice: 4,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      };

      const turns = parseColonistExport(recording);
      expect(turns[1].roads).toHaveLength(1);
      expect(turns[1].roads[0]).toEqual({
        edgeId: 22,
        ownerColor: 'blue',
      });
    });

    it('upgrades existing settlements to cities (buildingType 2 / pieceEnum 3)', () => {
      const recording: ColonistSessionExport = {
        schema: 'colonist-session-collector/v1',
        events: [
          createMockSnapshotEvent([1, 2, 3, 4]),
          // First diff: Place settlement on vertex 30
          {
            decoded: {
              id: '130',
              data: {
                type: 91,
                payload: {
                  diff: {
                    mapState: {
                      tileCornerStates: { '30': { owner: 1, buildingType: 1 } },
                    },
                    gameLogState: {
                      '1': { text: { type: 5, playerColor: 1, pieceEnum: PieceEnums.SETTLEMENT } },
                      '2': { text: { type: 10, playerColor: 1, firstDice: 2, secondDice: 3 } },
                    },
                  },
                },
              },
            },
          },
          // Second diff: Upgrade vertex 30 to city
          {
            decoded: {
              id: '130',
              data: {
                type: 91,
                payload: {
                  diff: {
                    mapState: {
                      tileCornerStates: { '30': { owner: 1, buildingType: 2 } },
                    },
                    gameLogState: {
                      '3': { text: { type: 5, playerColor: 1, pieceEnum: PieceEnums.CITY } },
                      '4': { text: { type: 10, playerColor: 1, firstDice: 6, secondDice: 2 } },
                    },
                  },
                },
              },
            },
          },
        ],
      };

      const turns = parseColonistExport(recording);
      expect(turns).toHaveLength(3);
      expect(turns[1].buildings[0].type).toBe('settlement');
      expect(turns[2].buildings[0].type).toBe('city');
      expect(turns[2].buildings[0].vertexId).toBe(30);
    });

    it('updates robber placement when mechanicRobberState diff is present', () => {
      const recording: ColonistSessionExport = {
        schema: 'colonist-session-collector/v1',
        events: [
          createMockSnapshotEvent([1, 2, 3, 4], 0),
          {
            decoded: {
              id: '130',
              data: {
                type: 91,
                payload: {
                  diff: {
                    mechanicRobberState: { locationTileIndex: 12 },
                    gameLogState: {
                      '1': { text: { type: 10, playerColor: 1, firstDice: 4, secondDice: 3 } },
                    },
                  },
                },
              },
            },
          },
        ],
      };

      const turns = parseColonistExport(recording);
      expect(turns[0].robberHexId).toBe(0);
      expect(turns[1].robberHexId).toBe(12);
    });
  });
});