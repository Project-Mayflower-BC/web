/**
 * Projects pointy-topped axial coordinates (q, r) to 2D Cartesian SVG pixels (x, y)
 * @param q Axial column
 * @param r Axial row
 * @param size Hex radius from center to any corner
 */
export function axialToPixel(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
}

/**
 * Returns the SVG SVG polygon points string for a pointy-topped hexagon
 */
export function getHexCornerPoints(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 30; // Pointy-top orientation
    const angleRad = (Math.PI / 180) * angleDeg;
    const px = cx + size * Math.cos(angleRad);
    const py = cy + size * Math.sin(angleRad);
    points.push(`${px.toFixed(2)},${py.toFixed(2)}`);
  }
  return points.join(' ');
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Returns the 6 corner vertex pixel positions for a given pointy-topped hex
 */
export function getHexVertices(cx: number, cy: number, size: number): Point[] {
  const vertices: Point[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 30; // Pointy-top orientation (-30°, 30°, 90°, 150°, 210°, 270°)
    const angleRad = (Math.PI / 180) * angleDeg;
    vertices.push({
      x: Number((cx + size * Math.cos(angleRad)).toFixed(2)),
      y: Number((cy + size * Math.sin(angleRad)).toFixed(2)),
    });
  }
  return vertices;
}

/**
 * Builds a deduplicated map of unique board vertices from standard hexes
 */
export function buildVertexMap(
  hexes: { q: number; r: number }[],
  size: number
): Map<number, Point> {
  const vertexMap = new Map<number, Point>();
  let vertexCounter = 0;
  const tolerance = 4.0; // Distance tolerance to deduplicate shared hex corners

  for (const hex of hexes) {
    const { x: cx, y: cy } = axialToPixel(hex.q, hex.r, size);
    const corners = getHexVertices(cx, cy, size);

    for (const corner of corners) {
      let existingId: number | null = null;
      for (const [id, pt] of vertexMap.entries()) {
        const dist = Math.hypot(pt.x - corner.x, pt.y - corner.y);
        if (dist < tolerance) {
          existingId = id;
          break;
        }
      }

      if (existingId === null) {
        vertexMap.set(vertexCounter++, corner);
      }
    }
  }

  return vertexMap;
}