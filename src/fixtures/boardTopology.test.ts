import { describe, it, expect } from 'vitest';
import { STANDARD_BOARD_HEXES } from './boardTopology';

describe('boardTopology.ts - Standard Catan Board Validation', () => {
  it('contains exactly 19 hexes for the standard board', () => {
    expect(STANDARD_BOARD_HEXES).toHaveLength(19);
  });

  it('has unique IDs and distinct axial (q, r) coordinates for every hex', () => {
    const ids = new Set<number>();
    const coords = new Set<string>();

    STANDARD_BOARD_HEXES.forEach((hex) => {
      expect(ids.has(hex.id)).toBe(false);
      ids.add(hex.id);

      const coordKey = `${hex.q},${hex.r}`;
      expect(coords.has(coordKey)).toBe(false);
      coords.add(coordKey);
    });
  });

  it('keeps all axial coordinates within radial distance 2 of origin', () => {
    STANDARD_BOARD_HEXES.forEach(({ q, r }) => {
      const s = -q - r; // Cube coordinate invariant: q + r + s = 0
      const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
      expect(distance).toBeLessThanOrEqual(2);
    });
  });

  it('matches official Catan resource distributions across 19 hexes', () => {
    const counts = STANDARD_BOARD_HEXES.reduce((acc, hex) => {
      const key = String(hex.resource).toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Handles either resource names (wood/brick/etc.) or terrain names (forest/hills/etc.)
    expect((counts['wood'] ?? 0) + (counts['forest'] ?? 0)).toBe(4);
    expect((counts['sheep'] ?? 0) + (counts['pasture'] ?? 0)).toBe(4);
    expect((counts['wheat'] ?? 0) + (counts['fields'] ?? 0)).toBe(4);
    expect((counts['brick'] ?? 0) + (counts['hills'] ?? 0)).toBe(3);
    expect((counts['ore'] ?? 0) + (counts['mountains'] ?? 0)).toBe(3);
    expect(counts['desert'] ?? 0).toBe(1);
  });

  it('ensures the desert hex has null rollNumber and 0 pips', () => {
    const desert = STANDARD_BOARD_HEXES.find(
      (h) => String(h.resource).toLowerCase() === 'desert'
    );
    expect(desert).toBeDefined();
    expect(desert?.rollNumber).toBeNull();
    expect(desert?.pips).toBe(0);
  });

  it('assigns valid dice roll numbers (2-12 excluding 7) to all 18 resource hexes', () => {
    const resourceHexes = STANDARD_BOARD_HEXES.filter(
      (h) => String(h.resource).toLowerCase() !== 'desert'
    );
    expect(resourceHexes).toHaveLength(18);

    resourceHexes.forEach((hex) => {
      expect(hex.rollNumber).not.toBeNull();
      expect(hex.rollNumber).toBeGreaterThanOrEqual(2);
      expect(hex.rollNumber).toBeLessThanOrEqual(12);
      expect(hex.rollNumber).not.toBe(7);
    });
  });

  it('matches probability pips to the corresponding roll numbers', () => {
    const expectedPipsMap: Record<number, number> = {
      2: 1, 12: 1,
      3: 2, 11: 2,
      4: 3, 10: 3,
      5: 4,  9: 4,
      6: 5,  8: 5,
    };

    const resourceHexes = STANDARD_BOARD_HEXES.filter(
      (h) => String(h.resource).toLowerCase() !== 'desert'
    );

    resourceHexes.forEach((hex) => {
      if (hex.rollNumber !== null) {
        expect(hex.pips).toBe(expectedPipsMap[hex.rollNumber]);
      }
    });
  });
});