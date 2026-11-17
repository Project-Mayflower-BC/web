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

describe('coordinates.ts - axialToPixel', () => {
  const HEX_RADIUS = 76;

  it('maps center hex (0, 0) to origin (0, 0)', () => {
    const { x, y } = axialToPixel(0, 0, HEX_RADIUS);
    expect(x).toBeCloseTo(0, 4);
    expect(y).toBeCloseTo(0, 4);
  });

  it('projects horizontal step along q-axis with y = 0', () => {
    // For pointy-topped hexes: x = R * sqrt(3) * (q + r/2), y = R * (3/2) * r
    const { x, y } = axialToPixel(1, 0, HEX_RADIUS);
    expect(x).toBeCloseTo(HEX_RADIUS * Math.sqrt(3), 4);
    expect(y).toBeCloseTo(0, 4);
  });

  it('projects vertical step along r-axis with appropriate x offset', () => {
    const { x, y } = axialToPixel(0, 1, HEX_RADIUS);
    expect(x).toBeCloseTo((HEX_RADIUS * Math.sqrt(3)) / 2, 4);
    expect(y).toBeCloseTo(HEX_RADIUS * 1.5, 4);
  });

  it('maintains origin symmetry for opposite hex pairs', () => {
    const positive = axialToPixel(2, -1, HEX_RADIUS);
    const negative = axialToPixel(-2, 1, HEX_RADIUS);
    expect(positive.x).toBeCloseTo(-negative.x, 4);
    expect(positive.y).toBeCloseTo(-negative.y, 4);
  });

  it('scales proportionally when radius changes', () => {
    const pointSmall = axialToPixel(1, 1, 50);
    const pointLarge = axialToPixel(1, 1, 100);
    expect(pointLarge.x).toBeCloseTo(pointSmall.x * 2, 4);
    expect(pointLarge.y).toBeCloseTo(pointSmall.y * 2, 4);
  });
});

describe('coordinates.ts - getHexCornerPoints', () => {
  const RADIUS = 76;
  const CENTER_X = 150;
  const CENTER_Y = 200;

  it('generates an SVG polygon string containing exactly 6 coordinate pairs', () => {
    const pointsStr = getHexCornerPoints(CENTER_X, CENTER_Y, RADIUS);
    const points = pointsStr.trim().split(/\s+/);
    expect(points).toHaveLength(6);
    points.forEach((point) => {
      const [x, y] = point.split(',').map(Number);
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
    });
  });

  it('places all 6 vertices exactly at radial distance R from the hex center', () => {
    const pointsStr = getHexCornerPoints(CENTER_X, CENTER_Y, RADIUS);
    const points = pointsStr.trim().split(/\s+/);

    points.forEach((point) => {
      const [px, py] = point.split(',').map(Number);
      const distance = Math.hypot(px - CENTER_X, py - CENTER_Y);
      expect(distance).toBeCloseTo(RADIUS, 1);
    });
  });

  it('aligns pointy-topped corners with top and bottom vertices on the vertical center axis', () => {
    const pointsStr = getHexCornerPoints(CENTER_X, CENTER_Y, RADIUS);
    const points = pointsStr
      .trim()
      .split(/\s+/)
      .map((p) => p.split(',').map(Number));

    // A pointy-topped hex has vertices at 30°, 90°, 150°, 210°, 270°, 330°
    // The top vertex (270° or -90°) and bottom vertex (90°) share x == CENTER_X
    const verticalVertices = points.filter(([x]) => Math.abs(x - CENTER_X) < 0.001);
    expect(verticalVertices).toHaveLength(2);

    const yValues = verticalVertices.map(([, y]) => y).sort((a, b) => a - b);
    expect(yValues[0]).toBeCloseTo(CENTER_Y - RADIUS, 3); // top vertex
    expect(yValues[1]).toBeCloseTo(CENTER_Y + RADIUS, 3); // bottom vertex
  });
});
