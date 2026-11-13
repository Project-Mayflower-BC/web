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

export interface Edge {
  id: number;
  v1: number;
  v2: number;
}

/**
 * Builds a deduplicated list of unique board edges connecting adjacent vertices
 */
export function buildEdgeList(
  hexes: { q: number; r: number }[],
  size: number,
  vertexMap: Map<number, Point>
): Edge[] {
  const edges: Edge[] = [];
  const edgeSet = new Set<string>();
  let edgeIdCounter = 0;
  const tolerance = 4.0;

  // Helper to find existing vertex ID by coordinate
  const findVertexId = (pt: Point): number | null => {
    for (const [id, vPt] of vertexMap.entries()) {
      if (Math.hypot(vPt.x - pt.x, vPt.y - pt.y) < tolerance) return id;
    }
    return null;
  };

  for (const hex of hexes) {
    const { x: cx, y: cy } = axialToPixel(hex.q, hex.r, size);
    const corners = getHexVertices(cx, cy, size);

    for (let i = 0; i < 6; i++) {
      const v1Id = findVertexId(corners[i]);
      const v2Id = findVertexId(corners[(i + 1) % 6]);

      if (v1Id !== null && v2Id !== null) {
        const key = v1Id < v2Id ? `${v1Id}-${v2Id}` : `${v2Id}-${v1Id}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ id: edgeIdCounter++, v1: v1Id, v2: v2Id });
        }
      }
    }
  }

  return edges;
}