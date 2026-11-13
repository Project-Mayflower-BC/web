import type { TurnState } from '../types/game';

export const SAMPLE_MATCH_TURNS: TurnState[] = [
  {
    turnIndex: 0,
    activeSeat: 0,
    activeColor: 'red',
    actionDescription: 'Turn 0: Setup Phase — Red places first settlement and road',
    diceRoll: null,
    robberHexId: 9, // Desert
    buildings: [
      { vertexId: 10, type: 'settlement', ownerColor: 'red', turnBuilt: 0 },
      { vertexId: 24, type: 'settlement', ownerColor: 'blue', turnBuilt: 0 },
      { vertexId: 35, type: 'settlement', ownerColor: 'orange', turnBuilt: 0 },
      { vertexId: 42, type: 'settlement', ownerColor: 'white', turnBuilt: 0 },
    ],
    roads: [
      { edgeId: 12, ownerColor: 'red', turnBuilt: 0 },
      { edgeId: 28, ownerColor: 'blue', turnBuilt: 0 },
    ],
    playerSummaries: [
      { seatId: 0, color: 'red', name: 'Player 1', victoryPoints: 2, totalCards: 0, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 1, color: 'blue', name: 'Player 2', victoryPoints: 2, totalCards: 0, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 2, color: 'orange', name: 'Player 3', victoryPoints: 2, totalCards: 0, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 3, color: 'white', name: 'Player 4', victoryPoints: 2, totalCards: 0, playedKnights: 0, longestRoad: false, largestArmy: false },
    ],
    evaluation: {
      winProbability: 0.28,
      deltaEV: 0.04,
      moveGrade: 'best',
      adviceSummary: 'Initial setup on 8-Ore / 5-Wheat maximizes city upgrade tempo.',
    },
  },
  {
    turnIndex: 1,
    activeSeat: 0,
    activeColor: 'red',
    actionDescription: 'Turn 1: Red rolls 8 (Harvest: 2 Ore, 1 Wood)',
    diceRoll: [5, 3],
    robberHexId: 9,
    buildings: [
      { vertexId: 10, type: 'settlement', ownerColor: 'red', turnBuilt: 0 },
      { vertexId: 24, type: 'settlement', ownerColor: 'blue', turnBuilt: 0 },
      { vertexId: 35, type: 'settlement', ownerColor: 'orange', turnBuilt: 0 },
      { vertexId: 42, type: 'settlement', ownerColor: 'white', turnBuilt: 0 },
    ],
    roads: [
      { edgeId: 12, ownerColor: 'red', turnBuilt: 0 },
      { edgeId: 28, ownerColor: 'blue', turnBuilt: 0 },
    ],
    playerSummaries: [
      { seatId: 0, color: 'red', name: 'Player 1', victoryPoints: 2, totalCards: 2, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 1, color: 'blue', name: 'Player 2', victoryPoints: 2, totalCards: 0, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 2, color: 'orange', name: 'Player 3', victoryPoints: 2, totalCards: 0, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 3, color: 'white', name: 'Player 4', victoryPoints: 2, totalCards: 1, playedKnights: 0, longestRoad: false, largestArmy: false },
    ],
  },
  {
    turnIndex: 2,
    activeSeat: 1,
    activeColor: 'blue',
    actionDescription: 'Turn 2: Blue rolls 6 (Harvest: 1 Brick) and builds a road',
    diceRoll: [2, 4],
    robberHexId: 9,
    buildings: [
      { vertexId: 10, type: 'settlement', ownerColor: 'red', turnBuilt: 0 },
      { vertexId: 24, type: 'settlement', ownerColor: 'blue', turnBuilt: 0 },
      { vertexId: 35, type: 'settlement', ownerColor: 'orange', turnBuilt: 0 },
      { vertexId: 42, type: 'settlement', ownerColor: 'white', turnBuilt: 0 },
    ],
    roads: [
      { edgeId: 12, ownerColor: 'red', turnBuilt: 0 },
      { edgeId: 28, ownerColor: 'blue', turnBuilt: 0 },
      { edgeId: 29, ownerColor: 'blue', turnBuilt: 2 },
    ],
    playerSummaries: [
      { seatId: 0, color: 'red', name: 'Player 1', victoryPoints: 2, totalCards: 2, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 1, color: 'blue', name: 'Player 2', victoryPoints: 2, totalCards: 0, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 2, color: 'orange', name: 'Player 3', victoryPoints: 2, totalCards: 1, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 3, color: 'white', name: 'Player 4', victoryPoints: 2, totalCards: 1, playedKnights: 0, longestRoad: false, largestArmy: false },
    ],
  },
  {
    turnIndex: 3,
    activeSeat: 2,
    activeColor: 'orange',
    actionDescription: 'Turn 3: Orange rolls 7 — Moves robber to Hex #11 (8-Ore)',
    diceRoll: [4, 3],
    robberHexId: 11, // Robber blocks hex 11
    buildings: [
      { vertexId: 10, type: 'settlement', ownerColor: 'red', turnBuilt: 0 },
      { vertexId: 24, type: 'settlement', ownerColor: 'blue', turnBuilt: 0 },
      { vertexId: 35, type: 'settlement', ownerColor: 'orange', turnBuilt: 0 },
      { vertexId: 42, type: 'settlement', ownerColor: 'white', turnBuilt: 0 },
    ],
    roads: [
      { edgeId: 12, ownerColor: 'red', turnBuilt: 0 },
      { edgeId: 28, ownerColor: 'blue', turnBuilt: 0 },
      { edgeId: 29, ownerColor: 'blue', turnBuilt: 2 },
    ],
    playerSummaries: [
      { seatId: 0, color: 'red', name: 'Player 1', victoryPoints: 2, totalCards: 1, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 1, color: 'blue', name: 'Player 2', victoryPoints: 2, totalCards: 0, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 2, color: 'orange', name: 'Player 3', victoryPoints: 2, totalCards: 2, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 3, color: 'white', name: 'Player 4', victoryPoints: 2, totalCards: 1, playedKnights: 0, longestRoad: false, largestArmy: false },
    ],
  },
  {
    turnIndex: 4,
    activeSeat: 0,
    activeColor: 'red',
    actionDescription: 'Turn 4: Red upgrades Settlement on Vertex 10 to a City (+1 VP)',
    diceRoll: [5, 4],
    robberHexId: 11,
    buildings: [
      { vertexId: 10, type: 'city', ownerColor: 'red', turnBuilt: 4 }, // City upgrade
      { vertexId: 24, type: 'settlement', ownerColor: 'blue', turnBuilt: 0 },
      { vertexId: 35, type: 'settlement', ownerColor: 'orange', turnBuilt: 0 },
      { vertexId: 42, type: 'settlement', ownerColor: 'white', turnBuilt: 0 },
    ],
    roads: [
      { edgeId: 12, ownerColor: 'red', turnBuilt: 0 },
      { edgeId: 28, ownerColor: 'blue', turnBuilt: 0 },
      { edgeId: 29, ownerColor: 'blue', turnBuilt: 2 },
    ],
    playerSummaries: [
      { seatId: 0, color: 'red', name: 'Player 1', victoryPoints: 3, totalCards: 0, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 1, color: 'blue', name: 'Player 2', victoryPoints: 2, totalCards: 1, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 2, color: 'orange', name: 'Player 3', victoryPoints: 2, totalCards: 2, playedKnights: 0, longestRoad: false, largestArmy: false },
      { seatId: 3, color: 'white', name: 'Player 4', victoryPoints: 2, totalCards: 1, playedKnights: 0, longestRoad: false, largestArmy: false },
    ],
  },
];