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

interface ColonistGameMessage {
  type: number;
  sequence?: number;
  payload?: {
    playOrder?: number[];
    gameState?: {
      mechanicRobberState?: { locationTileIndex?: number };
    };
    diff?: {
      mapState?: {
        tileCornerStates?: Record<string, { owner?: number | null; buildingType?: number }>;
        tileEdgeStates?: Record<string, { owner?: number | null }>;
      };
      mechanicRobberState?: { locationTileIndex?: number };
      gameLogState?: Record<
        string,
        {
          text?: {
            type: number;
            playerColor: number;
            pieceEnum?: number;
            firstDice?: number;
            secondDice?: number;
          };
        }
      >;
    };
  };
}

export function parseColonistExport(json: ColonistSessionExport): ReplayTurn[] {
  if (!json.schema?.startsWith('colonist-session-collector/')) {
    throw new Error('Unsupported schema: Expected colonist-session-collector/v1');
  }

  // 1. Extract game channel messages (ID "130")
  const messages: ColonistGameMessage[] = [];
  for (const event of json.events || []) {
    let dec = event.decoded as Record<string, unknown> | undefined;
    if (dec && 'value' in dec && !('id' in dec)) {
      dec = dec.value as Record<string, unknown> | undefined;
    }
    if (dec?.id === '130' && dec?.data) {
      messages.push(dec.data as ColonistGameMessage);
    }
  }

  const snapshotMsg = messages.find((m) => m.type === 4);
  if (!snapshotMsg || !snapshotMsg.payload) {
    throw new Error('No board snapshot found (type 4). Game recording incomplete.');
  }

  const snapPayload = snapshotMsg.payload;
  const gameState = snapPayload.gameState;
  const playOrder: number[] = snapPayload.playOrder || [];

  // 2. Running state accumulated over diffs
  let currentTurnIndex = 0;
  let activeRobberTile = gameState?.mechanicRobberState?.locationTileIndex ?? 0;
  const roads: BoardPieceRoad[] = [];
  const buildings: BoardPieceBuilding[] = [];

  const turnHistory: ReplayTurn[] = [];

  const initialPlayerSummaries: PlayerSummary[] = playOrder.map((c, idx) => ({
    seatId: idx,
    name: `Player ${idx + 1}`,
    color: COLOR_MAP[c] || 'red',
    victoryPoints: 2,
    totalCards: 0,
  }));

  // Turn 0: Setup state snapshot
  turnHistory.push({
    turnIndex: 0,
    activeColor: COLOR_MAP[playOrder[0]] || 'red',
    diceRoll: null,
    actionDescription: 'Setup Phase: Initial placements',
    robberHexId: activeRobberTile,
    roads: [],
    buildings: [],
    playerSummaries: initialPlayerSummaries,
  });

  // 3. Step through type 91 diffs
  for (const m of messages) {
    if (m.type !== 91 || !m.payload?.diff) continue;
    const diff = m.payload.diff;
    const mdiff = diff.mapState || {};

    const newCorners: Array<{ owner: number; cornerId: number }> = [];
    const newCities: number[] = [];
    for (const [k, v] of Object.entries(mdiff.tileCornerStates || {})) {
      if (v.buildingType === 2) {
        newCities.push(Number(k));
      } else if (v.owner !== undefined && v.owner !== null) {
        newCorners.push({ owner: v.owner, cornerId: Number(k) });
      }
    }

    const newEdges: Array<{ owner: number; edgeId: number }> = [];
    for (const [k, v] of Object.entries(mdiff.tileEdgeStates || {})) {
      if (v.owner !== undefined && v.owner !== null) {
        newEdges.push({ owner: v.owner, edgeId: Number(k) });
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
        const d1 = text.firstDice ?? 0;
        const d2 = text.secondDice ?? 0;

        const currentSummaries: PlayerSummary[] = playOrder.map((c, idx) => ({
          seatId: idx,
          name: `Player ${idx + 1}`,
          color: COLOR_MAP[c] || 'red',
          victoryPoints: 2,
          totalCards: 0,
        }));

        turnHistory.push({
          turnIndex: currentTurnIndex,
          activeColor: playerColor,
          diceRoll: [d1, d2],
          actionDescription: `${playerColor.toUpperCase()} rolled a ${d1 + d2} (${d1} + ${d2})`,
          robberHexId: activeRobberTile,
          roads: roads.map((r) => ({ ...r })),
          buildings: buildings.map((b) => ({ ...b })),
          playerSummaries: currentSummaries,
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