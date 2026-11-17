import { describe, it, expect } from 'vitest';
import { axialToPixel, getHexCornerPoints } from './coordinates';
import { STANDARD_BOARD_HEXES } from '../fixtures/boardTopology';

describe('Catan Board Coordinate Engine', () => {
  it('should initialize the standard 19-hex board topology', () => {
    expect(STANDARD_BOARD_HEXES).toHaveLength(19);
  });

  it('should project the center desert/hex (0, 0) to origin (0, 0)', () => {
    const origin = axialToPixel(0, 0, 76);
    expect(origin.x).toBeCloseTo(0);
    expect(origin.y).toBeCloseTo(0);
  });

  it('should generate 6 distinct vertices for a pointy-topped hex', () => {
    const pointsStr = getHexCornerPoints(0, 0, 76);
    const points = pointsStr.split(' ');
    expect(points).toHaveLength(6);
  });
});