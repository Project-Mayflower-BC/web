import type {
  ColonistSessionExport,
  ReplayTurn,
  PlayerColor,
  BoardPieceRoad,
  BoardPieceBuilding,
  PlayerSummary,
} from '../types/replay';

const COLOR_MAP: Record<number, PlayerColor> = {
  1: 'red',
  2: 'blue',
  3: 'orange',
  4: 'white',
};

export function parseColonistExport(json: ColonistSessionExport): ReplayTurn[] {
  if (!json.schema?.startsWith('colonist-session-collector/')) {
    throw new Error('Unsupported schema: Expected colonist-session-collector/v1');
  }

  // 1. Extract game channel messages (ID "130")
  const messages: any[] = [];
  for (const event of json.events || []) {
    let dec = event.decoded;
    if (dec && 'value' in dec && !('id' in dec)) {
      dec = (dec as any).value;
    }
    if (dec?.id === '130' && dec?.data) {
      messages.push(dec.data);
    }
  }

  const snapshotMsg = messages.find((m) => m.type === 4);
  if (!snapshotMsg) {
    throw new Error('No board snapshot found (type 4). Game recording incomplete.');
  }

  const snapPayload = snapshotMsg.payload;
  const gameState = snapPayload.gameState;
  const playOrder: number[] = snapPayload.playOrder || [];

  // 2. Running state accumulated over diffs
  let currentTurnIndex = 0;
  let activeRobberTile = gameState.mechanicRobberState?.locationTileIndex ?? 0;
  const roads: BoardPieceRoad[] = [];
  const buildings: BoardPieceBuilding[] = [];

  const turnHistory: ReplayTurn[] = [];

  // Turn 0: Setup state snapshot
  turnHistory.push({
    turnIndex: 0,
    activeColor: COLOR_MAP[playOrder[0]] || 'red',
    diceRoll: null,
    actionDescription: 'Setup Phase: Initial placements',
    robberHexId: activeRobberTile,
    roads: [],
    buildings: [],
    playerSummaries: playOrder.map((c, idx) => ({
      seatId: idx,
      name: `Player ${idx + 1}`,
      color: COLOR_MAP[c] || 'red',
      victoryPoints: 2,
      totalCards: 0,
    })),
  });

  // 3. Step through type 91 diffs
  for (const m of messages) {
    if (m.type !== 91 || !m.payload?.diff) continue;
    const diff = m.payload.diff;
    const mdiff = diff.mapState || {};

    const newCorners: Array<{ owner: number; cornerId: number }> = [];
    const newCities: number[] = [];
    for (const [k, v] of Object.entries(mdiff.tileCornerStates || {})) {
      const val = v as any;
      if (val.buildingType === 2) {
        newCities.push(Number(k));
      } else if (val.owner !== undefined && val.owner !== null) {
        newCorners.push({ owner: val.owner, cornerId: Number(k) });
      }
    }

    const newEdges: Array<{ owner: number; edgeId: number }> = [];
    for (const [k, v] of Object.entries(mdiff.tileEdgeStates || {})) {
      const val = v as any;
      if (val.owner !== undefined && val.owner !== null) {
        newEdges.push({ owner: val.owner, edgeId: Number(k) });
      }
    }

    if (diff.mechanicRobberState?.locationTileIndex !== undefined) {
      activeRobberTile = diff.mechanicRobberState.locationTileIndex;
    }

    const logs = diff.gameLogState || {};
    const sortedKeys = Object.keys(logs).map(Number).sort((a, b) => a - b);

    for (const key of sortedKeys) {
      const logEntry = logs[key];
      const text = logEntry?.text;
      if (!text) continue;

      const lt = text.type;
      const color = text.playerColor;
      const playerColor = COLOR_MAP[color] || 'red';

      // Type 10: Dice Roll (Advances turn)
      if (lt === 10) {
        currentTurnIndex += 1;
        const d1 = text.firstDice;
        const d2 = text.secondDice;

        turnHistory.push({
          turnIndex: currentTurnIndex,
          activeColor: playerColor,
          diceRoll: [d1, d2],
          actionDescription: `${playerColor.toUpperCase()} rolled a ${d1 + d2} (${d1} + ${d2})`,
          robberHexId: activeRobberTile,
          roads: roads.map((r) => ({ ...r })),
          buildings: buildings.map((b) => ({ ...b })),
          playerSummaries: playOrder.map((c, idx) => ({
            seatId: idx,
            name: `Player ${idx + 1}`,
            color: COLOR_MAP[c] || 'red',
            victoryPoints: 2,
            totalCards: 0,
          })),
        });
      }

      // Type 4 & 5: Settlements, Cities, and Roads
      if (lt === 4 || lt === 5) {
        const piece = text.pieceEnum;
        if (piece === 0) {
          // Road
          const edgeIdx = newEdges.findIndex((e) => e.owner === color);
          if (edgeIdx !== -1) {
            roads.push({ edgeId: newEdges[edgeIdx].edgeId, ownerColor: playerColor });
            newEdges.splice(edgeIdx, 1);
          }
        } else if (piece === 2) {
          // Settlement
          const cornerIdx = newCorners.findIndex((c) => c.owner === color);
          if (cornerIdx !== -1) {
            buildings.push({ vertexId: newCorners[cornerIdx].cornerId, type: 'settlement', ownerColor: playerColor });
            newCorners.splice(cornerIdx, 1);
          }
        } else if (piece === 3) {
          // City upgrade
          const cityCorner = newCities.shift();
          if (cityCorner !== undefined) {
            const b = buildings.find((x) => x.vertexId === cityCorner);
            if (b) b.type = 'city';
          }
        }
      }
    }
  }

  return turnHistory;
}