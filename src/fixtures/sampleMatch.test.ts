import { describe, it, expect } from 'vitest';
import { SAMPLE_MATCH_TURNS } from './sampleMatch';
import type { TurnState, PlayerScorecard } from '../types/game';

describe('sampleMatch.ts - Replay State Machine Fixture', () => {
  it('contains recorded turns', () => {
    expect(SAMPLE_MATCH_TURNS.length).toBeGreaterThan(0);
  });

  it('maintains sequential turn indexing without gaps or skips', () => {
    SAMPLE_MATCH_TURNS.forEach((turn: TurnState, idx: number) => {
      expect(turn.turnIndex).toBe(idx);
    });
  });

  it('assigns a valid active seat and active player color to each turn', () => {
    const validColors = new Set(['red', 'blue', 'orange', 'white']);

    SAMPLE_MATCH_TURNS.forEach((turn: TurnState) => {
      expect(turn.activeSeat).toBeGreaterThanOrEqual(0);
      expect(turn.activeSeat).toBeLessThanOrEqual(3);
      expect(validColors.has(turn.activeColor)).toBe(true);
    });
  });

  it('provides playerSummaries with valid victory points and card totals for all players', () => {
    SAMPLE_MATCH_TURNS.forEach((turn: TurnState) => {
      expect(turn.playerSummaries).toBeDefined();
      expect(turn.playerSummaries.length).toBeGreaterThan(0);

      turn.playerSummaries.forEach((player: PlayerScorecard) => {
        expect(player.victoryPoints).toBeGreaterThanOrEqual(0);
        expect(player.totalCards).toBeGreaterThanOrEqual(0);
        expect(player.playedKnights).toBeGreaterThanOrEqual(0);
        expect(typeof player.longestRoad).toBe('boolean');
        expect(typeof player.largestArmy).toBe('boolean');
      });
    });
  });

  it('ensures dice rolls on non-setup turns are valid 2d6 values', () => {
    SAMPLE_MATCH_TURNS.forEach((turn: TurnState) => {
      if (turn.diceRoll !== null) {
        const [d1, d2] = turn.diceRoll;
        expect(d1).toBeGreaterThanOrEqual(1);
        expect(d1).toBeLessThanOrEqual(6);
        expect(d2).toBeGreaterThanOrEqual(1);
        expect(d2).toBeLessThanOrEqual(6);

        const total = d1 + d2;
        expect(total).toBeGreaterThanOrEqual(2);
        expect(total).toBeLessThanOrEqual(12);
      }
    });
  });

  it('ensures robber occupies a valid hex tile ID', () => {
    SAMPLE_MATCH_TURNS.forEach((turn: TurnState) => {
      expect(turn.robberHexId).toBeGreaterThanOrEqual(0);
      expect(turn.robberHexId).toBeLessThanOrEqual(18);
    });
  });

  it('validates evaluation metadata schema when present on reviewed turns', () => {
    const validMoveGrades = new Set(['best', 'good', 'inaccuracy', 'mistake', 'blunder']);

    SAMPLE_MATCH_TURNS.forEach((turn: TurnState) => {
      if (turn.evaluation) {
        expect(turn.evaluation.winProbability).toBeGreaterThanOrEqual(0);
        expect(turn.evaluation.winProbability).toBeLessThanOrEqual(1);
        expect(validMoveGrades.has(turn.evaluation.moveGrade)).toBe(true);
        expect(typeof turn.evaluation.deltaEV).toBe('number');
        expect(typeof turn.evaluation.adviceSummary).toBe('string');
      }
    });
  });
});